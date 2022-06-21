// global declarations
const BOARD_SIZE = 3;
const PLAYERS = 2;

let players = [];

let gameOver, boardArr, introElement, boardElement;

// start game for first time
start();

/*

    INTRODUCTION

*/

function start() {
    gameOver = false;
    const body = document.querySelector('body');

    const boardOld  = document.querySelector('div.container-board');
    if (boardOld !== null) body.removeChild(boardOld); 

    const introOld = document.querySelector('div.container-intro');
    if (introOld !== null) body.removeChild(introOld);

    boardArr = createBoard(BOARD_SIZE);

    introElement = createIntro();
    document.querySelector('body').appendChild(introElement);
}

function createIntro() {

    const introp1 = createP('Hello, welcome to Tic-Tac-Toe. Get 3 in a line to win (horizontally, vertically or diagonally).');
    const introp2 = createP('Please enter the player names below');
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
    const buttonPlayerNames = (() => {
        const btn = document.createElement('button');
        btn.classList.add('player-name-accept');
        btn.textContent = 'Play!';
        btn.addEventListener('click', processIntro);
        return btn;
    })();
    // const buttonRestart = document.createElement('button');
    // buttonRestart.classList.add('player-name-accept');
    // buttonRestart.addEventListener('click', () => {
    //     clearArray(winningCoords);
    //     clearArray(players);
    //     clearArray(board);
    //     board = createBoard();
    //     const body = document.querySelector('body');
    //     body.removeChild(intro);
        
    // });
    // containerIntro.appendChild(buttonRestart);


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

    function createP(text) {
        const p = document.createElement('p');
        p.textContent = text;
        return p;
    }
}

function processIntro(event) {
    const p1Name = document.querySelector('#player1-name').value;
    const p2Name = document.querySelector('#player2-name').value;
    let p1Accept = validateName(p1Name);
    let p2Accept = validateName(p2Name);
    if (p1Accept && p2Accept) {
        const container = document.querySelector('.container-intro');
        container.classList.add('hidden');
        setTimeout(() => {
            document.querySelector('body').removeChild(container);
            prepareGame(p1Name, p2Name);
        }, 250);

    }
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

function prepareGame(p1Name, p2Name) {
    players = [new Player(1, p1Name, "X"), new Player(2, p2Name, "O")];
    currentPlayer = players[0];
    const containerBoard = document.createElement('div');
    const insideContainer = document.createElement('div');
    const body = document.querySelector('body');
    containerBoard.classList.add("container-board");
    insideContainer.id = "board";
    containerBoard.appendChild(insideContainer);

    const buttonRestart = document.createElement('button');
    buttonRestart.textContent = "Restart Game";
    buttonRestart.classList.add('player-name-accept');
    buttonRestart.id = 'restart-button';
    buttonRestart.addEventListener('click', start);

    containerBoard.appendChild(buttonRestart);
    body.appendChild(containerBoard);
    displayBoard(boardArr);
}

/*

    RESTART

*/



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
 * Create a 2-d array populated with null values.
 * @param {Number} size the length of each inner array and outer array.
 * @returns a 2d array with each outer array length size, and each inner array length size, populated with null values.
 */
function createBoard(size) {
    const boardObj = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push(null);
        }
        boardObj.push(row);
    }
    return boardObj;
}

/**
 * Switch the active player of the game
 */
function switchPlayer() {
    currentPlayer = (currentPlayer.getNumber() === players[0].getNumber()) ? players[1] : players[0];
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
                cellDiv.addEventListener('click', () => {
                    if (!gameOver) {
                        if (gameBoard[i][j] === null) {
                            gameBoard[i][j] = currentPlayer;
                            cellDiv.classList.remove("empty");
                            cellDiv.textContent = currentPlayer.getSymbol();
                            checkWinner(gameBoard, boardDiv, i, j);
                            switchPlayer();
                        }
                    }
                });
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
        return (BOARD_SIZE * row) + (col + 1) - 1;
    }

    function checkLinear(direction, coords) {
        let isWin = false;
        if (direction !== 'row' && direction !== 'column') {
            return;
        }
        let check = 0;
        for (let i = 0; i < BOARD_SIZE; i++) {
            let position = (direction === 'row') ? gameBoard[row][i] : gameBoard[i][col];
            if (position !== null && position.getNumber() === currentPlayer.getNumber()) {
                check++;
                coords.push(discernWinningNode((direction === 'row') ? row : i, (direction === 'row') ? i : col));
            }
        }
        if (check === BOARD_SIZE) {
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
            expLoopControl = (i, j) => i < BOARD_SIZE && j < BOARD_SIZE;
        } else {
            rowModifier = 1;
            colModifier = -1;
            expFindStart = (dr, dc) => dr < BOARD_SIZE - 1 && dc > 0;
            expLoopControl = (i, j) => i >= 0 && j < BOARD_SIZE;
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
            if (gameBoard[i][j] !== null && gameBoard[i][j].getNumber() === currentPlayer.getNumber()) {
                diag1Check++;
                coords.push(discernWinningNode(i, j));
            }
        }
        if (diag1Check === BOARD_SIZE) {
            isWin = true;
        } else {
            clearArray(coords);
        }
        return isWin;
    }

    function processResult(winFound) {
        if (winFound) {
            gameOver = true;
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
                gameOver = true;
                for (let i = 0; i < boardDiv.childNodes.length && !spaceLeft; i++) {
                    const node = boardDiv.childNodes[i];
                    node.classList.remove('empty');
                    node.classList.add('draw-found');
                    console.dir(node);
                }
            }
        }
        if (gameOver) {
            const declareGameOver = document.createElement('div');
            declareGameOver.classList.add('game-declared-over');
            if (winFound) {
                declareGameOver.textContent = currentPlayer.getName() + " wins!";
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

