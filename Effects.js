// Visual effects: debris/dust particles, floating score popups and the bird's flight trail.
var particles = [];
var popups = [];
var trailPoints = [];

function clearEffects() {
    particles = [];
    popups = [];
    trailPoints = [];
}

// col is [r, g, b]
function spawnBurst(x, y, count, col, speed, size) {
    for (var i = 0; i < count; i++) {
        var a = Math.random() * Math.PI * 2;
        var s = (0.4 + Math.random()) * (speed || 3);
        particles.push({
            x: x, y: y,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1,
            life: 30 + Math.random() * 20, max: 50,
            size: (size || 6) * (0.5 + Math.random()),
            col: col
        });
    }
}

function spawnPopup(x, y, text) {
    popups.push({ x: x, y: y, text: text, life: 70 });
}

function updateEffects() {
    for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
    for (var j = popups.length - 1; j >= 0; j--) {
        popups[j].y -= 0.7;
        popups[j].life--;
        if (popups[j].life <= 0) popups.splice(j, 1);
    }
}

function drawEffects() {
    push();
    noStroke();
    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        fill(p.col[0], p.col[1], p.col[2], 255 * Math.min(1, p.life / 25));
        ellipse(p.x, p.y, p.size, p.size);
    }
    textAlign(CENTER, CENTER);
    textSize(22);
    textStyle(BOLD);
    for (var j = 0; j < popups.length; j++) {
        var q = popups[j];
        var alpha = 255 * Math.min(1, q.life / 25);
        stroke(60, 30, 0, alpha);
        strokeWeight(4);
        fill(255, 240, 120, alpha);
        text(q.text, q.x, q.y);
    }
    pop();
}

// Dotted path of the most recently launched bird.
function recordTrail(body) {
    if (gameFrame % 4 === 0) {
        trailPoints.push({ x: body.position.x, y: body.position.y });
        if (trailPoints.length > 60) trailPoints.shift();
    }
}

function drawTrail() {
    push();
    noStroke();
    for (var i = 0; i < trailPoints.length; i++) {
        var f = (i + 1) / trailPoints.length;
        fill(255, 255, 255, 40 + 150 * f);
        ellipse(trailPoints[i].x, trailPoints[i].y, 3 + 3 * f, 3 + 3 * f);
    }
    pop();
}
