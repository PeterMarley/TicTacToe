// game controls module implemented with IIFE
const gameControls = (() => {
    const BOARD_SIZE = 3;
    let players = [];
    let gameOver, boardArr, currentPlayer;
    const contentElement = document.querySelector('.container-content');
    const introElement = document.querySelector('.intro');
    const gameElement = document.querySelector('#board');
    const gameElementCells = gameElement.querySelectorAll('.board-cell')
    const gameElementContainer = document.querySelector('.container-board');
    const introPlayButton = document.querySelector('.player-name-accept');
    const introContainer = document.querySelector('.container-intro');
    const restartButton = document.querySelector('#restart-button');
    const winnerDeclaration = document.querySelector('.game-declared-over');

    return {
        BOARD_SIZE,
        players,
        gameOver,
        boardArr,
        introElement,
        introPlayButton,
        introContainer,
        gameElement,
        gameElementCells,
        gameElementContainer,
        currentPlayer,
        contentElement,
        restartButton,
        winnerDeclaration,
    };
})();

// start game for first time
startIntro();

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
 * Starts a new game. First this function removes the old board and intro divs (if they exist), and appends new ones to the contentElement
 */
function startIntro() {

    boardArr = [];
    gameControls.gameElementContainer.classList.add('hidden');
    gameControls.introContainer.classList.remove('hidden');

    const p1NameField = gameControls.introElement.querySelector('#player1-name');
    const p2NameField = gameControls.introElement.querySelector('#player2-name');

    // Reset form inputs to be blank
    p1NameField.value = '';
    p2NameField.value = '';

    // ensure gameOver flag is set to false
    gameControls.gameOver = false;

    // create array to hold players moves
    gameControls.boardArr = ((size) => {
        const boardObj = [];
        for (let i = 0; i < size * size; i++) {
            boardObj.push(null);
        }
        return boardObj;
    })(gameControls.BOARD_SIZE);

    // attach event listener to intro play button
    gameControls.introPlayButton.addEventListener('click', () => {
        const p1Name = p1NameField.value;
        const p2Name = p2NameField.value;
        let p1Accept = validateName(p1Name);
        let p2Accept = validateName(p2Name);
        if (p1Accept && p2Accept) { // if names valid
            gameControls.introContainer.classList.add('hidden');
            setTimeout(() => {
                gameControls.players = [new Player(1, p1Name, "X"), new Player(2, p2Name, "O")];
                gameControls.currentPlayer = gameControls.players[0];
                startGame(gameControls.boardArr);
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
};

/**
 * Builds the board div element and adds appropriate event handlers
 * @param {2d array} gameBoard a 2d array of players pieces 
 */
function startGame(gameBoard) {
    setup();

    function setup() {
        gameControls.introContainer.classList.add('hidden');
        gameControls.gameElementContainer.classList.remove('hidden');
        gameControls.restartButton.addEventListener('click', startIntro);
        gameControls.winnerDeclaration.textContent = '';
        gameControls.winnerDeclaration.classList.add('hidden');
        for (let i = 0; i < gameControls.gameElementCells.length; i++) {
            let cell = gameControls.gameElementCells[i];
            cell.textContent = '';
            cell.classList.remove('winning-cell');
            cell.classList.remove('win-found');
            cell.classList.add('empty');
        }
        gameControls.currentPlayer = gameControls.players[0];
    }



    let cells = gameControls.gameElementCells;
    for (let i = 0; i < gameBoard.length; i++) {
        let cellContents = gameBoard[i];
        // console.dir(cellDiv);
        if (cellContents == null) {
            cells[i].classList.add("empty");
            cells[i].addEventListener('click', () => clickSquare(i));
            function clickSquare(index) {
                // click square
                if (!gameControls.gameOver) {
                    if (gameBoard[index] === null) {
                        gameBoard[index] = gameControls.currentPlayer;
                        cells[i].classList.remove("empty");
                        cells[i].textContent = gameControls.currentPlayer.getSymbol();
                        checkWinner(index);
                        // switch player
                        gameControls.currentPlayer = (gameControls.currentPlayer.getNumber() === gameControls.players[0].getNumber()) ? gameControls.players[1] : gameControls.players[0];
                    }
                }
            }
        } else {
            cells[i].classList.remove("empty");
            cells[i].textContent = cellContents.getSymbol();
        }
    }
    /**
     * Checks to see if a win or draw condition has been met
     * @param {Number} cellIndex the current players last selected cell
     */
    function checkWinner(cellIndex) {

        let winFound = false;
        let winningCoords = [];

        if (!winFound) winFound = checkLinear("row", cellIndex);      // current row
        if (!winFound) winFound = checkLinear("column", cellIndex);   // current column
        if (!winFound) winFound = checkDiagonal("TL-BR", cellIndex);  // top left to bottom right
        if (!winFound) winFound = checkDiagonal("BL-TR", cellIndex);  // bottom left to top right

        processResult(winFound);

        function checkLinear(direction, cellIndex) {
            let isWin = false;
            if (direction !== 'row' && direction !== 'column') {
                return;
            }

            let indices = ((i) => {
                if (direction === 'row') {
                    switch (i) {
                        case 0: case 1: case 2: return [0, 1, 2];
                        case 3: case 4: case 5: return [3, 4, 5];
                        case 6: case 7: case 8: return [6, 7, 8];
                    }
                } else {
                    switch (i) {
                        case 0: case 3: case 6: return [0, 3, 6];
                        case 1: case 4: case 7: return [1, 4, 7];
                        case 2: case 5: case 8: return [2, 5, 8];
                    }
                }
            })(cellIndex);

            let check = 0;
            for (let i = 0; i < indices.length; i++) {
                let position = gameControls.boardArr[indices[i]];
                if (position !== null && position.getNumber() === gameControls.currentPlayer.getNumber()) {
                    check++;
                }
            }
            if (check === gameControls.BOARD_SIZE) {
                isWin = true;
                winningCoords = indices;
            }
            return isWin;
        }

        function checkDiagonal(direction) {
            if (direction !== 'TL-BR' && direction !== 'BL-TR') {
                return;
            }
            let indices = (direction === 'TL-BR') ? [0, 4, 8] : [6, 4, 2];
            let isWin = false;
            let check = 0;
            for (let i = 0; i < indices.length; i++) {
                const cell = gameControls.boardArr[indices[i]];
                if (cell !== null && cell.getNumber() === gameControls.currentPlayer.getNumber()) {
                    check++;
                }
            }
            if (check === gameControls.BOARD_SIZE) {
                isWin = true;
                winningCoords = indices;
            }
            return isWin;
        }

        function processResult(winFound) {
            const cells = gameControls.gameElementCells;

            if (winFound) {
                gameControls.gameOver = true;
                for (let i = 0; i < cells.length; i++) {
                    const node = cells[i];
                    node.classList.remove('empty');
                    if (winningCoords.includes(i)) {
                        node.classList.add('winning-cell');
                    } else {
                        node.classList.add('win-found');
                        node.textContent = "";
                    }
                }
            } else {
                let spaceLeft = false;
                for (let i = 0; i < cells.length && !spaceLeft; i++) {
                    if (cells[i].textContent === "") {
                        spaceLeft = true;
                    }
                }
                if (!spaceLeft) {
                    gameControls.gameOver = true;
                    for (let i = 0; i < cells.length && !spaceLeft; i++) {
                        const node = cells[i];
                        node.classList.remove('empty');
                        node.classList.add('draw-found');
                    }
                }
            }
            if (gameControls.gameOver) {
                const winMsg = gameControls.winnerDeclaration;
                winMsg.classList.remove('hidden');
                if (winFound) {
                    winMsg.textContent = gameControls.currentPlayer.getName() + " wins!";
                } else {
                    winMsg.textContent = "Draw!";
                }
            }
        }
    }
}



