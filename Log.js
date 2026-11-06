class Log extends BaseClass{
  constructor(x,y,height,angle){
    super(x,y,20,height,angle);
    this.image = getImage("sprites/wood2.png");
    Matter.Body.setAngle(this.body, angle);
    this.health = this.maxHealth = 75;
    this.points = 500;
  }

  onDestroy(){
    spawnBurst(this.body.position.x, this.body.position.y, 12, [170, 110, 50], 3.5, 6);
    Sfx.wood();
  }
}
