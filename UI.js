// Menus, HUD and overlays, all drawn on the canvas.
// Buttons are re-registered every frame while drawing; handleClick() hit-tests them.
var buttons = [];

function uiButton(label, x, y, w, h, onClick, enabled) {
    var active = enabled !== false;
    var hover = active && mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
    push();
    rectMode(CORNER);
    stroke(70, 35, 10);
    strokeWeight(3);
    if (!active) fill(160, 160, 150);
    else fill(hover ? color(255, 214, 90) : color(245, 166, 35));
    rect(x, y, w, h, 10);
    noStroke();
    fill(active ? color(70, 35, 10) : color(110, 110, 100));
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(Math.min(24, h * 0.5));
    text(label, x + w / 2, y + h / 2 + 1);
    pop();
    if (active) buttons.push({ x: x, y: y, w: w, h: h, onClick: onClick });
}

// Returns true if a button was clicked.
function clickButtons() {
    for (var i = buttons.length - 1; i >= 0; i--) {
        var b = buttons[i];
        if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
            Sfx.click();
            b.onClick();
            return true;
        }
    }
    return false;
}

function outlinedText(str, x, y, size, fillCol) {
    push();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(size);
    stroke(50, 25, 5);
    strokeWeight(Math.max(3, size / 7));
    fill(fillCol || 255);
    text(str, x, y);
    pop();
}

function dimScreen(alpha) {
    push();
    rectMode(CORNER);
    noStroke();
    fill(0, 0, 0, alpha);
    rect(0, 0, width, height);
    pop();
}

function drawStar(cx, cy, r, filled) {
    push();
    stroke(70, 35, 10);
    strokeWeight(3);
    fill(filled ? color(255, 205, 40) : color(90, 80, 70, 160));
    beginShape();
    for (var i = 0; i < 10; i++) {
        var a = -Math.PI / 2 + i * Math.PI / 5;
        var rad = i % 2 === 0 ? r : r * 0.45;
        vertex(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
    }
    endShape(CLOSE);
    pop();
}

function drawMenu() {
    dimScreen(70);
    var bob = Math.sin(frameCount / 20) * 6;
    outlinedText("ANGRY BIRDS CLONE", width / 2, 95, 68, color(255, 235, 120));
    push();
    imageMode(CENTER);
    image(getImage("sprites/bird.png"), 330, 215 + bob, 90, 90);
    image(getImage("sprites/enemy.png"), 870, 215 - bob, 100, 100);
    pop();
    uiButton("PLAY", width / 2 - 100, 180, 200, 60, function () { gameState = "levels"; });
    uiButton("Sound: " + (Sfx.muted ? "Off" : "On"), width / 2 - 100, 255, 200, 40, toggleMute);
    outlinedText("Pull the bird back, let go, and knock out every pig.", width / 2, 335, 22);
}

function drawLevelSelect() {
    dimScreen(70);
    outlinedText("Select Level", width / 2, 50, 46, color(255, 235, 120));
    var cols = 3, tw = 170, th = 110, gap = 30;
    var startX = width / 2 - (cols * tw + (cols - 1) * gap) / 2;
    for (var i = 0; i < LEVELS.length; i++) {
        var x = startX + (i % cols) * (tw + gap);
        var y = 90 + Math.floor(i / cols) * (th + 25);
        var unlocked = isUnlocked(i);
        push();
        rectMode(CORNER);
        stroke(70, 35, 10);
        strokeWeight(3);
        fill(unlocked ? color(245, 166, 35, 235) : color(130, 130, 120, 220));
        rect(x, y, tw, th, 12);
        pop();
        outlinedText(unlocked ? "" + (i + 1) : "?", x + tw / 2, y + 36, 40);
        push();
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(15);
        fill(70, 35, 10);
        noStroke();
        text(unlocked ? LEVELS[i].name : "Locked", x + tw / 2, y + 68);
        pop();
        var stars = progress.stars[i] || 0;
        for (var s = 0; s < 3; s++) drawStar(x + tw / 2 - 30 + s * 30, y + 92, 11, s < stars);
        if (unlocked) {
            (function (index, bx, by) {
                // Invisible hit area over the tile.
                buttons.push({ x: bx, y: by, w: tw, h: th, onClick: function () { startLevel(index); } });
            })(i, x, y);
        }
    }
    uiButton("Back", 20, height - 55, 100, 38, function () { gameState = "menu"; });
}

function drawHUD() {
    var def = LEVELS[currentLevel];
    push();
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(18);
    stroke(50, 25, 5);
    strokeWeight(4);
    fill(255);
    text("Level " + (currentLevel + 1) + ": " + def.name, 14, 10);
    fill(255, 235, 120);
    text("Score: " + score, 14, 34);
    pop();

    if (gameState === "playing" || gameState === "paused") {
        uiButton(gameState === "paused" ? "Resume" : "Pause", width - 330, 10, 100, 30, togglePause);
        uiButton("Retry", width - 220, 10, 100, 30, function () { startLevel(currentLevel); });
        uiButton(Sfx.muted ? "Sound Off" : "Sound On", width - 110, 10, 100, 30, toggleMute);
    }

    // Birds still waiting on the platform.
    for (var i = 0; i < birdsQueue; i++) {
        push();
        imageMode(CENTER);
        image(getImage("sprites/bird.png"), 150 - 34 * i, 203, 34, 34);
        pop();
    }

    if (def.hint && birdsUsed === 0 && gameState === "playing") {
        outlinedText(def.hint, width / 2, 80, 22);
    }
}

function drawPauseOverlay() {
    dimScreen(120);
    outlinedText("Paused", width / 2, 110, 56, color(255, 235, 120));
    uiButton("Resume", width / 2 - 100, 160, 200, 50, togglePause);
    uiButton("Restart", width / 2 - 100, 220, 200, 50, function () { startLevel(currentLevel); });
    uiButton("Level Select", width / 2 - 100, 280, 200, 50, function () { gameState = "levels"; });
}

function drawResultOverlay() {
    overlayFrame++;
    dimScreen(140);
    var won = gameState === "won";
    push();
    rectMode(CENTER);
    stroke(70, 35, 10);
    strokeWeight(4);
    fill(255, 236, 190, 245);
    rect(width / 2, height / 2, 480, 300, 18);
    pop();

    outlinedText(won ? "Level Cleared!" : "Level Failed", width / 2, 90, 46, won ? color(255, 235, 120) : color(255, 150, 130));

    if (won) {
        for (var s = 0; s < 3; s++) {
            var appear = overlayFrame > 12 + s * 14;
            if (appear && overlayFrame === 13 + s * 14 && s < resultStars) Sfx.star(s);
            var pop_ = appear ? Math.min(1, (overlayFrame - 12 - s * 14) / 8) : 0;
            drawStar(width / 2 - 70 + s * 70, 150 + (s === 1 ? -8 : 0), 30 * pop_ + 1, s < resultStars);
        }
    } else {
        push();
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(20);
        fill(70, 35, 10);
        noStroke();
        text("The pigs survived. Try again!", width / 2, 150);
        pop();
    }

    push();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(22);
    fill(70, 35, 10);
    noStroke();
    text("Score: " + score + (resultBonus > 0 ? "  (bird bonus " + resultBonus + ")" : ""), width / 2, 200);
    var best = progress.best[currentLevel] || 0;
    textSize(16);
    text((resultNewBest ? "New best!  " : "Best: ") + best, width / 2, 226);
    pop();

    var lastLevel = currentLevel >= LEVELS.length - 1;
    if (won && lastLevel) {
        outlinedText("You beat every level!", width / 2, 255, 20, color(255, 235, 120));
    }
    var by = 280;
    uiButton("Retry", width / 2 - 215, by, 130, 44, function () { startLevel(currentLevel); });
    uiButton("Levels", width / 2 - 65, by, 130, 44, function () { gameState = "levels"; });
    if (won && !lastLevel) {
        uiButton("Next", width / 2 + 85, by, 130, 44, function () { startLevel(currentLevel + 1); });
    }
}
