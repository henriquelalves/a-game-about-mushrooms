class Menu extends Phaser.State {

  constructor() {
    super();
  }
  
  create() {
    var text = this.add.text(this.game.width * 0.5, this.game.height * 0.5, 'You won!', {
      font: '42px Arial', fill: '#ffffff', align: 'center'
    });
    text.anchor.set(0.5);
// BUT AT WHAT COST
    this.saveVarsToLocalStorage();

    this.input.onDown.add(this.restartGame, this);
  }

  saveVarsToLocalStorage(){

  }

  resetGlobalVariables(){

  }

  update() {}

  restartGame () {
    this.resetGlobalVariables();
    this.game.state.start('menu');
  }

}

export default Menu;
