class Preloader extends Phaser.State {

  constructor() {
    super();
    this.asset = null;
    this.ready = false;
  }

  preload() {
    //setup loading bar
    this.asset = this.add.sprite(this.game.width * 0.5 - 110, this.game.height * 0.5 - 10, 'preloader');
    this.load.setPreloadSprite(this.asset);

    //Setup loading and its events
    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.loadResources();
  }

  update() {
      if (this.ready) {
          this.game.state.start('menu');
      }
  }

  loadResources() {
      this.game.load.spritesheet('tile-mushroom', 'assets/images/mushroom-decaying.png',32, 32);
      this.game.load.spritesheet('tile-mushroom-dieing', 'assets/images/mushroom-dieing.png', 32, 32);
      this.game.load.spritesheet('tile-mushroom-borning', 'assets/images/mushroom-borning.png', 32, 32);
      this.game.load.spritesheet('won_writing', 'assets/images/won_writing.png', 120,50,22);
      this.game.load.spritesheet('won', 'assets/images/won.png',120,50,6);
      this.game.load.spritesheet('tchans', 'assets/images/tchans.png',32,32);
      this.game.load.spritesheet('star', 'assets/images/star.png',32,32);
      this.game.load.spritesheet('button_back', 'assets/images/back_arrow.png',32,32);
      this.game.load.spritesheet('button_next', 'assets/images/next_arrow.png',32,32);
      
      this.game.load.image('spore', 'assets/images/spore.png');
      this.game.load.spritesheet('grass', 'assets/images/ground_sprite.png', 32, 32);
      this.game.load.image('over-target1', 'assets/images/target1.png');
      this.game.load.image('tile-stone', 'assets/images/stone.png');
      this.game.load.image('tile-light', 'assets/images/light.png');

      this.game.global.current_stage = 1;
      this.game.global.stages = 7;
      for (var i = 1; i < this.game.global.stages+1; i++){
	  this.game.load.json('stage'+i, 'assets/stages/stage'+i+'.json');
      }
  }

  onLoadComplete() {
    this.ready = true;
  }
}

export default Preloader;
