const STATUS = Object.freeze({
  IDLE: "IDLE",
  JUMPING: "JUMPING",
  LOADED: "LOADED",
  FLYING: "FLYING",
  IMPACT: "IMPACT",
});

const categoryBird = 0x0002;

const LIFETIME = Object.freeze({
  FIRST: 1,
  SECOND: 2,
  THIRD: 3,
});

function convtoLIFETIME(value) {
  for (const f of Object.keys(LIFETIME)) {
    if (LIFETIME[f] == value) {
      return f;
    }
  }
  return null;
}

class Entity {
  constructor(x, y, r, img, options) {
    this.body = Bodies.circle(x, y, r, options);
    Body.setMass(this.body, 2);
    World.add(world, this.body);
    this.img = img;
    this.status = STATUS.IDLE;
    this.counter = 0;
    this.lastVelocity;
  }

  setPosition(x, y) {
    Body.setPosition(this.body, createVector(x, y));
  }

  show() {
    push();
    translate(this.body.position.x, this.body.position.y);
    const i = spriteSheet.getSprite(
      this.img.includes("ig")
        ? this.img + ceil(this.life) + this.status
        : this.img + this.status
    );
    if (i) {
      imageMode(CENTER);
      rotate(this.body.angle);
      image(i, 0, 0, 2 * this.body.circleRadius, 2 * this.body.circleRadius);
    } else {
      ellipseMode(CENTER);
      ellipse(0, 0, 2 * this.body.circleRadius, 2 * this.body.circleRadius);
    }
    pop();

    if (this.img.includes("ig")) {
      push();
      translate(
        this.body.position.x - (1.1 * this.body.circleRadius) / 2,
        this.body.position.y - this.body.circleRadius - 5
      );
      rect(0, 0, 1.1 * this.body.circleRadius, 3);
      noStroke();
      fill("red");
      rect(0, 0, (this.life * 1.1 * this.body.circleRadius) / 3, 3);
      pop();
    }
  }

  clear() {
    World.remove(world, this.body);
  }
}

class Bird extends Entity {
  constructor(x, y, r, img) {
    super(x, y, r, img, {
      restitution: 0.5,
      collisionFilter: { category: categoryBird, mask: ~categoryBird },
    });
  }

  update(map, slignshot) {
    switch (this.status) {
      case STATUS.IDLE:
        if (this.body.position.y >= height - 175) {
          this.counter++;
        }
        if (this.counter > random(100, 500)) {
          this.status = STATUS.JUMPING;
          this.counter = 0;
        }
        Body.setAngularVelocity(this.body, 0);
        Body.setVelocity(this.body, { x: 0, y: this.body.velocity.y });
        break;
      case STATUS.JUMPING:
        this.counter++;
        if (this.counter == 1) {
          Body.setPosition(this.body, {
            x: this.body.position.x,
            y: this.body.position.y,
          });
        }
        if (this.counter > 20) {
          this.status = STATUS.IDLE;
          this.counter = 0;
          Body.applyForce(this.body, this.body.position, { x: 0, y: -0.05 });
        }
        break;
      case STATUS.LOADED:
        if (slignshot.sling.bodyB == null) {
          this.status = STATUS.FLYING;
        }
      default:
        if (abs(this.body.velocity.x) > 0 && abs(this.body.velocity.y) > 0) {
          this.lastVelocity = this.body.velocity;
        }
        for (const box of map.boxes) {
          if (
            Collision.collides(this.body, box.body) != null &&
            (abs(this.lastVelocity.x) > gap || abs(this.lastVelocity.y) > gap)
          ) {
            this.status = STATUS.IMPACT;
            box.collition(
              map,
              max((abs(this.lastVelocity.x), abs(this.lastVelocity.y)))
            );
          }
        }
    }
  }

  stop() {
    return abs(this.body.velocity.x) < 10e-4;
  }
}

class Pig extends Entity {
  constructor(x, y, r, type) {
    super(x, y, r, type, {
      restitution: 0.5,
    });
    this.life = 3;
  }

  update(bird, map) {
    if (Collision.collides(this.body, bird.body) != null) {
      this.status = STATUS.IDLE;
      this.life -= 1;
      if (this.life <= 0) {
        map.removePig(this.body);
        this.clear();
      }
    }
    switch (this.status) {
      case STATUS.IDLE:
        this.counter++;
        if (this.counter > random(200, 500)) {
          this.status = STATUS.JUMPING;
          this.counter = 0;
        }
        break;
      case STATUS.JUMPING:
        this.counter++;
        if (this.counter > 20) {
          this.status = STATUS.IDLE;
          this.counter = 0;
        }
        break;
    }
  }
}

class Box {
  constructor(x, y, w, h, type = "glass", options = {}) {
    switch (type) {
      case "stone":
        options = { ...options, friction: 2, density: 0.05 };
        this.life = 3;
        break;
      case "glass":
        options = { ...options, friction: 0.5, density: 0.01 };
        this.life = 1;
        break;
      case "wood":
        options = { ...options, friction: 0.5, density: 0.01 };
        this.life = 2;
        break;
    }
    console.log("Vay", type, this.life);
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.w = w;
    this.h = h;
    this.img =
      w != h ? (w < 3 * h && h < 3 * w ? type + "Sm" : type) : type + "Sqr";
    World.add(world, this.body);
    this.status = LIFETIME.FIRST;
  }

  collition(map, damage) {
    if (this.status >= this.life) {
      map.removeBox(this.body);
      World.remove(world, this.body);
    } else {
      const newVal = this.status + 1 + damage;
      this.status = LIFETIME[convtoLIFETIME(ceil(newVal > 3 ? 3 : newVal))];
    }
  }

  show() {
    const i = spriteSheet.getSprite(
      this.img == "ground" ? this.img : this.img + this.status
    );
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);

    if (i) {
      imageMode(CENTER);
      if (this.img != "ground" && this.w < this.h) {
        rotate(PI / 2);
        image(i, 0, 0, this.h, this.w);
      } else {
        image(i, 0, 0, this.w, this.h);
      }
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
    this.pigs = [];
    this.loadMap();
    this.loadEntities();
  }

  loadTextures() {
    spriteSheet.loadTexture();
  }

  loadEntities() {
    this.pigs.push(new Pig(this.center.x, this.center.y, 40, "kingPig"));
    this.pigs.push(new Pig(this.center.x - 195, this.center.y, 35, "pig"));
    this.pigs.push(new Pig(this.center.x + 195, this.center.y, 35, "pig"));
    this.pigs.push(
      new Pig(this.center.x - 195, this.center.y - 160, 35, "pig")
    );
    this.pigs.push(
      new Pig(this.center.x + 195, this.center.y - 160, 35, "pig")
    );
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

  update() {
    for (const pig of this.pigs) {
      for (const box of this.boxes) {
        if (
          Collision.collides(pig.body, box.body) != null &&
          (box.body.velocity.x > gap ||
            box.body.velocity.y > gap ||
            pig.body.velocity.x > gap ||
            pig.body.velocity.y > gap)
        ) {
          const red = max(
            abs(box.body.velocity.x),
            abs(box.body.velocity.y),
            abs(pig.body.velocity.x),
            abs(pig.body.velocity.y)
          );
          pig.life -= red / (gap * 20);
          if (pig.life <= 0) {
            map.removePig(pig.body);
            pig.clear();
          }
        }
      }
    }

    if (this.pigs.length <= 0) {
      console.log("VICTORIA");
      noLoop();
    }
  }

  removeBox(box) {
    let index;
    for (let i = 0; i < this.boxes.length; i++) {
      if (this.boxes[i].body == box) {
        index = i;
        break;
      }
    }
    this.boxes.splice(index, 1);
  }

  removePig(pig) {
    let index;
    for (let i = 0; i < this.pigs.length; i++) {
      if (this.pigs[i].body == pig) {
        index = i;
        break;
      }
    }
    this.pigs.splice(index, 1);
  }

  show() {
    for (const box of this.boxes) {
      box.show();
    }

    for (const pig of this.pigs) {
      pig.show();
    }
  }
}
