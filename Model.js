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
    this.body = Bodies.circle(x, y, r, { ...options, restitution: 0.2 });
    // Body.setMass(this.body, 2);
    World.add(world, this.body);
    this.img = img;
    this.status = STATUS.IDLE;
    this.counter = 0;
    this.lastVelocity = { x: 0, y: 0 };
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
      collisionFilter: { category: categoryBird, mask: ~categoryBird },
    });
    this.launched = false;
  }

  update(map, slingshot) {
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
        if (slingshot.sling.bodyB == null) {
          this.status = STATUS.FLYING;
          this.launched = true;
        }
        break;
      default:
        let collition = Detector.collisions(detector).filter(
          (x) => x.bodyA == this.body || x.bodyB == this.body
        );
        if (collition.length == 0) {
          this.lastVelocity = Body.getVelocity(this.body);
        } else {
          for (const c of collition) {
            let objCol = c.bodyA != this.body ? c.bodyA : c.bodyB;
            let damage = Vector.magnitude(
              Vector.sub(this.lastVelocity, c.tangent)
            );
            this.status = STATUS.IMPACT;
            map.collition(objCol, damage);
            this.lastVelocity = { x: 0, y: 0 };
          }
        }
    }
  }

  stop() {
    return (
      abs(this.body.velocity.x) < 10e-4 ||
      this.body.position.x > width ||
      this.body.position.x < 0
    );
  }
}

class Pig extends Entity {
  constructor(x, y, r, type) {
    super(x, y, r, type);
    this.life = 3;
  }

  update() {
    let collition = Detector.collisions(detector).filter(
      (x) => x.bodyA == this.body || x.bodyB == this.body
    );
    if (collition.length == 0) {
      this.lastVelocity = Body.getVelocity(this.body);
    } else {
      this.lastVelocity = { x: 0, y: 0 };
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
    options = { ...options, restitution: 0 };
    switch (type) {
      case "stone":
        options = { ...options, friction: 1, density: 0.005 };
        this.life = 3;
        break;
      case "wood":
        options = { ...options, friction: 0.8, density: 0.003 };
        this.life = 2;
        break;
      case "glass":
        options = { ...options, friction: 0.5, density: 0.001 };
        this.life = 1;
        break;
    }
    this.body = Bodies.rectangle(x, y, w, h, { ...options });
    this.w = w;
    this.h = h;
    this.img =
      w != h ? (w < 3 * h && h < 3 * w ? type + "Sm" : type) : type + "Sqr";
    World.add(world, this.body);
    // Body.setMass(this.body, 10);
    this.status = LIFETIME.FIRST;
    this.lastVelocity = { x: 0, y: 0 };
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

  clear() {
    World.remove(world, this.body);
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
      stiffness: 1,
      stiffness: 0.01,
      // damping: 0.07,
    });
    World.add(world, this.sling);
    this.img = img;
    this.delayReappear = 0;
  }

  fly(mc, birds) {
    // console.log("P", this.sling.bodyB);
    // console.log("P", mc.mouse.button === -1);
    // console.log("P", this.sling.bodyB.position, this.sling.pointA);
    // console.log("P", this.sling.bodyB.position.x > this.sling.pointA.x + 1);
    if (
      this.sling.bodyB &&
      mc.mouse.button === -1 &&
      this.sling.bodyB.position.x > this.sling.pointA.x + 10
    ) {
      //Manage Launch

      this.sling.bodyB.collisionFilter.category = 1;
      this.sling.bodyB = null;
    } else if (
      this.attached() == null &&
      birds[0].stop() &&
      birds.length > 0 &&
      !this.delayReappear > 0
    ) {
      //Manage Birds Reloadd

      this.delayReappear = 1;
    }

    console.log(this.delayReappear);

    if (this.delayReappear > 0) {
      console.log(this.delayReappear);
      this.delayReappear++;

      console.log(this.delayReappear);
      if (this.delayReappear > 10) {
        let birds_0 = birds[0];
        birds.splice(0, 1);
        birds_0.clear();
        if (birds.length > 0) {
          this.attach(birds[0]);
        }
        this.delayReappear = 0;
      }
    }
  }

  attach(bird) {
    this.bird = bird;
    this.bird.setPosition(width / 5, (5 * height) / 8);
    this.bird.status = STATUS.LOADED;
    this.sling.bodyB = bird.body;
  }

  attached() {
    return this.sling.bodyB;
  }

  clear() {
    World.remove(world, this.body);
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
}

class Map {
  constructor(center) {
    this.center = center;
    this.boxes = [];
    this.pigs = [];
    this.life = 0;
    this.loadMap();
    this.loadEntities();
  }

  loadEntities() {
    this.pigs.push(new Pig(this.center.x, this.center.y - 35, 35, "kingPig"));
    this.pigs.push(new Pig(this.center.x - 195, this.center.y - 30, 30, "pig"));
    this.pigs.push(new Pig(this.center.x + 195, this.center.y - 30, 30, "pig"));
    this.pigs.push(new Pig(this.center.x - 300, this.center.y - 30, 30, "pig"));
    this.pigs.push(
      new Pig(this.center.x - 195, this.center.y - 190, 30, "pig")
    );
    this.pigs.push(
      new Pig(this.center.x + 195, this.center.y - 190, 30, "pig")
    );
    for (let pig of this.pigs) {
      this.life += pig.life;
    }
  }

  loadMap() {
    //Main sides
    let j = 0;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        this.boxes.push(
          new Box(
            this.center.x - 250 + i * 390,
            this.center.y - j * 160 - 60,
            20,
            120,
            "wood"
          )
        );
        this.boxes.push(
          new Box(
            this.center.x - 140 + i * 390,
            this.center.y - j * 160 - 60,
            20,
            120,
            "wood"
          )
        );
        this.boxes.push(
          new Box(
            this.center.x - 195 + i * 390,
            this.center.y - 140 - j * 160,
            140,
            40,
            "wood"
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
            40,
            40,
            "glass"
          )
        );
      }
    }
    //Center
    for (let i = 0; i < 2; i++) {
      this.boxes.push(
        new Box(
          this.center.x - 50 + i * 100,
          this.center.y - 45,
          20,
          90,
          "glass"
        )
      );
      this.boxes.push(
        new Box(this.center.x, this.center.y - 97.5 - i * 15, 120, 15, "glass")
      );
      this.boxes.push(
        new Box(
          this.center.x - 95 + i * 190,
          this.center.y - 70,
          30,
          140,
          "stone"
        )
      );
    }
    this.boxes.push(
      new Box(this.center.x, this.center.y - 150, 240, 20, "stone")
    );
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        this.boxes.push(
          new Box(
            this.center.x - 60 + j * 120,
            this.center.y -
              160 -
              Array.from(new Array(i + 1), (x, y) => y).reduce(
                (c, v) => c + 60 - v * 10,
                0
              ) +
              (60 - i * 10) / 2,
            60 - i * 10,
            60 - i * 10,
            "glass"
          )
        );
      }
    }
  }

  update() {
    let collition = Detector.collisions(detector).filter(
      (x) => x.bodyA.circleRadius != 0 || x.bodyB.circleRadius != 0
    );
    for (const c of collition) {
      let obj1 =
        c.bodyA.circleRadius != 0
          ? this.pigs.filter((x) => x.body == c.bodyA)[0]
          : this.boxes.filter((x) => x.body == c.bodyA)[0];
      let obj2 =
        c.bodyB.circleRadius != 0
          ? this.pigs.filter((x) => x.body == c.bodyB)[0]
          : this.boxes.filter((x) => x.body == c.bodyB)[0];
      // console.log(obj1, obj2);
      if (obj1 && obj2) {
        let damage = max(
          Vector.magnitude(Vector.sub(obj1.lastVelocity, c.tangent)),
          Vector.magnitude(Vector.sub(obj2.lastVelocity, c.tangent))
        );
        // console.log("DAÑOS", obj1, damage);
        if (obj1 instanceof Pig && damage > gap / 4) {
          obj1.life -= damage / (gap * obj1.img.includes("king") ? 4 : 3);
          if (obj1.life <= 0) {
            this.removePig(obj1.body);
            obj1.clear();
          }
        }
        if (obj2 instanceof Pig && damage > gap / 4) {
          obj2.life -= damage / (gap * obj2.img.includes("king") ? 4 : 3);
          // console.log("dañ2o", obj1, damage);
          if (obj2.life <= 0) {
            this.removePig(obj2.body);
            obj2.clear();
          }
        }
      }

      for (const box of this.boxes) {
        if (
          Detector.collisions(detector).filter(
            (x) => x.bodyA == box.body || x.bodyB == box.body
          ).length == 0
        ) {
          box.lastVelocity = Body.getVelocity(box.body);
        } else {
          box.lastVelocity = { x: 0, y: 0 };
        }
      }

      for (const pig of this.pigs) {
        if (pig.body.position.x > width || pig.body.position.x < 0) {
          this.removePig(pig.body);
          pig.clear();
        }
      }
    }

    if (this.pigs.length <= 0) {
      console.log("VICTORIA");
      noLoop();
    }
  }

  collition(entity, damage) {
    const pig = this.pigs.filter((x) => x.body == entity)[0];
    const box = this.boxes.filter((x) => x.body == entity)[0];
    if (entity.circleRadius > 0 && pig) {
      pig.life -=
        damage > gap / 2 ? 1 : damage > gap / 5 ? damage / (gap * 1.7) : 0;
      if (pig.life <= 0) {
        this.removePig(pig.body);
        pig.clear();
      }
    } else if (damage > gap && box) {
      // console.log("daño", damage, damage / (gap * 2));
      if (box.status >= box.life) {
        this.removeBox(box.body);
        World.remove(world, box.body);
      } else {
        const newVal = box.status + damage / (gap * 4);
        box.status = LIFETIME[convtoLIFETIME(ceil(newVal > 3 ? 3 : newVal))];
      }
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
    console.log([...this.pigs]);
    for (let i = 0; i < this.pigs.length; i++) {
      if (this.pigs[i].body == pig) {
        index = i;
        break;
      }
    }
    this.pigs.splice(index, 1);
    console.log(this.pigs);
  }

  getProgress() {
    if (this.pigs.length > 0) {
      let val = this.life;
      for (let pig of this.pigs) {
        val -= pig.life;
      }
      return floor((val / this.life) * 3);
    } else {
      return 3;
    }
  }

  clear() {
    for (let pig of this.pigs) {
      pig.clear();
    }
    for (let box of this.boxes) {
      box.clear();
    }
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
