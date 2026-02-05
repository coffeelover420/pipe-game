/***********************
    CANVAS & CONTEXT
***********************/
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

/***********************
        BILDER
***********************/
const marioImg = new Image();
marioImg.src = 'assets/mario.png';

/***********************
        LJUD
***********************/
const sounds = {
    jump: new Audio("assets/sounds/jump.mp3"),
    score: new Audio("assets/sounds/score.mp3"),
    hit: new Audio("assets/sounds/hit.mp3"),
    gameOver: new Audio("assets/sounds/gameover.mp3")
};

sounds.jump.volume = 0.4;
sounds.score.volume = 0.5;
sounds.hit.volume = 0.6;
sounds.gameOver.volume = 0.6;

/***********************
    SPELKONSTANTER
***********************/
// Justerad gravitation för att spelet ska kännas snällare än Flappy Bird
// För hög gravitation gjorde spelet onödigt svårt
const gravity = 0.35;

// Lite svagare hopp ger bättre kontroll mellan pipes
const jumpStrength = -8.5;

/***********************
       SPELSTATE
***********************/
// gameStarted används för att visa startskärmen
// och förhindra att spelet börjar innan spelaren trycker
let gameStarted = false;

// gameOver stoppar all uppdatering men tillåter rendering av game over-skärmen
let gameOver = false;

// Poäng & highscore
let score = 0;
let highScore = Number(localStorage.getItem("highScore")) || 0;

/***********************
    MARIO (CLASS)
***********************/
// Mario är en class för att samla all logik (rörelse, hopp, reset)
// på ett ställe istället för att sprida ut kod i update()
class Mario {
    constructor() {
        this.width = 50;
        this.height = 70;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height / 2 - this.height / 2;
        this.velocity = 0;
    }

    // Uppdaterar Marios rörelse & fysik
    update() {
        // Applicerar gravitation varje frame
        this.velocity += gravity;
        this.y += this.velocity;

        // Golv-kollision
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
        }

        // Tak-kollision
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    }

    // Hoppa
    jump() {
        this.velocity = jumpStrength;
    }

    // Rita Mario
    draw() {
        ctx.drawImage(
            marioImg,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }

    // Återställ Mario vid restart
    reset() {
        this.y = canvas.height / 2 - this.height / 2;
        this.velocity = 0;
    }
}

const mario = new Mario();

/***********************
        INPUT
***********************/
function jump() {
    if (!gameStarted) {
        gameStarted = true;
        return;
    }

    if (!gameOver) {
        mario.jump();
        
        // Ett nytt Audio-objekt skapas för varje hopp
        // Detta gör att ljud kan överlappa och inte klipps av
        // vilket ger ett mer naturligt ljud
        const jumpSound = new Audio("assets/sounds/jump.mp3");
        jumpSound.volume = 0.4;
        jumpSound.play();
    }
}

document.addEventListener("keydown", e => {
    if (e.code === "Space") jump();
});

document.addEventListener("mousedown", jump);

/***********************
      PIPE (CLASS)
***********************/
class Pipe {
    constructor(x, y, width, height, isFlipped = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 3;
        this.isFlipped = isFlipped;
        this.passed = false;

        this.image = new Image();
        this.image.src = "assets/pipe.png";
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        ctx.save();

        if (this.isFlipped) {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.scale(1, -1);
            ctx.drawImage(
                this.image,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }

        ctx.restore();
    }
}

/***********************
     FIENDE (CLASS)
***********************/
// Fienden är spelets unika twist jämfört med Flappy Bird
// Den spawnar mellan pipes och rör sig upp och ner
// vilket tvingar spelaren att tajma sina hopp bättre
class Enemy {
    constructor(x) {
        this.x = x;

        // Spawn nära mitten mellan pipes
        const centerY = canvas.height / 2;
        this.baseY = centerY + (Math.random() * 100 - 50);
        this.y = this.baseY;

        this.width = 50;
        this.height = 50;

        this.speedX = 3.6;      // Lite snabbare än pipes
        this.amplitude = 25;
        this.frequency = 0.04;
        this.time = 0;

        this.image = new Image();
        this.image.src = "assets/koopa.png";
    }

    update() {
        // Fienden rör sig åt vänster i samma riktning som pipes
        this.x -= this.speedX;

        // Sinus-rörelse ger ett levande och svårare mönster
        // utan att kännas orättvist
        this.time++;
        this.y = this.baseY + Math.sin(this.time * this.frequency) * this.amplitude;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

/***********************
        LISTOR
***********************/
const pipes = [];
const enemies = [];

/***********************
      PIPE-SPAWN
***********************/
let pipeTimer = 0;
let lastGapY = canvas.height / 2;
const pipeInterval = 1500;

function spawnPipePair() {
    const pipeWidth = 80;
    const pipeGap = 190;      
    const minPipeHeight = 60;
    const maxVariation = 120;

    // Begränsad variation från förra gapet
    let gapStart = lastGapY + (Math.random() * maxVariation * 2 - maxVariation);

    gapStart = Math.max(
        minPipeHeight,
        Math.min(gapStart, canvas.height - pipeGap - minPipeHeight)
    );
     
    lastGapY = gapStart;

    pipes.push(
        new Pipe(canvas.width, 0, pipeWidth, gapStart, true),
        new Pipe(
            canvas.width,
            gapStart + pipeGap,
            pipeWidth,
            canvas.height - (gapStart + pipeGap)
        )
    );

    // Fienden spawnar mellan varje pipe-par
    enemies.push(
        new Enemy(canvas.width + 260, gapStart + pipeGap / 2)
    );
}

/***********************
       KOLLISION
***********************/
// Padding används för att göra hitboxarna lite snällare
// vilket gör spelet mer förlåtande och roligare att spela
function checkCollision(a, b, padding = 10) {
    return (
        a.x + padding < b.x + b.width &&
        a.x + a.width - padding > b.x &&
        a.y + padding < b.y + b.height &&
        a.y + a.height - padding > b.y
    );
}

/***********************
       GAME OVER
***********************/
function endGame() {
    if (gameOver) return;

    gameOver = true;

    sounds.hit.currentTime = 0;
    sounds.hit.play();

    sounds.gameOver.currentTime = 0;
    sounds.gameOver.play();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
}

/***********************
        RESTART
***********************/
function restartGame() {
    gameStarted = false;
    gameOver = false;
    score = 0;
    pipes.length = 0;
    enemies.length = 0;
    mario.reset();
}

/***********************
        UPDATE
***********************/
function update() {
    if (!gameStarted || gameOver) return;

    mario.update();

    pipeTimer += 16;
    if (pipeTimer > pipeInterval) {
        spawnPipePair();
        pipeTimer = 0;
    }

    pipes.forEach(pipe => {
        pipe.update();

        if (checkCollision(mario, pipe)) endGame();

        if (!pipe.isFlipped && !pipe.passed && pipe.x + pipe.width < mario.x) {
            pipe.passed = true;
            score++;
            sounds.score.currentTime = 0;
            sounds.score.play();
        }
    });

    enemies.forEach(enemy => {
        enemy.update();
        if (checkCollision(mario, enemy, 18)) endGame();
    });

    // Rensa objekt utanför skärmen
    for (let i = pipes.length - 1; i >= 0; i--) {
        if (pipes[i].x + pipes[i].width < 0) pipes.splice(i, 1);
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].x + enemies[i].width < 0) enemies.splice(i, 1);
    }
}

/***********************
         DRAW
***********************/
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    mario.draw();
    pipes.forEach(p => p.draw());
    enemies.forEach(e => e.draw());

    // HUD
    ctx.fillStyle = "white";
    ctx.font = "20px Barriecito";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.shadowBlur = 0;

    // STARTSKÄRM
    if (!gameStarted) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "32px Barriecito";
        ctx.textAlign = "center";
        ctx.fillText("PIPE GAME", canvas.width / 2, 180);
        ctx.font = "20px Barriecito";
        ctx.fillText("Tryck SPACE eller klicka", canvas.width / 2, 230);
        ctx.fillText("för att starta", canvas.width / 2, 260);
        ctx.textAlign = "left";
    }

    // GAME OVER
    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "28px Barriecito";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, 150);
        ctx.fillText(`Score: ${score}`, canvas.width / 2, 190);
        ctx.fillText(`Highscore: ${highScore}`, canvas.width / 2, 230);

        // Restart-knapp (centrerad)
        ctx.fillStyle = "#ff4444";
        ctx.fillRect(canvas.width / 2 - 70, 280, 140, 40);
        ctx.fillStyle = "white";
        ctx.font = "20px Barriecito";
        ctx.fillText("Restart", canvas.width / 2, 308);

        ctx.textAlign = "left";
    }
}

/***********************
     CLICK RESTART
***********************/
canvas.addEventListener("click", e => {
    if (!gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
        x > canvas.width / 2 - 70 &&
        x < canvas.width / 2 + 70 &&
        y > 280 &&
        y < 320
    ) {
        restartGame();
    }
});

/***********************
      GAME LOOP
***********************/
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

marioImg.onload = gameLoop;