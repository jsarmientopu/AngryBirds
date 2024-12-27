class Bird {
  constructor(x, y, r, img) {
    this.body = Bodies.circle(x, y, r, {
      restitution: 0.5,
      collisionFilter: { category: 2 },
    });
    Body.setMass(this.body, 2);
    World.add(world, this.body);
    this.img = img;
  }

  setPosition(x, y) {
    Body.setPosition(this.body, createVector(x, y));
  }

  show() {
    push();
    translate(this.body.position.x, this.body.position.y);
    if (this.img) {
      imageMode(CENTER);
      rotate(this.body.angle);
      image(
        this.img,
        0,
        0,
        2 * this.body.circleRadius,
        2 * this.body.circleRadius
      );
    } else {
      ellipseMode(CENTER);
      ellipse(0, 0, 2 * this.body.circleRadius, 2 * this.body.circleRadius);
    }
    pop();
  }

  clear() {
    World.remove(world, this.body);
  }

  stop() {
    return abs(this.body.velocity.x) < 10e-4;
  }
}

class Box {
  constructor(x, y, w, h, type = "stone", options = {}) {
    this.img = spriteSheet.getSprite(type);
    switch (type) {
      case "stone":
        options = { ...options, friction: 2, density: 0.05 };
        this.life = 3;
      case "glass":
        options = { ...options, friction: 0.5, density: 0.01 };
        this.life = 1;
      case "wood":
        options = { ...options, friction: 0.5, density: 0.01 };
        this.life = 2;
    }
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.w = w;
    this.h = h;
    World.add(world, this.body);
  }

  show() {
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);

    if (this.img) {
      imageMode(CENTER);
      image(this.img, 0, 0, this.w, this.h);
    } else {
      rectMode(CENTER);
      rect(0, 0, this.w, this.h);
    }

    pop();
  }
}

class Ground extends Box {
  constructor(x, y, w, h, type) {
    super(x, y, w, h, "ground", { isStatic: true });
  }
}

class SlingShot {
  constructor(bird, img) {
    this.bird = bird;
    this.sling = Constraint.create({
      pointA: { x: bird.body.position.x, y: bird.body.position.y },
      bodyB: bird.body,
      length: 5,
      stiffness: 0.01,
    });
    World.add(world, this.sling);
    this.img = img;
  }

  show() {
    if (this.sling.bodyB) {
      push();
      strokeWeight(10);
      stroke("#40140c"),
        line(
          this.sling.pointA.x + 30,
          this.sling.pointA.y,
          this.sling.bodyB.position.x,
          this.sling.bodyB.position.y
        );

      strokeWeight(30);
      line(
        this.sling.bodyB.position.x,
        this.sling.bodyB.position.y,
        this.sling.bodyB.position.x +
          (this.sling.pointA.x > this.sling.bodyB.position.x - 30 ? -25 : 25),
        this.sling.bodyB.position.y
      );
      pop();
    } else {
      push();
      fill("#40140c"),
        translate(this.sling.pointA.x - 10, this.sling.pointA.y - 5);
      rect(0, 0, 60, 20);
      pop();
    }
  }

  showUpperPart() {
    push();
    if (this.sling.bodyB) {
      strokeWeight(10);
      stroke("#40140c"),
        line(
          this.sling.pointA.x - 30,
          this.sling.pointA.y,
          this.sling.bodyB.position.x +
            (this.sling.pointA.x > this.sling.bodyB.position.x - 30 ? -25 : 25),
          this.sling.bodyB.position.y
        );
    }
    translate(this.sling.pointA.x, (13 * height) / 16 - 75);

    if (this.img) {
      imageMode(CENTER);
      image(this.img, 0, 0, 100, 330);
    } else {
      rectMode(CENTER);
      rect(0, 0, this.w, this.h);
    }
    pop();
  }

  fly(mc) {
    if (
      this.sling.bodyB &&
      mc.mouse.button === -1 &&
      this.sling.bodyB.position.x > this.sling.pointA.x + 10
    ) {
      this.sling.bodyB.collisionFilter.category = 1;
      this.sling.bodyB = null;
    }
  }

  attach(bird) {
    this.sling.bodyB = bird.body;
  }

  attached() {
    return this.sling.bodyB;
  }
}

class Map {
  constructor(center) {
    this.center = center;
    this.boxes = [];
    // this.loadTextures();
    this.loadMap();
  }

  loadTextures() {
    spriteSheet.loadTexture();
  }

  loadMap() {
    //Main sides

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        this.boxes.push(
          new Box(
            this.center.x - 250 + i * 390,
            this.center.y - j * 200,
            20,
            120
          )
        );
        this.boxes.push(
          new Box(
            this.center.x - 140 + i * 390,
            this.center.y - j * 200,
            20,
            120
          )
        );
        this.boxes.push(
          new Box(
            this.center.x - 195 + i * 390,
            this.center.y - 130 - j * 180,
            140,
            20
          )
        );
        this.boxes.push(
          new Box(
            this.center.x - 195 + i * 390,
            this.center.y - 150 - j * 180,
            140,
            20
          )
        );
      }
    }

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 3; j++) {
        this.boxes.push(
          new Box(
            this.center.x - 245 + j * 50 + i * 390,
            this.center.y - 335,
            30,
            30
          )
        );
      }
    }

    //Center
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 4; j++) {
        this.boxes.push(
          new Box(
            this.center.x - 95 + i * 190 + (i > 0 ? j * 10 : -j * 10),
            this.center.y - 15,
            70,
            30
          )
        );
      }
      this.boxes.push(
        new Box(this.center.x - 50 + i * 100, this.center.y - 45, 20, 90)
      );
      this.boxes.push(
        new Box(this.center.x, this.center.y - 90 - i * 15, 100, 10)
      );
      this.boxes.push(
        new Box(this.center.x, this.center.y - 140 - i * 20, 260, 20)
      );
    }

    for (let i = 0; i < 4; i++) {
      this.boxes.push(
        new Box(this.center.x - 100, this.center.y - 180 - i * 20, 40, 40)
      );
      this.boxes.push(
        new Box(this.center.x + 100, this.center.y - 180 - i * 20, 40, 40)
      );

      this.boxes.push(
        new Box(this.center.x, this.center.y - 180 - i * 20, 40, 40)
      );
    }
  }

  show() {
    for (const box of this.boxes) {
      box.show();
    }
  }
}
