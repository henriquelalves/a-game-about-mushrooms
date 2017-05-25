class Boot extends Phaser.State {

    constructor() {
	super();
    }

    preload() {
	this.load.image('preloader', 'assets/preloader.gif');
    }

    create() {
	this.game.input.maxPointers = 1;

	this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.game.scale.pageAlignHorizontally = true;
	this.game.scale.pageAlignVertically = true;

	// this.game.scale.minWidth =  480;
	// this.game.scale.minHeight = 260;
	this.game.scale.maxWidth = 600;
	this.game.scale.maxHeight = 600;
	
	// //setup device scaling
	// if (this.game.device.desktop) {
	// 	this.game.scale.pageAlignHorizontally = true;
	// 	this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	// } else {
	//   this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	//   this.game.scale.minWidth =  480;
	//   this.game.scale.minHeight = 260;
	//   this.game.scale.maxWidth = 640;
	//   this.game.scale.maxHeight = 480;
	//   this.game.scale.forceOrientation(true);
	//   this.game.scale.pageAlignHorizontally = true;
	//   this.game.scale.setScreenSize(true);
	// }

	this.initGlobalVariables();

	this.game.state.start('preloader');
    }

    initGlobalVariables(){
	this.game.global = {
	    defineKeys: function(that){
		var dict = {}
		dict.left = that.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
		dict.right = that.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
		dict.up = that.game.input.keyboard.addKey(Phaser.Keyboard.UP);
		dict.down = that.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
		dict.enter = that.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		dict.spacebar = that.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		return dict;
	    },
	};
    }

}

export default Boot;
