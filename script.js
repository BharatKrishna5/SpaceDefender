const game = document.getElementById('game');
const shooter = document.getElementById('shooter');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');

let shooterY;
let bullets = [];
let enemies = [];
let score = 0;
let lives = 3;
let gameInterval;
let enemyInterval;
let isGameRunning = false;

// Enemy speed and spawn control
let enemySpeed = 6;
const maxEnemySpeed = 15;
let enemySpawnRate = 1500;
const minSpawnRate = 400;
const spawnRateStep = 100;

// Audio
const shootSound = new Audio('laser.mp3');
const gameOverSound = new Audio('over.mp3');
const bgMusic = new Audio('background.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;

window.onload = () => {
  startScreen.style.display = 'flex';
  game.style.display = 'none';
  gameOverScreen.style.display = 'none';
};

function startGame() {
  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  game.style.display = 'block';

  shooterY = window.innerHeight / 2;
  shooter.style.top = shooterY + 'px';

  score = 0;
  lives = 3;
  enemySpeed = 6;
  enemySpawnRate = 1500;
  updateHUD();

  bullets.forEach(bullet => bullet.remove());
  enemies.forEach(enemy => enemy.remove());
  bullets = [];
  enemies = [];

  clearIntervals();

  isGameRunning = true;
  gameInterval = setInterval(gameLoop, 20);
  enemyInterval = setInterval(spawnEnemy, enemySpawnRate);

  bgMusic.currentTime = 0;
  bgMusic.play();
}

function restartGame() {
  startGame();
}

function clearIntervals() {
  clearInterval(gameInterval);
  clearInterval(enemyInterval);
}

function updateHUD() {
  scoreDisplay.textContent = `Score: ${score}`;
  livesDisplay.textContent = `Lives: ${lives}`;
}

function spawnEnemy() {
  if (!isGameRunning) return;

  const hudHeight = 60;
  const enemy = document.createElement('div');
  enemy.classList.add('enemy');
  enemy.style.top = hudHeight + Math.random() * (window.innerHeight - hudHeight - 50) + 'px';
  enemy.style.left = window.innerWidth + 'px';
  game.appendChild(enemy);
  enemies.push(enemy);
}

function shoot() {
  if (!isGameRunning) return;

  shootSound.currentTime = 0;
  shootSound.play();

  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  bullet.style.left = '50px';
  bullet.style.top = shooterY + 13 + 'px';
  game.appendChild(bullet);
  bullets.push(bullet);
}

function gameLoop() {
  // Move bullets
  bullets.forEach((bullet, i) => {
    let left = parseFloat(bullet.style.left);
    left += 15;
    bullet.style.left = left + 'px';

    if (left > window.innerWidth) {
      bullet.remove();
      bullets.splice(i, 1);
    }
  });

  // Move enemies
  enemies.forEach((enemy, i) => {
    let left = parseFloat(enemy.style.left);
    left -= enemySpeed;
    enemy.style.left = left + 'px';

    if (left < -50) {
      enemy.remove();
      enemies.splice(i, 1);
      lives--;
      updateHUD();
      if (lives <= 0) endGame();
    }
  });

  // Check collisions
  bullets.forEach((bullet, bIndex) => {
    const bLeft = parseFloat(bullet.style.left);
    const bTop = parseFloat(bullet.style.top);

    enemies.forEach((enemy, eIndex) => {
      const eLeft = parseFloat(enemy.style.left);
      const eTop = parseFloat(enemy.style.top);

      if (
        bLeft < eLeft + 50 &&
        bLeft + 10 > eLeft &&
        bTop < eTop + 50 &&
        bTop + 4 > eTop
      ) {
        bullet.remove();
        enemy.remove();
        bullets.splice(bIndex, 1);
        enemies.splice(eIndex, 1);
        score++;
        updateHUD();

        if (score % 5 === 0) {
          if (enemySpeed < maxEnemySpeed) enemySpeed += 1;

          if (enemySpawnRate > minSpawnRate) {
            enemySpawnRate -= spawnRateStep;
            clearInterval(enemyInterval);
            enemyInterval = setInterval(spawnEnemy, enemySpawnRate);
          }
        }
      }
    });
  });
}

window.addEventListener('keydown', (e) => {
  if (!isGameRunning) return;

  if (e.key === 'ArrowUp') {
    shooterY -= 30;
    shooterY = Math.max(70, shooterY);
    shooter.style.top = shooterY + 'px';
  } else if (e.key === 'ArrowDown') {
    shooterY += 30;
    shooterY = Math.min(window.innerHeight - 50, shooterY);
    shooter.style.top = shooterY + 'px';
  } else if (e.code === 'Space') {
    e.preventDefault();
    shoot();
  }
});

function endGame() {
  isGameRunning = false;
  clearIntervals();
  game.style.display = 'none';
  finalScoreDisplay.textContent = `Your Score: ${score}`;
  gameOverScreen.style.display = 'flex';

  bgMusic.pause();
  gameOverSound.play();
}
