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