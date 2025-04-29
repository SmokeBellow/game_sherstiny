const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let keys = {};
let player = {
  x: 100, y: 100,
  width: 40, height: 60,
  speed: 5,
  color: 'blue',
  img: null,
  scale: 0.4
};
let wools = [];
let obstacles = [];
let woolCollected = 0;
let totalWool = 0;
let currentLevel = 1;
let character = 'masha';
let woolImage = new Image();
woolImage.src = 'images/sherst.png';
let levelComplete = false;
let showingMessage = false;
let passedLevel10 = false;

let cats = [];
let catImage = new Image();
catImage.src = 'images/cat_enemy.png';

let messagePhrases = ["Отлично!", "Шерсть собрана!", "Молодец!", "Чистота - залог уюта!"];

const obstacleImages = {
  table: new Image(),
  chair: new Image(),
  bed: new Image(),
  sofa: new Image(),
};

obstacleImages.table.src = 'images/table.png';
obstacleImages.chair.src = 'images/chair.png';
obstacleImages.bed.src = 'images/bed.png';
obstacleImages.sofa.src = 'images/sofa.png';

document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function resizeCanvas() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;
}

function showMurMyakScreen() {
  const murmyakScreen = document.getElementById('murmyak-screen');
  murmyakScreen.style.opacity = 1;
  setTimeout(() => {
    murmyakScreen.style.opacity = 0;
    setTimeout(() => {
      showGameNameScreen();
    }, 1000);
  }, 3000);
}

function showGameNameScreen() {
  const gameNameScreen = document.getElementById('gamename-screen');
  const sherstinyText = document.getElementById('sherstiny-text');
  const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS'];
  let fontIndex = 0;

  gameNameScreen.style.opacity = 1;

  const fontInterval = setInterval(() => {
    sherstinyText.style.fontFamily = fonts[fontIndex];
    fontIndex = (fontIndex + 1) % fonts.length;
  }, 300);

  setTimeout(() => {
    clearInterval(fontInterval);
    gameNameScreen.style.opacity = 0;
    setTimeout(() => {
      showCharacterSelectScreen();
    }, 1000);
  }, 5000);
}

function showCharacterSelectScreen() {
  document.getElementById('character-select').style.display = 'flex';
  document.getElementById('masha-image').style.display = 'block';
  document.getElementById('anton-image').style.display = 'block';

  if (passedLevel10) {
    document.getElementById('vika-image').style.display = 'block';
  }
}

function selectCharacter(selected) {
  character = selected;
  // Сбрасываем объект player до начальных значений
  player = {
    x: 100,
    y: 100,
    width: 40,
    height: 60,
    speed: 5, // Гарантируем, что скорость всегда сбрасывается до 5
    color: 'blue',
    img: null,
    scale: 0.4
  };
  const img = new Image();
  img.onload = () => {
    player.img = img;
    const desiredWidth = 60;
    player.scale = desiredWidth / img.width;
    player.width = img.width * player.scale;
    player.height = img.height * player.scale;
    document.getElementById('character-select').style.display = 'none';
    currentLevel = 1;
    startGame();
  };
  
  if (selected === 'vika' && passedLevel10) {
    img.src = 'images/player_vika.png';
  } else if (selected === 'masha') {
    img.src = 'images/player_masha.png';
  } else if (selected === 'anton') {
    img.src = 'images/player_anton.png';
  }
}

function startGame() {
  generateLevel();
  requestAnimationFrame(gameLoop);
}

function isFullyInsideScreen(x, y, width, height) {
  return x >= 0 && x + width <= canvas.width && y >= 0 && y + height <= canvas.height;
}

function isSafeFromObstacles(x, y, width, height) {
  return !obstacles.some(o =>
    x < o.x + o.width &&
    x + width > o.x &&
    y < o.y + o.height &&
    y + height > o.y
  );
}

function generateCatPath() {
  const edges = [
    { edge: 'left', x: 0, y: () => Math.random() * canvas.height },
    { edge: 'right', x: canvas.width - 60, y: () => Math.random() * canvas.height },
    { edge: 'top', x: () => Math.random() * canvas.width, y: 0 },
    { edge: 'bottom', x: () => Math.random() * canvas.width, y: canvas.height - 60 }
  ];

  const startEdgeIndex = Math.floor(Math.random() * edges.length);
  let startEdge = edges[startEdgeIndex];
  let startX = typeof startEdge.x === 'function' ? startEdge.x() : startEdge.x;
  let startY = typeof startEdge.y === 'function' ? startEdge.y() : startEdge.y;

  let endEdgeIndex;
  do {
    endEdgeIndex = Math.floor(Math.random() * edges.length);
  } while (endEdgeIndex === startEdgeIndex);
  let endEdge = edges[endEdgeIndex];
  let endX = typeof endEdge.x === 'function' ? endEdge.x() : endEdge.x;
  let endY = typeof endEdge.y === 'function' ? endEdge.y() : endEdge.y;

  return { startX, startY, endX, endY };
}

function generateLevel() {
  obstacles = [];
  wools = [];
  woolCollected = 0;
  levelComplete = false;
  showingMessage = false;
  totalWool = 5 + currentLevel * 2;

  cats = [];
  if (currentLevel >= 5 && currentLevel <= 6) {
    const { startX, startY, endX, endY } = generateCatPath();
    cats.push({
      x: startX,
      y: startY,
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      width: 60,
      height: 60,
      speed: 3,
      lastWoolDrop: Date.now(),
      isVisible: true,
      disappearTime: null
    });
  } else if (currentLevel >= 7 && currentLevel <= 8) {
    const { startX, startY, endX, endY } = generateCatPath();
    cats.push({
      x: startX,
      y: startY,
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      width: 60,
      height: 60,
      speed: 3,
      lastWoolDrop: Date.now(),
      isVisible: true,
      disappearTime: null
    });
  } else if (currentLevel >= 9 && currentLevel <= 10) {
    for (let i = 0; i < 2; i++) {
      const { startX, startY, endX, endY } = generateCatPath();
      cats.push({
        x: startX,
        y: startY,
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        width: 60,
        height: 60,
        speed: 3,
        lastWoolDrop: Date.now(),
        isVisible: true,
        disappearTime: null
      });
    }
  }

  let obstacleTypes = [];
  if (currentLevel <= 2) {
    obstacleTypes = ["chair"];
  } else if (currentLevel <= 4) {
    obstacleTypes = ["chair", "table"];
  } else if (currentLevel <= 6) {
    obstacleTypes = ["chair", "table", "sofa"];
  } else {
    obstacleTypes = ["chair", "table", "sofa", "bed"];
  }

  for (let i = 0; i < 5 + currentLevel; i++) {
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    let w = 0, h = 0;
    if (type === "table") { w = 100; h = 60; }
    if (type === "chair") { w = 40; h = 40; }
    if (type === "bed") { w = 140; h = 80; }
    if (type === "sofa") { w = 120; h = 70; }
    let ox = Math.random() * (canvas.width - w - 20) + 10;
    let oy = Math.random() * (canvas.height - h - 20) + 10;

    while (Math.hypot(player.x - ox, player.y - oy) < 100) {
      ox = Math.random() * (canvas.width - w - 20) + 10;
      oy = Math.random() * (canvas.height - h - 20) + 10;
    }

    obstacles.push({ x: ox, y: oy, width: w, height: h, type });
  }

  let attempts = 0;
  const maxAttempts = 1000;
  while (wools.length < totalWool && attempts < maxAttempts) {
    let x = Math.random() * (canvas.width - 30);
    let y = Math.random() * (canvas.height - 30);

    if (!isFullyInsideScreen(x, y, 30, 30)) {
      attempts++;
      continue;
    }

    if (!isSafeFromObstacles(x, y, 30, 30)) {
      attempts++;
      continue;
    }

    const safeFromPlayer = Math.hypot(player.x - x, player.y - y) > 100;

    if (safeFromPlayer) {
      wools.push({ x, y, scale: 1 });
    }
    attempts++;
  }

  if (wools.length < totalWool) {
    console.warn(`Не удалось разместить всю шерсть: размещено ${wools.length} из ${totalWool}`);
    totalWool = wools.length;
  }

  document.getElementById('level-text').textContent = "Уровень " + currentLevel;
  document.getElementById('level-text').style.opacity = 1;

  updateWoolCounter();
}

function showMessage(text) {
  const message = document.getElementById('message-text');
  message.textContent = text;
  message.style.opacity = 1;
  showingMessage = true;

  setTimeout(() => {
    message.style.opacity = 0;
    showingMessage = false;
  }, 3000);
}

function updateWoolCounter() {
  const woolCounter = document.getElementById('wool-count');
  woolCounter.textContent = `Шерсть: ${woolCollected}/${totalWool}`;
}

function updateCats() {
  const now = Date.now();
  const shouldDisappear = (currentLevel >= 5 && currentLevel <= 6) || (currentLevel >= 9 && currentLevel <= 10);
  const disappearDuration = (currentLevel >= 9 && currentLevel <= 10) ? 5000 : 7000;

  cats.forEach(cat => {
    if (!cat.isVisible) {
      if (shouldDisappear && now - cat.disappearTime >= disappearDuration) {
        const { startX, startY, endX, endY } = generateCatPath();
        cat.x = startX;
        cat.y = startY;
        cat.startX = startX;
        cat.startY = startY;
        cat.endX = endX;
        cat.endY = endY;
        cat.isVisible = true;
        cat.disappearTime = null;
        cat.lastWoolDrop = now;
      }
      return;
    }

    const dx = cat.endX - cat.startX;
    const dy = cat.endY - cat.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const moveX = (dx / distance) * cat.speed;
    const moveY = (dy / distance) * cat.speed;
    cat.x += moveX;
    cat.y += moveY;

    const distToEnd = Math.hypot(cat.x - cat.endX, cat.y - cat.endY);
    if (distToEnd < cat.speed) {
      if (shouldDisappear) {
        cat.isVisible = false;
        cat.disappearTime = now;
      } else {
        const { startX, startY, endX, endY } = generateCatPath();
        cat.x = startX;
        cat.y = startY;
        cat.startX = startX;
        cat.startY = startY;
        cat.endX = endX;
        cat.endY = endY;
      }
      return;
    }

    if (now - cat.lastWoolDrop >= 2000) {
      const woolX = cat.x + cat.width / 2;
      const woolY = cat.y + cat.height;

      if (!isFullyInsideScreen(woolX, woolY, 30, 30)) {
        cat.lastWoolDrop = now;
        return;
      }

      if (!isSafeFromObstacles(woolX, woolY, 30, 30)) {
        cat.lastWoolDrop = now;
        return;
      }

      wools.push({ x: woolX, y: woolY, scale: 1 });
      totalWool++;
      updateWoolCounter();
      cat.lastWoolDrop = now;
    }
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!levelComplete) {
    handlePlayerMovement();
    handleCollisions();
    updateCats();
    drawGame();
  }

  if (woolCollected === totalWool && !levelComplete) {
    levelComplete = true;
    currentLevel++;
    showMessage("Уровень пройден!");
    if (currentLevel > 10) {
      passedLevel10 = true;
      showVictoryScreen();
    } else {
      setTimeout(() => {
        generateLevel();
      }, 3000);
    }
  }

  requestAnimationFrame(gameLoop);
}

function showVictoryScreen() {
  const victoryScreen = document.createElement('div');
  victoryScreen.style.position = 'absolute';
  victoryScreen.style.top = '0';
  victoryScreen.style.left = '0';
  victoryScreen.style.width = '100%';
  victoryScreen.style.height = '100%';
  victoryScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  victoryScreen.style.color = 'white';
  victoryScreen.style.textAlign = 'center';
  victoryScreen.style.display = 'flex';
  victoryScreen.style.flexDirection = 'column';
  victoryScreen.style.justifyContent = 'center';
  victoryScreen.style.alignItems = 'center';
  victoryScreen.innerHTML = `
    <h1>Победа! Вы собрали целую кошку!</h1>
    <img src="images/win.png" alt="Win Image" style="width: 300px; height: auto;">
  `;

  document.body.appendChild(victoryScreen);

  setTimeout(() => {
    victoryScreen.style.opacity = '0';
    setTimeout(() => {
      victoryScreen.remove();
      showCharacterSelectScreen();
    }, 1000);
  }, 4000);
}

function handlePlayerMovement() {
  const previousX = player.x;
  const previousY = player.y;

  if (keys['w'] || keys['ц']) player.y -= player.speed;
  if (keys['a'] || keys['ф']) player.x -= player.speed;
  if (keys['s'] || keys['ы']) player.y += player.speed;
  if (keys['d'] || keys['в']) player.x += player.speed;

  if (checkCollisionWithObstacles(player.x, player.y)) {
    player.x = previousX;
    player.y = previousY;
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

function checkCollisionWithObstacles(newX, newY) {
  return obstacles.some(o => 
    newX < o.x + o.width &&
    newX + player.width > o.x &&
    newY < o.y + o.height &&
    newY + player.height > o.y
  );
}

function handleCollisions() {
  wools = wools.filter(wool => {
    if (player.x < wool.x + 30 && player.x + player.width > wool.x && 
        player.y < wool.y + 30 && player.y + player.height > wool.y) {
      woolCollected++;
      updateWoolCounter();
      if (woolCollected === totalWool) {
        showMessage("Шерсть собрана!");
      }
      return false;
    }
    return true;
  });

  obstacles.forEach(o => {
    if (player.x < o.x + o.width &&
        player.x + player.width > o.x &&
        player.y < o.y + o.height &&
        player.y + player.height > o.y) {
    }
  });
}

function drawGame() {
  ctx.drawImage(player.img, player.x, player.y, player.width, player.height);

  wools.forEach(wool => {
    ctx.drawImage(woolImage, wool.x, wool.y, 30, 30);
  });

  obstacles.forEach(o => {
    ctx.drawImage(obstacleImages[o.type], o.x, o.y, o.width, o.height);
  });

  cats.forEach(cat => {
    if (cat.isVisible) {
      ctx.drawImage(catImage, cat.x, cat.y, cat.width, cat.height);
    }
  });
}

document.addEventListener('keydown', function(event) {
  if (keys['1'] && keys['2'] && keys['3']) {
    levelComplete = true;
    currentLevel++;
    if (currentLevel > 10) {
      passedLevel10 = true;
      showVictoryScreen();
    } else {
      setTimeout(() => {
        generateLevel();
      }, 3000);
    }
  }
});

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
showMurMyakScreen();