var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();



function lerp(value, min, max)
{
	return value * (max - min) + min;
}

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our 
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}

//-------------------- Don't modify anything above here
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;
var STATE_GAMEFINISH = 4;
var splashTimer = 4;
var gameState = STATE_SPLASH;

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var background_sound = new Howl (
{
	urls: ["background.ogg"],
	loop: true,
	buffer: true,
	volume: 0.5

});
background_sound.play();

// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

var background = document.createElement("img");
background.src = "bg.png";

function initialize(input_level)
{
	var return_cells = [];
	
	for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++)
	{
		return_cells[layerIdx] = [];
		var idx = 0;
		for (var y = 0; y < input_level.layers[layerIdx].height; y++)
		{
			return_cells[layerIdx][y] = [];
			for (var x = 0; x < input_level.layers[layerIdx].width; x++)
			{
				if (input_level.layers[layerIdx].data[idx] != 0)
				{
					return_cells[layerIdx][y][x] = 1;	
					return_cells[layerIdx][y][x+1] = 1;							
					if (y != 0)
					{
						return_cells[layerIdx][y-1][x] = 1;
						return_cells[layerIdx][y-1][x+1] = 1;
					}
					
				}
				else if (return_cells[layerIdx][y][x] != 1)
				{
					return_cells[layerIdx][y][x] = 0;
				}
				idx++;
			}
		}
	}
	return return_cells;
}



var cells = initialize(level);

var keyboard = new Keyboard();
var player = new Player();

var cam_x = 0;
var cam_y = 0;

var example_emitter = new Emitter();

example_emitter.initialise(1, 200, 100, 0, 3000, 1.5, 50, 0.5, true);



function runSplash(deltaTime)
{
	if (splashTimer > 0)
	{
	context.fillStyle = "#87565f";
	context.font="24px Andy";
	context.fillText("starting game please wait...", 200, 240);
	splashTimer -= deltaTime;
	}
	else
		gameState = STATE_GAME;
	
	
	
}

function runGame(deltaTime)
{
	
	context.fillStyle = "#ccc";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "white";
	context.font = "24px Snap ITC";
	context.fillText("GAME ON!", 750,35);
	

	var wanted_cam_X;
	var wanted_cam_y;
	
	wanted_cam_x = player.x - SCREEN_WIDTH/2;
	wanted_cam_y = player.y - SCREEN_HEIGHT/2;
	
	if (wanted_cam_x < 0)
		wanted_cam_x = 0;
	if (wanted_cam_y < 0)
		wanted_cam_y = 0;
	
	if (wanted_cam_x > MAP.tw * TILE - SCREEN_WIDTH)
		wanted_cam_x = MAP.tw * TILE - SCREEN_WIDTH;
	if (wanted_cam_y > MAP.th * TILE - SCREEN_HEIGHT)
		wanted_cam_y = MAP.th * TILE - SCREEN_HEIGHT;
	
	cam_x = Math.floor(lerp(0.1, cam_x, wanted_cam_x));
	cam_y = Math.floor(lerp(0.1, cam_y, wanted_cam_y));
	
	drawMap(cam_x, cam_y);

	player.update(deltaTime);
	player.draw(cam_x, cam_y);	
	
		
	if (player.lives < 0)
	{
		gameState = STATE_GAMEOVER;
	}

	
}

function runGameOver(deltaTime)
{
	context.fillStyle = "red";
	context.font="50px Andy";
	context.fillText("GAME OVER", canvas.width - 400,100);
	context.fillText("press F5 to play again", canvas.width - 460,150);
	gameState = STATE_GAMEOVER;
	player.isDead = false;
	player.lives = 3;
	return;
}




function run()
{
	context.fillStyle = "#ccc";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	
	var deltaTime = getDeltaTime();
	
	switch(gameState)
		{
		case STATE_SPLASH:
			runSplash(deltaTime);
	break;
		case STATE_GAME:
			runGame(deltaTime);
	break;
		case STATE_GAMEOVER:
			runGameOver(deltaTime);
	break;
		case STATE_GAMEFINISH:
			runGameFinish(deltaTime);
	break;
		
		};
	
	example_emitter.update(deltaTime);
	example_emitter.draw(cam_x, cam_y);

	// update the frame counter 
	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}		
		
	// draw the FPS
	context.fillStyle = "#00f";
	context.font="14px Arial";
	context.fillText("FPS: " + fps, 5, 20, 100);
}

//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
