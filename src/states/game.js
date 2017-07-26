var Tile = function(){
    return {
	light: false, // If there is light hitting the floor (burns mushrooms, but won't stop spores).
	stone: false, // If tile is a stone (will stop spores from spreading)
	back_button: false,
	next_button: false,
	mushroom: false, // If tile is a mushroom
	mushroom_life: 0, // Mushroom life
	mushroom_sprite: null, // Mushroom sprite
	mushroom_label: null, // Mushroom label (unused?)
	target: 0, // 0: is not a target; 1: is target (mushroom); 2: is target (perfect mushroom)
    }
}

const DEFAULT_LIFE = 2;

class Game extends Phaser.State {
    constructor() {
	super();
	
	// Variables Game related
	this.begun = false;
	this.disable = true;
	
	this.x_offset = 100;
	this.y_offset = 100;

	this.stage_number = 0;
	this.stars3 = 0;
	this.stars2 = 0;
	this.won = false;
	this.spawnTimer = 0;
	this.width = 10;
	this.height = 10;
	this.scale = 1.0;
	this.delta_width = 0.0;
	this.board = [];
	this.targets = [];
	this.turn = 0;
	this.state = 0;
	this.recorded_boards = [];
	
	this.label_turn = 0;
	this.label_target = 0;

	// Tile groups (for drawing!)
	this.backdrop = null;
	this.middledrop = null;
	this.spores = null;
	this.overdrop = null;
	
	this.keys = null;
    }
    
    init(sn) {
	this.stage_number = 1;
	if(sn)
	    this.stage_number = sn;
    }

    create() {
	this.begun = false;
	this.targets = new Array();
	this.board = [];
	this.spawnTimer = 0.0;
	this.won = false;
	this.turn = 0;
	// Initialize groups
	this.backdrop = this.game.add.group();
	this.middledrop = this.game.add.group();
	this.spores = this.game.add.group();
	this.overdrop = this.game.add.group();
	this.overdrop.alpha = 0.5;

	this.recorded_boards = [];
	
	// Initialize board
	console.log('stage'+this.stage_number);
	var json_file = this.game.cache.getJSON('stage'+this.stage_number);
	this.board_width = json_file.size_x;
	this.board_height = json_file.size_y;
	this.stars3 = json_file['3-stars'];
	this.stars2 = json_file['2-stars'];
	
	// Set scale
	this.scale = 1.0;
	if (this.board_width <= 6){
	    this.scale = 1.5;
	}
	if (this.board_width <= 4){
	    this.scale = 2.0;
	}

	this.delta_width = 400 - (this.board_width*32*this.scale);
	console.log(this.delta_width);
	this.x_offset = this.delta_width/(2.0*this.scale);
	this.y_offset = this.x_offset;

	this.backdrop.scale.setTo(this.scale,this.scale);
	this.middledrop.scale.setTo(this.scale,this.scale);
	this.spores.scale.setTo(this.scale,this.scale);
	this.overdrop.scale.setTo(this.scale,this.scale);
	
	for(var i = 0; i < this.board_width; i++){
	    this.board.push([]);
	    for(var j = 0; j < this.board_height; j++){
		this.board[i].push(new Tile());
		this.backdrop.create(this.x_offset + i*32, this.y_offset + j*32, 'grass');
		var array = this.backdrop.children;
		array[array.length-1].frame = Math.floor(Math.random()*4);
		if (json_file.tiles[j][i] == 't'){
		    this.board[i][j].target = 1;
		}
		if (json_file.tiles[j][i] == 'm'){
		    this.board[i][j].mushroom = true;
		}
		if (json_file.tiles[j][i] == 's'){
		    this.board[i][j].stone = true;
		}
	    }
	}
	
	// Create tiles
	for(var i = 0; i < this.board_width; i++){
	    for(var j = 0; j < this.board_height; j++){
		// if(this.board[i][j].mushroom == true){
		//     this.spawnMushroom(i,j,DEFAULT_LIFE);
		// }
		if(this.board[i][j].stone == true){
		    this.middledrop.create(this.x_offset + i*32, this.y_offset + j*32, 'tile-stone');
		}
		if(this.board[i][j].light == true){
		    this.overdrop.create(this.x_offset + i*32, this.y_offset + j*32, 'tile-light');
		}
		if(this.board[i][j].target == 1){
		    this.overdrop.create(this.x_offset + i*32, this.y_offset + j*32, 'over-target1');
		    this.targets.push([i,j,1]);
		}
	    }
	}

	// Back button
	this.back_button = this.game.add.sprite(10,10,'button_back');
	this.back_button.animations.add('anim');
	this.back_button.play('anim', 10, true);
	this.back_button.inputEnabled = true;
	this.back_button.input.useHandCursor = true;
	this.back_button.events.onInputDown.add(this.rewindMove, this);

	this.next_button = this.game.add.sprite(-50,300,'button_next');
	this.next_button.anchor.set(0.5);
	this.next_button.animations.add('anim');
	this.next_button.play('anim', 10, true);
	this.next_button.inputEnabled = true;
	this.next_button.input.useHandCursor = true;
	this.next_button.events.onInputDown.add(this.nextStage, this);
	
	// Labels
	var style = {font: "32px 'Indie Flower'", fill:'#ffffff'};
	this.label_turn = this.game.add.text(200,32,'turn: ' + this.turn, style);
	this.label_turn.anchor.set(0.5);
	this.label_target = this.game.add.text(200,360,'target: ' + json_file['3-stars'],style);
	this.label_target.anchor.set(0.5);
	
	// Overdrop tween
	this.game.add.tween(this.overdrop).to({alpha:0.3}, 1000, "Linear", false, 0, -1, true).start();
	
	// Keyboard input
	this.keys = this.game.global.defineKeys(this);
	// this.keys.up.onDown.add(this.move,this);
	// this.keys.down.onDown.add(this.move,this);
	// this.keys.left.onDown.add(this.move,this);
	// this.keys.right.onDown.add(this.move,this);

	// Swipe setup
	var that = this;
	let SwipeModel = {
	    up: function(point) {
		that.move(that.keys.up);
	    },
	    down: function(point) {
		that.move(that.keys.down);
	    },
	    left: function(point) {
		that.move(that.keys.left);
	    },
	    right: function(point) {
		that.move(that.keys.right);
	    },
	};
	this.swipe = new Swipe(this.game, SwipeModel);
	
    }

    // Keyboard callback
    move(k){
	if (this.disable)
	    return;

	this.turn += 1;
	
	// Move mushrooms
	if (k == this.keys.up){
	    this.moveMushrooms('up');
	} else if (k == this.keys.down){
	    this.moveMushrooms('down');
	} else if (k == this.keys.right){
	    this.moveMushrooms('right');
	} else if (k == this.keys.left){
	    this.moveMushrooms('left');
	}
	
	// Update tiles
	for (var i = 0; i < this.board_width; i++){
	    for (var j = 0; j < this.board_height; j++){
		if(this.board[i][j].mushroom){
		    if (this.board[i][j].light) {
			this.board[i][j].mushroom = false;
			this.board[i][j].mushroom_life = 0;
			this.board[i][j].mushroom_sprite.destroy();
			// this.board[i][j].mushroom_sprite = this.game.add.sprite(this.x_offset + i*32, this.y_offset + j*32, 'dieing-mushroom');
		    } else {
			this.board[i][j].mushroom_life -= 1;
			if (this.board[i][j].mushroom_life == 0){
			    this.board[i][j].mushroom = false;
			    var sprite = this.board[i][j].mushroom_sprite;
			    sprite.loadTexture('tile-mushroom-dieing',0);
			    var anim = sprite.animations.add('anim');
			    sprite.animations.play('anim', 10, false);
			    anim.onComplete.add(function(){this.destroy();},sprite);
			    // this.board[i][j].mushroom_sprite = this.game.add.sprite(this.x_offset + i*32, this.y_offset + j*32, 'dieing-mushroom');
			} else if (this.board[i][j].mushroom_life == 1) {
			    // this.board[i][j].mushroom_sprite.destroy();
			    // var new_sprite = this.middledrop.create(this.x_offset + i*32,this.y_offset + j*32, 'tile-mushroom-dieing');
			    var sprite = this.board[i][j].mushroom_sprite;
			    sprite.loadTexture('tile-mushroom',0);
			    var anim = sprite.animations.add('dieing');
			    sprite.animations.play('dieing',5,false);
			}
		    }
		}
	    }
	}

	// Update moves label
	this.label_turn.setText('turn: '+this.turn);
	
	// Check winning condition
	var won = true;
	for (var i = 0; i < this.targets.length; i++){
	    if (this.board[this.targets[i][0]][this.targets[i][1]].mushroom == false)
		won = false;
	}

	this.won = won;
    }
    
    update() {
	// Swipe update
	this.swipe.check();
	
	// Spawn mushrooms
	if(!this.begun){
	    this.begun = true;
	    this.disable = false;
	    for(var i = 0; i < this.board_width; i++){
		for(var j = 0; j < this.board_height; j++){
		    if(this.board[i][j].mushroom == true){
			this.spawnMushroom(i,j,DEFAULT_LIFE);
		    }
		}
	    }
	}
	
	this.spawnTimer += this.game.time.elapsed/1000.0;
	if ((this.won && this.spawnTimer > 1) && this.disable == false){ // Won the game
	    this.disable = true;

	    var won_writing_sprite = this.game.add.sprite(200,200,'won_writing');
	    won_writing_sprite.anchor.setTo(0.5,0.5);
	    var won_writing_anim = won_writing_sprite.animations.add('default');
	    won_writing_sprite.animations.play('default', 18, false);
	    won_writing_sprite.animations.currentAnim.onComplete.add(function(){
		won_writing_sprite.loadTexture('won',0);
		won_writing_anim = won_writing_sprite.animations.add('default');
		won_writing_sprite.animations.play('default', 12, true);
		won_writing_sprite.animations.frame = 2;
		var stars = 3;
		if (this.turn > this.stars3)
		    stars = 2;
		if (this.turn > this.stars2)
		    stars = 1;
		
		for (var i = 0; i < stars; i++){
		    var star_sprite = this.game.add.sprite(160 + 40*i,240,'star');
		    star_sprite.animations.add('default');
		    star_sprite.animations.play('default', 18, true);
		    star_sprite.anchor.setTo(0.5,0.5);
		    star_sprite.scale.setTo(0.0,0.0);
		    var tween = this.game.add.tween(star_sprite.scale).to({x:1.0,y:1.0},1000,Phaser.Easing.Cubic.InOut,false, (i*500)).start();
		    var tchans_sprite = this.game.add.sprite(160 + 40*i,240,'tchans');
		    tchans_sprite.anchor.setTo(0.5,0.5);
		    tchans_sprite.animations.add('default');
		    tchans_sprite.animations.play('default', 10, false,true);
		}
		
		// this.input.onDown.add(this.nextStage, this);
		// this.nextStage();

		this.game.add.tween(this.next_button).to({x:200},1000,Phaser.Easing.Cubic.InOut,true,i*500);
		
		
	    }, this);
	}
    }

    restart() {
	this.game.state.start('game',null,null,true,false,this.game.global.current_stage);
    }

    rewindMove() {
	if (this.recorded_boards.length == 0)
	    return;

	console.log(this.recorded_boards);
	var last_board = this.recorded_boards.pop();
	for (var i = 0; i < this.board_width; i++){
	    for (var j = 0; j < this.board_height; j++){
		if (this.board[i][j].mushroom){
		    this.renewMushroom(i,j);
		} 
	    }
	}

	for (var i = 0; i < last_board.length; i+=1){
	    console.log(last_board);
	    this.renewMushroom(last_board[i][0],last_board[i][1]);
	}
	
	this.turn -= 1;
	this.label_turn.setText('turn: '+this.turn);
    }

    renewMushroom(x,y){
	if (this.board[x][y].mushroom == false){ // Weak mushroom
	    var sprite = this.middledrop.create(this.x_offset + x*32,this.y_offset + y*32, 'tile-mushroom-dieing');
	    var anim = sprite.animations.add('dieing',[5,4,3,2,1]);
	    sprite.animations.play('dieing',5,false);

	    this.board[x][y].mushroom_sprite = sprite;
	    this.board[x][y].mushroom = true;
	    this.board[x][y].mushroom_life = 1;	    
	} else if(this.board[x][y].mushroom_life == 1){ // Strong mushroom
	    var sprite = this.board[x][y].mushroom_sprite;
	    sprite.loadTexture('tile-mushroom',0);
	    var anim = sprite.animations.add('dieing',[5,4,3,2,1]);
	    sprite.animations.play('dieing',5,false);
	    sprite.animations.currentAnim.onComplete.add(function(){this.loadTexture('tile-mushroom',0);this.animations.add('current',[0,1]);this.animations.play('current',2,true);},sprite);

	    this.board[x][y].mushroom_life = 2;
	    
	} else if(this.board[x][y].mushroom_life == 2){ // Despawn
	    this.board[x][y].mushroom = false;
	    var sprite = this.board[x][y].mushroom_sprite;
	    sprite.loadTexture('tile-mushroom-borning',0);
	    var anim = sprite.animations.add('anim',[5,4,3,2,1]);
	    sprite.animations.play('anim', 10, false);
	    anim.onComplete.add(function(){this.destroy();},sprite);

	    this.board[x][y].mushroom = false;
	    this.board[x][y].mushroom_life = 0;
	}
	
    }
    
    copyBoard() {
	var copy = [];
	console.log(this.board[0]);
	for(var i = 0; i < this.board.length; i+=1){
	    for(var j = 0; j < this.board[0].length; j+=1){
		if(this.board[i][j].mushroom && this.board[i][j].mushroom_life == 1){
		    copy.push([i,j]);
		}
	    }
	}
	return copy;
    }
    
    moveMushrooms(dir) { // This is a bit tricky, but it was made like this so I can change only one function to test all possible directions
	this.recorded_boards.push(this.copyBoard());
	
	var i,j = 0;
	var i_init, i_final, j_init, j_final = 0;
	var hor = false;

	var spore_x = 0,spore_y = 0;
	
	if (dir == 'up'){
	    i_init = 0;
	    i_final = this.board_width;
	    j_init = this.board_height - 1;
	    j_final = -1;
	    spore_y = -32;
	} else if (dir == 'down'){
	    i_init = 0;
	    i_final = this.board_width;
	    j_init = 0;
	    j_final = this.board_height;
	    spore_y = 32;
	} else if (dir == 'left'){
	    i_init = 0;
	    i_final = this.board_height;
	    j_init = this.board_width - 1;
	    j_final = -1;
	    spore_x = -32;
	    hor = true;
	} else if (dir == 'right'){
	    i_init = 0;
	    i_final = this.board_height;
	    j_init = 0;
	    j_final = this.board_width;
	    spore_x = 32;
	    hor = true;
	}

	i = i_init;
	j = j_init;
	
	while( i != i_final){
	    var mushroom_count = 0;
	    j = j_init;
	    while(j != j_final){

		var m = i;
		var n = j;
		if (hor) {
		    m = j;
		    n = i;
		}
		
		if (this.board[m][n].mushroom){
		    mushroom_count = 2;
		    // Create random number of spores
		    for (var r = 0; r < Math.floor(Math.random()*3)+1; r++){
			var spore = this.spores.create(this.x_offset + Math.floor(Math.random()*24) + m*32, this.y_offset + Math.floor(Math.random()*24) + n*32, 'spore');
			var tween = this.game.add.tween(spore)
			tween.to({x:(this.x_offset+Math.floor(Math.random()*24) + m*32 + spore_x), y: (this.y_offset + Math.floor(Math.random()*24) + n*32 + spore_y)}, 500, Phaser.Easing.Sinusoidal.InOut);
			tween.onComplete.add(function(){this.destroy();},spore);
			tween.start();
			
		    }
		} else if (this.board[m][n].stone){
		    mushroom_count = 0;
		} else if (mushroom_count > 0){
		    this.spawnMushroom(m,n);
		}
		mushroom_count = Math.max(0, mushroom_count-1);
		
		if (j_init < j_final)
		    j += 1;
		else
		    j -= 1;
	    }
	    
	    if (i_init < i_final)
		i += 1;
	    else
		i -= 1;
	}
    }

    spawnMushroom(x, y, life = DEFAULT_LIFE+1){
	this.spawnTimer = 0.0;
	
	this.board[x][y].mushroom = true;
	var new_sprite = this.middledrop.create(this.x_offset + x*32,this.y_offset + y*32, 'tile-mushroom-borning');
	var anim = new_sprite.animations.add('anim');
	new_sprite.animations.play('anim', 10, false);
	new_sprite.animations.currentAnim.onComplete.add(function(){this.loadTexture('tile-mushroom',0);this.animations.add('current',[0,1]);this.animations.play('current',2,true);},new_sprite);
	this.board[x][y].mushroom_sprite = new_sprite;
	this.board[x][y].mushroom_life = life;
    }

    nextStage() {
	var slideIn = Phaser.Plugin.StateTransition.In["SlideLeft"],
	    slideOut = Phaser.Plugin.StateTransition.Out["SlideLeft"];
	slideIn.duration = 1e3;
	slideOut.duration = 1e3;
	
	if(this.game.global.current_stage < this.game.global.stages){
	    this.game.global.current_stage += 1;
	    this.game.state.start('game', slideOut, slideIn, true, false, this.game.global.current_stage);
	} else {
	    this.game.state.start('gameover', slideOut, slideIn);
	}
    }
    
    endGame() {
	this.game.state.start('gameover');
    }
}

export default Game;
