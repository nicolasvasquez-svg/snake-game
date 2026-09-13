const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop;

// Display high score
document.getElementById('highScore').textContent = highScore;

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Keyboard controls
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    const key = e.key.toLowerCase();

    // Arrow keys
    if (e.key === 'ArrowUp' || key === 'w') {
        if (direction.y === 0) nextDirection = { x: 0, y: -1 };
    }
    if (e.key === 'ArrowDown' || key === 's') {
        if (direction.y === 0) nextDirection = { x: 0, y: 1 };
    }
    if (e.key === 'ArrowLeft' || key === 'a') {
        if (direction.x === 0) nextDirection = { x: -1, y: 0 };
    }
    if (e.key === 'ArrowRight' || key === 'd') {
        if (direction.x === 0) nextDirection = { x: 1, y: 0 };
    }

    // Space to toggle pause
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameRunning) togglePause();
    }
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        document.getElementById('startBtn').textContent = 'Restart';
        document.getElementById('pauseBtn').textContent = 'Pause';
        gameLoop = setInterval(update, 100);
    }
}

function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;
    document.getElementById('pauseBtn').textContent = gamePaused ? 'Resume' : 'Pause';

    if (gamePaused) {
        clearInterval(gameLoop);
    } else {
        gameLoop = setInterval(update, 100);
    }
}

function resetGame() {
    clearInterval(gameLoop);
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameRunning = false;
    gamePaused = false;
    document.getElementById('score').textContent = score;
    document.getElementById('startBtn').textContent = 'Start Game';
    document.getElementById('pauseBtn').textContent = 'Pause';
    draw();
}

function generateFood() {
    let newFood;
    let foodOnSnake = true;

    while (foodOnSnake) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        foodOnSnake = snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        );
    }

    return newFood;
}

function update() {
    if (!gameRunning || gamePaused) return;

    // Update direction
    direction = nextDirection;

    // Calculate new head
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check collision with walls
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }

    // Check collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    // Add new head
    snake.unshift(head);

    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        food = generateFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }

    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = '#00ff00';
    snake.forEach(segment => {
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });

    // Draw head in different color
    ctx.fillStyle = '#00aa00';
    const head = snake[0];
    ctx.fillRect(
        head.x * gridSize + 1,
        head.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
    );

    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function endGame() {
    clearInterval(gameLoop);
    gameRunning = false;

    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }

    alert(`Game Over! Score: ${score}\nHigh Score: ${highScore}`);
    resetGame();
}

// Initial draw
draw();