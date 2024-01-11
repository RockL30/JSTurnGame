## Demo

[Click here to play the game](https://rockl30.github.io/JSTurnGame/)

---
Set and Run the Game
**To run the game, you need to execute a live server.**

### Installing the live server:
I recommend using VSCode, as this is the IDE I've used for this project. 
In VSCode:

1. Go to Extensions (`Ctrl+Shift+X`).
2. Paste this ID: `ritwickdey.LiveServer`, into the Search Extensions bar.

### Running the live server:
1. Go to the `index.html` file.
2. Press `Ctrl+Shift+P`.
3. Then select the 'Live Server: Open with Live Server' option.

## Game Development Progress
### Step 1 - Generate the Map

- [x] Initialize a grid to represent the game map.
- [x] Randomly assign each box on the map to be either:
    - [x] Empty
    - [x] Unavailable (dimmed)
- [x] Place a limited number of weapons on the map:
    - [x] Define up to 4 different types of weapons.
    - [x] Each weapon has a name and associated damage value.
    - [x] Randomly distribute weapons on the map, ensuring they are in 'empty' spaces.
- [x] Set the default weapon properties:
    - [x] The default weapon should inflict 10 points of damage.
- [x] Randomly place two players on the map:
    - [x] Ensure they do not start in adjacent boxes or on unavailable boxes.
    - [x] The players should also not start on a box with a weapon.
- [x] Create visual representations for different elements:
    - [x] Differentiate visually between empty, unavailable boxes, and weapons.
- [x] Ensure the map is valid and playable:
    - [x] Check that there are paths available for players to move around.
    - [x] Validate that the initial setup does not create unsolvable scenarios.
- [x] Improve Unavailable cells (Optional enhancements):
    - [x] Increase map size (Optional)
    - [x] Decrease unavailable cells (Optional)
    - [x] Generate unavailable cells in a way that they are not next to each other (Optional)

### Step 2 - Movements

- [x] Implement Player Movement Logic.
    - [x] Create method for handling player movement.
    - [x] Allow movement of 1 to 3 boxes per turn, horizontally or vertically.
    - [x] Prevent movement through 'unavailable' cells.

- [x] Check for Weapon Pickup:
    - [x] After moving, check if the player lands on a weapon.
    - [x] Trigger weapon pickup routine if a weapon is found.

- [x] Implement Weapon Pickup and Exchange:
    - [x] Update Player class to handle picking up a new weapon.
    - [x] Leave the current weapon at the previous position when picking up a new one.
    - [x] Reflect weapon pickup and exchange on the game board.

- [x] Update Game Board Visualization:
    - [x] Refresh board display after each move.
    - [x] Show updated player positions and weapon locations.

- [x] Turn Management:
    - [x] Implement a system to alternate turns between players.
    - [x] Ensure each player moves only once per turn.

- [x] Add Movement Restrictions:
    - [x] Enforce movement rules to prevent passing through obstacles.
    - [x] Include checks in movement method for these restrictions.

- [x] Test Movement Feature:
    - [x] Conduct thorough testing for all movement-related functionalities.
    - [x] Ensure all movement rules are correctly applied.

### Step 3: Fight!

- [x] Check if players are in adjacent squares (horizontally or vertically).
- [x] Trigger the start of the battle if players are adjacent.
    - [x] Change the color of the buttons Attack and Defense during battle.

- [x] Implement player actions: Attack and Defend:
    - [x] Attack will reduce the health of the opposite player.
    - [x] Defence will reduce the Attack Damage based on the weapon of the Opposite player.

- [x] Keep track of each player's weapon and its damage.
    - [x] Manage weapon details like name and damage points, and update when changed.

- [x] End the game when a player's life points fall to 0:
    - [x] Display a message and handle the game's conclusion, like resetting or offering a rematch.

