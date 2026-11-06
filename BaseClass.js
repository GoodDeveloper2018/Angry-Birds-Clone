// Sprites are cached so that creating a new object (a new bird every shot, a new
// level, ...) never has to wait for an image to load again.
var imageCache = {};
function getImage(path) {
    if (!imageCache[path]) imageCache[path] = loadImage(path);
    return imageCache[path];
}

// Every BaseClass object registers itself here so the game can draw and update it.
var gameObjects = [];
// Bodies removed during a physics step are queued and taken out of the world afterwards.
var pendingRemoval = [];

class BaseClass{
    constructor(x, y, width, height, angle) {
        var options = {
            'restitution':0.8,
            'friction':1.0,
            'density':1.0
        }
        this.body = Bodies.rectangle(x, y, width, height, options);
        this.width = width;
        this.height = height;
        this.image = getImage("sprites/base.png");
        World.add(world, this.body);

        // game additions
        this.body.gameObject = this;
        this.health = 100;
        this.maxHealth = 100;
        this.points = 0;
        this.dead = false;
        this.flash = 0;
        gameObjects.push(this);
      }

      // Called with the amount of impact damage from a collision.
      damage(amount){
        if (this.dead || amount <= 0) return;
        this.health -= amount;
        this.flash = 6;
        if (this.health <= 0) this.destroy();
      }

      destroy(){
        if (this.dead) return;
        this.dead = true;
        pendingRemoval.push(this.body);
        if (this.points > 0) {
          score += this.points;
          spawnPopup(this.body.position.x, this.body.position.y - 10, "" + this.points);
        }
        this.onDestroy();
      }

      onDestroy(){}

      display(){
        var angle = this.body.angle;
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(angle);
        imageMode(CENTER);
        this.applyTint();
        image(this.image, 0, 0, this.width, this.height);
        noTint();
        this.drawCracks();
        pop();
      }

      // Flash red when hit, then darken as health runs out.
      applyTint(){
        if (this.flash > 0) {
          this.flash--;
          tint(255, 110, 110);
        } else if (this.maxHealth !== Infinity) {
          var f = this.health / this.maxHealth;
          if (f < 0.66) {
            var c = 255 - 110 * (1 - f);
            tint(c, c, c);
          }
        }
      }

      drawCracks(){
        if (this.isPig || this.maxHealth === Infinity) return;
        var f = this.health / this.maxHealth;
        if (f >= 0.6) return;
        var w = this.width, h = this.height;
        push();
        stroke(40, 25, 15, 190);
        strokeWeight(2);
        line(-w * 0.1, -h * 0.4, w * 0.05, -h * 0.05);
        line(w * 0.05, -h * 0.05, -w * 0.15, h * 0.3);
        if (f < 0.3) {
          line(w * 0.05, -h * 0.05, w * 0.3, h * 0.2);
          line(-w * 0.3, -h * 0.1, -w * 0.05, -h * 0.02);
        }
        pop();
      }
}
