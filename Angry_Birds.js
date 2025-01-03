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
  detector;

function preload() {
  slingshotImg = loadImage("img/slignshot.png");
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
  updateCollisions();
  Engine.update(engine);
  updateBird();
  slingshot.fly(mc);

  map.update();
  for (const pig of map.pigs) {
    pig.update(bird[0], map);
  }
  slingshot.show();
  for (const b of bird) {
    b.update(map, slingshot);
    b.show();
  }

  slingshot.showUpperPart();
  map.show();
  ground.show();
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
}
