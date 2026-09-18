
// ========== 描画 ==========
function draw() {
    context.save();

    if (screenShake.intensity > 0) {
        screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
        screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
        context.translate(screenShake.x, screenShake.y);
        screenShake.intensity *= 0.9;
    }

    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.lineWidth = 0.05;
    context.strokeStyle = "#333";
    for (let x = 0; x < 12; ++x) {
        context.beginPath(); context.moveTo(x, 0);
        context.lineTo(x, 20); context.stroke();
    }
    for (let y = 0; y < 20; ++y) {
        context.beginPath(); context.moveTo(0, y);
        context.lineTo(12, y); context.stroke();
    }

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);

    if (clearAnimation > 0) {
        const flash = Math.sin(clearAnimation * 0.5) * 0.5 + 0.5;
        clearingRows.forEach((y) => {
            context.save();
            context.globalAlpha = flash;
            context.fillStyle = "#ffffff";
            context.fillRect(0, y, 12, 1);
            context.restore();
        });
    }

    particles.forEach((particle) => { particle.draw(context); });

    if (comboText.alpha > 0) {
        context.save();
        context.globalAlpha = comboText.alpha;
        context.fillStyle = "#FFD700";
        context.shadowBlur = 0.5;
        context.shadowColor = "#FFD700";
        context.font = "bold 1px Arial";
        context.textAlign = "center";
        context.fillText(comboText.text, 6, comboText.y);
        context.restore();
    }

    context.restore();
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const px = x + offset.x;
                const py = y + offset.y;
                context.save();
                context.shadowBlur = 0.5;
                context.shadowColor = colors[value];
                context.fillStyle = colors[value];
                context.fillRect(px, py, 1, 1);
                context.restore();
                context.lineWidth = 0.05;
                context.strokeStyle = "rgba(255, 255, 255, 0.5)";
                context.strokeRect(px, py, 1, 1);
                context.fillStyle = "rgba(255, 255, 255, 0.3)";
                context.fillRect(px + 0.1, py + 0.1, 0.3, 0.3);
            }
        });
    });
}

// ========== ゲーム操作 ==========
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
                const color = colors[value];
                for (let i = 0; i < 3; i++) {
                    particles.push(
                        new Particle(x + player.pos.x + 0.5,
                            y + player.pos.y + 0.5, color)
                    );
                }
            }
        });
    });
    screenShake.intensity = 0.05;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerHardDrop() {
    while (!collide(arena, player)) { player.pos.y++; }
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) { player.pos.x -= dir; }
}

function playerReset() {
    const pieces = "ILJOTSZ";
    player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
    player.pos.y = 0;
    player.pos.x =
        ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
    if (collide(arena, player)) {
        gameOver = true;
        startBtn.innerText = "GAME OVER - RESTART";
        startBtn.style.display = "block";
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) { matrix.forEach(row => row.reverse()); }
    else { matrix.reverse(); }
}

// ========== ゲームループ ==========
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    if (gameOver) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) { particles.splice(i, 1); }
    }

    if (comboText.alpha > 0) {
        comboText.alpha -= 0.015;
        comboText.y -= 0.05;
    }

    if (clearAnimation > 0) {
        clearAnimation--;
        if (clearAnimation === 0) {
            completeClearRows();
            updateScore();
        }
    } else {
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) { playerDrop(); }
    }

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    scoreElement.innerText = player.score;
}
