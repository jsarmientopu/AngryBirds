class SpriteSheet {
  constructor(backgroundImage, birdImage, textureImage) {
    this.backgroundImage = backgroundImage;
    this.birdImage = birdImage;
    this.textureImage = textureImage;
    this.spec = {};
  }

  loadSprites() {
    this.addSpec("sky", this.backgroundImage, 50, 145, 480, 350);
    this.addSpec("ground", this.backgroundImage, 590, 250, 340, 75);
    this.addSpec("groundBird", this.backgroundImage, 590, 250, 340, 75);
    this.addSpec("grass", this.backgroundImage, 970, 400, 410, 75);
    this.addSpec("stone", this.textureImage, 455, 240, 80, 40);
    this.addSpec("glass", this.textureImage, 970, 400, 410, 75);
    this.addSpec("wood", this.textureImage, 455, 240, 80, 40);
    this.addSpec("stone-sqr", this.textureImage, 0, 0, 80, 80);
    this.addSpec("red", loadImage("img/red.png"));
    this.addSpec("yellow", loadImage("img/yellow.png"));
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
