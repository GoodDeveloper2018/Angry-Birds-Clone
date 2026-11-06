class Pig extends BaseClass {
  constructor(x, y, size){
    size = size || 50;
    super(x,y,size,size);
    this.image = getImage("sprites/enemy.png");
    this.isPig = true;
    this.health = this.maxHealth = size > 50 ? 200 : 45;
    this.points = size > 50 ? 10000 : 5000;
  }

  onDestroy(){
    spawnBurst(this.body.position.x, this.body.position.y, 18, [140, 220, 90], 3.5, 8);
    spawnBurst(this.body.position.x, this.body.position.y, 8, [255, 255, 255], 2.5, 6);
    Sfx.pig();
  }

};
