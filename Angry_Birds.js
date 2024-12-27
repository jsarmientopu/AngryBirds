const {
  Engine,
  World,
  Bodies,
  Mouse,
  MouseConstraint,
  Body,
  Constraint,
  Events,
} = Matter;

let engine,
  world,
  ground,
  boxes = [],
  boxImg,
  slingshotImg,
  birdImg = [],
  slingshot,
  mc,
  spriteSheet,
  map;

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

  boxImg = loadImage("img/box.png");
  birdImg = [loadImage("img/red.png"), loadImage("img/yellow.png")];

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

  bird = new Bird(width / 5, (5 * height) / 8, 25, birdImg[0]);

  slingshot = new SlingShot(bird, slingshotImg);

  map = new Map(createVector((2 * width) / 3, height - 150));

  //Events.on(
  //   engine,
  //  'afterUpdate',
  //  ()=> slingshot.fly(mc)
  //);
}

function draw() {
  // background("#C6E7FF");

  background(spriteSheet.getSprite("sky"));

  Engine.update(engine);
  nextBird();
  slingshot.fly(mc);

  for (const box of boxes) {
    box.show();
  }

  slingshot.show();
  bird.show();
  map.show();
  ground.show();
}

function nextBird() {
  if (
    (slingshot.attached() == null && bird.stop()) ||
    bird.body.position.x > width
  ) {
    bird.clear();

    const index = floor(random(0, birdImg.length));

    bird = new Bird(width / 5, height - 400, 25, birdImg[index]);
    slingshot.attach(bird);
  }
}
