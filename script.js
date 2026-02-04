// Hämtar canvas och context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Skapar Mario-bilden
const marioImg = new Image();
marioImg.src = 'assets/mario.png';

// Mario-egenskaper
const mario = {
    x: canvas.width / 2 - 25, // Startposition i mitten
    y: canvas.height - 100,
    width: 50,
    height: 70,
    velocity: 0
};

// Spelvariabler
const gravity = 0.45;       // Drar Mario nedåt
const jumpStrength = -9;    // Hur högt Mario hoppar

let gameStarted = false;

let gameOver = false;

// Tid och highscore
let startTime = Date.now();
let currentTime = 0;
let score = 0;
let highScore = Number(localStorage.getItem("highScore")) || 0;

// Hoppa-funktion
function jump() {
    if (!gameStarted) {
        gameStarted = true;
        startTime = Date.now();
        return;
    }

    if (!gameOver) {
         mario.velocity = jumpStrength;
    }
}

// Mellanslag (spacebar)
document.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
        jump();
    }
});

// Vänsterklick (mouse1)
document.addEventListener("mousedown", function () {
    jump();
});

// Uppdaterar Marios position
function update() {
    if (!gameStarted || gameOver) return;

    mario.velocity += gravity;
    mario.y += mario.velocity;

    // Golv-kollision
    if (mario.y + mario.height > canvas.height) {
        mario.y = canvas.height - mario.height;
        mario.velocity = 0;
    }

    // Tak-kollision
    if (mario.y < 0) {
        mario.y = 0;
        mario.velocity = 0;
    }

    // Tid
    currentTime = Math.floor((Date.now() - startTime) / 1000);

    // Pipe-timer
    pipeTimer += 16;        // Ungefär 60 FPS

    if (pipeTimer > pipeInterval) {
        spawnPipePair();
        pipeTimer = 0;
    }

    // Uppdaterar alla pipes
    pipes.forEach(pipe =>  {
        pipe.update();

        if (checkCollision(mario, pipe)) {
            endGame();
        }

        if (!pipe.isFlipped && !pipe.passed && pipe.x + pipe.width < mario.x) {
            pipe.passed = true;
            score++;
        }
    });

    // Tar bort pipes som åkt ut ur skärmen
    for (let i = pipes.length - 1; i >= 0; i--) {
        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
        }
    }

    // Uppdaterar alla fiender
    enemies.forEach(enemy => {
        enemy.update();

        if (checkEnemyCollision(mario, enemy)) {
            endGame();
        }
    });

    // Tar bort fiender som åkt ut ur skärmen
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].x + enemies[i].width < 0) {
            enemies.splice(i, 1);
        }
    }
}

// Ritar allt på canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
        marioImg,
        mario.x,
        mario.y,
        mario.width,
        mario.height
    );

    // Ritar alla pipes
    pipes.forEach(pipe => pipe.draw());

    // Ritar alla fiender
    enemies.forEach(enemy => enemy.draw());

    // Text (Barriecito från CSS)
    ctx.fillStyle = "white";
    ctx.font = "20px Barriecito";

    // Textskugga
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillText(`Score: ${score}`, 20, 30);

    // Återställ skugga så den inte påverkar annat
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // STARTSKÄRM
    if (!gameStarted) {

        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "32px Barriecito";
        ctx.textAlign = "center";

        ctx.shadowColor = "black";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.fillText("PIPE GAME", canvas.width / 2, 180);
        ctx.font = "20px Barriecito";
        ctx.fillText("Tryck SPACE eller klicka", canvas.width / 2, 230);
        ctx.fillText("för att starta", canvas.width / 2, 260);

        ctx.shadowColor = "transparent";
        ctx.textAlign = "left";
        return;
    }

    // GAME OVER
    if (gameOver) {

        // Mörk bakgrund
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "28px Barriecito";
        ctx.textAlign = "center";

        // Skugga för all game over-text
        ctx.shadowColor = "black";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.fillText("GAME OVER", canvas.width / 2, 140);
        ctx.fillText(`Score: ${score}`, canvas.width / 2, 180);
        ctx.fillText(`Highscore: ${highScore}`, canvas.width / 2, 220);

        // Stäng av skugga innan knappen
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        // Restart-knappen
        ctx.fillStyle = "#ff4444";
        ctx.fillRect(canvas.width / 2 - 70, 260, 140, 40);

        ctx.fillStyle = "white";
        ctx.font = "20px Barriecito";

        // Liten textskugga
        ctx.shadowColor = "black";
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.fillText("Restart", canvas.width / 2, 290);

        // Återställ
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.textAlign = "left";
    }

}

class Pipe {
    constructor(x, y, width, height, isFlipped = false) {
        // Position
        this.x = x;
        this.y = y;

        // Storlek
        this.width = width;
        this.height = height;

        // Hur snabbt pipen rör sig åt vänster
        this.speed = 3;

        // Bild för pipen
        this.Image = new Image();
        this.Image.src = "assets/pipe.png";

        // Om pipen ska vara uppåt
        this.isFlipped = isFlipped;

        // Används för poäng
        this.passed = false;
    }

    // Uppdaterar pipens position
    update() {
        this.x -=this.speed;
    }

    // Ritar pipen på canvasen
    draw() {

        ctx.save();

        if (this.isFlipped) {
            // Vänder pipen uppåt
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.scale(1, -1);
            ctx.drawImage(
                this.Image,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            // Normal pipe
            ctx.drawImage(this.Image, this.x, this.y, this.width, this.height);

        }

        ctx.restore();
    }

}


class Enemy {
    constructor(x) {
        this.x = x;

        // Spawn-zon runt mitten av skärmen 
        const centerY = canvas.height / 2;
        const randomOffset = Math.random() * 120 - 60; // -60 till +60
        this.baseY = centerY + randomOffset;
        this.y = this.baseY;

        // Storlek
        this.width = 50;
        this.height = 50;

        // Rörelse
        this.speedX = 3;
        this.amplitude = 25;    // liten upp/ner-rörelse
        this.frequency = 0.04;
        this.time = 0;

        // Bild
        this.Image = new Image();
        this.Image.src = "assets/koopa.png";
    }

    update() {
        this.x -= this.speedX;

        this.time++;
        this.y = this.baseY + Math.sin(this.time * this.frequency) * this.amplitude;
    }

    draw() {
        ctx.drawImage(this.Image, this.x, this.y, this.width, this.height);
    }
}

// Lista som innehåller fienden
const enemies = [];

// Lista som innehåller alla pipes
const pipes = [];

// Hur ofta nya pipes skapas (i milliesekunder)
let pipeTimer = 0;
const pipeInterval = 1500;

// Skapar ett par pipes (top + botten)
function spawnPipePair() {
    const pipeWidth = 80;
    const pipeGap = 180;        // Lite större än original (snällare)
    const minPipeHeight = 50;

    // Slumpar var gapet börjar
    const gapStart =
        Math.random() * (canvas.height - pipeGap - minPipeHeight * 2) +
        minPipeHeight;

    // Topp-pipe (ner från toppen)
    const topPipe = new Pipe(
        canvas.width,           // Startar utanför högerkant
        0,                      // Börjar vid toppen
        pipeWidth,
        gapStart,               // Slutar precis innan gapet
        true                    // Flippad
    );

    // Botten-pipe (upp från botten)
    const bottomPipe = new Pipe(
        canvas.width,
        gapStart + pipeGap,     // Börjar efter gapet
        pipeWidth,
        canvas.height - (gapStart + pipeGap)
    );

    pipes.push(topPipe);
    pipes.push(bottomPipe);

    const enemySpawnX = canvas.width + (pipeInterval / 16 / 2) * 3;
    enemies.push(new Enemy(enemySpawnX));
}

// Kollision
function checkCollision(a, b) {
    const padding = 10; 

    return (
        a.x + padding < b.x + b.width &&
        a.x + a.width - padding > b.x &&
        a.y + padding < b.y + b.height &&
        a.y + a.height - padding > b.y
    );
}

function checkEnemyCollision(a, b) {
    const padding = 18; 

    return (
        a.x + padding < b.x + b.width &&
        a.x + a.width - padding > b.x &&
        a.y + padding < b.y + b.height &&
        a.y + a.height - padding > b.y
    );
}

// GAME OVER
function endGame() {
    gameOver = true;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
}

// RESTART
function restartGame() {
    gameOver = false;
    gameStarted = false;
    pipes.length = 0;
    enemies.length = 0;
    score = 0;

    mario.y = canvas.height - 120;
    mario.velocity = 0;

    startTime = Date.now();
}

// Klick på restart-knapp
canvas.addEventListener("click", (e) => {
    if (!gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (
        mx > canvas.width / 2 - 70 &&
        mx < canvas.width / 2 + 70 &&
        my > 260 &&
        my < 300
    ) {
        restartGame();
    }
});

// Spelloop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Startar spelet när bilden är laddad
marioImg.onload = function () {
    gameLoop();
};
