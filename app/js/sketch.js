const myRec = new p5.SpeechRec('PL', parseResult);
myRec.continuous = true;
myRec.interimResults = true;

const _windowWidth = window.innerWidth;
const _windowHeight = window.innerHeight;
let x, y;
let dx, dy;
let left = new Set(["lewo", "zlewo", "lewa", "lego"]);
let right = new Set(["prawo", "rawo", "wrawo"]);
let up = new Set(["góra", "tura"]);
let down = new Set(["dół", "du", "do"]);
let clear = "czyść";
console.log(left);

let block;
let blocks = [];
let carpenterBlock;

let colliders = [];

let iteration = 0;

let drawingMode = 'rectangle';

let colors;

let narrator;

function Narrator() {
  this.force = '';

  this.moveBlocks = (direction, velocity) => {
    console.log(direction);
    if (left.has(direction)) {
      blocks.filter(block => !block.stable)
        .forEach(block => {
          block.velocity.y = 0;
          block.velocity.x = -velocity;
        });
    } else if (right.has(direction)) {
      blocks.filter(block => !block.stable)
        .forEach(block => {
          block.velocity.y = 0;
          block.velocity.x = velocity;
        });
    } else if (up.has(direction)) {
      blocks.filter(block => !block.stable)
        .forEach(block => {
          block.velocity.x = 0;
          block.velocity.y = -velocity;
        });
    } else if (down.has(direction)) {
      blocks.filter(block => !block.stable)
        .forEach(block => {
          block.velocity.x = 0;
          block.velocity.y = velocity;
        });
    }
  }
}

function Carpenter() {

}

function mousePressed() {
  if (drawingMode == 'rectangle') {
    let mousePosition = createVector(mouseX, mouseY);
    carpenterBlock = new Block(1, 0, 0, mousePosition, colors.transparent);
  }
  //density
  //width = random(100)+100, height = random(100)+100
  //position=createVector(random(0.8)*_windowWidth+0.1*_windowWidth, random(0.8)*_windowHeight+0.1*_windowHeight)
  // blocks.push(new Block(iteration % 360, 200, 100, position=createVector(mouseX, mouseY)));
}

function mouseReleased() {
  if (drawingMode == 'rectangle') {
    carpenterBlock.color = colors.orange;
    if (carpenterBlock.width < 0) {
      carpenterBlock.width = -1*carpenterBlock.width;
      carpenterBlock.position.x -= carpenterBlock.width;
    }
    if (carpenterBlock.height < 0) {
      carpenterBlock.height = -1*carpenterBlock.height;
      carpenterBlock.position.y -= carpenterBlock.height;
    }
    blocks.push(new Block(
      carpenterBlock.density,
      carpenterBlock.width,
      carpenterBlock.height,
      carpenterBlock.position
    ));
    carpenterBlock = null;
  }
}

function setup() {

  narrator = new Narrator();

  colors = {
    red: color(120, 40, 40),
    green: color(40, 120, 50),
    blue: color(50, 60, 140),
    orange: color(150, 100, 0),
    transparent: color(0, 0, 0, 0),
    white: color(200, 200, 200)
  };

  // graphics stuff:
  createCanvas(_windowWidth, _windowHeight);
  background(255, 255, 255);
  fill(0, 0, 0, 255);
  x = width/2;
  y = height/2;
  dx = 0;
  dy = 0;
  // instructions:
  textSize(20);
  textAlign(LEFT);

  myRec.onResult = parseResult; // now in the constructor
  myRec.start(); // start engine

  // carpenterBlock = new Block(1);
  blocks.push(new Block(1));
  blocks[0].stable=true;
  blocks[0].color=colors.white;
  // colliders.push(new Block(1));

}
let as = true;

function draw() {
  if (as) {
    background(23);
    fill(244);
    // text("draw: up, down, left, right, clear", 20, 20);

    if (carpenterBlock) {
      carpenterBlock.building(mouseX - pmouseX, mouseY - pmouseY);
      carpenterBlock.draw();
    }

    blocks.forEach(block => {
      if (!block.stable) {
        if (!block.collisionDetection()) {
          block.applyForce(createVector(random(2), random(1000)));
          block.updatePosition();
        } else {
          block.stable = true;
        }
      }
      block.draw();
    });

    colliders.forEach(collider => {
      collider.draw();
    });

    iteration++;

    as = true;
  }
}
function parseResult() {
  // recognition system will often append words into phrases.
  // so hack here is to only use the last word:
  var mostrecentword = myRec.resultString.split(' ').pop();
  narrator.moveBlocks(mostrecentword.toLowerCase(), 2);
  // myRec.resultString = '';
  console.log(mostrecentword);
}


function Block(density,
  width = random(100)+100,
  height = random(100)+100,
  position=createVector(
    random(0.8)*_windowWidth+0.1*_windowWidth,
    random(0.8)*_windowHeight+0.1*_windowHeight),
  color = colors.orange,
  stable = false) {

  this.stable = stable;
  this.density = density;
  this.position = position;
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(0, 0);
  this.width = width;
  this.height = height;
  this.mass = this.width * this.height * this.density;
  this.color = color;

  this.building = (xOffset, yOffset) => {
    // this.position.x = mouseX;
    // this.position.y = mouseY;
    this.width += xOffset;
    this.height += yOffset;
    // this.position.x = mouseX + this.width;
    // this.position.y = mouseY + this.height;
  }

  this.applyForce = (force) => {
    this.acceleration.add(force.div(this.mass)) ;
  }

  this.updatePosition = () => {
    this.position.add(this.velocity);
  }

  this.draw = () => {
    push();
    fill(this.color);
    stroke(colors.white);
    strokeWeight(3);
    rect(this.position.x, this.position.y, this.width, this.height);
    pop();
  }

  this.collisionDetection = () => {
    blocks.filter(block => block.stable)
    .forEach(collider => {
      console.log(this.position.x + this.width >= collider.position.x
        && this.position.x + this.width <= collider.position.x + collider.width)
      if ((
        this.position.x >= collider.position.x
        && this.position.x <= collider.position.x + collider.width
        && this.position.y >= collider.position.y
        && this.position.y <= collider.position.y + collider.height
      ) || (
        this.position.x + this.width >= collider.position.x
        && this.position.x + this.width <= collider.position.x + collider.width
        && this.position.y >= collider.position.y
        && this.position.y <= collider.position.y + collider.height
      ) || (
        this.position.x >= collider.position.x
        && this.position.x <= collider.position.x + collider.width
        && this.position.y + this.height >= collider.position.y
        && this.position.y + this.height <= collider.position.y + collider.height
      ) || (
        this.position.x + this.width >= collider.position.x
        && this.position.x + this.width <= collider.position.x + collider.width
        && this.position.y + this.height >= collider.position.y
        && this.position.y + this.height <= collider.position.y + collider.height
      )
    ) {
        this.position.add(this.velocity);
        this.stable = true;
        this.color = colors.white;
        return true;
      } else {
        return false;
      }
    });
  }

  // function
}
