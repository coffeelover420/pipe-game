# Pipe Game 

Pipe Game är ett 2D-spel inspirerat av Flappy Bird, byggt med HTML5 Canvas och JavaScript.  
Spelaren styr Mario som ska ta sig mellan pipes och undvika flygande fiender.

Projektet är gjort som en del av ett skolprojekt med fokus på spelmekanik, kodstruktur och versionshantering.

# Hur spelet fungerar

- Tryck SPACE eller klicka med musen för att starta spelet
- Samma input används för att hoppa
- Undvik pipes och fiender
- Varje pipe-par du passerar ger 1 poäng
- Highscore sparas lokalt i webbläsaren

# Unik twist

Till skillnad från originalet Flappy Bird innehåller spelet:

- Flygande fiender (Koopas med vingar):
  Fiender spawnar mellan pipes och rör sig upp och ner i ett sinusmönster  
- Justerad fysik:
  Snällare gravitation och större gap mellan pipes för bättre spelkänsla  
- Ljudeffekter:
  Ljud för hopp, poäng och game over

Dessa förändringar gör spelet mer dynamiskt och mer utmanande utan att kännas orättvist.

# Starta spelet (lokalt)

# Alternativ 1 – Ladda ner som ZIP
1. Klicka på Code → Download ZIP på GitHub
2. Packa upp mappen
3. Öppna `index.html` i valfri webbläsare

# Alternativ 2 – Klona med Git

1. Öppna terminal
2. Kör:
   git clone https://github.com/coffeelover420/pipe-game.git
   En ny mapp skapas där kommandot kördes
3. Gå in i mappen:
4. cd pipe-game
5. Öppna `index.html` i en webbläsare

Om du redan befinner dig i projektmappen i en terminal kan du starta spelet så här:

# Windows (Git Bash / PowerShell)
start index.html

# macOS
open index.html

# Linux
xdg-open index.html

Detta öppnar index.html i din standardwebbläsare och spelet startar direkt.