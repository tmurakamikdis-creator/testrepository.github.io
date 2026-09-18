
// ========== 初期化 ==========
const arena = createMatrix(12, 20);
const player = { pos: { x: 0, y: 0 }, matrix: null, score: 0 };
let gameOver = true;

document.addEventListener("keydown", (event) => {
    if (gameOver) return;
    if (event.code === "ArrowLeft") { playerMove(-1); }
    else if (event.code === "ArrowRight") { playerMove(1); }
    else if (event.code === "ArrowDown") { playerDrop(); }
    else if (event.code === "ArrowUp") { playerHardDrop(); }
    else if (event.code === "Space") {
        event.preventDefault();
        playerRotate(1);
    }
});

startBtn.addEventListener("click", () => {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    gameOver = false;
    playerReset();
    startBtn.style.display = "none";
    update();
});

draw();