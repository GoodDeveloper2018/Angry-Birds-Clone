class Box extends BaseClass {
  constructor(x, y, width, height){
    super(x,y,width,height);
    this.image = getImage("sprites/wood1.png");
    this.health = this.maxHealth = 100;
    this.points = 500;
  }

  onDestroy(){
    spawnBurst(this.body.position.x, this.body.position.y, 14, [190, 130, 60], 3.5, 7);
    Sfx.wood();
  }

};
