const {
  Engine,
  World,
  Bodies,
  Mouse,
  MouseConstraint,
  Body,
  Constraint,
  Events,
  Composite,
  Composites,
  Collision,
  Detector,
  Vector,
} = Matter;

let engine,
  world,
  ground,
  slingshotImg,
  slingshot,
  mc,
  spriteSheet,
  map,
  birdsLevel,
  bird = [],
  gap = 5,
  flag = false,
  counter = 0,
  detector,
  pauseImg,
  unpauseImg,
  isPaused = false;

let gameState = "playing"; // can be "playing", "won", or "lost"
let stars = [];
let blackStars = [];
let retryImg;
let starAnimationStart = 0;
const STAR_ANIMATION_DELAY = 300;

function preload() {
  stars = [
    loadImage("img/star1.png"),
    loadImage("img/star2.png"),
    loadImage("img/star3.png")
  ];
  blackStars = [
    loadImage("img/blackstar1.png"),
    loadImage("img/blackstar2.png"),
    loadImage("img/blackstar3.png")
  ];
  retryImg = loadImage("img/retry.png");
  slingshotImg = loadImage("img/slignshot.png");
  pauseImg = loadImage("img/pause.png");
  unpauseImg = loadImage("img/unpause.png");
  spriteSheet = new SpriteSheet();
  spriteSheet.loadSprites();
}

function setup() {
  const canvas = createCanvas(windowWidth / 1, windowHeight / 1);

  engine = Engine.create();
  Engine.velocityIterations = 10;
  world = engine.world;

  const mouse = Mouse.create(canvas.elt);
  mouse.pixelRatio = pixelDensity();
  mc = MouseConstraint.create(engine, {
    mouse: mouse,
    collisionFilter: { mask: 2 },
  });
  World.add(world, mc);

  ground = new Ground(width / 2, height - 75, width, 150);

  birdsLevel = 2;

  for (let i = 0; i < birdsLevel; i++) {
    let kind = "red";
    if (random() > 0.5) {
      kind = "yellow";
    }
    bird.push(
      new Bird(
        width / 5 - i * 55 - (i == 0 ? 0 : 10),
        i == 0 ? (5 * height) / 8 : height - 175,
        25,
        kind
      )
    );
  }

  bird[0].status = STATUS.LOADED;

  slingshot = new SlingShot(bird[0], slingshotImg);

  map = new Map(createVector((2 * width) / 3, height - 150));

  Events.on(engine, "afterUpdate", () => {
    // console.log(Constraint.currentLength(slingshot.sling));
    slingshot.sling.stiffness = min(
      1,
      Constraint.currentLength(slingshot.sling) > 0
        ? Constraint.currentLength(slingshot.sling) / 3000
        : 0.01
    );

    // console.log(slingshot.sling.stiffness);
  });

  detector = Detector.create();
  World.add(world, detector);
}

function updateCollisions() {
  Detector.setBodies(detector, [
    ...map.boxes.map((x) => x.body),
    ...map.pigs.map((x) => x.body),
    ...bird.map((x) => x.body),
  ]);
}

function draw() {
  background(spriteSheet.getSprite("sky"));

  // Add semi-transparent overlay when paused
  if (isPaused) {
    push();
    fill(0, 0, 0, 127);
    rect(0, 0, width, height);
    pop();
  }

  if (gameState === "playing" && !isPaused) {
    updateCollisions();
    Engine.update(engine);
    updateBird();
    slingshot.fly(mc);
    map.update();
    for (const pig of map.pigs) {
      pig.update(bird[0], map);
    }
    checkGameEnd();
  }
  // if (!isPaused) {
  //   updateCollisions();
  //   Engine.update(engine);
  //   updateBird();
  //   slingshot.fly(mc);
  //   map.update();
  //   for (const pig of map.pigs) {
  //     pig.update(bird[0], map);
  //   }
  // }

  // Continue rendering even when paused
  slingshot.show();
  for (const b of bird) {
    b.show();
  }

  slingshot.showUpperPart();
  map.show();
  ground.show();
  if (gameState === "won" || gameState === "lost") {
    drawEndScreen();
  }

  // Draw pause/unpause button
  push();
  imageMode(CENTER);
  const buttonSize = 50;
  const buttonX = width - buttonSize - 20;
  const buttonY = buttonSize + 20;

  if (isPaused) {
    image(unpauseImg, buttonX, buttonY, buttonSize, buttonSize);
  } else {
    image(pauseImg, buttonX, buttonY, buttonSize, buttonSize);
  }
  pop();
}

function updateBird() {
  if (
    ((slingshot.attached() == null && bird[0].stop()) ||
      bird[0].body.position.x > width ||
      bird[0].body.position.x < 0) &&
    bird.length > 1
  ) {
    flag = true;
  }

  if (flag) {
    counter++;
  }

  if (counter > 10 && flag) {
    let bird_0 = bird[0];
    bird.splice(0, 1);
    bird_0.clear();
    bird[0].setPosition(width / 5, (5 * height) / 8);
    bird[0].status = STATUS.LOADED;
    slingshot.attach(bird[0]);
    counter = 0;
    flag = false;
  }

  // Check game end separately
  checkGameEnd();
}


function drawEndScreen() {
  // Draw semi-transparent background
  push();
  fill(0, 0, 0, 127);
  rectMode(CENTER);
  rect(width/2, height/2, width/3, height);
  
  // Draw text
  textSize(60);
  textAlign(CENTER, CENTER);
  fill(255);
  text(gameState === "won" ? "LEVEL CLEARED!" : "LEVEL LOST!", width/2, height/3 - height/4);

  // Calculate positions for stars
  const starSize = 150;
  const starSpacing = starSize * 1.2;
  const startX = width/2 - 1.5* starSpacing;
  const starY = height/2 - height/4;
  
  // Draw stars with animation
  const currentTime = millis();
  const starImages = gameState === "won" ? stars : blackStars;
  
  for (let i = 0; i < 3; i++) {
    if (currentTime - starAnimationStart > i * STAR_ANIMATION_DELAY) {
      image(
        starImages[i], 
        startX + i * starSpacing, 
        starY, 
        starSize, 
        starSize
      );
    }
  }

  // Draw retry button
  const buttonSize = 90;
  image(retryImg, width/2 -buttonSize/2, height * 2/3, buttonSize, buttonSize);
  pop();
}


// Add this new function to handle mouse clicks
function mousePressed() {
  if (gameState !== "playing") {
    const buttonSize2 = 60;
    if (
      mouseX > width/2 - buttonSize2/2 &&
      mouseX < width/2 + buttonSize2/2 &&
      mouseY > height * 2/3 - buttonSize2/2 &&
      mouseY < height * 2/3 + buttonSize2/2
    ) {
      resetGame();
    }
  }

  const buttonSize = 50;
  const buttonX = width - buttonSize - 20;
  const buttonY = buttonSize + 20;

  // Check if click is within button bounds
  if (
    mouseX > buttonX - buttonSize / 2 &&
    mouseX < buttonX + buttonSize / 2 &&
    mouseY > buttonY - buttonSize / 2 &&
    mouseY < buttonY + buttonSize / 2
  ) {
    isPaused = !isPaused;

    if (isPaused) {
      // Store current velocities when pausing
      bird.forEach(b => {
        b.storedVelocity = { ...b.body.velocity };
        Body.setVelocity(b.body, { x: 0, y: 0 });
      });
      map.boxes.forEach(box => {
        box.storedVelocity = { ...box.body.velocity };
        Body.setVelocity(box.body, { x: 0, y: 0 });
      });
      map.pigs.forEach(pig => {
        pig.storedVelocity = { ...pig.body.velocity };
        Body.setVelocity(pig.body, { x: 0, y: 0 });
      });
    } else {
      // Restore velocities when unpausing
      bird.forEach(b => {
        if (b.storedVelocity) {
          Body.setVelocity(b.body, b.storedVelocity);
        }
      });
      map.boxes.forEach(box => {
        if (box.storedVelocity) {
          Body.setVelocity(box.body, box.storedVelocity);
        }
      });
      map.pigs.forEach(pig => {
        if (pig.storedVelocity) {
          Body.setVelocity(pig.body, pig.storedVelocity);
        }
      });
    }
  }
}


function checkGameEnd() {
  // Win condition: all pigs are eliminated
  if (map.pigs.length <= 0) {
    gameState = "won";
    starAnimationStart = millis();
  }
  
  // Lose condition: last bird used and stopped or out of bounds
  let lastBirdInactive = bird.length === 1 && 
    slingshot.attached() == null && 
    (bird[0].stop() || 
     bird[0].body.position.x > width || 
     bird[0].body.position.x < 0 || 
     bird[0].body.position.y > height);
  
  if ((bird.length === 0 || lastBirdInactive) && map.pigs.length > 0) {
    gameState = "lost";
    starAnimationStart = millis();
  }
}


function resetGame() {
  // Remove all existing bodies from the world
  World.clear(world);
  
  // Reset arrays
  bird = [];
  map.boxes = [];
  map.pigs = [];
  
  // Reset game state
  gameState = "playing";
  
  // Recreate the initial setup
  ground = new Ground(width / 2, height - 75, width, 150);
  
  // Recreate birds
  birdsLevel = 7;
  for (let i = 0; i < birdsLevel; i++) {
    let kind = "red";
    if (random() > 0.5) {
      kind = "yellow";
    }
    bird.push(
      new Bird(
        width / 5 - i * 55 - (i == 0 ? 0 : 10),
        i == 0 ? (5 * height) / 8 : height - 175,
        25,
        kind
      )
    );
  }
  
  bird[0].status = STATUS.LOADED;
  slingshot = new SlingShot(bird[0], slingshotImg);
  
  // Recreate map
  map = new Map(createVector((2 * width) / 3, height - 150));
  
  // Add mouse constraint back
  World.add(world, mc);
}
