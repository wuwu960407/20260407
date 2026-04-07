let upperPoints = [];
let lowerPoints = [];
let gameState = "START"; // 狀態：START, PLAYING, WON, LOST

function setup() {
  createCanvas(windowWidth, windowHeight);
  initPath();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initPath();
  gameState = "START"; // 視窗縮放時重置遊戲狀態以避免路徑出錯
}

function initPath() {
  upperPoints = [];
  lowerPoints = [];
  let numPoints = 5;
  for (let i = 0; i < numPoints; i++) {
    // 將寬度平均分配給 5 個點 (從左到右)
    let x = (width / (numPoints - 1)) * i;
    // 隨機產生上方點的 Y 座標 (保留上下邊距以免路徑超出畫布)
    let yTop = random(50, height - 100);
    // 下方點與上方點距離在 15 到 45 之間
    let gap = random(15, 45);
    upperPoints.push({ x: x, y: yTop });
    lowerPoints.push({ x: x, y: yTop + gap });
  }
}

function draw() {
  background(0, 50, 0);

  // 繪製路徑邊界
  stroke(0);
  strokeWeight(3);
  noFill();

  // 使用 vertex 指令串接上方 5 個點
  beginShape();
  for (let p of upperPoints) {
    vertex(p.x, p.y);
  }
  endShape();

  // 使用 vertex 指令串接下方相對應的點
  beginShape();
  for (let p of lowerPoints) {
    vertex(p.x, p.y);
  }
  endShape();

  if (gameState === "START") {
    // 開始區域 (位於左側)
    fill(0, 255, 0, 150);
    noStroke();
    rect(0, upperPoints[0].y, 40, lowerPoints[0].y - upperPoints[0].y);
    fill(0);
    textAlign(LEFT, CENTER);
    textSize(16);
    text("  點擊此處開始遊戲", 45, (upperPoints[0].y + lowerPoints[0].y) / 2);
  } else if (gameState === "PLAYING") {
    checkCollision();
    // 提示結束點 (最右側)
    fill(255, 255, 0, 100);
    noStroke();
    rect(width - 20, upperPoints[4].y, 20, lowerPoints[4].y - upperPoints[4].y);
  } else if (gameState === "WON") {
    showOverlay("挑戰成功！\n點擊畫面重玩", color(0, 150, 0));
  } else if (gameState === "LOST") {
    showOverlay("失敗了！\n點擊畫面重試", color(200, 0, 0));
  }

  // 繪製玩家當前位置指示點 (藍色小圓點)
  if (gameState === "PLAYING") {
    fill(0, 0, 255);
    noStroke();
    ellipse(mouseX, mouseY, 6, 6);
  }
}

function checkCollision() {
  // 檢查是否到達最右邊
  if (mouseX >= width - 5) {
    gameState = "WON";
    return;
  }

  // 動態找出目前滑鼠在哪一個線段中
  let segmentWidth = width / (upperPoints.length - 1);
  let i = floor(mouseX / segmentWidth);
  
  // 確保索引在安全範圍內 (0 到 3)
  if (i < 0 || i >= upperPoints.length - 1) {
    gameState = "LOST"; // 移出左右邊界
    return;
  }

  // 透過線性插值 (lerp) 找出當前 mouseX 對應的上下 Y 座標極限
  let t = (mouseX - upperPoints[i].x) / (upperPoints[i + 1].x - upperPoints[i].x);
  let limitTop = lerp(upperPoints[i].y, upperPoints[i + 1].y, t);
  let limitBottom = lerp(lowerPoints[i].y, lowerPoints[i + 1].y, t);

  // 碰撞判定：如果 mouseY 超出上下線範圍
  if (mouseY < limitTop || mouseY > limitBottom) {
    gameState = "LOST";
  }
}

function showOverlay(msg, col) {
  fill(col);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(msg, width / 2, height / 2);
}

function mousePressed() {
  if (gameState === "START") {
    // 檢查是否在左側起始區域內點擊
    if (mouseX >= 0 && mouseX <= 40 && mouseY >= upperPoints[0].y && mouseY <= lowerPoints[0].y) {
      gameState = "PLAYING";
    }
  } else if (gameState === "WON" || gameState === "LOST") {
    // 遊戲結束後點擊畫面可重新初始化路徑並回到開始狀態
    initPath();
    gameState = "START";
  }
}