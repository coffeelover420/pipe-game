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
