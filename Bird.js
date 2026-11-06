class Bird extends BaseClass {
  constructor(x,y){
    super(x,y,50,50);
    this.image = getImage("sprites/bird.png");
    this.isBird = true;
    this.health = this.maxHealth = Infinity;
  }

  // Birds are never hurt by impacts.
  damage(amount) {}

  display() {
    //this.body.position.x = mouseX;
    //this.body.position.y = mouseY;
    super.display();
  }
}
