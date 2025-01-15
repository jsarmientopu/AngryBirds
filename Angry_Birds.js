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
  mc,
  spriteSheet,
  birdsLevel = 6, //Birs in the level
  gap = 5, //Sensibility of the game (Collisions, detentions)
  detector;

let gameState = "playing"; // can be "playing", "won", or "lost"
let stars = [];
let blackStars = [];
let retryImg;
let starAnimationStart = 0;
const STAR_ANIMATION_DELAY = 300;

function preload() {
  spriteSheet = new SpriteSheet();
  spriteSheet.loadSprites();
}

function setup() {
  const canvas = createCanvas(windowWidth / 1, windowHeight / 1);

  engine = Engine.create();
  world = engine.world;

  game = new AngryBirds(width, height, birdsLevel);

  //Maouse controler
  const mouse = Mouse.create(canvas.elt);
  mouse.pixelRatio = pixelDensity();
  mc = MouseConstraint.create(engine, {
    mouse: mouse,
    collisionFilter: { mask: 2 },
  });
  World.add(world, mc);

  //Colision detector
  detector = Detector.create();
  World.add(world, detector);
}

function draw() {
  background(spriteSheet.getSprite("sky"));

  game.update();

  game.draw();
}

// Add this new function to handle mouse clicks
function mousePressed() {
  console.log(game.state)
  if (game.state === GAME_STATUS.MENU) {
    // Existing menu button logic
    const playButtonSize = 313;
    const playButtonX = width / 2;
    const playButtonY = height * 0.65;
    
    if (
      mouseX > playButtonX - playButtonSize / 2 &&
      mouseX < playButtonX + playButtonSize / 2 &&
      mouseY > playButtonY - playButtonSize / 2 &&
      mouseY < playButtonY + playButtonSize / 2
    ) {
      game.startGame();
    }
  } else {
    // Handle retry button click (always visible)
    const buttonSize = 90;
    const retryX = width - (2.2 * buttonSize); // Position for retry button
    const retryY = buttonSize;

    if (
      mouseX > retryX - buttonSize / 2 &&
      mouseX < retryX + buttonSize / 2 &&
      mouseY > retryY - buttonSize / 2 &&
      mouseY < retryY + buttonSize / 2
    ) {
      game.resetGame();
      return;
    }

    // Handle pause/continue button
    const pauseX = width - buttonSize;
    const pauseY = buttonSize;
    
    if (
      mouseX > pauseX - buttonSize / 2 &&
      mouseX < pauseX + buttonSize / 2 &&
      mouseY > pauseY - buttonSize / 2 &&
      mouseY < pauseY + buttonSize / 2
    ) {
      game.click();
    }

    // Handle win/lose/pause state buttons
    if (game.state !== GAME_STATUS.PLAYING) {
      const centerButtonSize = 90;
      if (
        mouseX > width / 2 - centerButtonSize / 2 &&
        mouseX < width / 2 + centerButtonSize / 2 &&
        mouseY > (height * 2) / 3 - centerButtonSize / 2 &&
        mouseY < (height * 2) / 3 + centerButtonSize / 2
      ) {
        if (game.state === GAME_STATUS.LOST || game.state === GAME_STATUS.WON) {
          game.resetGame();
        } else {
          game.continue();
        }
      }
    }
  }
}

const GAME_STATUS = Object.freeze({
  INIT: "INITIATED",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  WON: "WON",
  LOST: "LOST",
  MENU: "MENU",
});

class Game {
  constructor(width, height, birdsLevel) {
    this.ground = new Ground(width / 2, height - 75, width, 150);

    this.map = new Map(createVector((2 * width) / 3, height - 150));

    this.birdsLevel = birdsLevel;

    this.birds = [];

    this.generateBirds();

    this.birds[0].status = STATUS.LOADED;

    this.slingshot = new SlingShot(
      this.birds[0],
      loadImage("img/slignshot.png")
    );

    // Event handle slingshot max length
    Events.on(engine, "afterUpdate", () => {
      this.slingshot.sling.stiffness = min(
        1,
        Constraint.currentLength(this.slingshot.sling) > 0
          ? Constraint.currentLength(this.slingshot.sling) / 3000
          : 0.01
      );
    });
  }

  generateBirds() {
    //Generate random bird (Red or Yellow)
    for (let i = 0; i < this.birdsLevel; i++) {
      let kind = "red";
      if (random() > 0.5) {
        kind = "yellow";
      }
      this.birds.push(
        new Bird(
          width / 5 - i * 55 - (i == 0 ? 0 : 10),
          i == 0 ? (5 * height) / 8 : height - 175,
          25,
          kind
        )
      );
    }
  }

  updateCollisionDetector() {
    Detector.setBodies(detector, [
      ...this.map.boxes.map((x) => x.body),
      ...this.map.pigs.map((x) => x.body),
      ...this.birds.map((x) => x.body),
    ]);
  }

  pause() {
    // Store current velocities when pausing
    this.birds.forEach((b) => {
      b.storedVelocity = { ...b.body.velocity };
      Body.setVelocity(b.body, { x: 0, y: 0 });
    });
    this.map.boxes.forEach((box) => {
      box.storedVelocity = { ...box.body.velocity };
      Body.setVelocity(box.body, { x: 0, y: 0 });
    });
    this.map.pigs.forEach((pig) => {
      pig.storedVelocity = { ...pig.body.velocity };
      Body.setVelocity(pig.body, { x: 0, y: 0 });
    });
  }

  unpause() {
    // Restore velocities when unpausing
    this.birds.forEach((b) => {
      if (b.storedVelocity) {
        Body.setVelocity(b.body, b.storedVelocity);
      }
    });
    this.map.boxes.forEach((box) => {
      if (box.storedVelocity) {
        Body.setVelocity(box.body, box.storedVelocity);
      }
    });
    this.map.pigs.forEach((pig) => {
      if (pig.storedVelocity) {
        Body.setVelocity(pig.body, pig.storedVelocity);
      }
    });
  }

  progress() {
    return this.map.getProgress();
  }

  clear() {
    for (let b of this.birds) {
      b.clear();
    }
    this.map.clear();
    this.ground.clear();
    this.slingshot.clear();
  }

  update() {
    //Update detector with object in the world
    this.updateCollisionDetector();

    //Identify collision bird in game
    this.birds[0].update(this.map, this.slingshot);

    //Indetify collisions between boxes and pgis
    this.map.update();

    //Launch or reload the birds
    this.slingshot.fly(mc, this.birds, this.map);

    //Pigs flicker
    for (const pig of this.map.pigs) {
      pig.update();
    }
  }

  draw() {
    this.slingshot.show();

    for (const bird of this.birds) {
      bird.show();
    }

    this.slingshot.showUpperPart();

    this.map.show();

    this.ground.show();
  }
}

class AngryBirds {
  constructor(width, height, birdsLevel) {
    this.game = new Game(width, height, birdsLevel);

    this.starAnimationStart = 0;
    this.state = GAME_STATUS.MENU;
    this.loadImages();


    this.logoScale = 0;
    this.playButtonOpacity = 0;
    this.menuAnimationStarted = false;
    
    // Add button states
    this.isPaused = false;
  }

  loadImages() {
    this.stars = [
      loadImage("img/star1.png"),
      loadImage("img/star2.png"),
      loadImage("img/star3.png"),
    ];
    this.blackStars = [
      loadImage("img/blackstar1.png"),
      loadImage("img/blackstar2.png"),
      loadImage("img/blackstar3.png"),
    ];
    this.retryImg = loadImage("img/retry.png");
    this.pauseImg = loadImage("img/pause.png");
    this.unpauseImg = loadImage("img/unpause.png");
    this.logoImg = loadImage("img/logo.png");
    this.playImg = loadImage("img/play.png");
  }

  resetGame() {
    console.log("reset");
    this.game.clear();
    this.game = new Game(width, height, birdsLevel);
    this.state = GAME_STATUS.PLAYING;
    this.isPaused = false;
    console.log(this.game);
  }

  startGame() {
    this.state = GAME_STATUS.PLAYING;
    this.logoScale = 0;
    this.playButtonOpacity = 0;
    this.menuAnimationStarted = false;
    this.isPaused = false;
  }

  continue() {
    console.log("continue");
    if (this.state == GAME_STATUS.PAUSED) {
      this.game.unpause();
    }
    this.state = GAME_STATUS.PLAYING;
    this.isPaused = false;
  }

  click() {
    if (this.state == GAME_STATUS.PLAYING) {
      this.game.pause();
      this.state = GAME_STATUS.PAUSED;
      this.isPaused = true;
    }
  }

  update() {
    if (this.state === GAME_STATUS.MENU) {
      if (!this.menuAnimationStarted) {
        this.menuAnimationStarted = true;
        this.logoScale = 0;
        this.playButtonOpacity = 0;
      }
      
      // Animate logo and play button
      if (this.logoScale < 1) {
        this.logoScale += 0.05;
      } else if (this.playButtonOpacity < 255) {
        this.playButtonOpacity += 10;
      }
      
      return;
    }

    // Win condition: all pigs are eliminated
    if (
      this.game.map.pigs.length <= 0 &&
      this.state != GAME_STATUS.WON &&
      this.state != GAME_STATUS.LOST
    ) {
      this.state = GAME_STATUS.WON;
      this.starAnimationStart = millis();
    } else if (
      this.game.birds.length <= 0 &&
      this.state != GAME_STATUS.WON &&
      this.state != GAME_STATUS.LOST
    ) {
      this.state = GAME_STATUS.LOST;
      this.starAnimationStart = millis();
    }

    if (this.state == GAME_STATUS.PLAYING) {
      Engine.update(engine);

      this.game.update();
    }

    // Lose condition: last bird used and stopped or out of bounds
    // let lastBirdInactive =
    //   bird.length === 1 &&
    //   slingshot.attached() == null &&
    //   (bird[0].stop() ||
    //     bird[0].body.position.x > width ||
    //     bird[0].body.position.x < 0 ||
    //     bird[0].body.position.y > height);
  }

  draw() {
    if (this.state === GAME_STATUS.MENU) {
      // Draw menu background
      background(spriteSheet.getSprite("sky"));
      
      // Draw logo with animation
      push();
      imageMode(CENTER);
      translate(width / 2, height * 0.35);
      scale(this.logoScale);
      image(this.logoImg, 0, 0, width * 0.6, width * 0.6 * 0.3); // Adjust size ratio as needed
      pop();
      
      // Draw play button with fade-in
      push();
      imageMode(CENTER);
      tint(255, this.playButtonOpacity);
      image(this.playImg, width / 2, height * 0.65, 447, 313);
      pop();
      
      return;
    }

    this.game.draw();
    // Add semi-transparent overlay when paused
    // if (this.state == GAME_STATUS.PAUSED) {
    //   push();
    //   fill(0, 0, 0, 127);
    //   rect(0, 0, width, height);
    //   pop();
    // }

    // // Draw pause/unpause button
    // push();
    // imageMode(CENTER);
    // const buttonSize = 50;
    // const buttonX = width - buttonSize - 20;
    // const buttonY = buttonSize + 20;

    // if (isPaused) {
    //   image(unpauseImg, buttonX, buttonY, buttonSize, buttonSize);
    // } else {
    //   image(pauseImg, buttonX, buttonY, buttonSize, buttonSize);
    // }
    // pop();
    if (this.state == GAME_STATUS.PLAYING) {
      push();
      imageMode(CENTER);
      const buttonSize = 90;
      const buttonX = width - buttonSize;
      const buttonY = buttonSize;
      // image(this.pauseImg, buttonX, buttonY, buttonSize, buttonSize);
      //RESET BUTTON (DAVID)
      image(
        this.retryImg,
        buttonX - 1.2 * buttonSize,
        buttonY,
        buttonSize,
        buttonSize
      );

      // Draw pause/unpause button based on state
      image(
        this.isPaused ? this.unpauseImg : this.pauseImg,
        buttonX,
        buttonY,
        buttonSize,
        buttonSize
      );
      pop();
    } else {
      // Draw semi-transparent background
      push();
      fill(0, 0, 0, 127);
      rectMode(CENTER);
      rect(width / 2, height / 2, width / 3, height);
      // Draw text
      textSize(60);
      textAlign(CENTER, CENTER);
      fill(255);
      switch (this.state) {
        // case GAME_STATUS.INIT:
        //   text("LEVEL 1", width / 2, height / 3 - height / 4);
        //   break;
        case GAME_STATUS.PAUSED:
          text("LEVEL PAUSED!", width / 2, height / 3 - height / 4);
          break;
        case GAME_STATUS.WON:
          text("LEVEL CLEARED!", width / 2, height / 3 - height / 4);
          break;
        case GAME_STATUS.LOST:
          text("LEVEL LOST!", width / 2, height / 3 - height / 4);
          break;
      }

      const buttonSize = 90;
      switch (this.state) {
        // case GAME_STATUS.INIT:
        //   text("LEVEL 1", width / 2, height / 3 - height / 4);
        //   // Draw retry button
        //   image(
        //     this.retryImg,
        //     width / 2 - buttonSize / 2,
        //     (height * 2) / 3,
        //     buttonSize,
        //     buttonSize
        //   );
        //   pop();
        //   break;
        case GAME_STATUS.PAUSED:
          text("LEVEL PAUSED!", width / 2, height / 3 - height / 4);
          // Draw retry button
          image(
            this.unpauseImg,
            width / 2 - buttonSize / 2,
            (height * 2) / 3,
            buttonSize,
            buttonSize
          );
          pop();
          break;
        default:
          const starSize = 150;
          const starSpacing = starSize * 1.2;
          const startX = width / 2 - 1.5 * starSpacing;
          const starY = height / 2 - height / 4;

          const currentTime = millis();
          const progress = this.game.progress();

          for (let i = 0; i < 3; i++) {
            if (
              currentTime - this.starAnimationStart >
              i * STAR_ANIMATION_DELAY
            ) {
              image(
                i < progress ? this.stars[i] : this.blackStars[i],
                startX + i * starSpacing,
                starY,
                starSize,
                starSize
              );
            }
            // Draw retry button
            image(
              this.retryImg,
              width / 2 - buttonSize / 2,
              (height * 2) / 3,
              buttonSize,
              buttonSize
            );
            pop();
          }
          break;
      }
    }
  }
}
