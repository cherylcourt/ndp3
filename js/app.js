// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

//TODO: add comments
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.startingXPosition = 202;
    this.startingYPosition = 380;
    this.x = this.startingXPosition;
    this.y = this.startingYPosition;
    this.verticalMove = 83;
    this.horizontalMove = 101;
}

Player.prototype.update = function() {
  // TODO: implement this function, yo
  // as per the comment in engine.js; this method should focus purely
  // on updating the data/properties related to the object
}

// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
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
    this.x = this.startingXPosition;
    this.y = this.startingYPosition;
  }
}

Player.prototype.moveDown = function() {
  if(this.y < this.startingYPosition) {
    this.y += this.verticalMove;
  }  
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
allEnemies = [];
player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
