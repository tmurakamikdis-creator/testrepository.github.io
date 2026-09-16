const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const startBtn = document.getElementById("start-btn");

context.scale(20, 20);

// ========== パーティクルシステム ==========
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3 - 0.1;
    this.life = 1;
    this.decay = 0.02;
    this.size = Math.random() * 0.3 + 0.1;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.01;
    this.life -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 0.3;
    ctx.shadowColor = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

const particles = [];
let clearingRows = [];
let clearAnimation = 0;
let screenShake = { x: 0, y: 0, intensity: 0 };
let comboText = { text: "", alpha: 0, y: 10 };

// ========== テトリミノの色 ==========
const colors = [
  null,
  "#FF0D72", "#0DC2FF", "#0DFF72", "#F538FF",
  "#FF8E0D", "#FFE138", "#3877FF",
];

// ========== 列消し ==========
function arenaSweep() {
  clearingRows = [];

  for (let y = arena.length - 1; y > 0; --y) {
    let isFullRow = true;
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        isFullRow = false;
        break;
      }
    }
    if (isFullRow) {
      clearingRows.push(y);
    }
  }

  if (clearingRows.length > 0) {
    clearAnimation = 30;
    screenShake.intensity = 0.2 + clearingRows.length * 0.1;

    const comboTexts = ["SINGLE!", "DOUBLE!!", "TRIPLE!!!", "TETRIS!!!!"];
    comboText.text = comboTexts[Math.min(clearingRows.length - 1, 3)];
    comboText.alpha = 1;
    comboText.y = 10;

    clearingRows.forEach((y) => {
      for (let x = 0; x < arena[y].length; ++x) {
        const color = colors[arena[y][x]];
        const particleCount = 8 + clearingRows.length * 2;
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle(x + 0.5, y + 0.5, color));
        }
      }
    });
  }
}

function completeClearRows() {
  let rowCount = 1;
  const sortedRows = clearingRows.sort((a, b) => b - a);
  sortedRows.forEach((y) => {
    arena.splice(y, 1);
    player.score += rowCount * 10;
    rowCount *= 2;
  });
  sortedRows.forEach(() => {
    arena.unshift(new Array(arena[0].length).fill(0));
  });
  clearingRows = [];
}

// ========== 衝突判定 ==========
function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

// ========== 盤面作成 ==========
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// ========== テトリミノ定義 ==========
function createPiece(type) {
  if (type === "I") {
    return [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]];
  } else if (type === "L") {
    return [[0,2,0],[0,2,0],[0,2,2]];
  } else if (type === "J") {
    return [[0,3,0],[0,3,0],[3,3,0]];
  } else if (type === "O") {
    return [[4,4],[4,4]];
  } else if (type === "Z") {
    return [[5,5,0],[0,5,5],[0,0,0]];
  } else if (type === "S") {
    return [[0,6,6],[6,6,0],[0,0,0]];
  } else if (type === "T") {
    return [[0,7,0],[7,7,7],[0,0,0]];
  }
}
