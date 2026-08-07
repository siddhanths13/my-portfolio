// Handwritten Digit Recognizer - Demo heuristic classifier
// Uses pixel-density analysis to guess the drawn digit (no backend needed)

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;

// Setup canvas drawing
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(getPos(e).x, getPos(e).y);
  e.preventDefault();
});
canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const pos = getPos(e);
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#000";
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
});
canvas.addEventListener("mouseup", () => (drawing = false));
canvas.addEventListener("mouseleave", () => (drawing = false));

// Touch support
canvas.addEventListener("touchstart", (e) => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(getPos(e.touches[0]).x, getPos(e.touches[0]).y);
  e.preventDefault();
});
canvas.addEventListener("touchmove", (e) => {
  if (!drawing) return;
  const pos = getPos(e.touches[0]);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  e.preventDefault();
});
canvas.addEventListener("touchend", () => (drawing = false));

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * 280,
    y: ((e.clientY - rect.top) / rect.height) * 280,
  };
}

function clearCanvas() {
  ctx.clearRect(0, 0, 280, 280);
  document.getElementById("result").textContent = "?";
  document.getElementById("confidence").textContent = "";
}

// Heuristic classifier based on pixel density in digit regions
function classifyDigit() {
  const data = ctx.getImageData(0, 0, 280, 280).data;
  const grid = Array(28)
    .fill(0)
    .map(() => Array(28).fill(0));
  let totalInk = 0;

  // Downsample to 28x28 grid
  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 28; x++) {
      // Average the 10x10 block
      let sum = 0;
      for (let dy = 0; dy < 10; dy++) {
        for (let dx = 0; dx < 10; dx++) {
          const px = x * 10 + dx;
          const py = y * 10 + dy;
          const idx = (py * 280 + px) * 4;
          // Invert: white paper (255) -> empty, black ink (0) -> filled
          sum += 255 - data[idx];
        }
      }
      grid[y][x] = sum / 10000;
      totalInk += grid[y][x];
    }
  }

  if (totalInk < 5) return { digit: "?", confidence: 0 }; // empty canvas

  // Calculate features: ink distribution in quadrants, center, and density
  const quadrants = {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
    center: 0,
  };
  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 28; x++) {
      const v = grid[y][x];
      if (x < 14 && y < 14) quadrants.topLeft += v;
      else if (x >= 14 && y < 14) quadrants.topRight += v;
      else if (x < 14 && y >= 14) quadrants.bottomLeft += v;
      else quadrants.bottomRight += v;
      if (x >= 10 && x < 18 && y >= 10 && y < 18) quadrants.center += v;
    }
  }
  const total = totalInk;
  const tl = quadrants.topLeft / total;
  const tr = quadrants.topRight / total;
  const bl = quadrants.bottomLeft / total;
  const br = quadrants.bottomRight / total;
  const center = quadrants.center / total;

  // Simple heuristic scoring for each digit
  const scores = {
    0: (tr + bl) * 0.5 + (tl + br) * 0.5 - Math.abs(center - 0.12) * 5,
    1: (tl + bl) * 0.8 + center * 0.2 - (tr + br) * 0.3,
    2: tr * 0.6 + bl * 0.4 + center * 0.3,
    3: tr * 0.5 + br * 0.5 + center * 0.2,
    4: tl * 0.4 + br * 0.6 + (tr + bl) * 0.2,
    5: tl * 0.5 + br * 0.5 + center * 0.2,
    6: bl * 0.6 + tr * 0.4 + center * 0.3,
    7: tl * 0.7 + tr * 0.3 - bl * 0.2,
    8: center * 0.8 + (tl + tr + bl + br) * 0.2,
    9: tr * 0.6 + bl * 0.4 + center * 0.3,
  };

  let best = "?";
  let bestScore = -Infinity;
  let totalScore = 0;
  for (const [d, s] of Object.entries(scores)) {
    totalScore += s;
    if (s > bestScore) {
      bestScore = s;
      best = d;
    }
  }
  const confidence = Math.min(99, Math.max(30, (bestScore / (totalScore / 10)) * 15 + 40));
  return { digit: best, confidence: Math.round(confidence) };
}

function analyze() {
  const { digit, confidence } = classifyDigit();
  document.getElementById("result").textContent = digit;
  document.getElementById("confidence").textContent =
    digit === "?" ? "Draw a digit first!" : `Confidence: ${confidence}% (demo heuristic)`;
}
