# Pipe Game

Pipe Game är ett webbaserat spel inspirerat av *Flappy Bird*, byggt med **HTML, CSS och JavaScript**.  
Spelet körs direkt i webbläsaren med hjälp av `<canvas>` och använder bilder från Mario-spelen.

Målet är att styra Mario genom rör (pipes) och undvika både rören **och en flygande fiende** som rör sig mellan dem.

## Unik twist

Utöver klassiska pipes har spelet en **extra fiende (Koopa med vingar)** som:

- Spawnar mellan varje par av pipes  
- Rör sig upp och ner med en sinus-rörelse  
- Gör spelet betydligt svårare än originalet  

Detta är en medveten design för att skapa en **egen version** av spelet och inte bara kopiera originalmekaniken.

## Funktioner

- Gravity och hopp-fysik
- Pipes som spawnar från toppen och botten
- Dynamisk poängräkning
- Highscore som sparas i `localStorage`
- Flygande fiende som rör sig mellan pipes
- Kollision med pipes och fiender
- Startskärm
- Game Over-skärm 
- Restart-knapp
- Anpassat typsnitt (Barriecito)
- Tydliga kommentarer i koden

## Styrning

- **Mellanslag (Space)** – Hoppa
- **Vänsterklick** – Hoppa
- Klicka på **Restart** när spelet är slut för att börja om

## Så kör du spelet

1. Klona repot:

git clone https://github.com/coffeelover420/pipe-game.git

2. Öppna filen index.html i valfri webbläsare

(Ingen installation eller server krävs – spelet körs direkt lokalt).