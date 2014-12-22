var Item = function(sprite, x, y, width, verticalBuffer) {
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = sprite;
    this.startingXPosition = x;
    this.startingYPosition = y;
    this.x = x; // Item's current x-position
    this.y = y; // Item's current y-position
    this.halfVisibleWidth = width / 2;
    this.rowAdjust = verticalBuffer;

    this.midPoint = function() {
      return this.x + 50.1;
    }

    this.visibleLeft = function() {
      return this.midPoint() - this.halfVisibleWidth;
    }

    this.visibleRight = function() {
      return this.midPoint() + this.halfVisibleWidth;
    }

    this.onRow = function() {
      return (this.y - this.rowAdjust)/83;
    }

    this.onColumn = function() {
      return(this.x / 101);
    }
}

Item.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Item.prototype.collidingWith = function(item) {
  if(this.onRow() == item.onRow()) {
    // the two items are on the same row; check to see if they are touching each other
    return (item.visibleLeft() < this.visibleRight() &&
            item.visibleLeft() > this.visibleLeft())
           ||
           (item.visibleRight() < this.visibleRight() &&
            item.visibleRight() > this.visibleLeft());
  }
}

Item.prototype.resetPosition = function() {
  this.x = this.startingXPosition;
  this.y = this.startingYPosition;
}

var Enemy = function() {
    this.verticalBuffer = 57;

    this.generateYPosition = function() {
      return Math.floor(Math.random() * 3) * 83 + this.verticalBuffer;
    }

    Item.call(this,
              'images/enemy-bug-red.png',
              -102,
              this.generateYPosition(),
              86,
              this.verticalBuffer)

    this.setSpeed();
}

Enemy.inheritsFrom(Item);

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // if the enemy runs off the screen, reset the enemy so that it can
    // appear on the screen again
    if (this.x > canvas.width+102) {
      this.reset();
    }
    // any movement is multiplied by the dt parameter to ensure the game
    // runs at the same speed for all computers.
    this.x += this.speed * dt;
}

Enemy.prototype.reset = function() {
    this.resetPosition();
    this.setSpeed();
}

/**
 * Sets the speed of the enemy to a random value between 100 and 599 and
 * then sets the enemy sprite based on the speed range
 */
Enemy.prototype.setSpeed = function () {
    this.speed= Math.floor((Math.random() * 500) + 100);
    this.setSpriteBySpeed();
}

/**
 * Sets the sprite image based on the speed of the enemy
 *
 * Slowest (100-199) - blue
 * Slower  (200-299) - purple
 * Normal  (300-399) - red
 * Faster  (400-499) - yellow
 * Fastest (500-599) - green
 */
Enemy.prototype.setSpriteBySpeed = function () {
    if(this.speed >= 500) {
      this.sprite = 'images/enemy-bug-green.png';
    } else if (this.speed >= 400) {
      this.sprite = 'images/enemy-bug-yellow.png';
    } else if (this.speed >= 300) {
      this.sprite = 'images/enemy-bug-red.png';
    } else if (this.speed >= 200) {
      this.sprite = 'images/enemy-bug-purple.png';
    } else if (this.speed >= 100) {
      this.sprite = 'images/enemy-bug-blue.png';
    }
}

var Player = function() {
    Item.call(this, 'images/char-boy.png', 202, 380, 36, 48)
    this.verticalMove = 83;
    this.horizontalMove = 101;
    this.collideSound = new Audio('sounds/crunch.wav');
    this.splashSound = new Audio('sounds/water-splash.wav');
    this.resetWalkingArray();
}

Player.inheritsFrom(Item);

Player.prototype.update = function() {
    // as per the comment in engine.js; this method should focus purely
    // on updating the data/properties related to the object
    for(var enemy in allEnemies) {
      if(allEnemies[enemy].collidingWith(this)) {
        this.collideSound.play();
        //TODO: move this functionality into the GameProperties object; beef up that object
        if (GameProperties.currentGamePoints > GameProperties.bestGamePoints) {
          GameProperties.bestGamePoints = GameProperties.currentGamePoints;
          console.log('Assigning points: '+GameProperties.bestGamePoints.toString());
        }
        GameProperties.consecutiveSuccesses = 0;
        GameProperties.currentGamePoints = 0;
        this.reset();
        break;
      }
    }

    if (!pauseScreen.colouredTileModeOn) {
        this.resetWalkingArray();
    }

    if(this.walkedSuccess[0] && this.walkedSuccess[0].length == 5 &&
       this.walkedSuccess[1] && this.walkedSuccess[1].length == 5 &&
       this.walkedSuccess[2] && this.walkedSuccess[2].length == 5) {
        GameProperties.currentGamePoints += 100;
        player.resetWalkingArray();
    }
}

Player.prototype.reset = function() {
    this.resetWalkingArray();
    console.log(this.walkedSuccess.toString());
    this.resetPosition();
}

Player.prototype.resetWalkingArray = function() {
    this.walkedSuccess = [];
    for(var i = 0; i < 3; i++) {
        this.walkedSuccess.push([]);
    }
}

Player.prototype.handleInput = function(input) {
    switch (input) {
      case 'left':
        this.moveLeft();
        break;
      case 'up':
        this.moveUp();
        break;
      case 'right':
        this.moveRight();
        break;
      case 'down':
        this.moveDown();
        break;
    }
    if(this.onRow() < 3) {
      if(this.walkedSuccess[this.onRow()].indexOf(this.onColumn()) == -1) {
          GameProperties.currentGamePoints += 10
          this.walkedSuccess[this.onRow()].push(this.onColumn());
      }
    }
    for(var i=0; i<this.walkedSuccess.length; i++) {
      console.log('walked array['+i+']: '+this.walkedSuccess[i].toString());
    }
}

Player.prototype.moveLeft = function() {
  if(this.x >= this.horizontalMove) {
    this.x -= this.horizontalMove;
  }
}

Player.prototype.moveRight = function() {
  if(this.x + this.horizontalMove < canvas.width) {
    this.x += this.horizontalMove;
  }
}

Player.prototype.moveUp = function() {
  if(this.y > this.verticalMove) {
    this.y -= this.verticalMove;
  } else {
    // the player has made it to the top row
    this.splashSound.play();
    //TODO: should probably move the tile mode attribute to GameProperties
    if(pauseScreen.colouredTileModeOn) {
      // lose 10 points for going in the water
      GameProperties.currentGamePoints -= 30;
    }
    else {
      GameProperties.consecutiveSuccesses++;
    }
    this.resetPosition();
  }
}

Player.prototype.moveDown = function() {
  if(this.y < this.startingYPosition) {
    this.y += this.verticalMove;
  }
}

Player.prototype.setCharacter = function(sprite) {
    this.sprite = sprite;
}

var PauseScreen = function() {
  this.characters = [
     'images/char-boy.png',
     'images/char-cat-girl.png',
     'images/char-horn-girl.png',
     'images/char-pink-girl.png',
     'images/char-princess-girl.png'
  ];
  this.characterSelection = 0;
  this.colouredTileModeOn = false;

  this.renderOverlay = function() {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = 'black';
      ctx.fillRect(10, 60, 485, 516);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'white';
      ctx.strokeRect(10, 60, 485, 516);
      ctx.strokeRect(9, 59, 486, 517);
  }
}

PauseScreen.prototype.render = function() {
    this.renderOverlay();

    //TODO: refactor this out into smaller bits
    //TODO: clean up and remove duplication here
    ctx.fillStyle = 'white';
    ctx.font = "20pt Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Press      to Resume Game", canvas.width/2, 555);
    ctx.drawImage(Resources.get('images/esc-icon.png'), 152, 521);

    ctx.drawImage(Resources.get('images/Selector.png'), this.characterSelection*90+21, 115);

    for(var character in this.characters) {
        ctx.drawImage(Resources.get(this.characters[character]), character * 90 + 21, 115);
    }

    ctx.fillStyle = 'black';
    ctx.font = "26pt Nunito, sans-serif";
    ctx.fillText("SELECT A CHARACTER", canvas.width/2+3, 103);
    ctx.fillText("GAME MODES", canvas.width/2+3, 333);
    ctx.fillStyle = 'grey';
    ctx.fillText("SELECT A CHARACTER", canvas.width/2, 100);
    ctx.fillText("GAME MODES", canvas.width/2, 330);
    ctx.font = "20pt Nunito, sans-serif";
    ctx.textAlign = 'left';
    ctx.fillStyle = 'red';
    var gameModeOneText = 'Coloured Tile Mode - ';
    if(this.colouredTileModeOn) {
        //highlight colouredTileMode
        ctx.fillStyle = 'green';
        gameModeOneText += 'ON';
    }
    else {
        gameModeOneText += 'OFF';
    }

    ctx.drawImage(Resources.get('images/1-icon.png'), 30, 337);
    ctx.fillText(gameModeOneText, 100, 377);
    //TODO: replace the following with the other modes (yet to be implemented)
    //TODO: create a method to draw these, remove duplication
    ctx.drawImage(Resources.get('images/2-icon.png'), 30, 397);
    ctx.fillText(gameModeOneText, 100, 437);
    ctx.drawImage(Resources.get('images/3-icon.png'), 30, 457);
    ctx.fillText(gameModeOneText, 100, 497);
}

PauseScreen.prototype.handleInput = function (input) {
    switch (input) {
      case 'left':
        if(this.characterSelection > 0) {
          this.characterSelection--;
        }
        break;
      case 'right':
        if(this.characterSelection < this.characters.length-1) {
          this.characterSelection++;
        }
        break;
      case 'one':
        this.colouredTileModeOn = !this.colouredTileModeOn;
        break;
    }
}

PauseScreen.prototype.getSelectedCharacter = function() {
    return this.characters[this.characterSelection];
}


allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy(), new Enemy()];
player = new Player();
pauseScreen = new PauseScreen();

// This listens for key presses and sends the keys to the Player.handleInput() method.
document.addEventListener('keyup', function(e) {
    var escapeKey = 27;

    console.log(e.keyCode.toString());
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        49: 'one'
    };

    if (e.keyCode == escapeKey) {
        GameProperties.pauseGame = !GameProperties.pauseGame;
    }

    if(GameProperties.pauseGame) {
        pauseScreen.handleInput(allowedKeys[e.keyCode]);
    }
    else {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});
