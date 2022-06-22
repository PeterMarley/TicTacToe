// game controls module implemented with IIFE
const gameControls = (() => {
    const BOARD_SIZE = 3;
    let players = [];
    let gameOver, boardArr, introElement, currentPlayer;
    const contentElement = document.querySelector('.content');
    return {
        BOARD_SIZE,
        players,
        gameOver,
        boardArr,
        introElement,
        currentPlayer,
        contentElement
    };
})();

// start game for first time
start();

/*

    START GAME

*/

/**
 * Starts a new game. First this function removes the old board and intro divs (if they exist), and appends new ones to the contentElement
 */
function start() {

    // ensure new gameOver flag is set to false
    gameControls.gameOver = false;

    // remove old board and intro
    const boardOld = document.querySelector('div.container-board');
    if (boardOld !== null) gameControls.contentElement.removeChild(boardOld);

    const introOld = document.querySelector('div.container-intro');
    if (introOld !== null) gameControls.contentElement.removeChild(introOld);

    // create new board array, and append new intro to contentElement
    gameControls.boardArr = ((size) => {
        const boardObj = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                row.push(null);
            }
            boardObj.push(row);
        }
        return boardObj;
    })(gameControls.BOARD_SIZE);

    // create new intro div
    gameControls.introElement = (() => {
        // create intro text p elements
        const introp1 = createP('Hello, welcome to Tic-Tac-Toe. Get 3 in a line to win (horizontally, vertically or diagonally).');
        const introp2 = createP('Please enter the player names below');

        function createP(text) {
            const p = document.createElement('p');
            p.textContent = text;
            return p;
        }

        // create player name form
        const form = (() => {
            const form = document.createElement('form');
            form.classList.add('name-select-form');
            form.appendChild(createInput(1));
            form.appendChild(createInput(2));
            return form;

            function createInput(playerNumber) {
                const label = document.createElement('label');
                label.setAttribute("for", `player${playerNumber}-name`);
                label.textContent = `Enter Player ${playerNumber} Name:`;
                const input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('id', `player${playerNumber}-name`);
                input.setAttribute('required', '');
                input.setAttribute('pattern', '^[A-Za-z]+$');
                label.appendChild(input);
                return label;
            }
        })();

        // create submit button - which is actually outside the form
        const buttonPlayerNames = (() => {
            const btn = document.createElement('button');
            btn.classList.add('player-name-accept');
            btn.textContent = 'Play!';
            btn.addEventListener('click', () => {
                // process player names and show board
                const p1Name = document.querySelector('#player1-name').value;
                const p2Name = document.querySelector('#player2-name').value;
                let p1Accept = validateName(p1Name);
                let p2Accept = validateName(p2Name);
                if (p1Accept && p2Accept) {
                    const container = document.querySelector('.container-intro');
                    container.classList.add('hidden');
                    setTimeout(() => {
                        gameControls.contentElement.removeChild(container);
                        // prepareGame(p1Name, p2Name);
                        ((p1Name, p2Name) => {
                            gameControls.players = [new Player(1, p1Name, "X"), new Player(2, p2Name, "O")];
                            gameControls.currentPlayer = gameControls.players[0];
                            const containerBoard = document.createElement('div');
                            const insideContainer = document.createElement('div');
                            containerBoard.classList.add("container-board");
                            insideContainer.id = "board";
                            containerBoard.appendChild(insideContainer);

                            const buttonRestart = document.createElement('button');
                            buttonRestart.textContent = "Restart Game";
                            buttonRestart.classList.add('player-name-accept');
                            buttonRestart.id = 'restart-button';
                            buttonRestart.addEventListener('click', start);

                            containerBoard.appendChild(buttonRestart);
                            gameControls.contentElement.appendChild(containerBoard);
                            displayBoard(gameControls.boardArr);
                        })(p1Name, p2Name);
                    }, 250);
                }

                function validateName(nameToValidate) {
                    if (nameToValidate && typeof nameToValidate !== 'string') {
                        return false;
                    }
                    const REGEX = /^[A-Za-z]+$/;
                    if (nameToValidate && nameToValidate.match(REGEX)) {
                        return true;
                    }
                    return false;
                }
            });
            return btn;

        })();

        // create the html elements for the intro, place together and return
        const intro = document.createElement('div');
        intro.classList.add('intro');
        intro.appendChild(introp1);
        intro.appendChild(introp2);
        intro.appendChild(form);
        intro.appendChild(buttonPlayerNames);

        const containerIntro = document.createElement('div');
        containerIntro.classList.add('container-intro')
        containerIntro.appendChild(intro);

        return containerIntro;
    })();

    gameControls.contentElement.appendChild(gameControls.introElement);
}

/*

    THE GAME

*/

/**
 * Construct a Player object
 * @param {Number} number 
 * @param {String} name 
 * @param {1-char String} symbol 
 */
function Player(number, name, symbol) {
    Object.assign(this, playerMethods);
    this.setNumber(number);
    this.setName(name);
    this.setSymbol(symbol);
}

/**
 * Getters and Setters for Player objects
 */
const playerMethods = {
    getName() { return this.name },
    setName(newName) { this.name = newName },

    getNumber() { return this.number },
    setNumber(newNumber) { this.number = newNumber },

    getSymbol() { return this.symbol },
    setSymbol(newSymbol) { this.symbol = newSymbol },
}

/**
 * Builds the board div element and adds appropriate event handlers
 * @param {2d array} gameBoard a 2d array of players pieces 
 */
function displayBoard(gameBoard) {
    const boardDiv = document.querySelector('#board');

    // delete old nodes
    for (let i = boardDiv.childNodes.length - 1; i >= 0; i--) {
        boardDiv.removeChild(boardDiv.childNodes[i]);
    }
    // repopulate with new nodes
    let winFound = false;
    for (let i = 0; i < gameBoard.length && !winFound; i++) {
        for (let j = 0; j < gameBoard[i].length && !winFound; j++) {
            let cellContents = gameBoard[i][j];
            let cellDiv = document.createElement('div');
            cellDiv.classList.add('board-cell');
            cellDiv.dataset.indexRow = i;
            cellDiv.dataset.indexCol = j;
            if (cellContents == null) {
                cellDiv.classList.add("empty");
                cellDiv.addEventListener('click', () => clickSquare(i,j));
                function clickSquare(row, col) {
                    // click square
                    if (!gameControls.gameOver) {
                        if (gameBoard[row][col] === null) {
                            gameBoard[row][col] = gameControls.currentPlayer;
                            cellDiv.classList.remove("empty");
                            cellDiv.textContent = gameControls.currentPlayer.getSymbol();
                            checkWinner(gameBoard, boardDiv, row, col);
                            // switch player
                            gameControls.currentPlayer = (gameControls.currentPlayer.getNumber() === gameControls.players[0].getNumber()) ? gameControls.players[1] : gameControls.players[0];
                        }
                    }
                }
            } else {
                cellDiv.classList.remove("empty");
                cellDiv.textContent = cellContents.getSymbol();
            }
            boardDiv.appendChild(cellDiv);
        }
    }
}

/**
 * Checks to see if a win or draw condition has been met
 * @param {Array} gameBoard a 2d array of Players
 * @param {HTML div element} boardDiv div html element representing board
 * @param {Number} row row index of last played position
 * @param {Number} col col index of last played position 
 */
function checkWinner(gameBoard, boardDiv, row, col) {

    let winFound = false;
    let winningCoords = [];

    if (!winFound) winFound = checkLinear("row", winningCoords);      // current row
    if (!winFound) winFound = checkLinear("column", winningCoords);   // current column
    if (!winFound) winFound = checkDiagonal("TL-BR", winningCoords);  // top left to bottom right
    if (!winFound) winFound = checkDiagonal("BL-TR", winningCoords);  // bottom left to top right

    processResult(winFound);

    function discernWinningNode(row, col) {
        return (gameControls.BOARD_SIZE * row) + (col + 1) - 1;
    }

    function checkLinear(direction, coords) {
        let isWin = false;
        if (direction !== 'row' && direction !== 'column') {
            return;
        }
        let check = 0;
        for (let i = 0; i < gameControls.BOARD_SIZE; i++) {
            let position = (direction === 'row') ? gameBoard[row][i] : gameBoard[i][col];
            if (position !== null && position.getNumber() === gameControls.currentPlayer.getNumber()) {
                check++;
                coords.push(discernWinningNode((direction === 'row') ? row : i, (direction === 'row') ? i : col));
            }
        }
        if (check === gameControls.BOARD_SIZE) {
            isWin = true;
        } else {
            clearArray(coords);
        }
        return isWin;
    }

    function checkDiagonal(direction, coords) {
        if (direction !== 'TL-BR' && direction !== 'BL-TR') {
            return;
        }
        let isWin = false;
        let rowModifier, colModifier, expFindStart, expLoopControl;
        if (direction === 'TL-BR') {
            rowModifier = -1;
            colModifier = -1;
            expFindStart = (dr, dc) => dr > 0 && dc > 0;
            expLoopControl = (i, j) => i < gameControls.BOARD_SIZE && j < gameControls.BOARD_SIZE;
        } else {
            rowModifier = 1;
            colModifier = -1;
            expFindStart = (dr, dc) => dr < gameControls.BOARD_SIZE - 1 && dc > 0;
            expLoopControl = (i, j) => i >= 0 && j < gameControls.BOARD_SIZE;
        }

        let dr, dc;
        dr = row;
        dc = col;
        while (expFindStart(dr, dc)) {
            dr += rowModifier;
            dc += colModifier;
        }
        let diag1Check = 0;
        for (let i = dr, j = dc; expLoopControl(i, j); i -= rowModifier, j -= colModifier) {
            if (gameBoard[i][j] !== null && gameBoard[i][j].getNumber() === gameControls.currentPlayer.getNumber()) {
                diag1Check++;
                coords.push(discernWinningNode(i, j));
            }
        }
        if (diag1Check === gameControls.BOARD_SIZE) {
            isWin = true;
        } else {
            clearArray(coords);
        }
        return isWin;
    }

    function processResult(winFound) {
        if (winFound) {
            gameControls.gameOver = true;
            for (let i = 0; i < boardDiv.childNodes.length; i++) {
                const node = boardDiv.childNodes[i];
                node.classList.remove('empty');
                node.classList.add('game-over');
                if (winningCoords.includes(i)) {
                    node.classList.add('winning-cell');
                } else {
                    node.classList.add('win-found');
                    node.textContent = "";
                }
            }
        } else {
            let spaceLeft = false;
            for (let i = 0; i < boardDiv.childNodes.length && !spaceLeft; i++) {
                if (boardDiv.childNodes[i].textContent === "") {
                    spaceLeft = true;
                }
            }
            if (!spaceLeft) {
                gameControls.gameOver = true;
                for (let i = 0; i < boardDiv.childNodes.length && !spaceLeft; i++) {
                    const node = boardDiv.childNodes[i];
                    node.classList.remove('empty');
                    node.classList.add('draw-found');
                    console.dir(node);
                }
            }
        }
        if (gameControls.gameOver) {
            const declareGameOver = document.createElement('div');
            declareGameOver.classList.add('game-declared-over');
            if (winFound) {
                declareGameOver.textContent = gameControls.currentPlayer.getName() + " wins!";
            } else {
                declareGameOver.textContent = "Draw!";
            }
            document.querySelector('#board').appendChild(declareGameOver);
        }
    }

    function clearArray(arr) {
        while (arr.length > 0) {
            arr.pop();
        }
    }

}

