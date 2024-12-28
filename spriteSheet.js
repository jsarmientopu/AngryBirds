class SpriteSheet {
  constructor() {
    this.backgroundImage = loadImage("img/background.png");
    this.glassImage = loadImage("img/glassTexture.png");
    this.woodImage = loadImage("img/woodTexture.png");
    this.stoneImage = loadImage("img/stoneTexture.png");
    this.redImage = loadImage("img/redSheet.png");
    this.yellowImage = loadImage("img/yellowSheet.png");
    this.pigImage = loadImage("img/pigSheet.png");
    this.spec = {};
  }

  loadSprites() {
    this.addSpec("sky", this.backgroundImage, 50, 145, 480, 350);
    this.addSpec("ground", this.backgroundImage, 590, 250, 340, 75);
    this.addSpec("groundBird", this.backgroundImage, 590, 250, 340, 75);
    this.addSpec("grass", this.backgroundImage, 970, 400, 410, 75);

    this.addSpec("redIDLE", this.redImage, 280, 260, 250, 250);
    this.addSpec("redJUMPING", this.redImage, 10, 510, 250, 210);
    this.addSpec("redLOADED", this.redImage, 10, 10, 250, 250);
    this.addSpec("redFLYING", this.redImage, 280, 10, 250, 250);
    this.addSpec("redIMPACT", this.redImage, 10, 260, 250, 250);
    this.addSpec("yellowIDLE", this.yellowImage, 0.1, 0, 220, 210);
    this.addSpec("yellowJUMPING", this.yellowImage, 260, 0, 220, 210);
    this.addSpec("yellowLOADED", this.yellowImage, 530, 0, 220, 210);
    this.addSpec("yellowFLYING", this.yellowImage, 820, 0, 220, 210);
    this.addSpec("yellowIMPACT", this.yellowImage, 1060, 0, 220, 210);

    this.addSpec("stone1", this.stoneImage, 173, 138, 142, 15);
    this.addSpec("stone2", this.stoneImage, 173, 168, 142, 15);
    this.addSpec("stone3", this.stoneImage, 173, 183, 142, 15);
    this.addSpec("stoneSm1", this.stoneImage, 115, 109, 58, 29);
    this.addSpec("stoneSm2", this.stoneImage, 115, 138, 58, 29);
    this.addSpec("stoneSm3", this.stoneImage, 115, 167, 58, 29);
    this.addSpec("stoneSqr1", this.stoneImage, 0.1, 57, 58, 58);
    this.addSpec("stoneSqr2", this.stoneImage, 0.1, 115, 58, 58);
    this.addSpec("stoneSqr3", this.stoneImage, 0.1, 171, 58, 58);

    this.addSpec("wood1", this.woodImage, 184, 149, 150, 16);
    this.addSpec("wood2", this.woodImage, 184, 181, 150, 16);
    this.addSpec("wood3", this.woodImage, 184, 197, 150, 17);
    this.addSpec("woodSm1", this.woodImage, 122, 117, 63, 34);
    this.addSpec("woodSm2", this.woodImage, 122, 183, 63, 33);
    this.addSpec("woodSm3", this.woodImage, 122, 212, 63, 34);
    this.addSpec("woodSqr1", this.woodImage, 0.1, 61, 62, 62);
    this.addSpec("woodSqr2", this.woodImage, 0.1, 122, 62, 62);
    this.addSpec("woodSqr3", this.woodImage, 0.1, 184, 62, 62);

    this.addSpec("glass1", this.glassImage, 195, 145, 140, 15);
    this.addSpec("glass2", this.glassImage, 195, 115, 140, 15);
    this.addSpec("glass3", this.glassImage, 195, 160, 140, 15);
    this.addSpec("glassSm1", this.glassImage, 224, 55, 58, 32);
    this.addSpec("glassSm2", this.glassImage, 224, 84, 57, 32);
    this.addSpec("glassSm3", this.glassImage, 164, 84, 59, 32);
    this.addSpec("glassSqr1", this.glassImage, 0.1, 0, 58, 58);
    this.addSpec("glassSqr2", this.glassImage, 0.1, 113, 58, 59);
    this.addSpec("glassSqr3", this.glassImage, 0.1, 170, 58, 59);

    this.addSpec("pig1IDLE", this.pigImage, 256, 365, 105, 103);
    this.addSpec("pig1JUMPING", this.pigImage, 625, 145, 105, 103);
    this.addSpec("pig2IDLE", this.pigImage, 360, 260, 105, 103);
    this.addSpec("pig2JUMPING", this.pigImage, 256, 570, 105, 103);
    this.addSpec("pig3IDLE", this.pigImage, 462, 260, 105, 103);
    this.addSpec("pig3JUMPING", this.pigImage, 567, 260, 105, 103);

    this.addSpec("kingPig1IDLE", this.pigImage, 0.1, 0, 135, 150);
    this.addSpec("kingPig1JUMPING", this.pigImage, 0.1, 150, 135, 150);
    this.addSpec("kingPig2IDLE", this.pigImage, 270, 0, 135, 150);
    this.addSpec("kingPig2JUMPING", this.pigImage, 135, 0, 135, 150);
    this.addSpec("kingPig3IDLE", this.pigImage, 405, 0, 135, 150);
    this.addSpec("kingPig3JUMPING", this.pigImage, 540, 0, 135, 150);
  }

  addSpec(name, image, x, y, w, h) {
    this.spec[name] = {
      image,
      x,
      y,
      w,
      h,
    };
  }

  getSprite(name) {
    if (!Object.hasOwn(this.spec, name)) {
      console.log(name);
      throw `no sprite registered with name "${name}"`;
    }

    const spec = this.spec[name];

    // lazy load sprite
    if (!Object.hasOwn(spec, "sprite")) {
      if (spec.x) {
        spec.sprite = spec.image.get(spec.x, spec.y, spec.w, spec.h);
      } else {
        spec.sprite = spec.image;
      }
    }

    return spec.sprite;
  }
}
