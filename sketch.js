const Engine = Matter.Engine;
const World= Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
const Events = Matter.Events;

var engine, world;
var box1, pig1;
var backgroundImg,platform;
var bird, slingShot;

// ---- game state (added on top of the original sketch) ----
var gameState = "menu";      // menu, levels, playing, paused, won, lost
var currentLevel = 0;
var score = 0;
var gameFrame = 0;
var birdsQueue = 0;          // birds waiting on the platform
var birdsUsed = 0;
var launchedBird = null;
var framesSinceLaunch = 0;
var birdReady = false;       // true while a bird sits on the sling
var levelResult = null;      // null while playing, then "win" or "lose"
var endTimer = 0;
var overlayFrame = 0;
var resultStars = 0, resultBonus = 0, resultNewBest = false;
var progress = { stars: [], best: [], muted: false };

var SETTLE_FRAMES = 100;     // no impact damage while a new level settles
var HIT_SPEED = 2;           // relative speed below this does no damage
var DAMAGE_PER_SPEED = 20;

function preload() {
    backgroundImg = loadImage("sprites/bg.png");
    ["base", "bird", "enemy", "wood1", "wood2", "sling1", "sling2", "sling3"].forEach(function (n) {
        getImage("sprites/" + n + ".png");
    });
}

function setup(){
    var canvas = createCanvas(1200,400);
    engine = Engine.create();
    world = engine.world;
    loadProgress();
    Sfx.muted = progress.muted;
}

// Builds a fresh world for the given level. The ground, platform, objects, first bird
// and slingshot are created the same way the original setup() did.
function startLevel(index){
    currentLevel = index;
    var def = LEVELS[index];

    engine = Engine.create();
    world = engine.world;
    Events.on(engine, "collisionStart", handleCollisions);

    gameObjects = [];
    pendingRemoval = [];
    clearEffects();
    slingshot = null;
    launchedBird = null;
    score = 0;
    gameFrame = 0;
    birdsUsed = 0;
    birdsQueue = def.birds;
    framesSinceLaunch = 0;
    levelResult = null;
    endTimer = 0;

    ground = new Ground(600,height,1200,20);
    platform = new Ground(150, 305, 300, 170);

    def.build();

    loadNextBird();
    gameState = "playing";
}

function loadNextBird(){
    if (birdsQueue <= 0) return;
    birdsQueue--;
    bird = new Bird(200,50);
    if (!slingshot) {
        slingshot = new SlingShot(bird.body,{x:200, y:50});
    } else {
        slingshot.attach(bird.body);
    }
    birdReady = true;
}

// Impact damage: how hard two bodies hit each other decides how much they are hurt.
function handleCollisions(event){
    if (gameFrame < SETTLE_FRAMES) return;
    for (var i = 0; i < event.pairs.length; i++) {
        var a = event.pairs[i].bodyA, b = event.pairs[i].bodyB;
        var dvx = a.velocity.x - b.velocity.x;
        var dvy = a.velocity.y - b.velocity.y;
        var rel = Math.sqrt(dvx * dvx + dvy * dvy);
        if (rel <= HIT_SPEED) continue;
        Sfx.hit(rel);
        applyImpact(a.gameObject, b, rel);
        applyImpact(b.gameObject, a, rel);
    }
}

function applyImpact(obj, other, rel){
    if (!obj || obj.dead) return;
    var ratio = isFinite(other.mass) ? other.mass / obj.body.mass : 1.6;
    ratio = Math.min(1.6, Math.max(0.6, ratio));
    obj.damage((rel - HIT_SPEED) * DAMAGE_PER_SPEED * ratio);
}

function countPigs(){
    var n = 0;
    for (var i = 0; i < gameObjects.length; i++) {
        if (gameObjects[i].isPig && !gameObjects[i].dead) n++;
    }
    return n;
}

function bodySpeed(body){
    return Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);
}

function isSettled(){
    for (var i = 0; i < gameObjects.length; i++) {
        if (!gameObjects[i].dead && bodySpeed(gameObjects[i].body) > 0.25) return false;
    }
    return true;
}

function isOffscreen(body){
    return body.position.y > height + 200 || body.position.x < -200 || body.position.x > width + 400;
}

// One tick of game logic (physics + rules). draw() calls this once per frame.
function stepGame(){
    updateEffects();
    if (gameState !== "playing") return;

    Engine.update(engine);
    gameFrame++;

    while (pendingRemoval.length) World.remove(world, pendingRemoval.pop());

    for (var i = 0; i < gameObjects.length; i++) {
        var o = gameObjects[i];
        if (!o.dead && isOffscreen(o.body)) o.destroy();
    }
    while (pendingRemoval.length) World.remove(world, pendingRemoval.pop());
    gameObjects = gameObjects.filter(function (o) { return !o.dead; });

    if (launchedBird && !launchedBird.dead) recordTrail(launchedBird.body);

    // Reload the sling once the last bird has come to rest, or left the screen.
    if (!birdReady) {
        framesSinceLaunch++;
        if (birdsQueue > 0) {
            var gone = !launchedBird || launchedBird.dead;
            var calm = launchedBird && !launchedBird.dead && bodySpeed(launchedBird.body) < 0.5;
            if (gone || (calm && framesSinceLaunch >= 60) || framesSinceLaunch >= 300) loadNextBird();
        }
    }

    if (!levelResult) {
        if (gameFrame > 1 && countPigs() === 0) {
            finishLevel(true);
        } else if (!birdReady && birdsQueue === 0 &&
                   ((framesSinceLaunch > 120 && isSettled()) || framesSinceLaunch > 480)) {
            finishLevel(false);
        }
    } else if (--endTimer <= 0) {
        gameState = levelResult === "win" ? "won" : "lost";
        overlayFrame = 0;
    }
}

function finishLevel(won){
    levelResult = won ? "win" : "lose";
    endTimer = won ? 80 : 50;
    resultBonus = 0;
    resultStars = 0;
    resultNewBest = false;
    if (won) {
        var spare = birdsQueue + (birdReady ? 1 : 0);
        resultBonus = spare * 10000;
        score += resultBonus;
        var par = LEVELS[currentLevel].par;
        resultStars = birdsUsed <= par ? 3 : (birdsUsed <= par + 1 ? 2 : 1);
        if (score > (progress.best[currentLevel] || 0)) {
            progress.best[currentLevel] = score;
            resultNewBest = true;
        }
        progress.stars[currentLevel] = Math.max(progress.stars[currentLevel] || 0, resultStars);
        saveProgress();
        Sfx.win();
    } else {
        Sfx.lose();
    }
}

function draw(){
    stepGame();

    background(backgroundImg);
    buttons = [];

    if (gameState === "menu") {
        drawMenu();
        return;
    }
    if (gameState === "levels") {
        drawLevelSelect();
        return;
    }

    drawScene();
    drawHUD();
    if (gameState === "paused") drawPauseOverlay();
    if (gameState === "won" || gameState === "lost") drawResultOverlay();
}

function drawScene(){
    strokeWeight(4);
    ground.display();

    // blocks and pigs first, then birds on top
    for (var i = 0; i < gameObjects.length; i++) {
        if (!gameObjects[i].isBird) gameObjects[i].display();
    }
    drawTrail();
    for (var j = 0; j < gameObjects.length; j++) {
        if (gameObjects[j].isBird) gameObjects[j].display();
    }
    platform.display();
    slingshot.display();
    drawEffects();
}

function mouseDragged(){
    if (gameState !== "playing" || !bird) return;
    Matter.Body.setPosition(bird.body, {x: mouseX , y: mouseY});
}

function mousePressed(){
    Sfx.init();
}

function mouseReleased(){
    if (handleClick()) return;
    if (gameState !== "playing") return;
    if (slingshot.fly()) {
        birdReady = false;
        launchedBird = bird;
        birdsUsed++;
        framesSinceLaunch = 0;
        trailPoints = [];
        Sfx.launch();
    }
}

// Menus and HUD buttons get the click first; in menus nothing else gets it.
function handleClick(){
    if (clickButtons()) return true;
    return gameState !== "playing";
}

function keyPressed(){
    if (key === "r" || key === "R") {
        if (gameState !== "menu" && gameState !== "levels") startLevel(currentLevel);
    } else if (key === "p" || key === "P" || keyCode === ESCAPE) {
        togglePause();
    } else if (key === "m" || key === "M") {
        toggleMute();
    } else if ((key === "n" || key === "N" || keyCode === ENTER) && gameState === "won" &&
               currentLevel < LEVELS.length - 1) {
        startLevel(currentLevel + 1);
    }
}

function togglePause(){
    if (gameState === "playing") gameState = "paused";
    else if (gameState === "paused") gameState = "playing";
}

function toggleMute(){
    Sfx.muted = !Sfx.muted;
    progress.muted = Sfx.muted;
    saveProgress();
}

function isUnlocked(i){
    return i === 0 || (progress.stars[i - 1] || 0) > 0;
}

function loadProgress(){
    try {
        var saved = JSON.parse(localStorage.getItem("angry-birds-clone-progress"));
        if (saved && saved.stars && saved.best) progress = saved;
    } catch (e) {}
}

function saveProgress(){
    try {
        localStorage.setItem("angry-birds-clone-progress", JSON.stringify(progress));
    } catch (e) {}
}
