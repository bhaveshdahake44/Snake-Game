const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");
const controlButtons = document.querySelectorAll(".control-btn");

const highScoreElement = document.querySelector("#high-score")
const scoreElement = document.querySelector("#score")
const timeElement = document.querySelector("#time")


const blockSize = 30

let highScore = localStorage.getItem("highScore") || 0
let score = 0
let time = `00-00`

highScoreElement.innerText = highScore

let cols = 0;
let rows = 0;

let intervalId = null;
let timerIntervalId = null;

let food = { x: 0, y: 0 }


const blocks = [];

let snake = [
    {x:1, y:3}
]

let direction = "down";
let touchStartX = 0;
let touchStartY = 0;

function randomPosition() {
    return {
        x: Math.floor(Math.random() * rows),
        y: Math.floor(Math.random() * cols)
    }
}

function buildBoard() {
    board.innerHTML = "";
    blocks.length = 0;

    const boardRect = board.getBoundingClientRect();
    cols = Math.max(8, Math.floor(boardRect.width / blockSize));
    rows = Math.max(8, Math.floor(boardRect.height / blockSize));

    board.style.setProperty("--cols", cols);
    board.style.setProperty("--rows", rows);

    for(let row = 0; row < rows; row++) {
        for(let col = 0; col < cols; col++) {
            const block = document.createElement('div');
            block.classList.add("block");
            board.appendChild(block);
            // block.innerText = `${row}-${col}`
            blocks[`${row}-${col}`] = block
        }
    }

    snake = [{ x: Math.min(1, rows - 1), y: Math.min(3, cols - 1) }]
    food = randomPosition()
    render()
}

function render() {
    snake.forEach(segment => {
        blocks[ `${segment.x}-${segment.y}` ]?.classList.add("fill");
        })
    blocks[ `${food.x}-${food.y}` ]?.classList.add("food")
}

function moveSnake() {
    let head = null;
 
    blocks[ `${food.x}-${food.y}` ]?.classList.add("food")

    if(direction === "left") {
        head = { x: snake[0].x, y: snake[0].y - 1}
    } else if(direction === "right") {
        head = { x: snake[0].x, y: snake[0].y + 1}
    } else if(direction === 'down') {
        head = { x: snake[0].x + 1, y: snake[0].y} 
    } else if(direction === 'up'){
        head = { x: snake[0].x - 1, y: snake[0].y}
    }

    if(head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    
        clearInterval(intervalId)
        clearInterval(timerIntervalId)
        intervalId = null
        timerIntervalId = null
        modal.style.display = "flex";
        startGameModal.style.display = "none";
        gameOverModal.style.display = "flex"
        return;
    }
    
    //Food Consume logic
    if(head.x == food.x && head.y == food.y) {
        blocks[ `${food.x}-${food.y}` ]?.classList.remove("food")
        food = randomPosition()

        blocks[ `${food.x}-${food.y}` ]?.classList.add("food")
        snake.unshift(head)

        score += 10
        scoreElement.innerText = score

        if(score > highScore) {
            highScore = score
            localStorage.setItem("highScore", highScore.toString())
            highScoreElement.innerText = highScore
        }
    }

    snake.forEach(segment => {
        blocks[ `${segment.x}-${segment.y}` ]?.classList.remove("fill")
    })

    snake.unshift(head)
    snake.pop()

    render()
}

function startGameLoop() {
    clearInterval(intervalId)
    clearInterval(timerIntervalId)
    intervalId = setInterval(moveSnake, 300)
    timerIntervalId = setInterval( () => {
        let [ min, sec ] = time.split("-").map(Number)

        if(sec == 59) {
            min += 1
            sec = 0
        } else {
            sec += 1
        }

        time = `${min}-${sec}`
        timeElement.innerText = time
    }, 1000)
}

function changeDirection(nextDirection) {
    const opposites = {
        up: "down",
        down: "up",
        left: "right",
        right: "left"
    }

    if(opposites[nextDirection] !== direction) {
        direction = nextDirection
    }
}

startButton.addEventListener("click", () => {
    modal.style.display = "none";
    startGameLoop()
})

restartButton.addEventListener("click", restartGame)


function restartGame() {
    blocks[ `${food.x}-${food.y}` ]?.classList.remove("food")
    snake.forEach(segment => {
        blocks[ `${segment.x}-${segment.y}` ]?.classList.remove("fill")
    })
    score = 0
    time = `00-00`

    scoreElement.innerText = score
    timeElement.innerText = time
    highScoreElement.innerText = highScore

    modal.style.display = "none";
    direction = "down";
    buildBoard()
    startGameLoop()
}

addEventListener("keydown", (event)=> {
    if(event.key == 'ArrowUp') {
        changeDirection("up")
    } else if(event.key == "ArrowDown") {
        changeDirection("down")
    } else if(event.key == "ArrowRight") {
        changeDirection("right")
    } else if(event.key == "ArrowLeft") {
        changeDirection("left")
    }
})

controlButtons.forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
        event.preventDefault()
        changeDirection(button.dataset.direction)
    })
})

board.addEventListener("pointerdown", (event) => {
    touchStartX = event.clientX
    touchStartY = event.clientY
    board.setPointerCapture(event.pointerId)
})

board.addEventListener("pointermove", (event) => {
    if(event.pointerType !== "mouse") {
        event.preventDefault()
    }
}, { passive: false })

board.addEventListener("pointerup", (event) => {
    const deltaX = event.clientX - touchStartX
    const deltaY = event.clientY - touchStartY

    if(Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) {
        return
    }

    if(Math.abs(deltaX) > Math.abs(deltaY)) {
        changeDirection(deltaX > 0 ? "right" : "left")
    } else {
        changeDirection(deltaY > 0 ? "down" : "up")
    }
})

requestAnimationFrame(buildBoard)

addEventListener("resize", () => {
    if(intervalId === null) {
        buildBoard()
    }
})
