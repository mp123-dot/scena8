// --- ZMIENNE GLOBALNE ---
let video;
let captureReady = true;
let snapshot;

let snapCount = 0;
let loading = false;
let loadingProgress = 0;
let showDalej = false;

let messageSide = true; // przy losowych komunikatach

let selfieBg, selfieBg2;
let snapImageButton;
let rawDalejImg, dalejImg;
let futuraFont, glimmerSound, flowerMouse;
let glitter = [];

const BTN_DIAMETER = 120;
const HOVER_SCALE  = 1.05;

// --- KOMUNIKATY LOSOWE ---
let messages = [
  "#ugly polish girl. again",
  "Obrzydliwe. Jeszcze raz!",
  "Co to za mina? Jeszcze raz!",
  "Chyba nie chcesz tak wyglądać na profilowym? Jeszcze raz!",
  "OMG, weź się za siebie... Jeszcze raz!",
  "Okropne! Jeszcze raz!",
  "Hmm... Jeszcze raz!",
  "Serio? Jeszcze raz!",
  "Nie, nie i jeszcze raz nie. Zrób kolejne zdjęcie!",
  "Wyglądasz jak pasztet. Jeszcze raz!",
  "To chyba nie jest Twój korzystny profil? Co? Jeszcze raz!",
];

let messageText = ""; // przechowuje aktualny komunikat

function preload() {
  selfieBg     = loadImage("t.selfie.png");
  selfieBg2    = loadImage("t.selfie2.png");
  rawDalejImg  = loadImage("PrzyciskDALEJ.png");
  futuraFont   = loadFont("futura.ttf");
  glimmerSound = loadSound("glimmer.wav");
  flowerMouse  = loadImage("flowerMouse.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(futuraFont);
  noCursor();

  // --- KAMERA VIDEO ---
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();

  // --- PRZYCISK „PSTRYK” ---
  snapImageButton = createImg("PrzyciskPSTRYK.png", "Pstryk");
  snapImageButton.size(BTN_DIAMETER, BTN_DIAMETER);
  snapImageButton.position(windowWidth / 2 - BTN_DIAMETER / 2, windowHeight - 80 - BTN_DIAMETER / 2);
  snapImageButton.style("border-radius", "50%");
  snapImageButton.style("object-fit", "cover");
  snapImageButton.style("cursor", "pointer");
  snapImageButton.style("position", "absolute");
  snapImageButton.mousePressed(takeSnapshot);

  // --- PRZYGOTUJ OKRĄGŁY OBRAZEK „DALEJ” Z MASKĄ ---
  const s = min(rawDalejImg.width, rawDalejImg.height);
  dalejImg = createImage(s, s);
  rawDalejImg.loadPixels();
  dalejImg.copy(
    rawDalejImg,
    (rawDalejImg.width - s)/2,
    (rawDalejImg.height - s)/2,
    s, s,
    0, 0, s, s
  );
  let maskG = createGraphics(s, s);
  maskG.noStroke(); maskG.fill(255);
  maskG.circle(s/2, s/2, s);
  dalejImg.mask(maskG);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(windowWidth, windowHeight);
  snapImageButton.position(windowWidth / 2 - BTN_DIAMETER / 2, windowHeight - 80 - BTN_DIAMETER / 2);
}

function draw() {
  imageMode(CORNER);
  image(snapCount >= 6 ? selfieBg2 : selfieBg, 0, 0, width, height);

  if (loading) {
    drawLoadingScreen();
  } else {
    if (showDalej) {
      imageMode(CORNER);
      image(selfieBg2, 0, 0, width, height);
      drawDalejButton();
    } else if (snapCount < 6) {
      drawMaskedCamera();
      drawFaceOverlay();
      // Wyświetl tylko tekst końcowy, nie losowe komunikaty
      if (messageText === "Niech będzie to.") {
        drawCenteredMessageAboveButton(messageText);
      }
    }
  }

  drawGlitter();

  imageMode(CENTER);
  image(flowerMouse, mouseX, mouseY, 32, 32);
}

function takeSnapshot() {
  snapCount++;
  snapshot = video.get();
  captureReady = false;
  snapImageButton.hide();

  if (snapCount === 3) {
    messageText = "Niech będzie to.";
    speak(messageText);
    loading = true;
  } else {
    // Losowy komunikat tylko czytany, nie wyświetlany
    let msg = random(messages);
    messageText = ""; // nie pokazuj na ekranie
    speak(msg);
    messageSide = !messageSide;
    setTimeout(() => {
      captureReady = true;
      snapImageButton.show();
      messageText = "";
    }, 2000);
  }
}

function drawMaskedCamera() {
  const w = 250, h = 320, cx = width/2, cy = height/2;
  let camImg = captureReady ? video.get() : snapshot;
  if (!camImg) return;

  let g = createGraphics(w, h);
  g.imageMode(CENTER);
  g.image(camImg, w/2, h/2, w, h);

  let m = createGraphics(w, h);
  m.noStroke(); m.fill(255);
  m.ellipse(w/2, h/2, w, h);

  g.loadPixels(); m.loadPixels();
  for (let i = 0; i < g.pixels.length; i += 4) {
    g.pixels[i+3] = m.pixels[i];
  }
  g.updatePixels();

  push();
    imageMode(CENTER);
    image(g, cx, cy);
  pop();
}

function drawFaceOverlay() {
  noFill();
  stroke(0);
  ellipse(width/2, height/2, 250, 320);
}

function drawLoadingScreen() {
  fill(0);
  textSize(28);
  textAlign(CENTER, CENTER);
  text("Sprawdzanie Twojej kobiecości", width/2, height/2 - 80);

  stroke(0); noFill();
  rect(width/2 - 200, height/2, 400, 30);
  noStroke(); fill(0);
  rect(width/2 - 200, height/2, loadingProgress * 4, 30);

  loadingProgress += 0.5;
  if (loadingProgress >= 100) {
    loading = false;
    loadingProgress = 0;
    captureReady = false;
    snapImageButton.hide();
    showDalej = true;  // od teraz w draw() rysujemy DALEJ + komunikat
  }
}

function drawCenteredMessageAboveButton(txt) {
  fill(0);
  textSize(28);
  textAlign(CENTER, CENTER);
  let y = height / 2 - BTN_DIAMETER;
  text(txt, width/2, y);
}

function drawDalejButton() {
  // Przycisk Dalej zawsze na środku ekranu
  let over = dist(mouseX, mouseY, width/2, height/2) < BTN_DIAMETER/2;
  let d = over ? BTN_DIAMETER * HOVER_SCALE : BTN_DIAMETER;
  push();
    imageMode(CENTER);
    image(dalejImg, width/2, height/2, d, d);
  pop();
}

function mousePressed() {
  // Kliknięcie w środek ekranu na przycisk Dalej
  if (showDalej && dist(mouseX, mouseY, width/2, height/2) < BTN_DIAMETER/2) {
    if (glimmerSound && glimmerSound.isLoaded()) glimmerSound.play();
    for (let i = 0; i < 18; i++) {
      glitter.push({
        x: mouseX, y: mouseY,
        size: random(3,7),
        angle: random(TWO_PI),
        life: 0, maxLife: random(20,40),
        color: color(random(180,255), random(120,200), random(200,255),200)
      });
    }
    setTimeout(() => {
      window.location.href = "https://mp123-dot.github.io/scena9/";
    }, 400);
  }
}

function drawGlitter() {
  for (let i = glitter.length - 1; i >= 0; i--) {
    let g = glitter[i];
    noStroke(); fill(g.color);
    ellipse(g.x, g.y, g.size);
    g.life++;
    g.x += cos(g.angle)*1.5;
    g.y += sin(g.angle)*1.5;
    if (g.life > g.maxLife) glitter.splice(i,1);
  }
}

function speak(txt) {
  let u = new SpeechSynthesisUtterance(txt);
  u.lang = txt.toLowerCase().includes("#ugly") ? "en-US" : "pl-PL";
  speechSynthesis.speak(u);
}
