// Nightclub preview scene. A scene is a plain object:
//   id, name
//   layout({ width, height, content })  -> { scale, x, y, floorY }   (device pixels)
//   paintStage(ctx, { width, height, layout })                         (static, cached)
// To add another scene, export one with the same shape and register it in
// scenes/index.js. The renderer never needs to change.

const CHARACTER_HEIGHT_RATIO = 0.7; // of stage height
const FEET_Y_RATIO = 0.9; // where the character's feet land (floor plane)
const POLE_X_RATIO = 0.46;
const POLE_OFFSET_RATIO = 0.3; // character centre sits this fraction of its width right of the pole

function layout({ width, height, content }) {
  const target = height * CHARACTER_HEIGHT_RATIO;
  const raw = target / content.h;
  // Whole-number scale keeps every source pixel the same size on screen.
  const scale = raw >= 1 ? Math.round(raw) : raw;

  const poleX = Math.round(width * POLE_X_RATIO);
  const contentW = content.w * scale;
  const centerX = poleX + contentW * POLE_OFFSET_RATIO;
  const feetY = Math.round(height * FEET_Y_RATIO);

  // Origin of the frame rectangle such that the content's bottom-centre lands on (centerX, feetY).
  const x = Math.round(centerX - (content.x + content.w / 2) * scale);
  const y = Math.round(feetY - (content.y + content.h) * scale);
  return { scale, x, y, poleX, feetY, centerX, contentW };
}

function paintStage(ctx, { width: W, height: H, layout: L }) {
  const floorTop = H * 0.76;

  // Backdrop
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Subtle coloured wash from the wings
  const wash = (x, color) => {
    const g = ctx.createRadialGradient(x, H * 0.35, 0, x, H * 0.35, W * 0.55);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, floorTop);
  };
  wash(0, 'rgba(120, 20, 60, 0.20)');
  wash(W, 'rgba(50, 30, 120, 0.18)');

  // Spotlight cone from above, aimed at the pole/character
  const aimX = (L.poleX + L.centerX) / 2;
  const coneTopW = W * 0.03;
  const coneBotW = W * 0.34;
  const cone = ctx.createLinearGradient(0, 0, 0, L.feetY);
  cone.addColorStop(0, 'rgba(255, 236, 214, 0.20)');
  cone.addColorStop(1, 'rgba(255, 236, 214, 0.035)');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(aimX - coneTopW, 0);
  ctx.lineTo(aimX + coneTopW, 0);
  ctx.lineTo(aimX + coneBotW, L.feetY);
  ctx.lineTo(aimX - coneBotW, L.feetY);
  ctx.closePath();
  ctx.fill();

  // Stage floor
  const floor = ctx.createLinearGradient(0, floorTop, 0, H);
  floor.addColorStop(0, '#0d0b10');
  floor.addColorStop(1, '#050407');
  ctx.fillStyle = floor;
  ctx.fillRect(0, floorTop, W, H - floorTop);

  // Floor seams, spaced with perspective
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = Math.max(1, Math.round(H / 700));
  for (let i = 1; i <= 5; i++) {
    const t = Math.pow(i / 5, 1.8);
    const y = Math.round(floorTop + (H - floorTop) * t);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Front edge of the stage
  ctx.fillStyle = 'rgba(190, 40, 80, 0.55)';
  ctx.fillRect(0, floorTop, W, Math.max(1, Math.round(H / 400)));

  // Spotlight pool on the floor
  ctx.save();
  ctx.translate(aimX, L.feetY);
  ctx.scale(1, 0.22);
  const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.3);
  pool.addColorStop(0, 'rgba(255, 232, 205, 0.34)');
  pool.addColorStop(0.55, 'rgba(255, 232, 205, 0.09)');
  pool.addColorStop(1, 'rgba(255, 232, 205, 0)');
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.arc(0, 0, W * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  paintPole(ctx, L, H);
  paintContactShadow(ctx, L, H);
}

function paintPole(ctx, L, H) {
  const w = Math.max(6, Math.round(H * 0.018));
  const x = L.poleX - w / 2;
  const baseY = L.feetY - H * 0.015; // a touch behind the character's feet

  const chrome = ctx.createLinearGradient(x, 0, x + w, 0);
  chrome.addColorStop(0, '#2a2c33');
  chrome.addColorStop(0.18, '#c9ced8');
  chrome.addColorStop(0.32, '#ffffff');
  chrome.addColorStop(0.5, '#7b808c');
  chrome.addColorStop(0.8, '#2b2d34');
  chrome.addColorStop(1, '#14151a');
  ctx.fillStyle = chrome;
  ctx.fillRect(x, 0, w, baseY);

  // Base plate
  const plateW = w * 4.2;
  const plate = ctx.createLinearGradient(0, baseY - w * 0.4, 0, baseY + w * 0.6);
  plate.addColorStop(0, '#e6e9ef');
  plate.addColorStop(1, '#2a2c33');
  ctx.fillStyle = plate;
  ctx.beginPath();
  ctx.ellipse(L.poleX, baseY, plateW / 2, w * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
}

function paintContactShadow(ctx, L, H) {
  ctx.save();
  ctx.translate(L.centerX, L.feetY);
  ctx.scale(1, 0.18);
  const r = Math.max(L.contentW * 0.55, H * 0.05);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, 'rgba(0,0,0,0.6)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export const nightclub = { id: 'nightclub', name: 'Nightclub', layout, paintStage };
