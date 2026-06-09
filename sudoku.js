const empty_board = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
]

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function shuffle(){ //shuffles 1-9 in random order for placement 
    let shuffled = [...numbers];
    for (let i = 8; i>0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function placementCheck(grid, row, col, val){
    for (let i = 0; i < 9; i++){ //simultaneously checks if the number to place is already in that square's row or column
        if (grid[row][i]==val || grid[i][col]==val) {
            return false;
        }
    } //below lines are for checking 3x3 space
    let i, r, j, c = 0;
    if (row<3) {  //i is starting val for row iteration, r is ending
        i = 0;
        r = 3;
    } else if (row<6){
        i = 3;
        r = 6;
    } else {
        i = 6;
        r = 9;
    }
    if (col<3) { //j is starting val for col iteration, c is ending
        j = 0;
        c = 3;
    } else if (col<6){
        j = 3;
        c = 6;
    } else {
        j = 6;
        c = 9;
    }
    const jStart = j;
    while(i<r){ //checks to see if the value to place is already present in 3x3 area
        j = jStart;
        while(j<c){
            if (grid[i][j]==val){
                return false;
            }
            j++;
        }
        i++;
    }
    return true; //all checks are done, value can be placed
}

function checkGrid(grid){ //check to see if all spots are filled with non-zero value
    for (let i = 0; i<81; i++){
        let row = Math.floor(i / 9);
        let col = i % 9;
        if (grid[row][col]==0){
            return false;
        }
    }
    return true;
}

function buildBoard(grid){
    for (let i = 0; i<81; i++){
        let row = Math.floor(i / 9); //determine the row and column we are in
        let col = i % 9;
        let shufnum = shuffle(); //shuffle 1-9 in random order for placement
        for (let j = 0; j<9; j++){ //run through 1-9
            if (placementCheck(grid, row, col, shufnum[j])){ //check if it can be placed
                grid[row][col] = shufnum[j]; //place number
                if (checkGrid(grid)) {
                    return true //grid has been filled, quit function
                } else {
                    break; //break from inner loop
                }
            } else {
                if (j==8){
                    return false; //ends this attempt at building the board
                } //otherwise, try the next number
            }
        }
    }
}

function solveGrid(grid){
    const board = grid.map(row => [...row]);
    return backtrack(board);
}

function backtrack(board){
    for (let i = 0; i < 81; i++){
        const row = Math.floor(i / 9);
        const col = i % 9;
        if (board[row][col] !== 0) continue;
        for (let val = 1; val <= 9; val++){
            if (placementCheck(board, row, col, val)){
                board[row][col] = val;
                if (backtrack(board)) return true;
                board[row][col] = 0;
            }
        }
        return false;
    }
    return true;
}

function pokeHoles(grid, toRemove){
    for (let i = 0; i < toRemove; i++){ //toRemove is based on the difficulty selected and represents number of holes to poke
        let random = Math.floor(Math.random() * 81); //pick a random square
        let row = Math.floor(random / 9);
        let col = random % 9;
        let val = grid[row][col];
        if (val === 0) { i--; continue; } //already empty, pick again
        grid[row][col] = 0; //poke the hole
        if (solveGrid(grid)){ //try solving after the hole is poked
            continue; //it worked, can continue
        } else {
            grid[row][col] = val; //put it back
            i--; //didn't work so no hole was added. decrement i to try again
        }
    }
    return;
}

function generateSudoku(toRem){
    let grid = empty_board.map(row => [...row]);
    let done = false;
    do { //keep trying to generate a board until you get one
        grid = empty_board.map(row => [...row]);
        done = buildBoard(grid);
    } while (!done)
    currentSolution = grid.map(row => [...row]);
    pokeHoles(grid, toRem); //poke holes based on the difficulty
    return grid;
}

const numNames = ['blank', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

let currentGrid = null;
let currentSolution = null;
let selectedCell = null;
let playerFilledCount = 0;
let removalTimeout = null;
let removalDelay = 30000;

function selectCell(img) {
    if (selectedCell) {
        const prev = parseInt(selectedCell.dataset.val);
        selectedCell.src = `assets/num_${numNames[prev]}.png`;
    }
    selectedCell = img;
    img.src = `assets/select_${numNames[parseInt(img.dataset.val)]}.png`;
}

function placeNumber(val) {
    if (!selectedCell) return;
    if (selectedCell.dataset.fixed === 'true') return;
    const prev = parseInt(selectedCell.dataset.val);
    selectedCell.dataset.val = val;
    selectedCell.src = `assets/select_${numNames[val]}.png`;

    if (prev === 0 && val !== 0) {
        playerFilledCount++;
        if (playerFilledCount === 4) {
            removalTimeout = setTimeout(removeRandomPlayerCell, removalDelay);
        }
    } else if (prev !== 0 && val === 0) {
        playerFilledCount = Math.max(0, playerFilledCount - 1);
    }

    checkCompletion();
}

function checkCompletion() {
    const cells = [...document.querySelectorAll('.cell')];
    const allFilled = cells.every(c => parseInt(c.dataset.val) !== 0);
    if (!allFilled) return;

    const correct = cells.every((c, idx) => {
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        return parseInt(c.dataset.val) === currentSolution[row][col];
    });

    clearTimeout(removalTimeout);
    removalTimeout = null;

    const overlay = document.getElementById('result-overlay');
    const btn = document.getElementById('result-btn');
    overlay.src = correct ? 'assets/youwin.png' : 'assets/notquite.png';
    btn.src = correct ? 'assets/newgame.png' : 'assets/keeptrying.png';
    overlay.style.display = 'block';
    btn.style.display = 'block';
}

function removeRandomPlayerCell() {
    const playerCells = [...document.querySelectorAll('.cell')].filter(
        c => c.dataset.fixed === 'false' && parseInt(c.dataset.val) !== 0
    );
    if (playerCells.length === 0) return;
    const target = playerCells[Math.floor(Math.random() * playerCells.length)];
    playerFilledCount = 0;

    const walkingdone = document.getElementById('walkingdone');
    const tosleep = document.getElementById('tosleep');
    const eating = document.getElementById('eating');
    const boardWrap = document.querySelector('.board-wrap');

    // t=0: walkingdone disappears; poof.gif appears
    tosleep.src = '';
    walkingdone.style.opacity = '0';
    tosleep.src = 'assets/poof.gif';
    tosleep.style.opacity = '1';

    // t=1.1s: nodino replaces poof; dino_eating appears over the target cell
    setTimeout(() => {
        tosleep.style.opacity = '0';
        walkingdone.src = '';
        walkingdone.src = 'assets/nodino.png';
        walkingdone.style.opacity = '1';

        boardWrap.appendChild(eating);
        eating.style.position = 'absolute';
        eating.style.left = target.offsetLeft + 'px';
        eating.style.top = target.offsetTop + 'px';
        eating.style.width = target.offsetWidth + 'px';
        eating.style.height = target.offsetHeight + 'px';
        eating.style.zIndex = 10;
        eating.src = '';
        eating.src = 'assets/dino_eating.gif';
        eating.style.display = 'block';
    }, 1100);

    // t=2.3s: cell becomes blank
    setTimeout(() => {
        target.dataset.val = 0;
        target.src = target === selectedCell ? `assets/select_${numNames[0]}.png` : `assets/num_${numNames[0]}.png`;
    }, 2300);

    // t=3s: eating hides; nodino disappears; tosleep restarts
    setTimeout(() => {
        eating.style.display = 'none';
        walkingdone.style.opacity = '0';
        tosleep.src = '';
        tosleep.src = 'assets/tosleep.gif';
        tosleep.style.opacity = '1';
    }, 3000);

    // t=6.2s: tosleep disappears; walking_done appears
    setTimeout(() => {
        tosleep.style.opacity = '0';
        walkingdone.src = 'assets/walking_done.png';
        walkingdone.style.opacity = '1';
    }, 6200);
}

function renderBoard(grid) {
    const boardWrap = document.querySelector('.board-wrap');
    document.querySelectorAll('.cell').forEach(c => c.remove());
    selectedCell = null;
    playerFilledCount = 0;
    clearTimeout(removalTimeout);
    removalTimeout = null;

    const board = document.getElementById('board');
    const border = 4;
    const cellW = (board.offsetWidth - 4 * border) / 9;
    const cellH = (board.offsetHeight - 4 * border) / 9;
    for (let i = 0; i < 81; i++) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        const val = grid[row][col];
        const img = document.createElement('img');
        const fixed = val !== 0;
        img.src = fixed ? `assets/def_${numNames[val]}.png` : `assets/num_${numNames[val]}.png`;
        img.className = 'cell';
        img.dataset.val = val;
        img.dataset.fixed = fixed;
        img.style.position = 'absolute';
        img.style.left = (border * (1 + Math.floor(col / 3)) + col * cellW) + 'px';
        img.style.top  = (border * (1 + Math.floor(row / 3)) + row * cellH) + 'px';
        img.style.width = cellW + 'px';
        img.style.height = cellH + 'px';
        img.style.zIndex = 3;
        if (!fixed) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => selectCell(img));
        }

        boardWrap.appendChild(img);
    }
}

function startGame(toRem, delay) {
    document.getElementById('difficulty-screen').style.display = 'none';
    document.getElementById('result-overlay').style.display = 'none';
    document.getElementById('result-btn').style.display = 'none';
    removalDelay = delay;

    const tosleep = document.getElementById('tosleep');
    const walkingdone = document.getElementById('walkingdone');
    walkingdone.style.opacity = '0';
    tosleep.style.opacity = '1';
    tosleep.src = '';
    tosleep.src = 'assets/tosleep.gif';

    currentGrid = generateSudoku(toRem);
    renderBoard(currentGrid);

    setTimeout(() => {
        tosleep.style.opacity = '0';
        walkingdone.src = 'assets/walking_done.png';
        walkingdone.style.opacity = '1';
    }, 3200);
}

window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('result-btn').addEventListener('click', () => {
        const btn = document.getElementById('result-btn');
        if (btn.src.includes('newgame.png')) {
            document.getElementById('result-overlay').style.display = 'none';
            btn.style.display = 'none';
            clearTimeout(removalTimeout);
            removalTimeout = null;
            const tosleep = document.getElementById('tosleep');
            const walkingdone = document.getElementById('walkingdone');
            const eating = document.getElementById('eating');
            tosleep.src = '';
            tosleep.style.opacity = '0';
            walkingdone.src = '';
            walkingdone.style.opacity = '0';
            eating.style.display = 'none';
            document.getElementById('difficulty-screen').style.display = '';
        } else {
            document.getElementById('result-overlay').style.display = 'none';
            btn.style.display = 'none';
            document.getElementById('eating').style.display = 'none';
            const walkingdone = document.getElementById('walkingdone');
            const tosleep = document.getElementById('tosleep');
            tosleep.style.opacity = '0';
            walkingdone.src = 'assets/walking_done.png';
            walkingdone.style.opacity = '1';
            playerFilledCount = 0;
        }
    });

    document.getElementById('easy-btn').addEventListener('click',   () => startGame(42, 30000));
    document.getElementById('medium-btn').addEventListener('click', () => startGame(56, 25000));
    document.getElementById('hard-btn').addEventListener('click',   () => startGame(60, 20000));
    document.getElementById('expert-btn').addEventListener('click', () => startGame(64, 15000));

    const numPad = document.querySelector('.numbers');
    const numPadButtons = [
        ...Array.from({length: 9}, (_, i) => ({ el: document.getElementById(`num${i + 1}`), val: i + 1 })),
        { el: document.getElementById('blank'), val: 0 }
    ];
    numPad.addEventListener('click', (e) => {
        for (const { el, val } of numPadButtons) {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            const pl = parseFloat(style.paddingLeft);
            const pt = parseFloat(style.paddingTop);
            const l = rect.left + pl;
            const t = rect.top + pt;
            const r = l + (rect.width - pl);
            const b = t + (rect.height - pt);
            if (e.clientX >= l && e.clientX <= r && e.clientY >= t && e.clientY <= b) {
                placeNumber(val);
                return;
            }
        }
    });

    window.addEventListener('keydown', (e) => {
        const n = parseInt(e.key);
        if (n >= 1 && n <= 9) placeNumber(n);
        else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') placeNumber(0);
    });
});