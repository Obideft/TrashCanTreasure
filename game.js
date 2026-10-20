(() => {
  "use strict";

  const CANVAS_W = 960;
  const CANVAS_H = 540;
  const GROUND_Y = 458;

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const images = {
    sheet1: null,
    sheet2: null,
    portrait: null,
  };

  const f = (x, y, w, h) => ({ x, y, w, h });

  const SPR = {
    idle: [
      f(15, 8, 55, 83), f(82, 9, 54, 82), f(143, 9, 55, 82), f(207, 8, 55, 83),
      f(271, 8, 53, 83), f(335, 9, 53, 82), f(399, 8, 53, 83), f(462, 9, 54, 82),
      f(526, 9, 54, 82), f(592, 8, 55, 83), f(660, 9, 54, 82),
    ],
    run: [
      f(16, 101, 55, 84), f(80, 100, 56, 85), f(147, 100, 55, 85), f(211, 100, 56, 85),
      f(275, 100, 56, 85), f(341, 100, 58, 84), f(408, 100, 56, 86), f(472, 100, 58, 85),
      f(538, 100, 56, 86), f(600, 100, 60, 85), f(663, 100, 64, 84),
    ],
    jump: [
      f(18, 385, 57, 87), f(80, 384, 57, 81), f(148, 384, 52, 81), f(202, 385, 65, 72),
      f(269, 385, 67, 78), f(337, 389, 65, 77), f(408, 387, 57, 85), f(476, 382, 59, 84),
      f(539, 404, 65, 77), f(610, 404, 62, 80),
    ],
    fall: [
      f(18, 492, 53, 70), f(80, 489, 56, 72), f(150, 490, 50, 72),
    ],
    land: [
      f(211, 497, 52, 65), f(274, 492, 49, 70), f(339, 495, 52, 67),
    ],
    gold: [
      f(17, 692, 26, 35), f(57, 692, 25, 35), f(96, 692, 25, 35), f(135, 692, 26, 35),
      f(192, 692, 25, 35), f(239, 692, 21, 35), f(277, 692, 22, 35), f(317, 692, 19, 35),
    ],
    crown: [f(367, 690, 34, 40), f(415, 690, 33, 41)],
    blue: [f(554, 686, 48, 50), f(622, 687, 47, 48), f(688, 688, 45, 46)],
    spark: [f(365, 739, 38, 35), f(413, 738, 35, 36), f(561, 740, 31, 31)],
    burst: f(256, 784, 98, 64),
    plus1: f(408, 800, 40, 34),
    plus5: f(490, 799, 43, 36),
    plus10: f(559, 793, 54, 36),
    bonus: f(649, 775, 86, 64),
    cans: [
      f(203, 588, 55, 74),
      f(269, 585, 51, 78),
      f(329, 588, 54, 76),
      f(393, 581, 70, 83),
    ],
    bags: [
      f(79, 791, 52, 50),
      f(152, 793, 60, 50),
      f(87, 859, 56, 55),
      f(155, 860, 58, 54),
    ],
    bgFar: f(9, 9, 749, 179),
    bgMid: f(9, 192, 749, 173),
    bgNear: f(10, 374, 748, 169),
    road: f(153, 553, 125, 60),
    sidewalk: f(10, 621, 76, 47),
    curb: f(375, 553, 120, 63),
    lamp: f(13, 738, 58, 118),
    lampLit: f(70, 746, 54, 110),
    hydrant: f(180, 780, 42, 75),
    signWalk: f(239, 755, 44, 100),
    signStop: f(300, 748, 32, 107),
    bench: f(346, 803, 87, 51),
    tree: f(441, 745, 80, 109),
    fence: f(533, 778, 72, 76),
    pallet: f(615, 790, 69, 65),
    boxes: f(688, 792, 61, 63),
    barrier: f(17, 860, 108, 88),
    puddle: f(545, 921, 104, 28),
  };

  const modes = {
    LOADING: "loading",
    TITLE: "title",
    PLAY: "play",
    PAUSE: "pause",
    OVER: "over",
  };

  const keys = new Set();
  const input = {
    jumpHeld: false,
    jumpQueued: false,
    pauseQueued: false,
    restartQueued: false,
  };

  let audioCtx = null;
  const missingAssets = [];

  const world = {
    mode: modes.LOADING,
    loadProgress: 0,
    time: 0,
    score: 0,
    coins: 0,
    distance: 0,
    best: Number(localStorage.getItem("tct-best") || 0),
    speed: 280,
    spawnTimer: 0,
    coinTimer: 0.6,
    decorTimer: 0.2,
    landingT: 0,
    overlayAlpha: 1,
    player: createPlayer(),
    obstacles: [],
    pickups: [],
    decor: [],
    floaters: [],
    sparks: [],
  };

  function createPlayer() {
    return {
      x: 168,
      y: GROUND_Y,
      vy: 0,
      onGround: true,
      anim: "idle",
      frame: 0,
      frameT: 0,
      scale: 1.42,
      invuln: 0,
    };
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(src));
      img.src = src;
    });
  }

  function loadAll() {
    const jobs = [
      ["sheet1", "assets/SpriteSheet_01.png"],
      ["sheet2", "assets/SpriteSheet_02.png"],
      ["portrait", "assets/01.png"],
    ];
    let done = 0;
    return Promise.all(
      jobs.map(([key, src]) =>
        loadImage(src)
          .then((img) => {
            images[key] = img;
            done += 1;
            world.loadProgress = done / jobs.length;
          })
          .catch(() => {
            missingAssets.push(src);
            done += 1;
            world.loadProgress = done / jobs.length;
          })
      )
    );
  }

  function ensureAudio() {
    if (audioCtx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
    } catch (err) {
      audioCtx = null;
    }
  }

  function beep(freq, dur, type, gain) {
    if (!audioCtx) return;
    const t0 = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(gain || 0.05, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  }

  function sfx(kind) {
    if (kind === "jump") {
      beep(420, 0.09, "square", 0.04);
      beep(620, 0.12, "triangle", 0.03);
    } else if (kind === "coin") {
      beep(880, 0.08, "triangle", 0.05);
      beep(1320, 0.12, "sine", 0.03);
    } else if (kind === "bonus") {
      beep(523, 0.1, "triangle", 0.05);
      beep(784, 0.14, "triangle", 0.05);
      beep(1046, 0.18, "sine", 0.04);
    } else if (kind === "hit") {
      beep(140, 0.22, "sawtooth", 0.06);
    } else if (kind === "start") {
      beep(392, 0.1, "square", 0.04);
      beep(523, 0.16, "square", 0.04);
    }
  }

  function resetRun() {
    world.score = 0;
    world.coins = 0;
    world.distance = 0;
    world.speed = 280;
    world.spawnTimer = 0.9;
    world.coinTimer = 0.4;
    world.decorTimer = 0;
    world.landingT = 0;
    world.obstacles.length = 0;
    world.pickups.length = 0;
    world.decor.length = 0;
    world.floaters.length = 0;
    world.sparks.length = 0;
    world.player = createPlayer();
    world.player.anim = "run";
    seedDecor();
  }

  function seedDecor() {
    let x = 40;
    while (x < CANVAS_W + 200) {
      spawnDecor(x);
      x += 140 + Math.random() * 180;
    }
  }

  function spawnDecor(x) {
    const roll = Math.random();
    let sprite;
    if (roll < 0.18) sprite = SPR.lampLit;
    else if (roll < 0.3) sprite = SPR.lamp;
    else if (roll < 0.42) sprite = SPR.tree;
    else if (roll < 0.52) sprite = SPR.bench;
    else if (roll < 0.62) sprite = SPR.hydrant;
    else if (roll < 0.72) sprite = SPR.signWalk;
    else if (roll < 0.8) sprite = SPR.fence;
    else if (roll < 0.88) sprite = SPR.pallet;
    else if (roll < 0.94) sprite = SPR.boxes;
    else sprite = SPR.signStop;
    world.decor.push({
      x,
      sprite,
      scale: sprite === SPR.tree ? 1.15 : 1,
    });
  }

  function currentDifficulty() {
    const t = world.distance / 100;
    return {
      speed: 280 + Math.min(260, t * 18 + world.score * 0.04),
      gap: Math.max(0.72, 1.55 - t * 0.07),
    };
  }

  function spawnObstacle() {
    const t = world.distance / 100;
    const pack = Math.random() < Math.min(0.34, 0.08 + t * 0.03);
    const kinds = [
      { sprite: SPR.cans[0], scale: 1.15, score: 0 },
      { sprite: SPR.cans[1], scale: 1.15, score: 0 },
      { sprite: SPR.cans[2], scale: 1.2, score: 0 },
      { sprite: SPR.cans[3], scale: 1.15, score: 0 },
      { sprite: SPR.bags[0], scale: 1.05, score: 0 },
      { sprite: SPR.bags[2], scale: 1.05, score: 0 },
      { sprite: SPR.barrier, scale: 0.92, score: 0 },
    ];
    const count = pack ? 2 : 1;
    let x = CANVAS_W + 40;
    for (let i = 0; i < count; i += 1) {
      const kind = kinds[(Math.random() * kinds.length) | 0];
      world.obstacles.push({
        x: x + i * (kind.sprite.w * kind.scale + 18),
        sprite: kind.sprite,
        scale: kind.scale,
        dead: false,
      });
    }
    if (Math.random() < 0.55) {
      spawnCoinArc(x + 10, true);
    }
  }

  function spawnCoinArc(originX, overObstacle) {
    const n = 3 + ((Math.random() * 3) | 0);
    const high = overObstacle || Math.random() < 0.4;
    const baseY = high ? GROUND_Y - 118 - Math.random() * 70 : GROUND_Y - 52;
    const bonus = Math.random() < 0.16;
    const rare = Math.random() < 0.07;
    for (let i = 0; i < n; i += 1) {
      const kind = rare && i === n - 1 ? "blue" : bonus && i === ((n / 2) | 0) ? "crown" : "gold";
      const rise = Math.sin((i / Math.max(1, n - 1)) * Math.PI) * (high ? 42 : 16);
      world.pickups.push({
        x: originX + i * 38,
        y: baseY - rise,
        kind,
        frame: 0,
        frameT: Math.random() * 0.2,
        taken: false,
      });
    }
  }

  function pickupValue(kind) {
    if (kind === "blue") return 10;
    if (kind === "crown") return 5;
    return 1;
  }

  function plusSprite(kind) {
    if (kind === "blue") return SPR.plus10;
    if (kind === "crown") return SPR.plus5;
    return SPR.plus1;
  }

  function coinFrames(kind) {
    if (kind === "blue") return SPR.blue;
    if (kind === "crown") return SPR.crown;
    return SPR.gold;
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function playerHitbox() {
    const p = world.player;
    const fr = animFrame(p);
    const dw = fr.w * p.scale;
    const dh = fr.h * p.scale;
    const insetX = dw * 0.28;
    const insetTop = dh * 0.22;
    return {
      x: p.x - dw / 2 + insetX,
      y: p.y - dh + insetTop,
      w: dw - insetX * 2,
      h: dh - insetTop - dh * 0.06,
    };
  }

  function obstacleHitbox(o) {
    const dw = o.sprite.w * o.scale;
    const dh = o.sprite.h * o.scale;
    return {
      x: o.x - dw / 2 + dw * 0.18,
      y: GROUND_Y - dh + dh * 0.12,
      w: dw * 0.64,
      h: dh * 0.86,
    };
  }

  function pickupHitbox(c) {
    const fr = coinFrames(c.kind)[0];
    const s = c.kind === "gold" ? 1.15 : 1.05;
    const dw = fr.w * s;
    const dh = fr.h * s;
    return { x: c.x - dw / 2, y: c.y - dh / 2, w: dw, h: dh };
  }

  function animFrame(p) {
    const frames = SPR[p.anim] || SPR.idle;
    return frames[p.frame % frames.length];
  }

  function setAnim(p, name) {
    if (p.anim === name) return;
    p.anim = name;
    p.frame = 0;
    p.frameT = 0;
  }

  function stepAnim(p, dt) {
    const rates = { idle: 0.09, run: 0.055, jump: 0.07, fall: 0.08, land: 0.07 };
    p.frameT += dt;
    const rate = rates[p.anim] || 0.08;
    if (p.frameT >= rate) {
      p.frameT -= rate;
      const len = (SPR[p.anim] || SPR.idle).length;
      if (p.anim === "land") {
        p.frame = Math.min(len - 1, p.frame + 1);
      } else if (p.anim === "jump") {
        p.frame = Math.min(len - 1, p.frame + 1);
      } else {
        p.frame = (p.frame + 1) % len;
      }
    }
  }

  function jump() {
    const p = world.player;
    if (!p.onGround) return;
    p.onGround = false;
    p.vy = -760;
    world.landingT = 0;
    setAnim(p, "jump");
    sfx("jump");
  }

  function startGame() {
    ensureAudio();
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    resetRun();
    world.mode = modes.PLAY;
    sfx("start");
  }

  function gameOver() {
    world.mode = modes.OVER;
    world.best = Math.max(world.best, world.score);
    localStorage.setItem("tct-best", String(world.best));
    setAnim(world.player, "fall");
    sfx("hit");
  }

  function updatePlayer(dt) {
    const p = world.player;
    const grav = 2150;
    if (!p.onGround) {
      if (!input.jumpHeld && p.vy < -220) p.vy += grav * dt * 0.85;
      p.vy += grav * dt;
      p.y += p.vy * dt;
      if (p.y >= GROUND_Y) {
        p.y = GROUND_Y;
        p.vy = 0;
        p.onGround = true;
        world.landingT = 0.16;
        setAnim(p, "land");
      } else if (p.vy > 140 && p.anim === "jump" && p.frame >= SPR.jump.length - 3) {
        setAnim(p, "fall");
      }
    } else if (world.mode === modes.PLAY) {
      if (world.landingT > 0) {
        world.landingT -= dt;
        if (world.landingT <= 0) setAnim(p, "run");
      } else {
        setAnim(p, "run");
      }
    }
    stepAnim(p, dt);
  }

  function updatePlay(dt) {
    const diff = currentDifficulty();
    world.speed = diff.speed;
    world.distance += world.speed * dt;
    world.score += world.speed * dt * 0.12;

    if (input.jumpQueued) {
      input.jumpQueued = false;
      jump();
    }

    updatePlayer(dt);

    world.spawnTimer -= dt;
    if (world.spawnTimer <= 0) {
      spawnObstacle();
      world.spawnTimer = diff.gap + Math.random() * 0.35;
    }
    world.coinTimer -= dt;
    if (world.coinTimer <= 0) {
      spawnCoinArc(CANVAS_W + 80 + Math.random() * 120, Math.random() < 0.35);
      world.coinTimer = 1.1 + Math.random() * 0.9;
    }
    world.decorTimer -= dt;
    if (world.decorTimer <= 0) {
      spawnDecor(CANVAS_W + 40);
      world.decorTimer = 0.7 + Math.random() * 0.8;
    }

    const dx = world.speed * dt;
    for (let i = world.obstacles.length - 1; i >= 0; i -= 1) {
      const o = world.obstacles[i];
      o.x -= dx;
      if (o.x < -120) world.obstacles.splice(i, 1);
    }
    for (let i = world.pickups.length - 1; i >= 0; i -= 1) {
      const c = world.pickups[i];
      c.x -= dx;
      c.frameT += dt;
      if (c.frameT >= 0.08) {
        c.frameT = 0;
        const frames = coinFrames(c.kind);
        c.frame = (c.frame + 1) % frames.length;
      }
      if (c.x < -80) world.pickups.splice(i, 1);
    }
    for (let i = world.decor.length - 1; i >= 0; i -= 1) {
      world.decor[i].x -= dx * 0.92;
      if (world.decor[i].x < -140) world.decor.splice(i, 1);
    }

    const ph = playerHitbox();
    for (let i = 0; i < world.obstacles.length; i += 1) {
      if (rectsOverlap(ph, obstacleHitbox(world.obstacles[i]))) {
        gameOver();
        return;
      }
    }
    for (let i = world.pickups.length - 1; i >= 0; i -= 1) {
      const c = world.pickups[i];
      if (rectsOverlap(ph, pickupHitbox(c))) {
        const value = pickupValue(c.kind);
        world.coins += 1;
        world.score += value * 10;
        world.floaters.push({
          x: c.x,
          y: c.y,
          t: 0,
          sprite: plusSprite(c.kind),
          bonus: c.kind === "blue",
        });
        spawnSparks(c.x, c.y);
        if (c.kind === "gold") sfx("coin");
        else sfx("bonus");
        world.pickups.splice(i, 1);
      }
    }

    updateFx(dt);
  }

  function spawnSparks(x, y) {
    for (let i = 0; i < 8; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 90;
      world.sparks.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 30,
        t: 0,
        life: 0.35 + Math.random() * 0.2,
        frame: (Math.random() * SPR.spark.length) | 0,
      });
    }
  }

  function updateFx(dt) {
    for (let i = world.floaters.length - 1; i >= 0; i -= 1) {
      const ftr = world.floaters[i];
      ftr.t += dt;
      ftr.y -= 42 * dt;
      if (ftr.t > 0.7) world.floaters.splice(i, 1);
    }
    for (let i = world.sparks.length - 1; i >= 0; i -= 1) {
      const s = world.sparks[i];
      s.t += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 180 * dt;
      if (s.t > s.life) world.sparks.splice(i, 1);
    }
  }

  function handleModeInput() {
    if (input.pauseQueued) {
      input.pauseQueued = false;
      if (world.mode === modes.PLAY) world.mode = modes.PAUSE;
      else if (world.mode === modes.PAUSE) world.mode = modes.PLAY;
    }
    if (world.mode === modes.TITLE && input.jumpQueued) {
      input.jumpQueued = false;
      startGame();
    }
    if (world.mode === modes.OVER && (input.jumpQueued || input.restartQueued)) {
      input.jumpQueued = false;
      input.restartQueued = false;
      startGame();
    }
    if (world.mode === modes.PAUSE && input.jumpQueued) {
      input.jumpQueued = false;
    }
  }

  function drawImageRect(img, spr, dx, dy, dw, dh) {
    if (!img || !spr) return;
    ctx.drawImage(img, spr.x, spr.y, spr.w, spr.h, dx, dy, dw, dh);
  }

  function drawSprite(img, spr, x, y, scale, anchor) {
    if (!img || !spr) return;
    const dw = spr.w * scale;
    const dh = spr.h * scale;
    let dx = x;
    let dy = y;
    if (anchor === "foot") {
      dx = x - dw / 2;
      dy = y - dh;
    } else if (anchor === "center") {
      dx = x - dw / 2;
      dy = y - dh / 2;
    }
    drawImageRect(img, spr, dx, dy, dw, dh);
  }

  function drawTiled(img, spr, scroll, y, height, speedFactor) {
    if (!img) return;
    const scale = height / spr.h;
    const dw = spr.w * scale;
    let x = -((scroll * speedFactor) % dw);
    if (x > 0) x -= dw;
    while (x < CANVAS_W) {
      drawImageRect(img, spr, x, y, dw, height);
      x += dw - 1;
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawHudPanel(x, y, w, h) {
    ctx.fillStyle = "rgba(8,12,28,0.72)";
    roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,210,74,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawText(str, x, y, size, color, align, weight) {
    ctx.font = `${weight || "700"} ${size}px Trebuchet MS, Segoe UI, sans-serif`;
    ctx.textAlign = align || "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    g.addColorStop(0, "#0c1733");
    g.addColorStop(0.55, "#152448");
    g.addColorStop(1, "#1a1a22");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const scroll = world.distance;
    if (images.sheet2) {
      drawTiled(images.sheet2, SPR.bgFar, scroll, 8, 168, 0.12);
      drawTiled(images.sheet2, SPR.bgMid, scroll, 148, 196, 0.32);
      drawTiled(images.sheet2, SPR.bgNear, scroll, 250, 188, 0.58);
      drawTiled(images.sheet2, SPR.road, scroll, 418, 78, 1);
      drawTiled(images.sheet2, SPR.sidewalk, scroll, 488, 52, 1);
    } else {
      ctx.fillStyle = "#243056";
      ctx.fillRect(0, 418, CANVAS_W, 122);
    }

    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(0, GROUND_Y, CANVAS_W, 4);
  }

  function drawWorld() {
    if (images.sheet2) {
      for (let i = 0; i < world.decor.length; i += 1) {
        const d = world.decor[i];
        drawSprite(images.sheet2, d.sprite, d.x, GROUND_Y + 2, d.scale, "foot");
      }
    }
    if (images.sheet1) {
      for (let i = 0; i < world.obstacles.length; i += 1) {
        const o = world.obstacles[i];
        drawSprite(images.sheet1, o.sprite, o.x, GROUND_Y, o.scale, "foot");
      }
      for (let i = 0; i < world.pickups.length; i += 1) {
        const c = world.pickups[i];
        const frames = coinFrames(c.kind);
        const bob = Math.sin(world.time * 6 + c.x * 0.02) * 4;
        const scale = c.kind === "gold" ? 1.2 : 1.05;
        drawSprite(images.sheet1, frames[c.frame % frames.length], c.x, c.y + bob, scale, "center");
      }
    }
    drawPlayer();
    if (images.sheet1) {
      for (let i = 0; i < world.sparks.length; i += 1) {
        const s = world.sparks[i];
        ctx.globalAlpha = 1 - s.t / s.life;
        drawSprite(images.sheet1, SPR.spark[s.frame], s.x, s.y, 0.7, "center");
        ctx.globalAlpha = 1;
      }
      for (let i = 0; i < world.floaters.length; i += 1) {
        const ftr = world.floaters[i];
        ctx.globalAlpha = 1 - ftr.t / 0.7;
        if (ftr.bonus) drawSprite(images.sheet1, SPR.bonus, ftr.x, ftr.y - 26, 0.7, "center");
        drawSprite(images.sheet1, ftr.sprite, ftr.x, ftr.y, 1, "center");
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawPlayer() {
    const p = world.player;
    const fr = animFrame(p);
    if (!images.sheet1) {
      ctx.fillStyle = "#7dff9a";
      ctx.fillRect(p.x - 18, p.y - 64, 36, 64);
      return;
    }
    drawSprite(images.sheet1, fr, p.x, p.y, p.scale, "foot");
  }

  function drawHud() {
    drawHudPanel(16, 14, 210, 86);
    drawText("SCORE", 28, 32, 12, "#c9d2ef", "left", "600");
    drawText(String(Math.floor(world.score)).padStart(6, "0"), 28, 54, 26, "#ffe789");
    drawText("BEST " + Math.floor(world.best), 28, 80, 13, "#9aa8d1");

    drawHudPanel(238, 14, 168, 86);
    if (images.sheet1) drawSprite(images.sheet1, SPR.gold[0], 268, 56, 1.15, "center");
    drawText("COINS", 292, 32, 12, "#c9d2ef");
    drawText(String(world.coins), 292, 58, 26, "#ffd24a");

    drawHudPanel(418, 14, 188, 86);
    drawText("DISTANCE", 432, 32, 12, "#c9d2ef");
    drawText((world.distance / 28).toFixed(0) + " m", 432, 58, 24, "#f4f1e8");

    drawHudPanel(CANVAS_W - 150, 14, 134, 44);
    drawText(world.mode === modes.PAUSE ? "PAUSED" : "P / ESC", CANVAS_W - 83, 36, 14, "#ffd24a", "center");
  }

  function drawTitle() {
    ctx.fillStyle = "rgba(5,8,18,0.38)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawHudPanel(170, 78, 620, 360);
    if (images.portrait) {
      ctx.drawImage(images.portrait, 196, 128, 128, 206);
    }
    drawText("TRASH CAN TREASURE", 360, 130, 28, "#ffe789");
    drawText("Night run through the city. Jump the cans.", 360, 168, 16, "#c9d2ef");
    drawText("Space / ↑ / W / Click  —  Jump", 360, 220, 16, "#f4f1e8");
    drawText("Esc or P  —  Pause", 360, 246, 16, "#f4f1e8");
    drawText("Collect gold, crown, and blue coins.", 360, 280, 16, "#c9d2ef");
    drawText("Press Jump to start", 360, 340, 22, "#7dffb0");
    if (world.best > 0) drawText("Best score  " + Math.floor(world.best), 360, 382, 15, "#9aa8d1");
  }

  function drawPause() {
    ctx.fillStyle = "rgba(5,8,18,0.45)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawHudPanel(280, 190, 400, 140);
    drawText("PAUSED", 480, 230, 32, "#ffe789", "center");
    drawText("Press Esc or P to resume", 480, 278, 16, "#c9d2ef", "center");
  }

  function drawOver() {
    ctx.fillStyle = "rgba(5,8,18,0.5)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawHudPanel(230, 120, 500, 300);
    if (images.portrait) ctx.drawImage(images.portrait, 258, 168, 90, 145);
    drawText("GAME OVER", 380, 160, 30, "#ff8d7a");
    drawText("Score  " + Math.floor(world.score), 380, 210, 22, "#ffe789");
    drawText("Coins  " + world.coins, 380, 242, 18, "#ffd24a");
    drawText("Distance  " + (world.distance / 28).toFixed(0) + " m", 380, 272, 18, "#c9d2ef");
    drawText("Best  " + Math.floor(world.best), 380, 304, 16, "#9aa8d1");
    drawText("Jump or click to restart", 480, 372, 18, "#7dffb0", "center");
  }

  function drawLoading() {
    ctx.fillStyle = "#0a1020";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawText("Loading city streets...", CANVAS_W / 2, 240, 22, "#c9d2ef", "center");
    const w = 360;
    const x = (CANVAS_W - w) / 2;
    ctx.strokeStyle = "#ffd24a";
    ctx.strokeRect(x, 270, w, 16);
    ctx.fillStyle = "#ffd24a";
    ctx.fillRect(x, 270, w * world.loadProgress, 16);
  }

  function drawMissing() {
    if (!missingAssets.length) return;
    drawText("Missing: " + missingAssets.join(", "), 16, CANVAS_H - 18, 12, "#ff8d7a");
  }

  function render() {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    if (world.mode === modes.LOADING) {
      drawLoading();
      return;
    }
    drawBackground();
    drawWorld();
    drawHud();
    if (world.mode === modes.TITLE) drawTitle();
    if (world.mode === modes.PAUSE) drawPause();
    if (world.mode === modes.OVER) drawOver();
    drawMissing();
  }

  let last = 0;
  function loop(ts) {
    const dt = Math.min(0.033, (ts - last) / 1000 || 0.016);
    last = ts;
    world.time += dt;
    handleModeInput();
    if (world.mode === modes.TITLE) {
      setAnim(world.player, "idle");
      stepAnim(world.player, dt);
    } else if (world.mode === modes.PLAY) {
      updatePlay(dt);
    } else if (world.mode === modes.OVER) {
      updatePlayer(dt);
      updateFx(dt);
    }
    render();
    requestAnimationFrame(loop);
  }

  function isTypingTarget(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
  }

  window.addEventListener("keydown", (e) => {
    if (isTypingTarget(e.target)) return;
    const code = e.code;
    const jumpKey = code === "Space" || code === "ArrowUp" || code === "KeyW";
    const pauseKey = code === "Escape" || code === "KeyP";
    if (jumpKey || pauseKey || code === "ArrowDown" || code === "KeyS") {
      e.preventDefault();
    }
    if (keys.has(code)) {
      if (jumpKey) input.jumpHeld = true;
      return;
    }
    keys.add(code);
    if (jumpKey) {
      queueJump();
    }
    if (pauseKey) input.pauseQueued = true;
  });

  window.addEventListener("keyup", (e) => {
    keys.delete(e.code);
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
      input.jumpHeld = false;
    }
  });

  function queueJump() {
    input.jumpHeld = true;
    input.jumpQueued = true;
    ensureAudio();
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  }

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    queueJump();
  });
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      e.preventDefault();
      queueJump();
    }
  });
  window.addEventListener("pointerup", () => {
    input.jumpHeld = false;
  });
  window.addEventListener("mouseup", () => {
    input.jumpHeld = false;
  });

  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  loadAll().then(() => {
    world.mode = modes.TITLE;
    world.player = createPlayer();
    seedDecor();
  });
  requestAnimationFrame(loop);

  window.TCT = {
    start: startGame,
    pause() {
      if (world.mode === modes.PLAY) world.mode = modes.PAUSE;
    },
    resume() {
      if (world.mode === modes.PAUSE) world.mode = modes.PLAY;
    },
    snapshot() {
      return {
        mode: world.mode,
        score: Math.floor(world.score),
        coins: world.coins,
        distance: Math.floor(world.distance),
        obstacles: world.obstacles.length,
        pickups: world.pickups.length,
        anim: world.player.anim,
        y: Math.round(world.player.y),
        onGround: world.player.onGround,
      };
    },
  };
})();
