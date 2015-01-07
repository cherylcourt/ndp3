frontend-nanodegree-arcade-game
===============================

To play the game, do the following:

1. Clone this repository
2. Navigate to your local copy of index.html through your web browser 
(note: this has only been tested in Chrome - Version 39.0.2171.95 (64-bit))
3. Have fun playing!

**OR**

1. Play online [here](http://www.cherylcourt.ca/frogger/)

### Playing the Game
When you first navigate to the game page the pause screen will be up and you can select the character image you would
like by using the left and right arrows on the keyboard.

You can also select any, all or none of the game modes and then press the _Escape_ key to start playing the game.

### Basic Movement
You control the player character with the arrow keys and can move up, down, left or right

### Pausing The Game
You can pause the game at any time by pressing the _Escape_ key

### Game Info
You can click on the info image in the bottom right hand corner of the game screen to see some information about
game play.  Click on the info image again to return to the game.  Bringing this screen up does not pause the game, so
if you press any game buttons the game will respond as if the game info screen wasn't there.

### Game Modes
There are three game modes that you can play with any combination turned on.  You can also play without any 'modes'
turned on. The objective of the game will change depending on whether any game modes are turned on or not.  No matter
what mode is on the game is always reset if the player comes into contact with a bug.  Also, the bugs are colour
coded based on their speed with Blue being the slowest and Green being the fastest.

#### No modes
**Objective**: jump in the water as many times as possible

There is a counter in the upper right hand corner of the screen that keeps track of the number of times you've jumped 
in the water without getting hit by a bug.  If the player gets hit by a bug at any point the game resets; the player is
put back at the starting position and the counter is reset.

#### Coloured Tiles
**Objective**: get as many points as possible

Points are tracked in the upper left hand corner of the screen.  For each unique tile the player steps on, 10 points 
are added and the tile changes colour; when all tiles are stepped on there are 200 bonus points 
added and all tiles are reset. Jumping in the water in this mode subtracts 30 points from
the total.  If the player gets hit by a bug at any point the game resets; the player is put back at the starting 
position and if the current score is higher than any previous score it is shown in the middle of the screen.

#### Collectibles
**Objective**: get as many points as possible

Points are tracked in the upper left hand corner of the screen.  There are three different coloured gems that appear on
the stone tiles that can be collected for points. Jumping in the water in this mode subtracts 30 points from
the total.  If the player gets hit by a bug at any point the game resets; the player is put back at the starting 
position and if the current score is higher than any previous score it is shown in the middle of the screen.

#### Alternate Directions
There is no further objective with this mode; it simply adds a further layer of challenge to the game as it
reverses direction of the second row of bugs.


References
----------

Royalty-free sounds were taken from [freesound.org](http://www.freesound.org)

Keyboard image icons obtained from [megaicons.net](http://megaicons.net/)
- Icons by chromatix

Info icon obtained from [findicons.com](http://findicons.com/icon/211717/info)

Further information regarding image and sound attribution can be found in attribution.html, which is linked to
from the main page.

- Udacity: Object-Oriented JavaScript 
- Udacity: HTML5 Canvas
- Stack Overflow
- http://phrogz.net/js/classes/OOPinJS2.html
- W3C Schools


Evaluation Link
---------------
Students should use this rubric: https://www.udacity.com/course/viewer/#!/c-nd001/l-2696458597/m-2687128535 for self-checking their submission.
