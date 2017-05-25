class Menu extends Phaser.State {

    constructor() {
	super();
	this.next_button = null;
    }
    
    create() {
	var text = this.add.text(this.game.width * 0.5, this.game.height * 0.5, 'IMPROVISED MENU', {
	    font: '42px "Indie Flower"', fill: '#ffffff', align: 'center'
	});
	text.anchor.set(0.5);

	this.next_button = this.game.add.sprite(200,300,'button_next');
	this.next_button.anchor.set(0.5);
	this.next_button.animations.add('anim');
	this.next_button.play('anim', 10, true);
	this.next_button.inputEnabled = true;
	this.next_button.input.useHandCursor = true;
	this.next_button.events.onInputDown.add(this.startGame, this);
    }

    startGame () {
	this.game.global.current_stage = 1;
	this.game.state.start('game', false, false, this.game.global.current_stage);
  }

}

export default Menu;
