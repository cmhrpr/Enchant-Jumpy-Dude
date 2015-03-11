enchant();

// game settings
var pipeDelay = 3;
var fallSpeed = 0.2;
var terminalVelocity = 5;
var cscene = 0;
var debug = 0;

var images = ['assets/mushroom.png', 'assets/pipe.png', 'assets/pipescore.png','assets/logo.png', 'assets/scorebutton.png', 'assets/startbutton.png', 'assets/pause.png'];

// on loading the page
function startGame() {
 document.getElementById("hide").style.visibility ="hidden";
	alert('enjoy the game');	// setup the enchant game
    game = new Game(400, 500);
    game.fps = 60;
    game.score = 0;
    
    // game variables
    game.touched = false;
	game.gameover = false;
	
	// load all the game's images
    game.preload(images);
 
 	// load the TitleScreen into the game
    game.onload = function () {
    	title = new TitleScene();
		game.pushScene(title);
    };
	
	// start the game
    game.start();
}

var GameScene = Class.create(Scene, {
	initialize: function(){
		Scene.apply(this);
		alert("Touch the screen to make him jump!");
		game.gameover = 0;
		game.score = 0;
		game.paused = 0;
		
		// create the player
		player = new Player(32, 152);
		
		// create arrays to hold the pipes and score holes
        pipes = new Array();
		holes = new Array();
		
		// create a label displaying the player's score
		scoreLabel = new Label("Score: ");
		scoreLabel.addEventListener('enterframe', function() {
			this.text = "Score:"+game.score;
		});
		
		pauseButton = new Sprite(30, 30);
		pauseButton.image = game.assets['assets/pause.png'];
		pauseButton.y = 30;
		pauseButton.x = 30;
		pauseButton.addEventListener('touchstart', function()
		{
		if(game.paused){
        			game.paused = 0;
        			console.log("unpaused");
        		}else{
        			game.paused = 1;
        			console.log("paused");
        		}
        });
        
		scoreLabel.x = game.width/2;
		scoreLabel.color = "black";
		
		this.addChild(player);
		this.addChild(scoreLabel);
		this.addChild(pauseButton);
		
		this.addEventListener('enterframe', function () {
       		if(!game.gameover && !game.paused)
       		{
            	this.addPipes();
            }
        });
        
        this.addEventListener('touchstart', function (e) {

        		if(!game.paused){
					if(!game.gameover)	player.jump();
					else				game.replaceScene(new TitleScene());
				}
			
        });
        
		this.addPipes = function() {
        	if(game.frame % (game.fps * pipeDelay) == 0) {
				var hole = Math.floor(Math.random()*5)+1;
				var newhole = new Hole(350, hole*50);
				
				this.addChild(newhole);
				
				for(var i = 0; i<11; i++){
					if(i != hole && i != hole+1){
						var pipe = new Pipe(350, i*50);
						this.addChild(pipe);
						pipes.key = game.frame;
						pipes[game.frame] = pipe;
					}
				}
            }
        }       
		
    	this.gameover = function() {
        	game.gameover = 1;
        	gameoverL = new Label("Game Over!");
			var name = "";
			// client side validation
			while(name== "")
			{
				name = prompt("Game Over! You scored " + game.score + "\nPlease enter your name: ");
			}
			if(!localStorage.highscore)
			{
			localStorage.highscore = game.score;
				localStorage.name = name;
			}
			if(game.score > localStorage.highscore)
			{
				localStorage.highscore = game.score;
				localStorage.name = name;
			}

		}
	}
});

var ScoreScene = enchant.Class.create(enchant.Scene, {
	initialize: function(){
		Scene.apply(this);

		
		startButton = new Sprite(400, 200);
		startButton.image = game.assets['assets/startbutton.png'];
		startButton.scale(0.5,0.5);
		startButton.y = 150;
		startButton.x = -100;

		// create a label displaying the player's score
		scoreLabel = new Label("Score: ");
		scoreLabel.addEventListener('enterframe', function() {
			this.text = localStorage.name + " : " + localStorage.highscore;
		});
		
		
		scoreLabel.x = game.width/2;
		scoreLabel.y = 50;
		scoreLabel.color = "black";
		
		startButton.addEventListener('touchstart', function(evt)
		{
			game.replaceScene(new TitleScene());
		});
		this.addChild(scoreLabel);
		this.addChild(startButton);
				
		
		
		}
		});

var TitleScene = enchant.Class.create(enchant.Scene, {
	initialize: function(){
		Scene.apply(this);
		
		logo = new Sprite(300, 150);
		logo.image = game.assets['assets/logo.png'];
		logo.x = 50;
		
		startButton = new Sprite(400, 200);
		startButton.image = game.assets['assets/startbutton.png'];
		startButton.scale(0.5,0.5);
		startButton.y = 150;
		startButton.x = -100;
		
		
		scoreButton = new Sprite(400, 200);
		scoreButton.image = game.assets['assets/scorebutton.png'];
		scoreButton.y = 150;
		scoreButton.x = 100;
		scoreButton.scale(0.5,0.5);
		
		this.addChild(logo);
		this.addChild(startButton);
		this.addChild(scoreButton);
		
		this.addEventListener('touchstart', function(evt) {
			// if touch is within the button y range
			if(evt.y > 200 && evt.y < 300){
				// if touch is within the x range for the start button
				if(evt.x< 200)	game.replaceScene(new GameScene());
				
				// if touch is within the x range for the score button
				if(evt.x>200 && evt.x< 400) game.replaceScene(new ScoreScene());

			}
		});
		
		this.addEventListener('leftbuttondown', function()
		{
			game.replaceScene(new GameScene());
		});
		
		this.addEventListener('rightbuttondown', function()
		{
			game.replaceScene(new ScoreScene());
		});
		
		}
		});

var Player = enchant.Class.create(enchant.Sprite, {
    initialize: function (x, y) {
        enchant.Sprite.call(this, 25, 25);
        
        // set the player's image
        this.image = game.assets['assets/mushroom.png'];
        
        // set the position (x,y) of the player
        this.x = x; 
        this.y = y;
        
        // speed at start of player is 0
        this.speed = 0;

		// move the player if game is running
        this.addEventListener('enterframe', function () {
			if(!game.gameover && !game.paused)
				this.move();
        });


    },
    
	move: function() {
		// make the player fall faster down the screen
		if(	this.y > 0 && 
			this.speed < terminalVelocity) this.speed += fallSpeed;
		
		// end the game if the player hits the "ground"
		if(this.y >= 500){
				this.speed = 0;
				game.currentScene.gameover();
		}	
		
		// change the y-position of the player based on its speed
		this.y = this.y + this.speed;
	},
	
	jump: function() {
		// make the player "jump" by increasing its y speed
		this.speed = -3;
	}
});

var Pipe = enchant.Class.create(enchant.Sprite, {

    initialize: function (x, y) {

        enchant.Sprite.call(this, 50, 50);
        this.image = game.assets['assets/pipe.png'];
        this.x = x;
        this.y = y;

		this.alive = true;


        this.direction = 0;
        this.moveSpeed = 3;
		

        this.addEventListener('enterframe', function () {
		if(!game.gameover && !game.paused){
            this.move();
			if(this.x <= -50){
				if(this.alive){
				
					if(debug)console.log("removing pipe");
					this.remove();
				}
			}
			if(this.intersect(player))
			{
				if(debug) console.log("game over");
				game.currentScene.gameover();
			}
		}

        });

    },

    move: function () {
        this.x -= this.moveSpeed;
    },
    remove: function () {
		this.alive = false;
        game.rootScene.removeChild(this);
        delete pipes[this.key];
    }
});

var Hole = enchant.Class.create(enchant.Sprite, {

    initialize: function (x, y) {

        enchant.Sprite.call(this, 50, 100);
        if(debug)
		this.image = game.assets['assets/pipescore.png'];
        this.x = x;
        this.y = y;

		this.alive = true;
        this.moveSpeed = 3;
		
        this.addEventListener('enterframe', function () {
		if(!game.gameover && !game.paused){
            this.move();
			if(this.x <= -50){
				if(this.alive){
				if(debug) console.log("removing hole");
				this.remove();
				}
			}
			if(this.intersect(player))
			{
			if(this.alive){
			if(debug) console.log("scored!");
				game.score++;
				this.alive=false;
			}}
			}

        });

    },

    move: function () {
        this.x -= this.moveSpeed;
    },
    remove: function () {
		this.alive = false;
        game.rootScene.removeChild(this);
        delete holes[this.key];
    }
});