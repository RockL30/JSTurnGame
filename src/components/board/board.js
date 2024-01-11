import { weapons } from '../weapon/weapon.js';

class Board {
    // Constructor for the 'Board' class, called when a new Board object is created.
    constructor(rows, cols, player1, player2, unavailableFrequency = 0.2) {
        this.rows = rows; // Number of rows
        this.cols = cols; // Number of columns
        this.player1 = player1; // Add player1 as a property
        this.player2 = player2; // Add player2 as a property
        this.player1InitialPos = null;
        this.player2InitialPos = null;
        this.unavailableFrequency = unavailableFrequency; // Frequency of unavailable cells
        this.lastUnavailableCell = null; // Track the last unavailable cell
        this.currentPlayer = player1; // Initialize currentPlayer with player1
        this.actionTaken = false; // Track if action has been taken
        this.previousAction = null; // Initialize the variable to store the previous action
        this.actionMessage = null;
        // this.actionPerformedLog = null; // Debug and Development
        // this.damageAppliedLog = null; // Debug and Development
        // this.prevousActionLog = null; // Debug and Development
        // this.pickUpWeaponLog = null; // Debug and Development
        // Update the UI based on the current player and to initialize the game board.
        this.updateCurrentPlayerUI();
        this.initializeBoard();
    }

    // Method to create the board, place weapons and players
    initializeBoard() {
        this.createBoard(); // Create the board in the DOM
        this.placeWeapons(); // Place weapons on the board
        this.placePlayers(); // Place players on the board
        this.clearHighlights();// Clear any highlights when initializing the board
        this.setupAttackEventListener(); // Set up listener for 'Attack' button
        this.setupDefendEventListener(); // Set up listener for 'Defend' button
        document.getElementById('attackGameButton').disabled = true; // Disable attack button at the start of the game
        document.getElementById('defendGameButton').disabled = true; // Disable attack button at the start of the game
        this.clearActionLog(); // Clear the action log
    }

    logAction(actionMessage) {
        // Use jQuery to append the message to the action log
        $('#actionLog').append(`<p>${actionMessage}</p>`);

        // Automatically scroll to the bottom of the action log
        $('#actionLog').scrollTop($('#actionLog')[0].scrollHeight);

        // Check the number of messages and remove the oldest if there are more than 3
        const messages = $('#actionLog p');
        if (messages.length > 3) {
            messages.first().remove();
        }
    }

    // Set up the event listener for the 'Attack' button
    setupAttackEventListener() {
        // Add event listener to the 'Attack' button
        const attackButton = document.getElementById('attackGameButton');
        attackButton.addEventListener('click', this.handleAttackButtonClick);
    }

    // Set up the event listener for the 'Defend' button
    setupDefendEventListener() {
        // Add event listener to the 'Defend' button
        const defendButton = document.getElementById('defendGameButton');
        defendButton.addEventListener('click', this.handleDefendButtonClick);
    }
    // Event handler - Hover
    handleMouseover = (event) => {
        if (event.target.classList.contains('highlight-move')) {
            event.target.classList.add('highlight-hover');
        }
    }
    // Event handler - handleMouseout
    handleMouseout = (event) => {
        if (event.target.classList.contains('highlight-move')) {
            event.target.classList.remove('highlight-hover');
        }
    }

    // Event handler - click
    handleClick = (event) => {
        let cell = event.target;
        if (cell.classList.contains('highlight-move')) {
            // Extract cell coordinates
            const x = parseInt(cell.dataset.x, 10); // convert to int
            const y = parseInt(cell.dataset.y, 10); // convert to int
            // movePlayer(player, newX, newY) 
            if (this.movePlayer(this.currentPlayer, x, y)) {
                // Update player info on the page after the move
                this.updatePlayerInfo(this.player1);
                this.updatePlayerInfo(this.player2);
            }
        }
    };

    // Handle a player's action, actionType can be Attack or Defend
    handlePlayerAction(actionType) {
        if (this.actionTaken) return; // Prevent multiple actions in a single turn - Safeguard

        // const formattedTime = this.getCurrentFormattedTime();
        // const actionPerformedLog = `[${formattedTime}] ${this.currentPlayer.name} ${actionType}ed!`; - Debugging / Development purposes
        // this.logAction(actionPerformedLog); // Log the action to the UI - Debugging purposes - Debugging / Development purposes

        // Object literal creation or Object Initialization, define a new object with properties and their correspondent values
        this.previousAction = { player: this.currentPlayer, action: actionType };
        this.actionTaken = true; // Mark the action as taken
        this.switchPlayer(); // Switch to the other player
    }

    // Method called when the Attack button is clicked
    handleAttackButtonClick = () => {
        // Retrieve the damage value of the weapon currently equipped by the attacking player.
        const weaponDamage = weapons.find(w => w.name === this.currentPlayer.getCurrentWeapon()).damage;
        // Determine the defending player: if the current player is player1, then player2 is defending, and vice versa.
        const defendingPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
        // Identify the attacking player (the current player).
        const attackingPlayer = this.currentPlayer; // Define the attacking player

        let damageReduction = 1; // No reduction by default
        // If the defending player chose to defended in their last action, reduce damage by half.
        if (this.previousAction && this.previousAction.player === defendingPlayer && this.previousAction.action === 'Defend') {
            damageReduction = 0.5;
        }

        // Apply damage to the defending player, Modify damage accounting for damageReduction.
        defendingPlayer.takeDamage(weaponDamage * damageReduction, this, attackingPlayer);
        // const formattedTime = this.getCurrentFormattedTime(); - Debugging / Development purposes
        // const damageAppliedLog = `[${formattedTime}] Damage applied: ${weaponDamage * damageReduction}`; - Debugging / Development purposes
        // this.logAction(damageAppliedLog);

        // Update the UI with the latest information for both players.
        this.updatePlayerInfo(this.player1);
        this.updatePlayerInfo(this.player2);

        this.handlePlayerAction('Attack'); // Log attack and Switch player
    };

    // Method called when the Defend button is clicked
    handleDefendButtonClick = () => {
        this.handlePlayerAction('Defend'); // Only log the action and switch player
    };

    // get current time for actionMessage in HH:MM:SS
    getCurrentFormattedTime() {
        const currentTime = new Date();
        return currentTime.getHours().toString().padStart(2, '0') + ':' +
            currentTime.getMinutes().toString().padStart(2, '0') + ':' +
            currentTime.getSeconds().toString().padStart(2, '0');
    }

    // Method to create the board in the DOM.
    createBoard() {
        // Find the element in the HTML document where the board will be displayed.
        const boardElement = document.getElementById('gameBoard');
        // If the element is not found, log an error and stop further execution.
        if (!boardElement) {
            console.error("Board element not found in the DOM.");
            return;
        }
        // Create a new table element. This will be used to represent the game board.
        const tableBoard = document.createElement('table');

        // Loop through each row (based on the number of rows specified for the board).
        // Remember about let block scope
        for (let i = 0; i < this.rows; i++) {
            // Create a new row using the createRow method.
            const row = this.createRow();
            // Loop through each column in the current row.
            for (let j = 0; j < this.cols; j++) {
                // Create a new cell at the current position (j, i).
                const cell = this.createCell(j, i); // x=j, y=i
                // Add the cell to the current row.
                row.appendChild(cell);
            }
            // Add the completed row to the table (the game board).
            tableBoard.appendChild(row);
        }
        // Add the fully constructed table to the board element in the HTML document.
        boardElement.appendChild(tableBoard);
    }

    // Method to create a row
    createRow() {
        return document.createElement('tr'); // Returns a new 'tr' element.
    }

    // Create a new table cell
    createCell(x, y) {
        // Create a new table cell element
        const cell = document.createElement('td');
        cell.classList.add('text-center'); // // Add a text-center class for styling

        // Use the dataset property read and write custom data attributes (data-*) on HTML elements. 
        // We used dataset to store coordinates in each cell so it's easier to manage the game board, 
        // handle player interactions, and maintain the game's logic.

        // Store x and y coordinates in the cell's dataset for easy access
        cell.dataset.x = x; // custom data attribute to handle x coordinate
        cell.dataset.y = y; // custom data attribute to handle y coordinate
        cell.dataset.weapon = ''; // custom data attribute to handle weapons, initally no weapon is assigned

        // Determine if the cell should be marked as unavailable
        //   - A cell can be marked unavailable if:
        //      1. It meets the random chance based on 'unavailableFrequency'.
        //      2. It is not adjacent to the last unavailable cell.
        const isSuitableForUnavailable = Math.random() < this.unavailableFrequency && !this.isAdjacentToUnavailable(x, y);

        if (isSuitableForUnavailable) {
            cell.classList.add('unavailable'); // Mark the cell as unavailable
            cell.dataset.type = 'unavailable'; // Store the type as unavailable
            // 'this.lastUnavailableCell' holds the coordinates of the most recently marked unavailable cell.
            this.lastUnavailableCell = { x, y };
        } else {
            cell.textContent = ''; // If not unavailable, leave the cell empty
        }

        return cell; // Return the created cell
    }

    clearBoard() {
        const boardElement = document.getElementById('gameBoard');
        // Clear the board if boardElement exists
        boardElement && (boardElement.innerHTML = '');
    }

    clearActionLog() {
        $('#actionLog').empty(); // Clear the action log using jQuery
    }

    // This method checks if a cell (with coordinates x and y) is adjacent to the last unavailable cell.
    // Important for a balanced game board with paths for movement.
    isAdjacentToUnavailable(x, y) {
        // If there is no last unavailable cell recorded, return false (don't need to check adjacency)
        if (!this.lastUnavailableCell) return false; // see line 211

        // Extract the x and y coordinates of the last unavailable cell
        const { x: lastX, y: lastY } = this.lastUnavailableCell;

        // Calculate the absolute difference between x and y coordinates between current and last unavailable cell
        // 'Math.abs' ensures we get a positive value regardless of which cell is ahead or behind.
        const deltaX = Math.abs(x - lastX); // Horizontal distance from the last unavailable cell
        const deltaY = Math.abs(y - lastY); // Vertical distance from the last unavailable cell
        const isAdjacentXY = deltaX <= 1 && deltaY <= 1;

        // Check if the current cell is adjacent to the last unavailable cell.
        // If deltaX or deltaY is less than or equal to 1, the cells are adjacent.
        return isAdjacentXY;
    }

    // cell is COMPLETELY surrounded by unavailable cells.
    isSurroundedByUnavailable(x, y) {
        // Array of objects with directions
        // Each object represents a direction
        const directions = [
            { dx: 1, dy: 0 }, // right (increase x-coordinate)
            { dx: -1, dy: 0 }, // left (decrease x-coordinate)
            { dx: 0, dy: 1 }, // down (increase y-coordinate)
            { dx: 0, dy: -1 } // up (decrease y-coordinate)
        ];

        // Loop through each direction
        for (let direction of directions) {
            // Calculate the coordinates of the adjacent cell
            const adjacentX = x + direction.dx; // used for bounds
            const adjacentY = y + direction.dy; // used for bounds

            // Check if the adjacent cell is within the board bounds
            if (adjacentX >= 0 && adjacentX < this.cols && adjacentY >= 0 && adjacentY < this.rows) {
                // Retrieve the adjacent cell
                const adjacentCell = this.getCell(adjacentX, adjacentY);
                // If there is at least one adjacent cell that is not unavailable, return false
                if (!adjacentCell || !adjacentCell.classList.contains('unavailable')) {
                    return false;
                }
            }
        }

        // If all adjacent cells are unavailable, return true
        return true;
    }

    // Method to find a random empty cell on the game board, i.e does not have a weapon or player
    // Used for placing weapons and players
    // Optionally, an avoidPosition can be provided to exclude cells adjacent to it. (Was thinking on setting the players fixed, but that doesn't meet requirements)
    findRandomEmptyCell(avoidPosition = null) {
        // Hold x and y coords of the random cell
        let x, y;
        do {
            // Generate random x and y coordinates within the board's boundaries.

            //Math.floor -> return the closest INTEGER that's smaller than or equal to the given number
            x = Math.floor(Math.random() * this.cols); // Random x-coordinate
            y = Math.floor(Math.random() * this.rows); // Random y-coordinate
            // Keep looking for a new cell until:
            //  1. The cell is suitable (empty, not unavailable)
            //  2. It's not adjacent to avoidPosition
            //  3. It's not completely surrounded by unavailable cells
        } while (!this.isCellSuitable(x, y, avoidPosition) || this.isSurroundedByUnavailable(x, y));

        // Return the coords of suitable cell
        return { x, y };
    }

    // Check if a CELL is SUITABLE for PLACING an ITEM (like a weapon or player)
    isCellSuitable(x, y, avoidPosition) {
        const cell = this.getCell(x, y);
        if (!cell) {
            return false; // Cell does not exist, so it's not suitable
        }

        // Check if the cell is empty (no player symbol and no weapon)
        const cellIsEmpty = cell.textContent === '' && cell.dataset.weapon === '';

        // Check if the cell is unavailable
        const cellIsUnavailable = cell.classList.contains('unavailable');

        // Check if the cell is adjacent to avoidPosition
        const cellToAvoid = avoidPosition && this.isAdjacent({ x, y }, avoidPosition);

        // A cell is suitable if it's empty, Available, and not adjacent to the avoidPosition
        return cellIsEmpty && !cellIsUnavailable && !cellToAvoid;
    }

    // Check if two positions are next to each other
    isAdjacent(pos1, pos2) {
        // Calculate the delta (difference) in the x-coordinates (horizontal distance) between pos1 and pos2
        const deltaX = Math.abs(pos1.x - pos2.x);

        // Calculate the delta (difference) in the y-coordinates (vertical distance) between pos1 and pos2
        const deltaY = Math.abs(pos1.y - pos2.y);

        // Two positions are adjacent if:
        //  1. Horizontal Delta (deltaX) is 1 and Vertical Delta (deltaY) is 0
        //  OR
        //  2. Vertical Delta (deltaY) is 1 and Horizontal Delta (deltaX) is 0
        return (deltaX === 1 && deltaY === 0) ||
            (deltaX === 0 && deltaY === 1);
    }

    // Determine if a move to a specific cell (x, y) is valid.
    // Limit move between bounds
    isValidMove(x, y) {
        // Check if x-coordinate is within the board's width (0 to this.cols - 1).
        let isXWithinBounds = x >= 0 && x < this.cols;
        // Check if y-coordinate is within the board's height (0 to this.rows - 1)
        let isYWithinBounds = y >= 0 && y < this.rows;
        // The move is within bounds if both x and y are within bounds.
        let isWithinBounds = isXWithinBounds && isYWithinBounds;

        // If the cell is not within bounds, return false
        if (!isWithinBounds) {
            return false;
        }

        // Retrieve the cell element at the given coordinates
        let cell = this.getCell(x, y);
        // If the cell does not exist (null), return false
        if (!cell) {
            return false; // Cell does not exist
        }

        // Check for the presence of a player in the cell
        // Avoid movement if a cell has a player
        const cellHasPlayer = cell.dataset.player;

        // A cell is valid for movement if it does not have a player and is not marked as unavailable.
        // If these conditions are met, the move is valid, so return true.
        const cellIsValid = !cellHasPlayer && !cell.classList.contains('unavailable');

        // Return whether the cell is valid for movement
        return cellIsValid;
    }

    // Cell that the player can move to
    // Indicate visually the cells the player can move to
    highlightMoveableCells() {
        // First, clear any existing highlights from the game board.
        this.clearHighlights();

        // Check if either player has zero health. If so, disable further movement.
        if (this.player1.health === 0 || this.player2.health === 0) {
            return false; // Stop the function
        }

        // Get the current position (x, y coordinates) of the player whose turn it is
        const { x, y } = this.currentPlayer.getPosition();

        // Define the directions in which the player can potentially move.
        // Array of objects
        // Each object represents a direction
        const directions = [
            { dx: 0, dy: -1 }, // up
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }, // left
            { dx: 1, dy: 0 }   // right
        ];

        // Iterate over each direction.
        directions.forEach(direction => {
            // Check up to 3 cells in each direction
            for (let step = 1; step <= 3; step++) {
                // Calculate the new coordinates based on direction and step size
                const newX = x + direction.dx * step;
                const newY = y + direction.dy * step;

                // Check if moving to this new cell is valid.
                // it is within bounds, does not have a player and is not marked as unavailable.
                if (!this.isValidMove(newX, newY)) {
                    break;
                }

                // Retrieve the cell location based on the new coordinates
                const cell = this.getCell(newX, newY);

                // If the cell is valid, add highlighting CSS class and set up event listeners for mouse interactions.
                if (cell) {
                    cell.classList.add('highlight-move');
                    cell.addEventListener('mouseover', this.handleMouseover);
                    cell.addEventListener('mouseout', this.handleMouseout);
                    cell.addEventListener('click', this.handleClick);
                }
            }
        });
    }

    // Place weapons on the board
    placeWeapons() {
        for (let weapon of weapons) {
            let pos;
            do {
                // Find a random empty cell for each weapon
                pos = this.findRandomEmptyCell();
            } while (pos === null); // Ensure the position is valid (not null)

            // Get the cell at the found position
            let cell = this.getCell(pos.x, pos.y);

            // Add CSS classes to style the cell as a weapon and set its symbol
            cell.classList.add('weapon', weapon.class);
            cell.textContent = weapon.symbol;

            // Update the data-weapon attribute to reflect the weapon placed
            cell.dataset.weapon = weapon.name;
        }
    }

    // Check if a player is confined to a limited area on the board
    isPlayerConfined(player) {
        // Get the current position of the player
        const { x, y } = player.getPosition();

        // Set to keep track of visited cells to avoid revisiting them
        // Set -> Collection of unique values
        const visited = new Set();

        // Queue for BFS, starting from player's current position
        // Breadth-First Search
        // Algo for searching a tree or graph data structure.
        // It begins at the root node then explores all nodes left to right, level by level.
        // Breadth first search follows the FIFO(first in, first out) principle and can be implemented with a queue.
        // https://ellen-park.medium.com/implementing-breadth-first-search-in-javascript-49af8cfad763

        const queue = [{ x, y }];

        // Keep exploring until there are no more cells in the queue
        while (queue.length > 0) {
            // Remove the first cell from the queue 
            const current = queue.shift(); // Get the next cell to explore
            const currentKey = `${current.x},${current.y}`; // Create a unique key for the current cell

            // Skip this cell if it's already been visited
            if (visited.has(currentKey)) continue;
            visited.add(currentKey); // Mark this cell as visited

            // Directions for exploring adjacent cells 
            // Array of objects
            // Each object represents a direction
            const directions = [
                { dx: 0, dy: -1 }, // up
                { dx: 0, dy: 1 },  // down
                { dx: -1, dy: 0 }, // left
                { dx: 1, dy: 0 }   // right
            ];

            // Check each direction from the current cell
            for (let direction of directions) {
                const newX = current.x + direction.dx;
                const newY = current.y + direction.dy;

                // Bounds Checking
                // Ensure the new position is within the bounds of the board
                if (newX >= 0 && newX < this.cols && newY >= 0 && newY < this.rows) {
                    const newKey = `${newX},${newY}`;
                    // If the new cell hasn't been visited and isn't blocked (unavailable), it's added to the queue for further exploration.
                    if (!visited.has(newKey) && !this.getCell(newX, newY).classList.contains('unavailable')) {
                        queue.push({ x: newX, y: newY });
                    }
                }
            }
        }

        // Determining Confinement
        // Check if the number of visited cells is below a certain threshold
        // Example: if less than 25% of the board is accessible, the player is confined
        const threshold = 0.25;
        return (visited.size < this.rows * this.cols * threshold);
    }

    // Place players on the board
    placePlayers() {
        // Place the first player
        let player1Pos;
        do {
            // Keep finding a random empty cell until it's not surrounded by unavailable cells
            // and the player isn't confined (has enough space to move)
            player1Pos = this.findRandomEmptyCell();
        } while (this.isSurroundedByUnavailable(player1Pos.x, player1Pos.y) || this.isPlayerConfined({ getPosition: () => player1Pos }));

        // Set the first player's position
        this.player1.setPosition(player1Pos.x, player1Pos.y);

        // Get the cell at the player's position and update the content and data attribute
        let cell1 = this.getCell(player1Pos.x, player1Pos.y);
        cell1.textContent = this.player1.symbol; // Display the player's symbol in the cell
        cell1.dataset.player = this.player1.symbol; // Add data-player for player1

        // Place the second player
        let player2Pos;
        do {
            // Keep finding a random empty cell until it's not surrounded by unavailable cells
            // and the player isn't confined (has enough space to move)
            player2Pos = this.findRandomEmptyCell(player1Pos);
        } while (this.isSurroundedByUnavailable(player2Pos.x, player2Pos.y) || this.isPlayerConfined({ getPosition: () => player2Pos }));

        // Set the second player's position
        this.player2.setPosition(player2Pos.x, player2Pos.y);
        let cell2 = this.getCell(player2Pos.x, player2Pos.y);
        cell2.textContent = this.player2.symbol; // Display the player's symbol in the cell
        cell2.dataset.player = this.player2.symbol; // Add data-player for player2

        // Update player information on the page
        this.updatePlayerInfo(this.player1);
        this.updatePlayerInfo(this.player2);
    }

    movePlayer(player, newX, newY) {
        // Check if the new position is a valid move
        // it is within bounds, does not have a player and is not marked as unavailable.
        if (this.isValidMove(newX, newY)) {
            // Get the current position of the player
            // Destructuring assignment
            // assign x and y to the current position of the player
            const { x: currentX, y: currentY } = player.getPosition();

            // Calculate the path from current position to new position
            // We need the path to check if there is a cell with a weapon along the way
            const path = this.calculatePath(currentX, currentY, newX, newY);

            // Handle weapon pickup along the path
            for (const cellPos of path) {
                // Skip the starting cell - Bug Fixed
                if (cellPos.x === currentX && cellPos.y === currentY) {
                    continue;
                }

                // Retrieve the cell element at the current position from the path
                const cell = this.getCell(cellPos.x, cellPos.y);

                // Check if the cell has 'dataset.weapon' 
                if (cell.dataset.weapon) {
                    // This function determines if the player should pick up the weapon based on game logic
                    // It takes two arguments: the player object and the cell element
                    this.checkAndPickupWeapon(player, cell);
                }
            }

            // Get the cell at the player's current position
            const currentCell = this.getCell(currentX, currentY);
            currentCell.textContent = ''; // Clear the cell if no weapon
            currentCell.classList.remove('player');
            delete currentCell.dataset.player; // Remove player data from current cell

            // Move player to the new cell
            player.setPosition(newX, newY);
            const newCell = this.getCell(newX, newY);

            // Update the new cell with the player's symbol
            newCell.textContent = player.symbol;
            newCell.classList.add('player');
            newCell.dataset.player = player.symbol; // Add player data to the new cell

            this.clearHighlights();
            this.switchPlayer();
            this.updateAttackDefendButtonState(); // Update the state of attack and defend buttons
            this.updateWeaponSymbolsOnBoard(); // fill empty cells with dataset.weapon
            return true;
        } else {
            console.log("Invalid move.");
            return false;
        }
    }

    // Calculate the path between x or y
    calculatePath(startX, startY, endX, endY) {
        const path = []; // Initialize an empty array to store the path

        // Determine the direction of movement along the x-axis and y-axis
        const xDirection = startX < endX ? 1 : -1; // 1 for right, -1 for left
        const yDirection = startY < endY ? 1 : -1; // 1 for down, -1 for up

        // Handle horizontal movement first
        // Loop through the x-coordinates from startX to endX (excluding endX)
        // reminder for (initialization; condition; afterthought)
        for (let x = startX; x !== endX; x += xDirection) {
            // Add each coordinate to the path array
            path.push({ x: x, y: startY });
        }

        // Handle vertical movement next
        // Loop through the y-coordinates from startY to endY (excluding endY)
        for (let y = startY; y !== endY; y += yDirection) {
            // Add each coordinate to the path array
            // Note: The x-coordinate is fixed at endX during vertical movement
            path.push({ x: endX, y: y });
        }

        // Add the final destination point to the path
        // This is necessary because the loops above exclude the endX and endY
        path.push({ x: endX, y: endY });

        return path; // Return the complete path from start to end
    }

    // Update the weapon symbols on the board, where cell is "empty" but it has a weapon dataset
    updateWeaponSymbolsOnBoard() {
        // Loop through each row of the board
        for (let i = 0; i < this.rows; i++) {
            // Loop through each column in the current row
            for (let j = 0; j < this.cols; j++) {
                // Retrieve the cell at the current row and column
                const cell = this.getCell(j, i);

                // Check if the cell exists, has a weapon, and does not already have text content
                if (cell && cell.dataset.weapon && !cell.textContent) {
                    // Find the weapon object corresponding to the weapon name stored in the cell's dataset
                    const weaponSymbol = weapons.find(w => w.name === cell.dataset.weapon).symbol;

                    // Update the cell's text content with the weapon's symbol
                    cell.textContent = weaponSymbol;
                }
            }
        }
    }

    // Trigger attack / defend buttons 
    updateAttackDefendButtonState() {
        // Check if players are adjacent
        const playersAreAdjacent = this.isAdjacent(this.player1.getPosition(), this.player2.getPosition());

        // Get the buttons from the DOM
        const attackButton = document.getElementById('attackGameButton');
        const defendButton = document.getElementById('defendGameButton');

        if (playersAreAdjacent) {
            // Players are adjacent, enable attack/defend buttons and change color to red
            attackButton.classList.add('btn-danger');
            defendButton.classList.add('btn-danger');
            attackButton.disabled = false;
            defendButton.disabled = false;
        } else {
            // Players are not adjacent, disable attack/defend buttons and revert button color
            attackButton.classList.remove('btn-danger');
            defendButton.classList.remove('btn-danger');
            attackButton.disabled = true;
            defendButton.disabled = true;
        }
    }

    // Alternate players
    switchPlayer() {
        // Log the previous action before switching players
        this.actionTaken = false; // Reset the actionTaken flag
        // if (this.previousAction) {
        //     const formattedTime = this.getCurrentFormattedTime();
        //     const prevousActionLog = `[${formattedTime}] Previous action: ${this.previousAction.player.name} chose to ${this.previousAction.action}`;
        //     // this.logAction(prevousActionLog);
        // }
        this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;

        // Highlight moveable cells for the new current player
        this.highlightMoveableCells();

        // Update the UI to reflect the current player
        this.updateCurrentPlayerUI();
    }

    // Update player-info for current player
    updateCurrentPlayerUI() {
        const player1Panel = document.querySelector('.player-info-1');
        const player2Panel = document.querySelector('.player-info-2');

        // Remove the 'current-player' class from both panels
        player1Panel.classList.remove('current-player');
        player2Panel.classList.remove('current-player');

        // Add the 'current-player' class to the current player's panel
        if (this.currentPlayer === this.player1) {
            player1Panel.classList.add('current-player');
        } else if (this.currentPlayer === this.player2) {
            player2Panel.classList.add('current-player');
        }
    }

    // Check and pickup weapon if cell has weapon
    checkAndPickupWeapon(player, cell) {
        const weaponInCell = weapons.find(w => cell.classList.contains(w.class));
        const currentPlayerWeapon = weapons.find(w => w.name === player.getCurrentWeapon());

        if (weaponInCell) {
            // Remove the existing weapon's class from the cell
            cell.classList.remove(weaponInCell.class);

            if (weaponInCell.name !== currentPlayerWeapon.name) {
                // Equip the new weapon
                player.equipWeapon(weaponInCell.name);
                // const formattedTime = this.getCurrentFormattedTime();
                // const pickUpWeaponLog = `[${formattedTime}] ${player.name} picked up ${weaponInCell.name}`;
                // this.logAction(pickUpWeaponLog);

                // Add the old weapon's class to the cell
                cell.classList.add(currentPlayerWeapon.class);
                cell.dataset.weapon = currentPlayerWeapon.name; // Update data-weapon
            }
        }
        // Update the cell content to show player's symbol and current weapon alternative
        // cell.textContent = player.symbol + currentPlayerWeapon.symbol;
        cell.textContent = currentPlayerWeapon.symbol;
    }

    // Terminate game, designate winner and disable attack and defend buttons
    gameOver(winner) {
        // Get the buttons from the DOM
        const attackButton = document.getElementById('attackGameButton');
        const defendButton = document.getElementById('defendGameButton');
        attackButton.classList.remove('btn-danger');
        defendButton.classList.remove('btn-danger');
        attackButton.disabled = true;
        defendButton.disabled = true;
        const gameOverMessage = `${winner.name} wins the game!, if you would like to play again press the reset-game button`;
        this.logAction(gameOverMessage);

    }

    // Clear highlight from all cells after move
    clearHighlights() {
        const cells = document.querySelectorAll('.highlight-move');
        cells.forEach(cell => {
            cell.classList.remove('highlight-move', 'highlight-hover');
            cell.removeEventListener('mouseover', this.handleMouseover);
            cell.removeEventListener('mouseout', this.handleMouseout);
            cell.removeEventListener('click', this.handleClick);
        });
    }

    // Update HTML with player info
    updatePlayerInfo(player) {
        // Select the right elements based on player
        const playerInfoPrefix = player === this.player1 ? 'player1' : 'player2';
        const nameElement = document.getElementById(`${playerInfoPrefix}Name`);
        const positionElement = document.getElementById(`${playerInfoPrefix}Position`);
        const weaponElement = document.getElementById(`${playerInfoPrefix}Weapon`);
        const symbolElement = document.getElementById(`${playerInfoPrefix}Symbol`);
        const healthElement = document.getElementById(`${playerInfoPrefix}Health`);

        // Find the weapon object from the weapons array based on the player's current weapon
        const weapon = weapons.find(w => w.name === player.getCurrentWeapon());

        // Update the elements with the player's current information
        nameElement.textContent = `Name: ${player.name}`;
        // ?. Optional chaining operator, if player.position is null or undefined, the expression will return undefined
        positionElement.textContent = `Position: (${player.position?.x}, ${player.position?.y})`;
        weaponElement.textContent = `Weapon: ${weapon ? `${weapon.name} (${weapon.damage})` : 'None'}`; // Add damage info
        symbolElement.textContent = `Symbol: ${player.symbol}`;
        healthElement.textContent = `Health: ${player.health}`;
    }

    // Get cell x and y coords, essential for game actions and logic
    getCell(x, y) {
        const boardElement = document.getElementById('gameBoard');
        if (!boardElement) {
            console.error("Board element not found.");
            return null;
        }

        const table = boardElement.getElementsByTagName('table')[0];
        if (!table) {
            console.error("Table not found in the board element.");
            return null;
        }

        // Check if the specified row and cell exist 
        const row = table.rows[y];
        if (!row) {
            console.error(`Row ${y} does not exist.`);
            return null;
        }

        const cell = row.cells[x];
        if (!cell) {
            console.error(`Cell ${x} does not exist in row ${y}.`);
            return null;
        }

        return cell;
    }
}

export { Board };
