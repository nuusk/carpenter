const myRec = new p5.SpeechRec('PL', parseResult);
myRec.continuous = true;
myRec.interimResults = true;

const _windowWidth = window.innerWidth;
const _windowHeight = window.innerHeight;

//these are the input values (the words you say to move objects on the screen)
let left = new Set(["lewo", "zlewo", "lewa", "lego"]);
let right = new Set(["prawo", "rawo", "wrawo"]);
let up = new Set(["góra", "tura"]);
let down = new Set(["dół", "du", "do"]);
let next = new Set(["następne", "następna", "następnie", "następny"]);

//array of blocks that are the main objects on the scene
let blocks = [];
//object that is currently being built by the carpenter
let carpenterBlock;

//current frame
let frame = 0;

//array of available colors
let colors;

//players
let carpenter;
let narrator;

//player one - narrator
//he is the one that stimulates the scene by speaking
function Narrator(name) {
  this.name = name;

  //function used to move blocks with voice
  this.moveBlocks = (direction, velocity) => {
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

//player two - carpenter
//he is the one that stimulates the scene by drawing
function Carpenter(name) {
  this.name = name;
  this.drawingMode = 'rectangle';

  this.sketch = () => {
    if (this.drawingMode == 'rectangle') {
      let mousePosition = createVector(mouseX, mouseY);
      carpenterBlock = new Block(1, 0, 0, mousePosition, colors.transparent);
    }
  }
}

function mousePressed() {
  carpenter.sketch();
}

function getRandomColor() {
  //all colors excluding white and transparent from the colors array
  let size = Object.keys(colors).length - 2;
  let index = floor(random(size));
  let count = 0;
  for (randomColor in colors) {
    if (count == index) {
      return colors[randomColor];
    }
    count++;
  }
}

function mouseReleased() {
  if (carpenter.drawingMode == 'rectangle') {
    carpenterBlock.color = colors.orange;
    if (carpenterBlock.width < 0) {
      carpenterBlock.width = -1*carpenterBlock.width;
      carpenterBlock.position.x -= carpenterBlock.width;
    }
    if (carpenterBlock.height < 0) {
      carpenterBlock.height = -1*carpenterBlock.height;
      carpenterBlock.position.y -= carpenterBlock.height;
    }

    getRandomColor();

    blocks.push(new Block(
      carpenterBlock.density,
      carpenterBlock.width,
      carpenterBlock.height,
      carpenterBlock.position,
      getRandomColor()
    ));
    carpenterBlock = null;
  }
}

function setup() {

  narrator = new Narrator('rabal');
  carpenter = new Carpenter('poe');

  colors = {
    red: color(211, 76, 61),
    green: color(47, 183, 70),
    blue: color(53, 109, 198),
    orange: color(239, 150, 33),
    yellow: color(242, 242, 75),
    seledin: color(87, 214, 176),
    violet: color(136, 97, 181),
    pink: color(242, 140, 225),
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

    frame++;

    as = true;
  }
}
function parseResult() {
  // recognition system will often append words into phrases.
  // so hack here is to only use the last word:
  var mostrecentword = myRec.resultString.split(' ').pop();
  narrator.moveBlocks(mostrecentword.toLowerCase(), 2);
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
