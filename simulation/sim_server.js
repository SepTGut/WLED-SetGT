const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WLED System Info Simulation (900 LEDs, ESP32)
const wledInfo = {
  ver: "17.0.0-devV5",
  vid: 2409260,
  leds: {
    count: 900,
    pwr: 450,
    fps: 42,
    maxpwr: 25000,
    maxseg: 32,
    segs: 4,
    lc: 900,
    matrix: { w: 15, h: 20 },
    pin: [16, 17, 18, 19]
  },
  str: false,
  name: "WLED-SetGT Sim",
  udpport: 21324,
  live: false,
  lm: "",
  lip: "",
  ws: 1,
  fxcount: 180,
  palcount: 72,
  cpalcount: 0,
  maps: [{ id: 0 }],
  wifi: { bssid: "AA:BB:CC:DD:EE:FF", rssi: -55, signal: 80, channel: 6 },
  fs: { u: 120, t: 1024, pmort: 0 },
  ndc: 0,
  arch: "esp32",
  core: "v5.1",
  lwip: 0,
  freeheap: 185400,
  uptime: 3600,
  opt: 1,
  brand: "WLED",
  product: "FIRMWARE",
  mac: "A4:CF:12:34:56:78",
  ip: "127.0.0.1",
  um: ["automation_engine", "device_manager", "audioreactive", "wled_espnow"]
};

// 180 Effect Names
const effectList = [
  "Solid", "Blink", "Breathe", "Wipe", "Wipe Random", "Random Colors", "Sweep", "Dynamic", "Colorloop",
  "Rainbow", "Scan", "Dual Scan", "Fade", "Chase", "Chase Random", "Running", "Saw", "Twinkle", "Dissolve",
  "Dissolve Rnd", "Sparkle", "Sparkle Dark", "Sparkle+", "Strobe", "Strobe Rainbow", "Strobe Mega", "Blink Rainbow",
  "Android", "Chase Flash", "Chase Flash Rnd", "Chase Rainbow", "Circus", "Tricolor Chase", "Chase Random 2",
  "Rain", "Fireworks", "Fireworks Starburst", "Fireworks 1D", "Bouncing Balls", "Sinelon", "Sinelon Dual",
  "Sinelon Rainbow", "Popcorn", "Drip", "Plasma", "Percent", "Ripple", "Ripple Rainbow", "Heartbeat", "Pacific",
  "Candle", "Candle Multi", "Solid Glitter", "Sunrise", "Phased", "TwinkleUP", "Noise Pal", "Noise 1", "Noise 2",
  "Noise 3", "Noise 4", "Colortwinkles", "Lake", "Meteor", "Meteor Smooth", "Railway", "Ripple Pattern", "Juggle",
  "Lightning", "Icu", "Multi Comet", "Dual Scanner", "Stream", "Stream 2", "Oscillate", "Pride 09", "Juggle 2",
  "MatriX", "Dna", "Akemi", "Fireworks 3D", "Lissajous", "Fire 2D", "Plasma 2D", "Noise 2D", "Matrix 2D"
];

// 72 Palette Names
const paletteList = [
  "Default", "Random Cycle", "Primary color", "Based on Primary", "Set Colors", "Colors Only", "Color Gradient",
  "Party", "Cloud", "Lava", "Ocean", "Forest", "Rainbow", "Rainbow Bands", "Sunset", "Rivendell", "Breeze",
  "Ocean Breeze", "Atlantis", "Vintage", "Thermal", "Yellowout", "Analogous", "Splash", "Pastel", "Sunset 2",
  "Beech", "Vintage 2", "Departure", "Landscape", "Beach", "Sherbet", "Sherbet 2", "Fire", "Icefire", "Cyane",
  "Light Pink", "Autumn", "Magenta", "Magma", "Spectral", "Cyberpunk", "Neon", "Electric", "Matrix"
];

// Global WLED State
let wledState = {
  on: true,
  bri: 128,
  transition: 7,
  ps: -1,
  pl: -1,
  nl: { on: false, dur: 60, mode: 1, tbri: 0, rem: -1 },
  udpn: { send: false, recv: true, sgrp: 1, rgrp: 1 },
  lor: 0,
  mainseg: 0,
  seg: [
    { id: 0, start: 0, stop: 150, len: 150, grp: 1, spc: 0, of: 0, on: true, frz: false, bri: 255, cct: 127, col: [[255, 160, 0], [0, 0, 0], [0, 0, 0]], fx: 0, sx: 128, ix: 128, pal: 0, sel: true, rev: false, mi: false },
    { id: 1, start: 150, stop: 300, len: 150, grp: 1, spc: 0, of: 0, on: true, frz: false, bri: 255, cct: 127, col: [[0, 255, 128], [0, 0, 0], [0, 0, 0]], fx: 9, sx: 128, ix: 128, pal: 0, sel: false, rev: false, mi: false },
    { id: 2, start: 300, stop: 600, len: 300, grp: 1, spc: 0, of: 0, on: true, frz: false, bri: 255, cct: 127, col: [[255, 0, 128], [0, 0, 0], [0, 0, 0]], fx: 13, sx: 160, ix: 200, pal: 12, sel: false, rev: false, mi: false },
    { id: 3, start: 600, stop: 900, len: 300, grp: 1, spc: 0, of: 0, on: true, frz: false, bri: 255, cct: 127, col: [[0, 200, 255], [0, 0, 0], [0, 0, 0]], fx: 84, sx: 128, ix: 128, pal: 11, sel: false, rev: false, mi: false }
  ]
};

// Automations Usermod Mock Storage
let wledAutomations = [
  { id: 1, name: "Sunset Warmth", trigger: { type: "time", value: "18:30" }, action: { type: "preset", value: 1 }, enabled: true },
  { id: 2, name: "Night Mode Dim", trigger: { type: "time", value: "23:00" }, action: { type: "bri", value: 20 }, enabled: true }
];

// Device Manager Usermod Mock Storage
let wledDeviceManager = {
  i2c: { enabled: true, sda: 21, scl: 22, frequency: 400000, devices: [{ addr: "0x3C", name: "SSD1306 Display" }] },
  spi: { enabled: true, mosi: 23, miso: 19, sck: 18, cs: 5, devices: [] }
};

// WLED API Endpoints
app.get('/json', (req, res) => {
  res.json({ state: wledState, info: wledInfo, effects: effectList, palettes: paletteList });
});

app.get('/json/state', (req, res) => res.json(wledState));

app.post('/json/state', (req, res) => {
  const body = req.body;
  if (typeof body.on === 'boolean') wledState.on = body.on;
  if (typeof body.bri === 'number') wledState.bri = body.bri;
  if (typeof body.transition === 'number') wledState.transition = body.transition;
  if (typeof body.ps === 'number') wledState.ps = body.ps;
  if (Array.isArray(body.seg)) {
    body.seg.forEach((s, idx) => {
      if (wledState.seg[idx]) {
        Object.assign(wledState.seg[idx], s);
      } else {
        wledState.seg.push(s);
      }
    });
  }
  broadcastJsonState();
  res.json({ success: true, state: wledState });
});

app.get('/json/info', (req, res) => res.json(wledInfo));
app.get('/json/eff', (req, res) => res.json(effectList));
app.get('/json/effects', (req, res) => res.json(effectList));
app.get('/json/pal', (req, res) => res.json(paletteList));
app.get('/json/palettes', (req, res) => res.json(paletteList));
app.get('/json/cfg', (req, res) => res.json({ rev: [1, 0], vid: 2409260, id: { name: "WLED-SetGT" } }));
app.get('/json/nodes', (req, res) => res.json({ nodes: [{ name: "WLED-SetGT Sim", ip: "127.0.0.1", type: 0 }] }));
app.get('/json/si', (req, res) => res.json({ n: "WLED-SetGT", seg: wledState.seg }));
app.get('/json/pins', (req, res) => res.json({ pins: [{ pin: 16, owner: "BusDigital" }, { pin: 17, owner: "BusDigital" }, { pin: 18, owner: "BusDigital" }, { pin: 19, owner: "BusDigital" }] }));

// Usermod API endpoints
app.get('/json/automations', (req, res) => res.json({ automations: wledAutomations }));
app.post('/json/automations', (req, res) => {
  if (Array.isArray(req.body.automations)) {
    wledAutomations = req.body.automations;
  }
  res.json({ success: true, automations: wledAutomations });
});

app.get('/json/device_manager', (req, res) => res.json(wledDeviceManager));

// HTTP API compatibility (/win)
app.get('/win', (req, res) => {
  if (req.query.A) wledState.bri = parseInt(req.query.A, 10);
  if (req.query.T) wledState.on = (req.query.T === '2') ? !wledState.on : (req.query.T === '1');
  if (req.query.FX) wledState.seg[0].fx = parseInt(req.query.FX, 10);
  broadcastJsonState();
  res.send('<response>SUCCESS</response>');
});

// Serve 2D Matrix & Strip Interactive Visualizer Simulator
app.get('/simulator', (req, res) => {
  res.sendFile(path.join(__dirname, 'simulator.html'));
});

// Serve Static WLED Data Files
app.use(express.static(path.join(__dirname, '../wled00/data')));

// Root Route fallback to index.htm
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../wled00/data/index.htm'));
});

// WebSocket Liveview & State Broadcast
const liveClients = new Set();
const jsonClients = new Set();

wss.on('connection', (ws) => {
  jsonClients.add(ws);
  ws.send(JSON.stringify({ state: wledState, info: wledInfo }));

  ws.on('message', (msg) => {
    try {
      if (typeof msg === 'string' || msg instanceof String) {
        if (msg.includes('"lv":true')) {
          liveClients.add(ws);
        } else {
          const parsed = JSON.parse(msg);
          if (parsed.state) {
            Object.assign(wledState, parsed.state);
            broadcastJsonState();
          }
        }
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    liveClients.delete(ws);
    jsonClients.delete(ws);
  });
});

function broadcastJsonState() {
  const payload = JSON.stringify({ state: wledState });
  jsonClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

// Generate Live RGB Pixel Frames (900 LEDs) for 2D Liveview & Canvas Visualizer
let animTime = 0;
setInterval(() => {
  animTime += 0.05;
  if (liveClients.size === 0) return;

  const mW = 15;
  const mH = 20;
  const totalLeds = 900;
  const buffer = Buffer.alloc(4 + totalLeds * 3);

  buffer[0] = 76; // 'L'
  buffer[1] = 2;  // 2D Matrix flag
  buffer[2] = mW;
  buffer[3] = mH;

  const bri = wledState.on ? (wledState.bri / 255.0) : 0;

  for (let i = 0; i < totalLeds; i++) {
    let r = 0, g = 0, b = 0;
    const segIdx = i < 150 ? 0 : (i < 300 ? 1 : (i < 600 ? 2 : 3));
    const seg = wledState.seg[segIdx] || wledState.seg[0];
    const baseCol = (seg.col && seg.col[0]) ? seg.col[0] : [255, 160, 0];
    const speed = (seg.sx || 128) / 64.0;

    if (seg.fx === 0) { // Solid
      r = baseCol[0]; g = baseCol[1]; b = baseCol[2];
    } else if (seg.fx === 9) { // Rainbow
      const hue = ((i * 5) + animTime * 50 * speed) % 360;
      [r, g, b] = hslToRgb(hue / 360, 1.0, 0.5);
    } else if (seg.fx === 13) { // Chase
      const pos = Math.floor((animTime * 20 * speed) % 150);
      const dist = Math.abs((i % 150) - pos);
      if (dist < 10) {
        const factor = 1 - (dist / 10);
        r = baseCol[0] * factor; g = baseCol[1] * factor; b = baseCol[2] * factor;
      }
    } else { // 2D Plasma / Noise
      const x = (i % mW) / mW;
      const y = Math.floor((i - 600) / mW) / mH;
      const v = Math.sin(x * 10 + animTime * speed) + Math.cos(y * 10 + animTime * speed);
      r = Math.floor((Math.sin(v) + 1) * 127);
      g = Math.floor((Math.cos(v) + 1) * 127);
      b = 200;
    }

    const offset = 4 + i * 3;
    buffer[offset] = Math.min(255, Math.floor(r * bri));
    buffer[offset + 1] = Math.min(255, Math.floor(g * bri));
    buffer[offset + 2] = Math.min(255, Math.floor(b * bri));
  }

  liveClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(buffer);
    }
  });
}, 33); // ~30 FPS

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1/3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 WLED-SetGT Mock Web & 2D Matrix Server Running!`);
  console.log(`🌐 WLED Web UI:          http://localhost:${PORT}/`);
  console.log(`✨ Automations UI:       http://localhost:${PORT}/automations.htm`);
  console.log(`🎨 2D Matrix Visualizer: http://localhost:${PORT}/simulator`);
  console.log(`=======================================================`);
});
