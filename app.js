const { name, age, messages, fame, photos, guests } = window.PARTY;

const sparkleCanvas = document.getElementById("sparkle");
const ctx = sparkleCanvas.getContext("2d");
const sparks = [];
const extraPhotos = [];
let cakePhase = "wish";
let cutting = false;
let cutStart = null;
let audio;
let nameStars = [];
const SEAL_KEY = "birthday-gift-sealed";

document.getElementById("house-title").textContent = `${name}'s birthday house`;
document.title = `A surprise for ${name}`;

function show(id) {
  document.querySelectorAll(".scene").forEach((scene) => {
    const on = scene.id === id;
    scene.hidden = !on;
    scene.classList.toggle("hidden", !on);
  });
}

function tone(freq, time = 0.12, type = "sine", gain = 0.04) {
  audio ??= new AudioContext();
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(audio.destination);
  osc.start();
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + time);
  osc.stop(audio.currentTime + time);
}

function resize() {
  sparkleCanvas.width = window.innerWidth;
  sparkleCanvas.height = window.innerHeight;
}

function burst(x, y, count = 26) {
  for (let i = 0; i < count; i += 1) {
    sparks.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 7,
      vy: Math.random() * -6 - 1,
      life: 1,
      size: Math.random() * 3 + 1,
      color: i % 2 ? "#c97b76" : "#f3e6df",
    });
  }
}

function tick() {
  ctx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
  for (let i = sparks.length - 1; i >= 0; i -= 1) {
    const s = sparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.09;
    s.life -= 0.016;
    if (s.life <= 0) {
      sparks.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = s.life;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  drawConstellation();
  requestAnimationFrame(tick);
}

function isSealed() {
  return document.getElementById("intro").classList.contains("is-closed") || localStorage.getItem(SEAL_KEY) === "1";
}

function sealGift() {
  const intro = document.getElementById("intro");
  const gift = document.querySelector(".gift");
  intro.classList.add("is-closed");
  gift.disabled = true;
  gift.setAttribute("aria-label", "The gift is sealed until next year");
  intro.querySelector(".whisper").textContent = "tucked in. until next year.";
  intro.querySelector(".whisper--soft").textContent = "this gift stays closed";
  localStorage.setItem(SEAL_KEY, "1");
}

function openHouse() {
  if (isSealed()) return;
  tone(523, 0.18);
  burst(window.innerWidth / 2, window.innerHeight / 2, 40);
  show("house");
}

document.querySelector(".gift").addEventListener("click", (event) => {
  event.stopPropagation();
  openHouse();
});
document.getElementById("intro").addEventListener("click", openHouse);
document.getElementById("night-btn").addEventListener("click", () => {
  show("sky");
  resetSky();
});
document.getElementById("release").addEventListener("click", sendLanterns);
document.getElementById("tuck").addEventListener("click", tuckTheDay);

document.querySelectorAll("[data-room]").forEach((btn) => {
  btn.addEventListener("click", () => {
    tone(392, 0.1);
    const room = btn.dataset.room;
    show(room);
    if (room === "messages") playMessages();
    if (room === "cake") resetCake();
    if (room === "sky") resetSky();
  });
});

document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => show("house"));
});

function playMessages() {
  const thread = document.getElementById("thread");
  thread.innerHTML = "";
  let i = 0;
  const next = () => {
    if (i >= messages.length) return;
    const typing = document.createElement("div");
    typing.className = "bubble typing";
    typing.innerHTML = "<i></i><i></i><i></i>";
    thread.append(typing);
    thread.scrollTop = thread.scrollHeight;
    window.setTimeout(() => {
      typing.remove();
      const msg = messages[i];
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.innerHTML = `<b>${msg.from}</b>${msg.text}`;
      thread.append(bubble);
      tone(660, 0.08, "triangle", 0.03);
      i += 1;
      window.setTimeout(next, 900);
    }, 700);
  };
  next();
}

function renderFame() {
  const root = document.getElementById("frames");
  root.innerHTML = "";
  fame.forEach((item, index) => {
    const el = document.createElement("article");
    el.className = "frame";
    el.style.setProperty("--tilt", `${index % 2 ? 1.6 : -1.8}deg`);
    el.innerHTML = `<strong>${item.title}</strong><span>${item.note}</span>`;
    root.append(el);
  });
}

function renderWall() {
  const wall = document.getElementById("wall");
  wall.innerHTML = "";
  [...photos, ...extraPhotos].forEach((photo, index) => {
    const card = document.createElement("button");
    card.className = "polaroid";
    card.type = "button";
    card.style.setProperty("--tilt", `${(index % 2 ? 2 : -2) + (index % 3) * 0.4}deg`);
    card.style.setProperty("--wash", photo.wash || "#efd5c8");
    const shot = document.createElement("div");
    shot.className = "shot";
    if (photo.src) shot.style.backgroundImage = `url("${photo.src}")`;
    const cap = document.createElement("figcaption");
    cap.textContent = photo.caption || "a little forever";
    card.append(shot, cap);
    card.addEventListener("click", () => {
      if (!photo.src) return;
      const dialog = document.getElementById("lightbox");
      dialog.querySelector("img").src = photo.src;
      dialog.showModal();
    });
    wall.append(card);
  });
}

document.getElementById("photo-input").addEventListener("change", (event) => {
  [...event.target.files].forEach((file) => {
    extraPhotos.push({
      src: URL.createObjectURL(file),
      caption: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
    });
  });
  renderWall();
});

function makeCandles() {
  const root = document.getElementById("candles");
  root.innerHTML = "";
  for (let i = 0; i < Math.min(age, 8); i += 1) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.innerHTML = '<span class="flame"></span>';
    root.append(candle);
  }
}

function setLine(text) {
  document.getElementById("cake-line").textContent = text;
}

function seats() {
  return [name, ...(guests || ["Mama", "Papa", "bestie"])];
}

function clearServing() {
  const pieces = document.getElementById("pieces");
  const plates = document.getElementById("plates");
  pieces.hidden = true;
  plates.hidden = true;
  pieces.innerHTML = "";
  plates.innerHTML = "";
  document.getElementById("cake-body").classList.remove("is-shared");
  stage.classList.remove("is-serving");
  heldPiece = null;
}

function plateAt(event) {
  return [...document.querySelectorAll(".plate")].find((plate) => {
    const box = plate.getBoundingClientRect();
    return event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
  });
}

function snapToPlate(piece, plate) {
  const stageBox = stage.getBoundingClientRect();
  const plateBox = plate.getBoundingClientRect();
  piece.style.left = `${plateBox.left - stageBox.left + plateBox.width / 2}px`;
  piece.style.top = `${plateBox.top - stageBox.top + plateBox.height / 2 - 16}px`;
  piece.classList.add("is-plated");
  piece.dataset.plate = plate.dataset.seat;
  plate.classList.add("is-full");
}

function nibble(piece) {
  const bites = Number(piece.dataset.bites || 0) + 1;
  piece.dataset.bites = String(bites);
  const box = piece.getBoundingClientRect();
  burst(box.left + box.width / 2, box.top + box.height / 2, 14);
  tone(220, 0.1, "triangle", 0.04);
  if (bites === 1) {
    piece.classList.add("is-bite");
    setLine("crumbs. one more tap for the last bite.");
    return;
  }
  piece.classList.add("is-gone");
  setLine("that slice is history. pass another piece if you want.");
}

function checkAllServed() {
  const plates = [...document.querySelectorAll(".plate")];
  if (plates.length && plates.every((plate) => plate.classList.contains("is-full"))) {
    setLine("every plate has cake. when you’re ready, take the night.");
    tone(659, 0.16);
    unlockNight();
  }
}

function unlockNight() {
  nightUnlocked = true;
  document.getElementById("night-btn").hidden = false;
  const room = document.getElementById("night-room");
  room.hidden = false;
  room.classList.remove("hidden");
}

function sizeConstellation() {
  const canvas = document.getElementById("constellation");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function resetSky() {
  document.getElementById("lanterns").innerHTML = "";
  document.getElementById("release").hidden = false;
  document.getElementById("sky-keep").hidden = true;
  document.getElementById("tuck").hidden = true;
  document.getElementById("sky-line").textContent = "the night came to collect the party";
  nameStars = [];
  sizeConstellation();
}

function sendLanterns() {
  const root = document.getElementById("lanterns");
  root.innerHTML = "";
  const count = seats().length + 1;
  for (let i = 0; i < count; i += 1) {
    const lantern = document.createElement("div");
    lantern.className = "lantern";
    lantern.style.left = `${10 + (i * 78) / count}%`;
    lantern.style.animationDelay = `${i * 0.25}s`;
    root.append(lantern);
    window.setTimeout(() => tone(392 + i * 48, 0.22, "sine", 0.03), i * 250);
  }
  document.getElementById("release").hidden = true;
  document.getElementById("sky-line").textContent = "look up";
  window.setTimeout(formName, 2300);
}

function formName() {
  const canvas = document.getElementById("constellation");
  const width = canvas.width;
  const height = canvas.height;
  const off = document.createElement("canvas");
  off.width = width;
  off.height = height;
  const ink = off.getContext("2d");
  const size = Math.min(width * 0.22, 168);
  ink.font = `700 ${size}px Fraunces, serif`;
  ink.textAlign = "center";
  ink.textBaseline = "middle";
  ink.fillStyle = "#fff";
  ink.fillText(name, width / 2, height * 0.46);
  const pixels = ink.getImageData(0, 0, width, height).data;
  nameStars = [];
  for (let y = 0; y < height; y += 6) {
    for (let x = 0; x < width; x += 6) {
      if (pixels[(y * width + x) * 4 + 3] > 90) {
        nameStars.push({
          tx: x,
          ty: y,
          sx: Math.random() * width,
          sy: Math.random() * height,
          t: 0,
          tw: Math.random() * Math.PI * 2,
        });
      }
    }
  }
  document.getElementById("sky-line").textContent = "";
  document.getElementById("sky-keep").hidden = false;
  document.getElementById("tuck").hidden = false;
  tone(784, 0.4, "sine", 0.035);
}

function drawConstellation() {
  const canvas = document.getElementById("constellation");
  if (!canvas.width || !nameStars.length) return;
  const sky = canvas.getContext("2d");
  sky.clearRect(0, 0, canvas.width, canvas.height);
  for (const star of nameStars) {
    star.t = Math.min(1, star.t + 0.014);
    const x = star.sx + (star.tx - star.sx) * star.t;
    const y = star.sy + (star.ty - star.sy) * star.t;
    sky.globalAlpha = 0.35 + Math.sin(star.tw + Date.now() / 380) * 0.25 + star.t * 0.4;
    sky.fillStyle = "#f7eee8";
    sky.beginPath();
    sky.arc(x, y, 1.5, 0, Math.PI * 2);
    sky.fill();
  }
  sky.globalAlpha = 1;
}

function tuckTheDay() {
  sealGift();
  show("intro");
}

function spawnPieces() {
  cakePhase = "share";
  knife.classList.remove("is-on");
  document.getElementById("cake-body").classList.add("is-shared");
  stage.classList.add("is-serving");
  const piecesRoot = document.getElementById("pieces");
  const platesRoot = document.getElementById("plates");
  piecesRoot.hidden = false;
  platesRoot.hidden = false;
  piecesRoot.innerHTML = "";
  platesRoot.innerHTML = "";

  seats().forEach((label) => {
    const plate = document.createElement("div");
    plate.className = "plate";
    plate.dataset.seat = label;
    plate.textContent = label;
    platesRoot.append(plate);
  });

  const spots = [
    { x: "28%", y: "34%", spin: "-18deg" },
    { x: "48%", y: "26%", spin: "8deg" },
    { x: "68%", y: "34%", spin: "16deg" },
    { x: "38%", y: "50%", spin: "-6deg" },
    { x: "60%", y: "52%", spin: "12deg" },
  ];
  spots.forEach((spot, index) => {
    const piece = document.createElement("button");
    piece.type = "button";
    piece.className = "piece";
    piece.style.left = spot.x;
    piece.style.top = spot.y;
    piece.style.setProperty("--spin", spot.spin);
    piece.style.animationDelay = `${index * 70}ms`;
    piece.dataset.bites = "0";
    piece.innerHTML = '<span class="piece__cherry"></span><span class="piece__drip"></span><span class="piece__body"></span>';
    piecesRoot.append(piece);
  });
  setLine("the pieces came apart. drop one on each plate — then tap to eat.");
}

function resetCake() {
  cakePhase = "wish";
  cutting = false;
  document.getElementById("cake-body").classList.remove("is-cut", "is-served");
  document.getElementById("knife").classList.remove("is-on");
  document.getElementById("finale").hidden = true;
  document.getElementById("blow-btn").hidden = false;
  document.getElementById("mic-btn").hidden = false;
  document.getElementById("night-btn").hidden = !nightUnlocked;
  clearServing();
  makeCandles();
  setLine("close your eyes. make a wish.");
}

function blowOut() {
  if (cakePhase !== "wish") return;
  document.querySelectorAll(".candle").forEach((c, i) => {
    window.setTimeout(() => c.classList.add("is-out"), i * 80);
  });
  tone(180, 0.3, "sawtooth", 0.02);
  burst(window.innerWidth / 2, window.innerHeight * 0.42, 18);
  cakePhase = "cut";
  setLine("now cut the cake. drag the knife across.");
  document.getElementById("knife").classList.add("is-on");
  document.getElementById("blow-btn").hidden = true;
  document.getElementById("mic-btn").hidden = true;
}

function serveCake() {
  if (cakePhase !== "cut") return;
  cakePhase = "done";
  document.getElementById("cake-body").classList.add("is-cut", "is-served");
  tone(523, 0.2);
  window.setTimeout(() => tone(659, 0.2), 160);
  window.setTimeout(() => tone(784, 0.35), 320);
  burst(window.innerWidth / 2, window.innerHeight * 0.45, 60);
  setLine("the first slice is hers");
  const finale = document.getElementById("finale");
  finale.hidden = false;
  finale.textContent = `happy birthday, ${name}`;
  window.setTimeout(spawnPieces, 850);
}

document.getElementById("blow-btn").addEventListener("click", blowOut);

document.getElementById("mic-btn").addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctxAudio = new AudioContext();
    const source = ctxAudio.createMediaStreamSource(stream);
    const analyser = ctxAudio.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    setLine("lean in and blow…");
    const listen = () => {
      if (cakePhase !== "wish") {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      if (avg > 28) blowOut();
      requestAnimationFrame(listen);
    };
    listen();
  } catch {
    setLine("mic needs a tap of permission — or just press blow candles.");
  }
});

const stage = document.getElementById("stage");
const knife = document.getElementById("knife");

stage.addEventListener("pointermove", (event) => {
  if (cakePhase !== "cut") return;
  const rect = stage.getBoundingClientRect();
  knife.style.left = `${event.clientX - rect.left - 20}px`;
  knife.style.top = `${event.clientY - rect.top - 6}px`;
  if (cutting && cutStart) {
    const dx = Math.abs(event.clientX - cutStart.x);
    if (dx > 90) serveCake();
  }
});

stage.addEventListener("pointerdown", (event) => {
  if (cakePhase !== "cut") return;
  cutting = true;
  cutStart = { x: event.clientX, y: event.clientY };
  stage.setPointerCapture(event.pointerId);
});

stage.addEventListener("pointerup", () => {
  cutting = false;
  cutStart = null;
});

document.getElementById("pieces").addEventListener("pointerdown", (event) => {
  const piece = event.target.closest(".piece");
  if (!piece || cakePhase !== "share" || piece.classList.contains("is-gone")) return;
  const box = piece.getBoundingClientRect();
  heldPiece = piece;
  holdOffset = {
    x: event.clientX - (box.left + box.width / 2),
    y: event.clientY - (box.top + box.height / 2),
  };
  piece.dataset.startX = String(event.clientX);
  piece.dataset.startY = String(event.clientY);
  piece.classList.add("is-held");
  piece.setPointerCapture(event.pointerId);
  event.stopPropagation();
});

window.addEventListener("pointermove", (event) => {
  if (!heldPiece) return;
  const box = stage.getBoundingClientRect();
  heldPiece.style.left = `${event.clientX - box.left - holdOffset.x}px`;
  heldPiece.style.top = `${event.clientY - box.top - holdOffset.y}px`;
  document.querySelectorAll(".plate").forEach((plate) => {
    plate.classList.toggle("is-hot", plateAt(event) === plate);
  });
});

window.addEventListener("pointerup", (event) => {
  if (!heldPiece) return;
  const moved = Math.hypot(
    event.clientX - Number(heldPiece.dataset.startX),
    event.clientY - Number(heldPiece.dataset.startY)
  );
  const plate = plateAt(event);
  heldPiece.classList.remove("is-held");
  document.querySelectorAll(".plate").forEach((p) => p.classList.remove("is-hot"));

  if (moved < 14 && heldPiece.classList.contains("is-plated")) {
    nibble(heldPiece);
  } else if (plate) {
    snapToPlate(heldPiece, plate);
    tone(498, 0.1, "sine", 0.04);
    const box = plate.getBoundingClientRect();
    burst(box.left + box.width / 2, box.top + 12, 12);
    setLine(`this slice is for ${plate.dataset.seat}. tap it if she wants a bite.`);
    checkAllServed();
  }

  heldPiece = null;
});

window.addEventListener("resize", () => {
  resize();
  sizeConstellation();
});
resize();
sizeConstellation();
tick();
renderFame();
renderWall();
makeCandles();
if (localStorage.getItem(SEAL_KEY) === "1") sealGift();
