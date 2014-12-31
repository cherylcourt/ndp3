/**
 * Base class that represents an item displayed on the screen that has a location and visible width and height
 *
 * @param {number} x - x coordinate position on the canvas of this item
 * @param {number} y - y coordinate position on the canvas of this item
 * @param {number} width - the visible width of the object (used to determine collision with other objects)
 * @param {number} verticalBuffer - number of pixels from the top of the canvas
 * @constructor
 */
var Item = function(x, y, width, verticalBuffer, sprite) {
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.HORIZONTAL_TILE_WIDTH = 101;
    this.VISIBLE_VERTICAL_TILE_HEIGHT = 83;
    if(sprite) {
        this.sprite = sprite;
    }
    else {
        this.sprite = 'images/blank-tile.png';
    }
    this.startingXPosition = x;
    this.startingYPosition = y;
    this.x = x; // Item's current x-position
    this.y = y; // Item's current y-position
    this.halfVisibleWidth = width / 2;
    this.rowAdjust = verticalBuffer;
};

/**
 * @returns {number} the x-coordinate position on the canvas of the horizontal middle of this item
 */
Item.prototype.midPoint = function() {
    return this.x + 50.5;
};

/**
 * @returns {number} - the x-coordinate position on the canvas of the left boundary of the visible part of this item
 */
Item.prototype.visibleLeft = function() {
    return this.midPoint() - this.halfVisibleWidth;
};

/**
 * @returns {number} - the x-coordinate position on the canvas of the right boundary of the visible part of this item
 */
Item.prototype.visibleRight = function() {
    return this.midPoint() + this.halfVisibleWidth;
};

/**
 *
 * @returns {number} - the row that this item currently occupies; numbering starts at 0 from the top row
 */
Item.prototype.onRow = function() {
    var adjustedY = this.y - this.rowAdjust;
    if (adjustedY != 0) {
        return Math.floor((this.y - this.rowAdjust) / this.VISIBLE_VERTICAL_TILE_HEIGHT);
    }
    else {
        return 0;
    }
};

/**
 * @returns {number} - the column that this item currently occupies; numbering starts at 0 from left-most column
 */
Item.prototype.onColumn = function() {
    if (this.x != 0) {
        return Math.floor(this.x / this.HORIZONTAL_TILE_WIDTH);
    }
    else {
        return 0;
    }
};

/**
 * This is the function that is called by the game engine to render this item on the screen.
 */
Item.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Check to see if this object "collides with" (or occupies the same space) as another object.  If the visible
 * boundaries of both items on the x-axis overlap and they are both on the same row then these items have collided
 *
 * @param {object} item - the other Item we are checking against
 * @returns {boolean} - whether the two items visible boundaries overlap; true, if so, false otherwise
 */
Item.prototype.collidingWith = function(item) {
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

Item.prototype.resetPosition = function() {
    this.x = this.startingXPosition;
    this.y = this.startingYPosition;
};

var Enemy = function() {
    this.verticalBuffer = 57;

    Item.call(this,
        -102,
        this.generateYPosition(),
        86,
        this.verticalBuffer);

    this.setSpeed();
};

Enemy.inheritsFrom(Item);

Enemy.prototype.generateYPosition = function() {
    return Math.floor(Math.random() * 3) * this.VISIBLE_VERTICAL_TILE_HEIGHT + this.verticalBuffer;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    if (this.isReversedEnemy()) {
        if (this.x < -102) {
            this.reset();
        }
        this.x -= this.speed * dt;
    }
    else {
        // if the enemy runs off the screen, reset the enemy so that it can
        // appear on the screen again
        if (this.x > canvas.width + 2) {
            this.reset();
        }
        // any movement is multiplied by the dt parameter to ensure the game
        // runs at the same speed for all computers.
        this.x += this.speed * dt;
    }
};

Enemy.prototype.isReversedEnemy = function() {
    return pauseScreen.alternateDirectionsOn && (this.onRow() == 1);
};

Enemy.prototype.reset = function() {
    this.resetPosition();
    this.setSpeed();
};

Enemy.prototype.resetPosition = function() {
    this.y = this.generateYPosition();
    if (this.isReversedEnemy()) {
        this.x = canvas.width + 2;
    }
    else {
        this.x = this.startingXPosition;
    }
};

/**
 * Sets the speed of the enemy to a random value between 100 and 599 and
 * then sets the enemy sprite based on the speed range
 */
Enemy.prototype.setSpeed = function () {
    this.speed= Math.floor((Math.random() * 500) + 100);
    this.setSpriteBySpeed();
};

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
    if(this.isReversedEnemy()) {
        this.reverseEnemy();
    }
};

Enemy.prototype.reverseEnemy = function() {

    if (this.sprite.indexOf('-reversed') != -1) {
        this.sprite = this.sprite.replace('-reversed', '');
    }
    else {
        var splitSprite = this.sprite.split('.');
        this.sprite = splitSprite[0]+'-reversed.'+splitSprite[1];
    }
};

var Player = function() {
    Item.call(this, 202, 380, 31, 48);
    this.collideSound = new Audio('sounds/crunch.wav');
    this.splashSound = new Audio('sounds/water-splash.wav');
    this.collectSound = new Audio('sounds/ding.mp3');
    this.resetWalkingArray();
};

Player.inheritsFrom(Item);

Player.prototype.update = function() {
    // as per the comment in engine.js; this method should focus purely
    // on updating the data/properties related to the object

    var collectibles = collectibleManager.currentCollectibles;
    for(var index in collectibles) {
        var collectible = collectibles[index];

        if(collectible.collidingWith(this)) {
            this.collectSound.play();
            GameProperties.currentGamePoints += collectible.points;
            collectibleManager.resetCollectible();
        }
    }

    for(var enemy in allEnemies) {
        if(allEnemies[enemy].collidingWith(this)) {
            this.collideSound.play();
            //TODO: move this functionality into the GameProperties object; beef up that object
            if (GameProperties.currentGamePoints > GameProperties.bestGamePoints) {
                GameProperties.bestGamePoints = GameProperties.currentGamePoints;
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
        GameProperties.currentGamePoints += 200;
        player.resetWalkingArray();
    }
};

Player.prototype.reset = function() {
    this.resetWalkingArray();
    this.resetPosition();
};

Player.prototype.resetWalkingArray = function() {
    this.walkedSuccess = [];
    for(var i = 0; i < 3; i++) {
        this.walkedSuccess.push([]);
    }
};

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
        if(pauseScreen.colouredTileModeOn && this.walkedSuccess[this.onRow()].indexOf(this.onColumn()) == -1) {
            GameProperties.currentGamePoints += 10;
            this.walkedSuccess[this.onRow()].push(this.onColumn());
        }
    }
};

Player.prototype.moveLeft = function() {
    if(this.x >= this.HORIZONTAL_TILE_WIDTH) {
        this.x -= this.HORIZONTAL_TILE_WIDTH;
    }
};

Player.prototype.moveRight = function() {
    if(this.x + this.HORIZONTAL_TILE_WIDTH < canvas.width) {
        this.x += this.HORIZONTAL_TILE_WIDTH;
    }
};

Player.prototype.hasReachedTopRow = function() {
    return this.y <= this.VISIBLE_VERTICAL_TILE_HEIGHT;
};

Player.prototype.moveUp = function() {

    if(this.hasReachedTopRow()) {
        this.splashSound.play();
        //TODO: should probably move the tile mode attribute to GameProperties
        //TODO: GameProperties.playerReachedTopRow()
        if(pauseScreen.colouredTileModeOn || pauseScreen.collectiblesOn) {
            // lose 30 points for going in the water
            GameProperties.currentGamePoints -= 30;
        }
        else {
            GameProperties.consecutiveSuccesses++;
        }
        this.resetPosition();
    } else {
        this.y -= this.VISIBLE_VERTICAL_TILE_HEIGHT;
    }
};

Player.prototype.moveDown = function() {
    if(this.y < this.startingYPosition) {
        this.y += this.VISIBLE_VERTICAL_TILE_HEIGHT;
    }
};

Player.prototype.setCharacter = function(sprite) {
    this.sprite = sprite;
};

var Collectible = function(x, y, points, sprite) {
    Item.call(this, x, y, 95, 57);

    this.sprite = sprite;
    this.points = points;
};

Collectible.inheritsFrom(Item);

var CollectibleManager = function(usableGameRows, usableGameColumns) {
    this.rows = usableGameRows;
    this.columns = usableGameColumns;

    this.availableCollectibles = [
        {sprite: 'images/gem-blue.png', points:25},
        {sprite: 'images/gem-orange.png', points: 50},
        {sprite: 'images/gem-green.png', points: 75}
    ];

    this.currentCollectibles = [];

    if (pauseScreen.collectiblesOn) {
        this.resetCollectible();
    }
};

CollectibleManager.prototype.resetCollectible = function() {
    var collectibleSelection = Math.floor(Math.random() * this.availableCollectibles.length);
    var sprite = this.availableCollectibles[collectibleSelection].sprite;
    var points = this.availableCollectibles[collectibleSelection].points;
    var x = Math.floor(Math.random() * this.columns) * 101;
    var y = (Math.floor(Math.random() * this.rows) + 1) * 83;

    if(this.currentCollectibles.length != 0) {
       this.currentCollectibles.pop();
    }
    this.currentCollectibles.push(new Collectible(x, y, points, sprite));
};

CollectibleManager.prototype.update = function() {
    if(pauseScreen.collectiblesOn && this.currentCollectibles.length == 0) {
        this.resetCollectible();
    }
};

CollectibleManager.prototype.removeCollectibles = function () {
    this.currentCollectibles = [];
};

var Screen = function() {
   this.alpha = 1;
};

/**
 * This method draws the background and border of the pause screen so that the game options are more visible to
 * the user.
 */
Screen.prototype.renderOverlay = function() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = 'black';
    ctx.fillRect(10, 60, 485, 516);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 60, 485, 516);
};

/**
 * Draw a grey centered title on the canvas with a black shadow.
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
 * Creates a new PauseScreen class.  This class contains all the information necessary to display the pause screen
 * with all game option information visible to the user.
 * @constructor
 */
var PauseScreen = function() {
    //TODO: consider passing this information into the class or putting it in GameProperties
    this.characterImages = [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ];

    this.alpha = 0.85;
    this.characterSelection = 0;
    this.colouredTileModeOn = false;
    this.collectiblesOn = false;
    this.alternateDirectionsOn = false;
};

PauseScreen.inheritsFrom(Screen);

/**
 * This is called to draw the pause screen on the canvas.
 * The user is allowed to select a character and set which game modes they would like active.
 * There is also a message letting the user know how to exit the pause screen.
 */
PauseScreen.prototype.render = function() {
    this.renderOverlay();
    this.drawTitle('SELECT A CHARACTER', canvas.width/2, 100);
    this.drawCharacterSelect(21, 115, 90);
    this.drawTitle('GAME MODES', canvas.width/2, 330);
    this.drawGameModeText('images/1-icon.png', 'Coloured Tile', this.colouredTileModeOn, 337);
    this.drawGameModeText('images/2-icon.png', 'Collectibles', this.collectiblesOn, 397);
    this.drawGameModeText('images/3-icon.png', 'Alternate Directions', this.alternateDirectionsOn, 457);
    this.drawEscapeMessage(555);
};

/**
 * Draw the characters available for selection.
 * @param {number} x - the canvas x-coordinate of the left-most character image
 * @param {number} y - the canvas x-coordinate of all the character images
 * @param {number} spacingInterval - the x-coordinate interval to use to evenly space the character images
 */
PauseScreen.prototype.drawCharacterSelect = function(x, y, spacingInterval) {
    ctx.drawImage(Resources.get('images/Selector.png'), this.characterSelection * spacingInterval + x, y);

    for(var characterIndex in this.characterImages) {
        ctx.drawImage(Resources.get(this.characterImages[characterIndex]), characterIndex * spacingInterval + x, y);
    }
};

/**
 * Draw the available game mode text as well as whether the game mode is currently "ON" or "OFF"
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
 * @param {number} y - the canvas y-coordinate of where the message should be drawn
 */
PauseScreen.prototype.drawEscapeMessage = function(y) {
    ctx.fillStyle = 'white';
    ctx.font = '20pt Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press      to play game', canvas.width/2, y);
    ctx.drawImage(Resources.get('images/esc-icon.png'), canvas.width/2 - 72, y-34);
};

/**
 * This function is called by the event listener that is listening for keyUp events when the game is
 * considered 'paused'.  Based on which key was pressed either a new character is selected or a game mode
 * is enabled/disabled.
 * @param {string} input - the string representation of the key that the user pressed
 */
PauseScreen.prototype.handleInput = function (input) {
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
            //TODO: move this attribute to GameProperties
            this.colouredTileModeOn = !this.colouredTileModeOn;
            GameProperties.currentGamePoints = 0;
            player.resetWalkingArray();
            player.reset();
            break;
        case 'two':
            this.collectiblesOn = !this.collectiblesOn;
            GameProperties.currentGamePoints = 0;
            if(!this.collectiblesOn) {
                collectibleManager.removeCollectibles();
            }
            player.reset();
            break;
        case 'three':
            this.alternateDirectionsOn = !this.alternateDirectionsOn;
            allEnemies.forEach(function(enemy) {
               if (enemy.onRow() == 1) {
                   enemy.reverseEnemy();
               }
            });
            GameProperties.currentGamePoints = 0;
            player.reset();
            break;
    }
};

/**
 * Gets the URL of the image for the selected character
 * @returns {string} - image URL of the selected character
 */
PauseScreen.prototype.getSelectedCharacterImageURL = function() {
    return this.characterImages[this.characterSelection];
};

var InfoScreen = function() {
    this.alpha = 1;
};

InfoScreen.inheritsFrom(Screen);

InfoScreen.prototype.render = function() {
    infoTextX = 30;
    startingTextY = 100;
    this.renderOverlay();

    this.drawTitle("Basic Gameplay", canvas.width / 2, startingTextY);
    this.infoText("See how many times you can reach the water", infoTextX, startingTextY + 25);
    this.infoText("without being hit by a bug.", infoTextX, startingTextY + 50);

    this.drawTitle("Coloured Tile Mode", canvas.width / 2, startingTextY + 100);
    this.infoText("See how many tiles you can walk on without", infoTextX, startingTextY + 125);
    this.infoText("being hit by a bug. Each tile is 10 pts, going in", infoTextX, startingTextY + 150);
    this.infoText("the water is -30 pts and getting all tiles is 200.", infoTextX, startingTextY + 175);

    this.drawTitle("Collectibles Mode", canvas.width / 2, startingTextY + 225);
    this.infoText("See how many gems you can collect without", infoTextX, startingTextY + 250);
    this.infoText("being hit by a bug.", infoTextX, startingTextY + 275);
    this.infoText("Blue - 25pts, Orange - 50pts, Green - 75 pts", infoTextX, startingTextY + 300);

    this.drawTitle("Alternate Directions Mode", canvas.width / 2, startingTextY + 350);
    this.infoText("The second row of bugs move in the other", infoTextX, startingTextY + 375);
    this.infoText("direction for an added challenge.", infoTextX, startingTextY + 400);

    this.infoText("* Changing modes resets the game.", infoTextX, startingTextY + 450);
}

InfoScreen.prototype.infoText = function(text, x, y) {
    ctx.fillStyle = 'white';
    ctx.font = '15pt Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(text, x, y);
};

pauseScreen = new PauseScreen();
infoScreen = new InfoScreen();
allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy(), new Enemy()];
collectibleManager = new CollectibleManager(3, 5);
player = new Player();
infoItem = new Item(423, 507, 64, 0, 'images/info.png');


/**
 * This listens for key presses and sends the keys to the Player.handleInput() method.
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
        GameProperties.pauseGame = !GameProperties.pauseGame;
    }

    if(GameProperties.pauseGame) {
        pauseScreen.handleInput(allowedKeys[e.keyCode]);
    }
    else {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});

document.addEventListener('mousedown', function(e) {
    // taken from http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
    // and http://www.homeandlearn.co.uk/JS/html5_canvas_mouse_events.html
    var rect = canvas.getBoundingClientRect();
    x = e.pageX - rect.left;
    y = e.pageY - rect.top;

    console.log(x.toString()+", "+ y.toString());

    if(x > 423 && x < 487 && y > 507 && y < 571) {
        GameProperties.showInfo = !GameProperties.showInfo;
    }
});
