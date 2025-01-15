# Anfry Birds

A p5 (With Matter js) based recreation of one level of the Angry Birds game for the Visual Computing - 2024-2 class at Universidad Nacional de Colombia.

## Team

- David Alfonso Cañas Palomino - Saturday Group
- Juan Sebastian Sarmiento Pulido - Saturday Group
- Esteban Lopez Barreto - Saturday Group
- Sergio Sanchez Moreno - Virtual Group

## Screenshots

<!-- ![screenshot1](./screenshot_1.png)
![screenshot2](./screenshot_2.png) -->

## How to run

We use a local minified copy of p5.js, but due to the spritesheet and CORS you cannot just open the index.html file, it needs to be served through http, we suggest running `python -m http.server 8888` in the code root folder. Or you can visit the slightly adapted version we uploaded to the p5 web editor [here](https://editor.p5js.org/sesanchezmo/full/kyvxBr6Rc)

## Program Structure

Some notes relevant to the implementation and program structure

- Most elements on screen (birds, pigs, obstacles) are rendered using sprites sourced from a sprite sheet.
- The physics engine integrates gravity, collisions, and trajectory calculations, allowing for realistic interactions between entities.
- A significant portion of the code is dedicated to animations, including bird launches and object destructions, with easing functions providing smooth transitions.
- The AngryBirdsGame class handles core game logic, including level management, input handling, and score tracking, with some rendering logic included.
- Entity classes, such as Bird, Pig, and Obstacle, manage state machines and animations independently, encapsulating behavior and simplifying interactions.
- Damage thresholds for pigs and obstacles are visually represented, such as cracks or other effects, enhancing feedback during gameplay.
