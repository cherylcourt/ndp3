// TODO: refactor Enemy and Player classes to derive from a superclass
// TODO: refactor out duplicated code (e.g. the speed and row selection functionality)
// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.startingXPosition = -200;
    this.speed = Math.floor((Math.random() * 500) + 100);

    this.x = this.startingXPosition;
    this.y = Math.floor(Math.random() * 3) *83 + 57;
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.x > canvas.width+200) {
      this.y = Math.floor(Math.random() * 3) * 83 + 57;
      this.speed = Math.floor((Math.random() * 300)) + 100;
      this.x = this.startingXPosition;
    }
    this.x += this.speed * dt;
}

Enemy.prototype.collidedWith = function(player) {
  // figure out if clipping regions intersect and if player is on the same row as an enemy
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
  for(var enemy in allEnemies) {
  //TODO: create a clipping region for both enemy and player and see if they
  //intersect
    if(allEnemies[enemy].collidedWith(this)) {
      this.reset();
      break;
    }
  }
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
    this.reset();
  }
}

Player.prototype.moveDown = function() {
  if(this.y < this.startingYPosition) {
    this.y += this.verticalMove;
  }  
}

Player.prototype.reset = function() {
  this.x = this.startingXPosition;
  this.y = this.startingYPosition;
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy(), new Enemy()];
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
