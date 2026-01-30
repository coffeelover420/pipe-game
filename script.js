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

// Fysikvärden
const gravity = 0.8;       // Drar Mario nedåt
const jumpStrength = -15;  // Hur högt Mario hoppar

// Hoppa-funktion
function jump() {
    mario.velocity = jumpStrength;
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
    mario.velocity += gravity;
    mario.y += mario.velocity;

    // Golv-kollision
    if (mario.y + mario.height > canvas.height) {
        mario.y = canvas.height - mario.height;
        mario.velocity = 0;
    }

    // Pipe-timer
    pipeTimer += 16;        // Ungefär 60 FPS

    if (pipeTimer > pipeInterval) {
        spawnPipePair();
        pipeTimer = 0;
    }

    // Uppdaterar alla pipes
    pipes.forEach(pipe => pipe.update());

    // Tar bort pipes som åkt ut ur skärmen
    for (let i = pipes.length - 1; i >= 0; i--) {
        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
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

// Lista som innehåller alla pipes
const pipes = [];

// Hur ofta nya pipes skapas (i milliesekunder)
let pipeTimer = 0;
const pipeInterval = 1500;

// Skapar ett par pipes (top + botten)
function spawnPipePair() {
    const pipeWidth = 80;
    const pipeGap = 220;    // Större gap än vanliga Flappy Bird

    const gapY =
        Math.random() * (canvas.height - pipeGap - 200) + 100;

    // Topp-pipe
    const topPipe = new Pipe(
        canvas.width,
        gapY - 300,
        pipeWidth,
        300,
        true
    );

    // Botten-pipe
    const bottomPipe = new Pipe(
        canvas.width,
        gapY + pipeGap,
        pipeWidth,
        300
    );

    pipes.push(topPipe);
    pipes.push(bottomPipe);
}

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
