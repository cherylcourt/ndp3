/**
 * Base class that contains the tile width and height information needed for determining where to render
 * things on the screen; should be inherited from by any class that needs this information for rendering
 * purposes.
 *
 * @constructor
 */
var GameItem = function() {
    this.HORIZONTAL_TILE_WIDTH = 101;
    this.VISIBLE_VERTICAL_TILE_HEIGHT = 83;
};

/**
 * Base class that represents an item displayed on the screen that has a location and visible width and height
 *
 * @param {number} x - x coordinate position on the canvas of this item
 * @param {number} y - y coordinate position on the canvas of this item
 * @param {number} width - width of the image for this item
 * @param {string} sprite - the name of the image file that will be rendered for this item
 * @constructor
 */
var RenderableItem = function(x, y, width, sprite) {
    GameItem.call(this);

    this.x = x;
    this.y = y;
    this.width = width;

    if(sprite) {
        this.sprite = sprite;
    }
    else {
        this.sprite = 'images/blank-tile.png';
    }
};

RenderableItem.inheritsFrom(GameItem);

/**
 * This is the function that is called by the game engine to render this item on the screen.
 */
RenderableItem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

};

/**
 * Base class that represents an item displayed on the screen that has a location and visible width and height
 * and can change location
 *
 * @param {number} x - x coordinate position on the canvas of this item
 * @param {number} y - y coordinate position on the canvas of this item
 * @param {number} width - the visible width of the object (used to determine collision with other objects)
 * @param {number} verticalBuffer - number of pixels from the top of the canvas
 * @param {string} sprite - the name of the image file that will be rendered for this item
 * @constructor
 */
var MovableItem = function(x, y, width, verticalBuffer, sprite) {
    RenderableItem.call(this, x, y, width, sprite);

    this.startingXPosition = x;
    this.startingYPosition = y;

    this.halfVisibleWidth = width / 2;
    this.rowAdjust = verticalBuffer;
};

MovableItem.inheritsFrom(RenderableItem);

/**
 * @returns {number} the x-coordinate position on the canvas of the horizontal middle of this item
 */
MovableItem.prototype.midPoint = function() {
    return this.x + (this.HORIZONTAL_TILE_WIDTH / 2);
};

/**
 * @returns {number} - the x-coordinate position on the canvas of the left boundary of the visible part of this item
 */
MovableItem.prototype.visibleLeft = function() {
    return this.midPoint() - this.halfVisibleWidth;
};

/**
 * @returns {number} - the x-coordinate position on the canvas of the right boundary of the visible part of this item
 */
MovableItem.prototype.visibleRight = function() {
    return this.midPoint() + this.halfVisibleWidth;
};

/**
 * @returns {number} - the row that this item currently occupies; numbering starts at 0 from the top stone row
 */
MovableItem.prototype.onRow = function() {
    var adjustedY = this.y - this.rowAdjust;
    if (adjustedY != 0) {
        return Math.floor(adjustedY / this.VISIBLE_VERTICAL_TILE_HEIGHT);
    }
    else {
        return 0;
    }
};

/**
 * @returns {number} - the column that this item currently occupies; numbering starts at 0 from left-most column
 */
MovableItem.prototype.onColumn = function() {
    if (this.x != 0) {
        return Math.floor(this.x / this.HORIZONTAL_TILE_WIDTH);
    }
    else {
        return 0;
    }
};

/**
 * Check to see if this object "collides with" (or occupies the same space) as another object.  If the visible
 * boundaries of both items on the x-axis overlap and they are both on the same row then these items have collided
 *
 * @param {object} item - the other Item we are checking against
 * @returns {boolean} - whether the two items visible boundaries overlap; true, if so, false otherwise
 */
MovableItem.prototype.collidingWith = function(item) {
    try {
        if (this.onRow() == item.onRow()) {
            // the two items are on the same row; check to see if they are touching each other
            return (item.visibleLeft() < this.visibleRight() &&
                item.visibleLeft() > this.visibleLeft())
                ||
                (item.visibleRight() < this.visibleRight() &&
                item.visibleRight() > this.visibleLeft());
        }
    } catch(err) {
        console.log(err.message);
        return false;
    }
};

/**
 * Resets this item's position to the initial x, y coordinates passed into this object
 */
MovableItem.prototype.resetPosition = function() {
    this.x = this.startingXPosition;
    this.y = this.startingYPosition;
};

/**
 * A movable item that represents an enemy in the game.
 *
 * @constructor
 */
var Enemy = function() {
    this.verticalBuffer = 57;
    MovableItem.call(this, this._leftMostXPosition(), this.generateYPosition(), 86, this.verticalBuffer);
    this.setSpeed();
};

Enemy.inheritsFrom(MovableItem);

/**
 * Generates a random valid y co-ordinate for an enemy.  Enemies can occupy any of the stone tile rows.
 *
 * @returns {number} - a random y co-ordinate that corresponds to one of the stone tile rows
 */
Enemy.prototype.generateYPosition = function() {
    return Math.floor(Math.random() * 3) * this.VISIBLE_VERTICAL_TILE_HEIGHT + this.verticalBuffer;
};

/**
 * @returns {number} - the left most x co-ordinate an enemy can be located at
 * @private
 */
Enemy.prototype._leftMostXPosition = function() {
    return -this.HORIZONTAL_TILE_WIDTH-2;
};

/**
 * @returns {number} - the right most x co-ordinate an enemy can be located at
 * @private
 */
Enemy.prototype._rightMostXPosition = function() {
    return ctx.canvas.width + 2;
};

/**
 * Updates the enemy position based on the direction it is moving as well as its speed
 *
 * Note: this could be improved by creating an Enemy factory that creates either an enemy that moves
 *   to the left or the right with the appropriate method calls for each, but this would require a
 *   major refactoring and would affect the entire Enemy class
 *
 * @param {number} dt - a time delta between ticks
 */
Enemy.prototype.update = function(dt) {
    if (this.isReversedEnemy()) {
        if (this.x < this._leftMostXPosition()) {
            this.reset();
        }
        this.x -= this.speed * dt;
    }
    else {
        // if the enemy runs off the screen, reset the enemy so that it can
        // appear on the screen again
        if (this.x > this._rightMostXPosition()) {
            this.reset();
        }
        // any movement is multiplied by the dt parameter to ensure the game
        // runs at the same speed for all computers.
        this.x += this.speed * dt;
    }
};


/**
 * Returns a boolean value determining whether the enemy should be moving from right to left.
 * Only enemies on the second row of stone tiles when the alternate directions mode is on should be moving this way.
 *
 * @returns {boolean} - true if the enemy is moving from right to left, false otherwise
 */
Enemy.prototype.isReversedEnemy = function() {
    return gameProperties.alternateDirectionsOn && (this.onRow() == 1);
};

/**
 * Reset the enemy speed and position.
 */
Enemy.prototype.reset = function() {
    this.resetPosition();
    this.setSpeed();
};

/**
 * Resets the position of the enemy.
 * Y position is randomly generated.
 * X position is based on whether this enemy is 'reversed'
 */
Enemy.prototype.resetPosition = function() {
    this.y = this.generateYPosition();
    if (this.isReversedEnemy()) {
        this.x = this._rightMostXPosition();
    }
    else {
        this.x = this.startingXPosition;
    }
};

/**
 * Sets the speed of the enemy to a random value between 100 and 399 and
 * then sets the enemy sprite based on the speed range
 */
Enemy.prototype.setSpeed = function () {
    this.speed= Math.floor((Math.random() * 300)+100);
    this.setSpriteBySpeed();
};

/**
 * Sets the sprite image based on the speed of the enemy:
 *
 * Slowest (100-149) - blue
 * Slower  (150-199) - purple
 * Normal  (200-249) - red
 * Faster  (250-299) - yellow
 * Fastest (300-399) - green
 */
Enemy.prototype.setSpriteBySpeed = function () {
    if(this.speed >= 300) {
        this.sprite = 'images/enemy-bug-green.png';
    } else if (this.speed >= 250) {
        this.sprite = 'images/enemy-bug-yellow.png';
    } else if (this.speed >= 200) {
        this.sprite = 'images/enemy-bug-red.png';
    } else if (this.speed >= 150) {
        this.sprite = 'images/enemy-bug-purple.png';
    } else if (this.speed >= 100) {
        this.sprite = 'images/enemy-bug-blue.png';
    }
    if(this.isReversedEnemy()) {
        this.reverseEnemyImage();
    }
};

/**
 * Sets the correct image of the enemy when it reverses directions.
 */
Enemy.prototype.reverseEnemyImage = function() {

    if (this.sprite.indexOf('-reversed') != -1) {
        this.sprite = this.sprite.replace('-reversed', '');
    }
    else {
        var splitSprite = this.sprite.split('.');
        this.sprite = splitSprite[0]+'-reversed.'+splitSprite[1];
    }
};

/**
 * This class represents the player character in the game.
 *
 * @constructor
 */
var Player = function() {
    MovableItem.call(this, 202, 380, 31, 48);
};

Player.inheritsFrom(MovableItem);

/**
 * Check to see if the Player collides with an enemy.
 * If coloured tile mode is on, check to see if the player has walked on a new tile.
 * If collectible mode is on, check to see if the player has collided with a collectible.
 */
Player.prototype.update = function() {
    this._checkEnemyCollisions();
    this._checkCollectibleCollisions();
    this._checkPlayerLocation();
};

/**
 * Check to see if the Player collides with an enemy.  If so, notify GameProperties object
 *
 * @private
 */
Player.prototype._checkEnemyCollisions = function() {
    var allEnemiesLength = allEnemies.length;

    for(var i = 0; i < allEnemiesLength; i++) {
        if(allEnemies[i].collidingWith(this)) {
            gameProperties.playerCollidedWithEnemy();
            break;
        }
    }
};

/**
 * Check to see if the player has picked up any collectibles.  If so, notify GameProperties object
 * and set the collectible to a new location.
 *
 * @private
 */
Player.prototype._checkCollectibleCollisions = function () {
    var collectibles = collectibleManager.currentCollectibles;
    var collectiblesLength = collectibles.length;

    for(var i = 0; i < collectiblesLength; i++) {
        var collectible = collectibles[i];

        if(collectible.collidingWith(this)) {
            gameProperties.playerCollectedItem(this.onRow(), this.onColumn(), collectible.points);
            collectibleManager.resetCollectible();
        }
    }
};

/**
 * If player walked on a tile that could award points, notify gameProperties to check to see if any points
 * should be added and displayed
 *
 * @private
 */
Player.prototype._checkPlayerLocation = function() {
    // if the player is on a row from 0-2 then they are on a stone tile row
    if (this.onRow() < 3) {
        gameProperties.playerWalkedOnStoneTile(this.onRow(), this.onColumn());
    }
};

/**
 * Handles input from the user that has been translated into available player moves.
 *
 * @param input - a string representation of available player moves
 */
Player.prototype.handleInput = function(input) {
    switch (input) {
        case 'left':
            this._moveLeft();
            break;
        case 'up':
            this._moveUp();
            break;
        case 'right':
            this._moveRight();
            break;
        case 'down':
            this._moveDown();
            break;
    }
};

/**
 * Moves the player to the tile to the left if the player is not on the left-most tile
 *
 * @private
 */
Player.prototype._moveLeft = function() {
    if(this.x >= this.HORIZONTAL_TILE_WIDTH) {
        this.x -= this.HORIZONTAL_TILE_WIDTH;
    }
};

/**
 * Moves the player to the right if the player is not on the right-most tile.
 *
 * @private
 */
Player.prototype._moveRight = function() {
    if(this.x + this.HORIZONTAL_TILE_WIDTH < ctx.canvas.width) {
        this.x += this.HORIZONTAL_TILE_WIDTH;
    }
};

/**
 * Moves the player up one row if the player is not on the top stone row.  If the player is on the top
 * stone row, then the player is reset to their starting position and the game properties object is notified.
 *
 * @private
 */
Player.prototype._moveUp = function() {

    if(this._hasReachedTopRow()) {
        gameProperties.playerReachedTopRow(this.onColumn());
        this.resetPosition();
    } else {
        this.y -= this.VISIBLE_VERTICAL_TILE_HEIGHT;
    }
};

/**
 * Checks to see if the player has reached the top of the walkable area in the game
 *
 * @returns {boolean} - true if on the top stone row; false otherwise
 * @private
 */
Player.prototype._hasReachedTopRow = function() {
    return this.onRow() == 0;
};

/**
 * Moves the player down one tile if the player is not on the bottom-most row.
 *
 * @private
 */
Player.prototype._moveDown = function() {
    if(this.y < this.startingYPosition) {
        this.y += this.VISIBLE_VERTICAL_TILE_HEIGHT;
    }
};

/**
 * Sets the image of the player character.
 *
 * @param sprite - the character image to set the player to.
 */
Player.prototype.setCharacter = function(sprite) {
    this.sprite = sprite;
};

/**
 * Represents a collectible on a tile in the game.
 *
 * @param x - the x-co-ordinate of the collectible's location
 * @param y - the y co-ordinate of the collectible's location
 * @param points - the number of points the collectible is worth
 * @param sprite - the image that will be drawn on the screen that represents the collectible
 * @constructor
 */
var Collectible = function(x, y, points, sprite) {
    MovableItem.call(this, x, y, 95, 57);

    this.sprite = sprite;
    this.points = points;
};

Collectible.inheritsFrom(MovableItem);

/**
 * Manages any collectibles on the screen.
 *
 * @param usableGameRows - number of rows that the collectibles can be located
 * @param usableGameColumns - number of columns in the game that the collectibles can be located
 * @constructor
 */
var CollectibleManager = function(usableGameRows, usableGameColumns) {
    GameItem.call(this);

    this.rows = usableGameRows;
    this.columns = usableGameColumns;

    this.availableCollectibles = [
        {sprite: 'images/gem-blue.png', points:25},
        {sprite: 'images/gem-orange.png', points: 50},
        {sprite: 'images/gem-green.png', points: 75}
    ];

    this.currentCollectibles = [];

    if (gameProperties.collectiblesOn) {
        this.resetCollectible();
    }
};

CollectibleManager.inheritsFrom(GameItem);

/**
 * Move collectible to a new position
 */
CollectibleManager.prototype.resetCollectible = function() {
    var collectibleSelection = Math.floor(Math.random() * this.availableCollectibles.length);
    var sprite = this.availableCollectibles[collectibleSelection].sprite;
    var points = this.availableCollectibles[collectibleSelection].points;
    var x = Math.floor(Math.random() * this.columns) * this.HORIZONTAL_TILE_WIDTH;
    var y = (Math.floor(Math.random() * this.rows) + 1) * this.VISIBLE_VERTICAL_TILE_HEIGHT;

    if(this.currentCollectibles.length != 0) {
       this.currentCollectibles.pop();
    }
    this.currentCollectibles.push(new Collectible(x, y, points, sprite));
};

/**
 * If there is no collectible in the array and the collectibles mode is on create a new collectible.
 */
CollectibleManager.prototype.update = function() {
    if(gameProperties.collectiblesOn && this.currentCollectibles.length == 0) {
        this.resetCollectible();
    }
};

/**
 * Remove any collectibles in the collectibles array.
 */
CollectibleManager.prototype.removeCollectibles = function () {
    this.currentCollectibles = [];
};

/**
 * The base class for any rendered screens in the game.
 *
 * @constructor
 */
var Screen = function() {
   this.alpha = 1;
};

/**
 * This method draws the background and border of an overlay screen so that the contents drawn on the screen
 * are more visible to the user.
 */
Screen.prototype.renderOverlay = function() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = 'black';
    ctx.fillRect(10, 60, ctx.canvas.width - 20, ctx.canvas.height - 90);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 60, ctx.canvas.width - 20, ctx.canvas.height - 90);
};

/**
 * Draw a grey centered title on the canvas with a black shadow.
 *
 * @param {string} title - the text of the title
 * @param {number} x - the canvas x-coordinate of the middle of the title
 * @param {number} y - the canvas y-coordinate of the title text
 */
Screen.prototype.drawTitle = function(title, x, y) {
    ctx.textAlign = 'center';
    ctx.font = '26pt Nunito, sans-serif';
    ctx.fillStyle = 'black';
    // put a shadow behind the title text
    ctx.fillText(title, x+3, y+3);
    ctx.fillStyle = 'grey';
    ctx.fillText(title, x, y);
};


/**
 * Creates a new PauseScreen class.  This class contains all the functionality necessary to display the pause screen
 * with all game option information visible to the user.
 *
 * @constructor
 */
var PauseScreen = function() {
    this.alpha = 0.85;
};

PauseScreen.inheritsFrom(Screen);

/**
 * This is called to draw the pause screen on the canvas.
 * The user is allowed to select a character and set which game modes they would like active.
 * There is also a message letting the user know how to exit the pause screen.
 */
PauseScreen.prototype.render = function() {
    if(gameProperties.pauseGame) {
        this.renderOverlay();
        this.drawTitle('SELECT A CHARACTER', ctx.canvas.width/2, 100);
        gameProperties.drawCharacterSelect(21, 115, 90);
        this.drawTitle('GAME MODES', ctx.canvas.width/2, 330);
        this.drawGameModeText('images/1-icon.png', 'Coloured Tile', gameProperties.colouredTileModeOn, 337);
        this.drawGameModeText('images/2-icon.png', 'Collectibles', gameProperties.collectiblesOn, 397);
        this.drawGameModeText('images/3-icon.png', 'Alternate Directions', gameProperties.alternateDirectionsOn, 457);
        this.drawEscapeMessage(555);
    }
};

/**
 * Draw the available game mode text as well as whether the game mode is currently "ON" or "OFF"
 *
 * @param {string} image - the url of the image file
 * @param {string} modeText - the text describing the mode to the user
 * @param {boolean} isOn - true if this game mode is enabled; false if this game mode is disabled
 * @param y - the canvas y-coordinate of where this text should be placed on the canvas
 */
PauseScreen.prototype.drawGameModeText = function(image, modeText, isOn, y) {
    ctx.font = '20pt Nunito, sans-serif';
    ctx.textAlign = 'left';

    var gameModeText = modeText + ' - ';
    if(isOn) {
        // if the game mode is enabled then append ON and colour text green
        ctx.fillStyle = 'green';
        gameModeText += 'ON';
    }
    else {
        // if the game mode is disabled then append OFF and colour text red
        ctx.fillStyle = 'red';
        gameModeText += 'OFF';
    }

    ctx.drawImage(Resources.get(image), 30, y);
    ctx.fillText(gameModeText, 100, y + 40);
};

/**
 * Draws the message that lets the user know to press the escape key to exit the pause screen.
 *
 * @param {number} y - the canvas y-coordinate of where the message should be drawn
 */
PauseScreen.prototype.drawEscapeMessage = function(y) {
    ctx.fillStyle = 'white';
    ctx.font = '20pt Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press      to play game', ctx.canvas.width/2, y);
    ctx.drawImage(Resources.get('images/esc-icon.png'), ctx.canvas.width/2 - 72, y-34);
};

/**
 * This object displays an information screen that describes the game when its render method is called.
 *
 * @constructor
 */
var InfoScreen = function() {};

InfoScreen.inheritsFrom(Screen);

/**
 * When this method is called an information screen is displayed on the canvas, describing the game
 */
InfoScreen.prototype.render = function() {
    if(gameProperties.showInfo) {
        var infoTextX = 30,
            startingInfoTextY = 100;

        this.renderOverlay();

        this.drawTitle("Basic Gameplay", ctx.canvas.width / 2, startingInfoTextY);
        this.infoText("See how many times you can reach the water", infoTextX, startingInfoTextY + 25);
        this.infoText("without being hit by a bug.", infoTextX, startingInfoTextY + 50);

        this.drawTitle("Coloured Tile Mode", ctx.canvas.width / 2, startingInfoTextY + 100);
        this.infoText("See how many tiles you can walk on without", infoTextX, startingInfoTextY + 125);
        this.infoText("being hit by a bug. Each tile is 10 pts, going in", infoTextX, startingInfoTextY + 150);
        this.infoText("the water is -30 pts and getting all tiles is 200.", infoTextX, startingInfoTextY + 175);

        this.drawTitle("Collectibles Mode", ctx.canvas.width / 2, startingInfoTextY + 225);
        this.infoText("See how many gems you can collect without", infoTextX, startingInfoTextY + 250);
        this.infoText("being hit by a bug. Going in the water is -30", infoTextX, startingInfoTextY + 275);
        this.infoText("pts, Blue: 25pts, Orange: 50pts, Green: 75 pts", infoTextX, startingInfoTextY + 300);

        this.drawTitle("Alternate Directions Mode", ctx.canvas.width / 2, startingInfoTextY + 350);
        this.infoText("The second row of bugs move in the other", infoTextX, startingInfoTextY + 375);
        this.infoText("direction for an added challenge.", infoTextX, startingInfoTextY + 400);

        this.infoText("* Changing modes resets the game.", infoTextX, startingInfoTextY + 450);
    }
};

/**
 * Sets the properties for displaying information on the info screen and then displays the text.
 *
 * @param text - the information text that needs to be displayed
 * @param x - the x co-ordinate of where the text should be displayed
 * @param y - the y co-ordinate of where the text should be displayed
 */
InfoScreen.prototype.infoText = function(text, x, y) {
    ctx.fillStyle = 'white';
    ctx.font = '15pt Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(text, x, y);
};

/**
 * Holds the points information that has been recently gained/lost by the player.  Is used by the
 * GameProperties class to display this information to the player on the tile where the points were gained/lost.
 *
 *
 * @param {number} row - the row of the tile the player was on when they gained/lost these points
 * @param {number} column - the column of the tile the player was on when they gained/lost these points
 * @param {number} points - the amount of points that were gained/lost
 * @constructor
 */
var ShowPoints = function(row, column, points) {
    this.row = row;
    this.column = column;
    this.points = points;
    // This counter allows this object's information to be displayed for a limited time
    this.counter = 100;

    GameItem.call(this);
};

ShowPoints.inheritsFrom(GameItem);

/**
 * Display the points on the canvas where the player lost or gained them
 *
 * @param offset - an offset to apply to where the points should be displayed in relation to the center of the
 *                 tile where they were gained/lost
 */
ShowPoints.prototype.render = function(offset) {
    ctx.font = '25pt Nunito, sans-serif';
    ctx.textAlign = 'center';
    var pointsText = this.points.toString();

    // points that are lost are displayed in red; gained points are in green
    if (this.points < 0) {
        ctx.fillStyle = 'red';
    }
    else {
        pointsText = '+' + pointsText;
        ctx.fillStyle = 'green';
    }

    //slowly fade the points on the screen
    if (this.counter > 0) {
        ctx.globalAlpha = this.counter/100;
    }
    else {
        ctx.globalAlpha = 0;
    }

    var x = this.column * this.HORIZONTAL_TILE_WIDTH + (this.HORIZONTAL_TILE_WIDTH/2);
    var y = this.row * 130 + this.counter;

    if(offset) {
        x -= offset;
        y -= offset;
    }

    ctx.fillText(pointsText, x, y);

    ctx.globalAlpha = 1;
};

/**
 * Decrement the counter so that the points slowly move upwards and fade away
 *
 * @param dt - a time delta between ticks
 */
ShowPoints.prototype.update = function(dt) {
    this.counter -= this.counter * dt;
};

/**
 * This class keeps track of game points and whether the game is paused or the user wants to see the
 * information screen.
 *
 * @constructor
 */
var GameProperties = function() {
    GameItem.call(this);

    this.pauseGame = true;
    this.currentGamePoints = 0;
    this.bestGamePoints = 0;
    this.consecutiveSuccesses = 0;
    this.showInfo = false;
    this.showPoints = [];

    this.characterSelection = 0;
    this.characterImages = [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ];

    this.sounds = {
        enemyCollision: new Audio('sounds/crunch.wav'),
        splash: new Audio('sounds/water-splash.wav'),
        collect: new Audio('sounds/ding.mp3')
    };

    this.colouredTileModeOn = false;
    this.collectiblesOn = false;
    this.alternateDirectionsOn = false;

    this._initializeWalkingArray();
};

GameProperties.inheritsFrom(GameItem);

/**
 * Toggle the coloured tile mode on or off.  Reset points and player.
 */
GameProperties.prototype.toggleColouredTileMode = function() {
    this.colouredTileModeOn = !this.colouredTileModeOn;
    this.reset();
};

/**
 * Toggle the collectibles mode on or off.  If the mode is toggled off, remove any collectibles from the screen.
 * Reset points and player.
 */
GameProperties.prototype.toggleCollectiblesMode = function() {
    this.collectiblesOn = !this.collectiblesOn;
    if(!this.collectiblesOn) {
        collectibleManager.removeCollectibles();
    }
    this.reset();
};

/**
 * Toggle the alternate directions mode on or off.  For every enemy that is on the second stone row reverse
 * their image.
 * Reset points and player.
 */
GameProperties.prototype.toggleAlternateDirectionsMode = function() {
    this.alternateDirectionsOn = !this.alternateDirectionsOn;
    allEnemies.forEach(function(enemy) {
        if (enemy.onRow() == 1) {
            enemy.reverseEnemyImage();
        }
    });
    this.reset();
};

/**
 * This method should be called when the game is reset.  All points are reset to 0 and if the current game points
 * accrued is greater than the best score, then the best score is set to the current game points before being reset.
 * The player is also reset.
 */
GameProperties.prototype.reset = function() {
    if (this.currentGamePoints > this.bestGamePoints) {
        this.bestGamePoints = this.currentGamePoints;
    }
    this.consecutiveSuccesses = 0;
    this.currentGamePoints = 0;
    this._initializeWalkingArray();
    player.resetPosition();
};

/**
 * The player collided with an enemy; play collision sound and reset game.
 */
GameProperties.prototype.playerCollidedWithEnemy = function() {
    this.sounds.enemyCollision.play();
    this.reset();
};

/**
 * Check to see if the player has picked up any collectibles.  If so, play collectible collision sound, add
 * points and set the collectible to a new location.
 */
GameProperties.prototype.playerCollectedItem = function (row, column, points) {
    this.sounds.collect.play();
    this.addPoints(row, column, points);
};

/**
 * If coloured Tile mode is on then update the state of the walking array and add any points for new tiles that
 * are walked on.  If all walkable tiles are walked on then add 200 bonus points.
 */
GameProperties.prototype.playerWalkedOnStoneTile = function(row, column) {
    if(this.colouredTileModeOn) {
        // if the tile the player is on hasn't been walked on before, add it to the array and add 10 points
        if (this.walkedSuccess[row].indexOf(column) == -1) {
            this.addPoints(row, column, 10);
            this.walkedSuccess[row].push(column);
        }

        // if all tiles have been walked on, then add 200 points and reset the walking array
        if (this.walkedSuccess[0] && this.walkedSuccess[0].length == 5 &&
            this.walkedSuccess[1] && this.walkedSuccess[1].length == 5 &&
            this.walkedSuccess[2] && this.walkedSuccess[2].length == 5) {
            this.addPoints(row, column, 200);
            this._initializeWalkingArray();
        }
    }
    else {
        // if coloured tile mode is not on, ensure the walking array is clear
        this._initializeWalkingArray();
    }
};

/**
 * Initializes the array that holds the position of the tiles that the player has successfully walked on
 * to an empty array
 *
 * @private
 */
GameProperties.prototype._initializeWalkingArray = function() {
    this.walkedSuccess = [];
    for(var i = 0; i < 3; i++) {
        this.walkedSuccess.push([]);
    }
};

/**
 * This method should be called when the player reaches the top row so that the proper amount of points/successes
 * can be added to the total
 *
 * @param {number} column - the column where the player reached the top row
 */
GameProperties.prototype.playerReachedTopRow = function(column) {
    this.sounds.splash.play();

    if(this.pointsTrackingModesOn()) {
        // lose 30 points for going in the water
        this.addPoints(0, column, -30);
    }
    else {
        // if the game does not have coloured tile or collectibles mode on, then simply add to the number
        // of consecutive times the player has reached the water without being hit by a bug
        this.consecutiveSuccesses++;
    }
};

/**
 * @returns {boolean} - true if any or all of the modes that track points are turned on
 */
GameProperties.prototype.pointsTrackingModesOn = function() {
    return this.colouredTileModeOn || this.collectiblesOn;
};

/**
 * This adds positive or negative game points to the current game points total and creates an object that
 * renders this amount on the canvas to show the player.
 *
 * @param {number} row - the row where the points were gained/lost
 * @param {number} column - the column where the points were gained/lost
 * @param {number} points - the points that were gained/lost; this value can be positive (gained) or negative (lost)
 */
GameProperties.prototype.addPoints = function(row, column, points) {
    this.currentGamePoints += points;
    this.showPoints.push(new ShowPoints(row, column, points));
};

/**
 * Removes the added/subtracted game points from being shown when their counters reach 0.
 * Updates the player character image with selection if the game is paused.
 */
GameProperties.prototype.update = function(dt) {
    var i = this.showPoints.length - 1;
    for(; i >= 0; i--) {
        if(this.showPoints[i].counter <= 0) {
            this.showPoints.splice(i, 1);
        }
    }
    if(this.pauseGame) {
        player.setCharacter(this.getSelectedCharacterImageURL());
    }

    this.showPoints.forEach(function(showPoint) {
        showPoint.update(dt);
    });
};

/**
 * When called by the game engine this renders all game points on the canvas that are either added or subtracted.
 */
GameProperties.prototype.render = function() {
    this._renderNewPoints();
    this._renderGamePoints();
};

/**
 * Render the coloured tiles for a row if the Coloured Tile Mode is on
 *
 * @param row - the row for the coloured tiles to be rendered (first row = 0)
 */
GameProperties.prototype.renderColouredTilesForRow = function(row) {
    var width = this.HORIZONTAL_TILE_WIDTH,
        height = this.VISIBLE_VERTICAL_TILE_HEIGHT;

    if(this.colouredTileModeOn) {
        if(this.walkedSuccess[row]) {
            this.walkedSuccess[row].forEach(function (column) {
                var x = column * width;
                var y = (row + 1) * height;
                ctx.drawImage(Resources.get('images/stone-block-highlight.png'), x, y);
            });
        }
    }
};

/**
 * Renders all game points on the canvas that are either added or subtracted.
 *
 * @private
 */
GameProperties.prototype._renderNewPoints = function() {
    var OFFSET_INCREMENT = 30,
        offset = OFFSET_INCREMENT,
        lastColumn,
        lastRow;

    this.showPoints.forEach(function(showPoint) {
        // if this point value is on the same tile as the last one offset the rendering so that it does not appear
        // on top of the last value
        if(lastRow == showPoint.row && lastColumn == showPoint.column) {
            showPoint.render(offset);
            offset += OFFSET_INCREMENT;
        }
        else {
            offset = OFFSET_INCREMENT;
            showPoint.render();
        }
        lastColumn = showPoint.column;
        lastRow = showPoint.row;

    });
};

/**
 * Renders the current total game points and best game points at the top of the canvas
 *
 * @private
 */
GameProperties.prototype._renderGamePoints = function() {
    var yCoordinate = 40,
        canvasMiddle = ctx.canvas.width / 2;

    ctx.fillStyle = 'white';
    ctx.font = '20pt Nunito, sans-serif';

    if((this.pointsTrackingModesOn()) && this.currentGamePoints) {
        ctx.textAlign = 'left';
        ctx.fillText(this.currentGamePoints.toString() + ' pts', 7, yCoordinate);
    }

    if(gameProperties.consecutiveSuccesses > 0) {
        ctx.textAlign = 'right';
        ctx.fillText(gameProperties.consecutiveSuccesses.toString(), ctx.canvas.width - 7, yCoordinate);
    }

    if((this.pointsTrackingModesOn()) && this.bestGamePoints && this.bestGamePoints > 0) {
        ctx.textAlign = 'center';
        ctx.fillText(this.bestGamePoints.toString() + ' pts', canvasMiddle, yCoordinate);
        ctx.font = '10pt Nunito, sans-serif';
        ctx.fillText('High Score', canvasMiddle, 15);
    }
};

/**
 * Draw the characters available for selection.
 *
 * @param {number} x - the canvas x-coordinate of the left-most character image
 * @param {number} y - the canvas x-coordinate of all the character images
 * @param {number} spacingInterval - the x-coordinate interval to use to evenly space the character images
 */
GameProperties.prototype.drawCharacterSelect = function(x, y, spacingInterval) {
    ctx.drawImage(Resources.get('images/Selector.png'), this.characterSelection * spacingInterval + x, y);

    var characterImagesLength = this.characterImages.length,
        i;

    for(i = 0; i < characterImagesLength; i++) {
        ctx.drawImage(Resources.get(this.characterImages[i]), i * spacingInterval + x, y);
    }
};

/**
 * Gets the URL of the image for the selected character
 *
 * @returns {string} - image URL of the selected character
 */
GameProperties.prototype.getSelectedCharacterImageURL = function() {
    return this.characterImages[this.characterSelection];
};

/**
 * This function is called by the event listener that is listening for keyUp events when the game is
 * considered 'paused'.  Based on which key was pressed either a new character is selected or a game mode
 * is enabled/disabled.
 *
 * @param {string} input - the string representation of the key that the user pressed
 */
GameProperties.prototype.handleInput = function (input) {
    switch (input) {
        case 'left':
            if(this.characterSelection > 0) {
                this.characterSelection--;
            }
            break;
        case 'right':
            if(this.characterSelection < this.characterImages.length-1) {
                this.characterSelection++;
            }
            break;
        case 'one':
            this.toggleColouredTileMode();
            break;
        case 'two':
            this.toggleCollectiblesMode();
            break;
        case 'three':
            this.toggleAlternateDirectionsMode();
            break;
    }
};

/**
 * Global Game Objects
 * ===================
 */

/**
 * global GameProperties object
 *
 * @type {GameProperties}
 */
gameProperties = new GameProperties();

/**
 * global PauseScreen object
 * @type {PauseScreen}
 */
pauseScreen = new PauseScreen();

/**
 * global InfoScreen object
 * @type {InfoScreen}
 */
infoScreen = new InfoScreen();

/**
 * global enemy array
 * @type {*[]}
 */
allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy(), new Enemy()];

/**
 * global object managing collectibles on the screen
 * @type {CollectibleManager}
 */
collectibleManager = new CollectibleManager(3, 5);

/**
 * global player object
 * @type {Player}
 */
player = new Player();

/**
 * global info Item image object
 * @type {RenderableItem}
 */
infoItem = new RenderableItem(423, 507, 64, 'images/info.png');

/**
 * Event Listeners
 * ===============
 */

/**
 * This listens for key presses and sends the keys to the Player.handleInput() method if the game is not paused
 * or the gameProperties.handleInput method if the game is paused.
 */
document.addEventListener('keyup', function(e) {
    var escapeKey = 27;
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        49: 'one',
        50: 'two',
        51: 'three'
    };

    if (e.keyCode == escapeKey) {
        gameProperties.pauseGame = !gameProperties.pauseGame;
    }

    if(gameProperties.pauseGame) {
        gameProperties.handleInput(allowedKeys[e.keyCode]);
    }
    else {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});

/**
 * Adds an event listener for mouse clicks on the canvas to see if the user has clicked on the 'info' image
 * to toggle the info screen on and off
 */
document.addEventListener('mousedown', function(event) {

    /**
     * Determine whether the user has clicked on the info image on the canvas
     *
     * @param {number} x - canvas x co-ordinate
     * @param {number} y - canvas y co-ordinate
     * @returns {boolean} - true if the x,y canvas co-ordinates are contained within the region that represents
     *                      the info image on the canvas; false otherwise
     */
    var coordinatesOnInfoItem = function(x, y) {
        var infoLeftX = infoItem.x,
            infoRightX = infoLeftX + infoItem.width,
            infoTopY = infoItem.y,
            infoBottomY = infoTopY + infoItem.width;    // infoItem is a square, so width == height

        return (x > infoLeftX && x < infoRightX && y > infoTopY && y < infoBottomY);
    };

    /**
     * Get the bounding rectangle of the canvas and use that to translate the mouse event co-ordinates
     * to canvas co-ordinates
     *
     * Logic taken from http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
     * and http://www.homeandlearn.co.uk/JS/html5_canvas_mouse_events.html
     *
     * @param {object} event - mouse event
     * @returns {{x: number, y: number}} - canvas co-ordinates
     */
    var translateCoordinatesToCanvas = function(event) {
        var rect = ctx.canvas.getBoundingClientRect(),
            x = event.pageX - rect.left,
            y = event.pageY - rect.top;

        return {x: x, y: y};
    };

    var coordinates = translateCoordinatesToCanvas(event);

    if(coordinatesOnInfoItem(coordinates.x, coordinates.y)) {
        gameProperties.showInfo = !gameProperties.showInfo;
    }
});
