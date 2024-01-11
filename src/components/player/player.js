import { weapons } from '../weapon/weapon.js';
// import { Board } from '../board/board.js';

// Player class
class Player {
    // Initialize new player
    constructor(name, symbol, health = 100) {
        this.name = name;      // Name of the player 
        this.symbol = symbol;  // Represent player on the board
        this.position = null;  // Initial position of the player
        this.currentWeapon = weapons[0].name; // Add a property for the currently equipped weapon
        this.health = health;
    }

    // Set the player's position
    setPosition(x, y) {
        this.position = { x, y };
    }

    // Get the player's current position
    getPosition() {
        return this.position;
    }

    // Equip a weapon
    equipWeapon(weapon) {
        this.currentWeapon = weapon;
    }

    // Get the current weapon
    getCurrentWeapon() {
        return this.currentWeapon;
    }

    // Update Player health after damage
    takeDamage(amount, board, opponent) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0; // Prevent health from going below 0
        }
        if (this.health === 0) {
            board.gameOver(opponent);
        }
    }

}

// Export the Player class 
export { Player };