


const canvas = document.getElementById('fieldCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modalOverlay');
const modalMsg = document.getElementById('modalMsg');

canvas.width = 850;
canvas.height = 500;

let score = 0;
let planningMode = true;
let timeLeft = 20;
let passSequence = [0];
let shotTarget = null;
let ball = { x: 60, y: 250, targetIdx: 0, moving: false, speed: 10, radius: 9 };
let timerInterval;

const players = [{ x: 60, y: 250 }, { x: 250, y: 120 }, { x: 250, y: 380 }, { x: 450, y: 250 }, { x: 650, y: 150 }, { x: 650, y: 350 }];
const defenders = [
    { x: 300, y: 120, range: 60, speed: 0.05, angle: 0 },
    // { x: 300, y: 380, range: 60, speed: 0.05, angle: 1 },
    // { x: 450, y: 200, range: 100, speed: 0.04, angle: 2 },
    // { x: 600, y: 150, range: 80, speed: 0.06, angle: 1 },
    { x: 600, y: 350, range: 80, speed: 0.06, angle: 2 }
];
const goalkeeper = { x: canvas.width - 20, y: 250, targetY: 250, diving: false };

function showModal(text) {
    modalMsg.innerText = text;
    modal.style.display = 'flex';
    setTimeout(() => { document.getElementById('modalContent').style.transform = "scale(1)"; }, 10);
}

function closeModal() {
    modal.style.display = 'none';
    document.getElementById('modalContent').style.transform = "scale(0.8)";
    resetGame();
}

function drawField() {
    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillStyle = i % 80 === 0 ? '#2e7d32' : '#1b5e20';
        ctx.fillRect(0, i, canvas.width, 40);
    }
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 20);
    ctx.lineTo(canvas.width / 2, canvas.height - 20);
    ctx.stroke();
    ctx.strokeRect(canvas.width - 140, canvas.height / 2 - 110, 120, 220);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.strokeRect(canvas.width - 25, canvas.height / 2 - 50, 20, 100);
}

function drawEntities() {
    defenders.forEach(d => {
        d.angle += d.speed;
        d.currentY = d.y + Math.sin(d.angle) * d.range;
        ctx.beginPath();
        ctx.arc(d.x, d.currentY, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4b2b';
        ctx.fill();
        if (ball.moving) {
            let dist = Math.hypot(ball.x - d.x, ball.y - d.currentY);
            if (dist < 22) endGame("BLOCKED!");
        }
    });

    if (goalkeeper.diving) goalkeeper.y += (goalkeeper.targetY - goalkeeper.y) * 0.25;
    else goalkeeper.y += (250 - goalkeeper.y) * 0.1;

    ctx.beginPath();
    ctx.arc(goalkeeper.x, goalkeeper.y, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#ff9800';
    ctx.fill();

    players.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = passSequence.includes(i) ? '#ffd700' : '#e0e0e0';
        ctx.fill();
    });
}

function update() {
    drawField();
    if (planningMode && passSequence.length > 0) {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'gold';
        ctx.moveTo(players[passSequence[0]].x, players[passSequence[0]].y);
        passSequence.forEach(i => ctx.lineTo(players[i].x, players[i].y));
        if (shotTarget) ctx.lineTo(shotTarget.x, shotTarget.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    drawEntities();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    if (ball.moving) {
        let target = (ball.targetIdx < passSequence.length) ? players[passSequence[ball.targetIdx]] : shotTarget;
        let dx = target.x - ball.x, dy = target.y - ball.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
            ball.x += (dx / dist) * ball.speed;
            ball.y += (dy / dist) * ball.speed;
        } else {
            ball.targetIdx++;
            if (ball.targetIdx > passSequence.length) shoot();
        }
    }
    requestAnimationFrame(update);
}

function shoot() {
    goalkeeper.diving = true;
    goalkeeper.targetY = shotTarget.y;
    setTimeout(() => { checkGoalResult(); goalkeeper.diving = false; }, 400);
}

function checkGoalResult() {
    if (ball.x > canvas.width - 25 && ball.y >= 200 && ball.y <= 300) {
        if (Math.abs(goalkeeper.y - ball.y) < 35) endGame("KEEPER SAVED!");
        else { score += 100; document.getElementById('score').innerText = score; endGame("GOAL!!!"); }
    } else endGame("MISS!");
}

canvas.addEventListener('mousedown', (e) => {
    if (!planningMode) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    if (mx > canvas.width - 50 && my > 200 && my < 300) {
        shotTarget = { x: canvas.width - 10, y: my };
        document.getElementById('msg').innerText = "Target Locked!";
        return;
    }
    players.forEach((p, i) => {
        if (Math.hypot(mx - p.x, my - p.y) < 20) {
            if (passSequence[passSequence.length - 1] !== i) { passSequence.push(i); shotTarget = null; }
        }
    });
});

document.getElementById('startBtn').onclick = () => {
    if (!shotTarget) { showModal("PLEASE SELECT GOAL TARGET!"); return; }
    planningMode = false; ball.moving = true; ball.targetIdx = 1;
};

function resetGame() {
    planningMode = true; timeLeft = 20; passSequence = [0]; shotTarget = null;
    ball = { x: 60, y: 250, targetIdx: 0, moving: false, speed: 10, radius: 9 };
    document.getElementById('msg').innerText = "Pass to Players -> Shoot Goal";
    startTimer();
}

function endGame(msg) { ball.moving = false; clearInterval(timerInterval); showModal(msg); }

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (planningMode) {
            timeLeft--;
            document.getElementById('timer').innerText = timeLeft;
            if (timeLeft <= 0) endGame("TIME UP!");
        }
    }, 1000);
}

document.getElementById('resetBtn').onclick = () => { closeModal(); };
startTimer();
update();