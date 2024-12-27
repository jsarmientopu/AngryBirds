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
  bird = [];

function preload() {
  backgroundSpriteSheet = loadImage("img/background.png");
  objSpriteSheet = loadImage("img/objTexture.png");
  birdsSpriteSheet = loadImage("img/objTexture.png");
  slingshotImg = loadImage("img/slignshot.png");
  spriteSheet = new SpriteSheet(
    backgroundSpriteSheet,
    birdsSpriteSheet,
    objSpriteSheet
  );
  spriteSheet.loadSprites();
}

function setup() {
  const canvas = createCanvas(windowWidth / 1, windowHeight / 1);

  // boxImg = loadImage("img/box.png");

  engine = Engine.create();
  world = engine.world;

  const mouse = Mouse.create(canvas.elt);
  mouse.pixelRatio = pixelDensity();
  mc = MouseConstraint.create(engine, {
    mouse: mouse,
    collisionFilter: { mask: 2 },
  });
  World.add(world, mc);

  ground = new Ground(width / 2, height - 75, width, 150);

  // for (let i = 0; i <= 6; i++) {
  //   let box = new Box((2 * width) / 3, height - 40 * (i + 1), 60, 60, +);
  //   boxes.push(box);

  //   box = new Box((2 * width) / 3 + 60, height - 40 * (i + 1), 60, 60, boxImg);
  //   boxes.push(box);
  // }

  birdsLevel = 5;

  for (let i = 0; i < birdsLevel; i++) {
    let kind = "red";
    if (random() > 0.5) {
      kind = "yellow";
    }
    bird.push(
      new Bird(
        width / 5 - i * 55 - (i == 0 ? 0 : 50),
        i == 0 ? (5 * height) / 8 : height - 175,
        25,
        spriteSheet.getSprite(kind)
      )
    );
  }

  slingshot = new SlingShot(bird[0], slingshotImg);

  map = new Map(createVector((2 * width) / 3, height - 150));
}

function draw() {
  background(spriteSheet.getSprite("sky"));

  Engine.update(engine);
  nextBird();
  slingshot.fly(mc);

  slingshot.show();
  for (const b of bird) {
    b.show();
  }

  slingshot.showUpperPart();
  map.show();
  ground.show();
}

function nextBird() {
  if (
    (slingshot.attached() == null && bird[0].stop()) ||
    bird[0].body.position.x > width
  ) {
    let bird_0 = bird[0];
    bird.splice(0, 1);
    console.log("BIRD", bird);
    bird_0.clear();
    bird[0].setPosition(width / 5, (5 * height) / 8);
    console.log("BIRD", bird.collisionFilter);
    slingshot.attach(bird[0]);
  }
}
