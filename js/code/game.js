/* variable declarations */
        var stage;
		var canvas;
		var g;		
		var stars;
		var limit;
		var fpsDisplay;
		var scoreDisplay;
		var ship;
		var shipImg;
		var bullets;
		var rocks;
		var explosions;
		
		var ROCK_LIMIT = 3;
		var ROCK_SPEED = 10;
		var BULLET_SPEED = 15;
		var BG_SPEED = 4;
		var speed = 8;
		var score = 0;
		var moveLeft = false;
		var moveRight = false;
		var moveUp = false;
		var moveDown = false;
		var gameOver = false;
		
		var shot;
		var boom;

        var bossImg; 
        var boss;
        var bossMove = false;
        var bossLvl = false; 
        var counter = 0; 

        /* my function to  reload page easily */

        function reloadGame(){
            location.reload();
        }

        /* boss level function */
        function createBoss(){
            bossImg = new Image(); 
            bossImg.onload = onBossLoaded; 
            bossImg.src = "img/enemy.png";
        }
        
        function onBossLoaded(){
            boss = new Bitmap(bossImg);
            boss.visible = false; 
            boss.regX = boss.image.width * 0.5;
			boss.regY = boss.image.height * 0.5;
			boss.x    = 700;
			boss.y 	  = 60;
			
			stage.addChild(boss);	
        }

        /* function that will be used to update the position of the boss up and down the screen */
        function updateBoss(){
            /* get boss to move up and down screen constantly */
            if(boss.y >= 60 && boss.y < 500 && bossMove == false)
            {
                boss.y += speed; 
                
                if(boss.y > 400)
                {
                    bossMove = true; 
                }
                
            }
            else if(boss.y < 540 && bossMove == true)
            {
                boss.y -= speed; 
                
                if(boss.y < 100)
                {
                    bossMove = false; 
                }
            }
        }
        
        /* init fuction to be call on body load */
		function init()	{		
            
			bullets = new Array();
			rocks = new Array();
			explosions = new Array();
			/* changed the .mp3 files in the root directory so that code does not require alterations for soundJS */
			SoundJS.addBatch(
				[{name:"shot", src:"./shot.mp3", instances:1},
				{name:"boom", src:"./boom.mp3", instances:2 },
				{name:"die", src:"./death.mp3", instances:1 },
				{name:"theme", src:"./minions.mp3", instances:1}]
			);
			
			SoundJS.onLoadQueueComplete  = onSoundLoaded;
			
			canvas = document.getElementById("canvas");
			stage = new Stage(canvas);			

			fpsDisplay = new Text("24 FPS", "20px bold Arial", "#00cc00", 200);
			fpsDisplay.x = 4;
			fpsDisplay.y = 20;
			
			scoreDisplay = new Text("Score: " + score, "20px bold Arial", "#00cc00", 100);
			scoreDisplay.textAlign = "right";
			scoreDisplay.x = 780;
			scoreDisplay.y = 20;
			
			shipImg = new Image();
			shipImg.onload = onShipLoaded;
			shipImg.src  = "img/player.png";
			createBoss();
			createStarField();
			
			stage.addChild(fpsDisplay);
			stage.addChild(scoreDisplay);
			Ticker.setFPS(60);
			
			document.onkeydown = onKeyDown;
			document.onkeyup	= onKeyUp;
            
            counter = 0; 
		}
		
		function onShipLoaded() {
			ship = new Bitmap(shipImg);
			ship.regX = ship.image.width * 0.5;
			ship.regY = ship.image.height * 0.5;
			ship.x    = 100;
			ship.y 	  = 100;
			
			stage.addChild(ship);			
		}
		
		function onSoundLoaded() {
			SoundJS.play("theme", SoundJS.INTERRUPT_NONE, 1, 1);
			Ticker.addListener(window);
		}
		
		function doFire() {
			var bulletG = new Graphics();
			bulletG.setStrokeStyle(1);
			bulletG.beginStroke(Graphics.getRGB(180,0,0));
			bulletG.beginFill(Graphics.getRGB(200,200,0));
			bulletG.drawCircle(0,0, 3);
			
			var bullet = new Shape(bulletG);
			bullet.scaleY = 1.5;
			bullet.x = ship.x + 1.5;
			bullet.y = ship.y - 30;
			bullets.push(bullet);
			
			stage.addChild(bullet);
			
			SoundJS.play("shot", SoundJS.INTERRUPT_LATE);
		}

        function updateBullets() {
            var bLimit = bullets.length - 1;
            
            for(var i = bLimit; i >= 0; --i) {
                bullets[i].x += BULLET_SPEED;
                /* canvas ends at 800 --- off screen */
                if(bullets[i].x > 805) {
                    stage.removeChild(bullets[i]);					
                    bullets.splice(i, 1)
                }
            }
        }
                
		function onKeyDown(e) {		
			if(!e){ var e = window.event; }
			
            //ADDED PREVENTDEFAULT TO PREVENT THE WINDOW FROM SCROLLING WHEN USING THE ARROW KEYS! 
            
				switch(e.keyCode) {
					// left
					case 37: 	moveLeft = true; moveRight = false; e.preventDefault();	break;					
					// up
					case 38:	moveUp = true; moveDown = false; e.preventDefault();	break;					
					// right
					case 39:	moveRight = true; moveLeft = false; e.preventDefault();	break;										
					// down
					case 40:	moveDown = true; moveUp = false; e.preventDefault();	break;
                        
                    case 32: e.preventDefault(); break;
				}
		}
		
        /* make shooting harder by firing only onkeyup - will not allow constant shoots to be fired */
		function onKeyUp(e) {		
			if(!e){ var e = window.event; }
			
				switch(e.keyCode) {
					// left
					case 37: 	moveLeft = false; break;					
					// up
					case 38:	moveUp = false; break;					
					// right
					case 39:	moveRight = false; break;
					// down
					case 40:	moveDown = false; break;
					// Space
					case 32:	doFire(); break;
				}
		}
		
        /* TICK FUNCTION *********************************** */
		function tick() {
			
			fpsDisplay.text = Math.round(Ticker.getMeasuredFPS()) + " FPS";
			
			if(gameOver != true && bossLvl == false) {
				createRock();
				checkMovement();				
				collide();
			}
            
            if(bossLvl == true){
                updateBoss();
                checkMovement();
                myCollision();
            }
            
			updateStarField();
			updateBullets();
			updateRocks();
			updateExplosions();
			stage.update();
		}
		/*update the snow effect on the screen */
		function updateStarField() {
			var curStar;
			for(var i = 0; i < limit; ++i) {
				curStar = stars[i];
				curStar.y += BG_SPEED;
				if(curStar.y > 600)
				{
					curStar.x = randRange(10, 800);
					curStar.y = -randRange(20,600);					
				}
			}
		}

		function updateExplosions() {
			var loopLimit = explosions.length - 1;
			for(var i = loopLimit; i >= 0; --i) {
				explosions[i].alpha -= 0.1;
				if(explosions[i].alpha <= 0) {
					stage.removeChild(explosions[i]);
					explosions.splice(i, 1);
				}
			}
		}
		/* check for collision b/w minion and bullet, also, for minion and ship, respond accordingly */
		function collide() {
			var numRocks = rocks.length - 1;
			var numBullets = bullets.length - 1;
			var curRock, curBullet;
			
			for(var i = numRocks; i >= 0; --i) {
				curRock = rocks[i];
				if(distance(curRock, ship) < 45) { // a distance of 45 gives a little cushion for the player
					endGame();
				}
                
				for(var j = numBullets; j >= 0; --j) {
					curBullet = bullets[j];
                    
                    
					if( distance(curRock, curBullet) < 32)  {
						stage.removeChild(curRock);
						stage.removeChild(curBullet);
						createExplosion(curRock.x, curRock.y);
						rocks.splice(i, 1);
						bullets.splice(j, 1);				
						score += 100;
                        if(score > 3000)
                        {   
                            boss.visible = true;
                            bossLvl = true; 
                        }
						scoreDisplay.text = "Score: " + score;
						SoundJS.play("boom", SoundJS.INTERRUPT_LATE);
						break;
					}
				}
				numBullets = bullets.length - 1;
			}
		}

        /* collision function for the grinch and bullets , problems with game's collision function so i made my own */
        function myCollision(){
                    
            var numBullets = bullets.length - 1;
            var curBullet;
            
            
            
            
            for(var j = numBullets; j >= 0; --j) {
					curBullet = bullets[j];
                
                    if(distance(boss,curBullet) < 60 && boss.visible === true)
                    {
                        stage.removeChild(boss); 
                        stage.removeChild(curBullet); 
                        createExplosion(boss.x, boss.y); 
                        winGame();
                    }
                
				}
            
            numBullets = bullets.length - 1;
        }
        
        /* call when player defeats the boss */
        function winGame(){
            gameOver = true; 
            SoundJS.play("boom", SoundJS.INTERRUPT_LATE);
            var goverText = new Text("You Win!", "72pt bold Arial", "#cc0000");
			goverText.textAlign = "center";
			goverText.x = 380;
			goverText.y = 250;
            SoundJS.play("die", SoundJS.INTERRUPT_NONE);
			stage.addChild(goverText);
            
        }
		
        /* function to call if player loses */
		function endGame() {
			createExplosion(ship.x, ship.y);
			stage.removeChild(ship);	
			
			SoundJS.play("boom", SoundJS.INTERRUPT_LATE);
			SoundJS.stop("theme");
			SoundJS.play("die", SoundJS.INTERRUPT_NONE);
			gameOver = true;			
			
			var goverText = new Text("GAME OVER", "72pt bold Arial", "#cc0000");
			goverText.textAlign = "center";
			goverText.x = 380;
			goverText.y = 250;
			stage.addChild(goverText);
		}
		
		function distance(obj1, obj2) {
			var difx = obj2.x - obj1.x;
			var dify = obj2.y - obj1.y;
			
			return Math.sqrt( (difx*difx) + (dify*dify) );
		}
		/* create explosion effect */
		function createExplosion(xpos, ypos) {
			var exp = new Bitmap("explode.png");
			exp.regX = exp.image.width * 0.5;
			exp.regY = exp.image.height * 0.5;
			exp.x = xpos;
			exp.y = ypos;
			explosions.push(exp);
			stage.addChild(exp);
		}
		
		/* use this function to create minions */
		function createRock() {
			if(randRange(0, 100) > 80 && rocks.length < ROCK_LIMIT) {
				var r = new Bitmap("img/robot.png");
				r.regX = r.image.width * 0.5;
				r.regY = r.image.height * 0.5;
				r.x = randRange(900, 1000);
				r.y = randRange(100, 500);
				rocks.push(r);				
				stage.addChildAt(r, stage.getChildIndex(fpsDisplay) - 1);
			}
		}
		
		/* updates the minions position */
		function updateRocks() {
			var loopLimit = rocks.length - 1;
			for(var i = loopLimit; i >= 0; --i) {
				rocks[i].x -= ROCK_SPEED;
				if(rocks[i].x < -50) {					
					stage.removeChild(rocks[i]);
					rocks.splice(i, 1)
					score -= 50;
                    if(score < 0)
                    {
                        endGame();
                    }
					scoreDisplay.text = "Score: " + score;
				}
			}
		}
		
        function checkMovement() {
            if(moveLeft)
            {
                /* left - keep on screen */
                if(ship.x > 80 )
                {
                    ship.x -= speed;
                }
            }
            else if(moveRight)
            {
                /* right - keep on screen */
                if(ship.x < 720)
                {
                    ship.x += speed;
                }
            }
                        
            if(moveUp)
            {
                if(ship.y > 60)
                {
                    ship.y -= speed; 
                }
            }
            else if(moveDown)
            {
                if(ship.y < 540)
                {
                    ship.y += speed; 
                }
            }
        }
		
        /* use this function to create the effect of falling snow */
		function createStarField() {		
			stars = new Array();
			
			g = new Graphics();
			g.setStrokeStyle(1);
			g.beginStroke(Graphics.getRGB(255,255,255));
			g.beginFill(Graphics.getRGB(255,255,255));
			g.drawCircle(0,0, 1);
			
			for(var i = 0; i < 100; ++i) {
				var s = new Shape(g);
				stars.push(s);
				s.x = randRange(10, 630);
				s.y = randRange(-250, 470);
				s.scaleX = randRange(0.5, 2);
				s.alpha = Math.random() + 0.2;
				
				if(stage.getNumChildren() >= 3)
					stage.addChildAt(s, stage.getNumChildren() - 3);
				else
					stage.addChild(s);
			}
			
			limit = stars.length;
		}

		
		function randRange(min, max) {
			return Math.floor(Math.random() * (max - min)) + min;
		}
		
		function toggleFPS() {
			fpsDisplay.visible = !fpsDisplay.visible;
		}

