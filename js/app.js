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

Item.prototype.reset = function() {
  this.x = this.startingXPosition;
  this.y = this.startingYPosition;
}

var Enemy = function() {
    this.verticalBuffer = 57;

    this.generateYPosition = function() {
      return Math.floor(Math.random() * 3) * 83 + this.verticalBuffer;
    }

    Item.call(this, 
              'images/enemy-bug.png', 
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
    this.y = this.generateYPosition();
    this.x = this.startingXPosition;
    this.setSpeed();
}

Enemy.prototype.setSpeed = function () {
    this.speed= Math.floor((Math.random() * 500) + 100); 
}

var Player = function() {
    Item.call(this, 'images/char-boy.png', 202, 380, 36, 48)
    this.verticalMove = 83;
    this.horizontalMove = 101;
}

Player.inheritsFrom(Item);

Player.prototype.update = function() {
  // as per the comment in engine.js; this method should focus purely
  // on updating the data/properties related to the object
  for(var enemy in allEnemies) {
    if(allEnemies[enemy].collidingWith(this)) {
      consecutiveSuccesses = 0;
      this.reset();
      break;
    }
  }
}

Player.prototype.handleInput = function(input) {
  if (input == 'esc') {
    pauseGame = !pauseGame;
  }

  if(!pauseGame) {
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
    consecutiveSuccesses++;
    this.reset();
  }
}

Player.prototype.moveDown = function() {
  if(this.y < this.startingYPosition) {
    this.y += this.verticalMove;
  }  
}

allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy(), new Enemy()];
player = new Player();

// This listens for key presses and sends the keys to the Player.handleInput() method. 
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        27: 'esc',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
