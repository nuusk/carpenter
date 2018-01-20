const myRec = new p5.SpeechRec('PL', parseResult);
myRec.continuous = true;
myRec.interimResults = true;

const _windowWidth = window.innerWidth;
const _windowHeight = window.innerHeight;
const backgroundColor = 23;


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

//stages
let stages = [];
let stageNumber = 0;

let gravity;

//player one - narrator
//he is the one that stimulates the scene by speaking
function Narrator(name) {
  this.name = name;
  this.force = 2;

  //function used to move blocks with voice
  this.processInput = (command) => {
    if (this.commands.left.has(command)) {
      blocks.filter(block => !block.stable)
        .forEach(block => {
          block.velocity.y = 0;
          block.velocity.x = -this.force;
        });
    } else if (this.commands.right.has(command)) {
      blocks.filter(block => !block.stable)
        .forEach(block => {
          block.velocity.y = 0;
          block.velocity.x = this.force;
        });
    } else if (this.commands.up.has(command)) {
      blocks.filter(block => !block.stable)
        .forEach(block => {
          block.velocity.x = 0;
          block.velocity.y = -this.force;
        });
    } else if (this.commands.down.has(command)) {
      blocks.filter(block => !block.stable)
        .forEach(block => {
          block.velocity.x = 0;
          block.velocity.y = this.force;
        });
    } else if (this.commands.pause.has(command)) {
      pause = true;
    } else if (this.commands.resume.has(command)) {
      pause = false;
      help = false;
    } else if (this.commands.help.has(command)) {
      help = true;
    }
  }

  //these are the input values (the words you say to move objects on the screen)
  this.commands = {
    left: new Set(["lewo", "zlewo", "lewa", "lego"]),
    right: new Set(["prawo", "rawo", "wrawo"]),
    up: new Set(["góra", "tura"]),
    down: new Set(["dół", "du", "do"]),
    next: new Set(["następne", "następna", "następnie", "następny"]),
    pause: new Set(["pauza", "pauzuj"]),
    resume: new Set(["wznów", "graj", "start"]),
    help: new Set(["pomóż", "pomoc", "pomocy", "pomożesz"])
  }
}

//player two - carpenter
//he is the one that stimulates the scene by drawing
function Carpenter(name) {
  this.name = name;
  this.drawingMode = 'rectangle';

  this.sketchingTimer = 1000
  this.canSketch = true;

  this.minSketchSize = 1000;
  this.maxSketchSize = 40000;
  this.maxWidth = 300;
  this.maxHeight = 300;
  this.isRightSize = () => {
    let size = Math.abs(carpenterBlock.width) * Math.abs(carpenterBlock.height);
    if (size >= this.minSketchSize && size <= this.maxSketchSize && Math.abs(carpenterBlock.width) <= this.maxWidth && Math.abs(carpenterBlock.height) <= this.maxHeight) {
      return true;
    } else {
      return false;
    }
  }

  //carpenter building objects
  this.sketch = () => {
    if (this.drawingMode == 'rectangle') {
      let mousePosition = createVector(mouseX, mouseY);
      carpenterBlock = new Block(1, 0, 0, mousePosition, colors.transparent);
    }
  }

  //finalize the sketch. time to build object
  this.build = () => {
    if (this.drawingMode == 'rectangle') {
      if (this.isRightSize()) {
        if (carpenterBlock.width < 0) {
          carpenterBlock.width = -1*carpenterBlock.width;
          carpenterBlock.position.x -= carpenterBlock.width;
        }
        if (carpenterBlock.height < 0) {
          carpenterBlock.height = -1*carpenterBlock.height;
          carpenterBlock.position.y -= carpenterBlock.height;
        }
        carpenterBlock.stable = false;
        //push the carpenter block to the standard blocks array
        blocks.push(new Block(
          carpenterBlock.density,
          carpenterBlock.width,
          carpenterBlock.height,
          carpenterBlock.position,
          getRandomColor()
        ));
        carpenterBlock = null;
      } else {
        carpenterBlock = null;
        return;
      }
    }

    this.canSketch = false;
    setTimeout(()=>{
      this.canSketch = true;
    }, this.sketchingTimer);
  }

  this.keyboardInput = () => {
    //pause
    if (keyCode === 32) {
      pause = !pause;
    } else if (keyCode === 104 || keyCode === 72) {
      help = !help;
    }
  }
}

function keyPressed() {
  carpenter.keyboardInput();
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

function mousePressed() {
  //carpenter start sketching
  if(carpenter.canSketch) {
    carpenter.sketch();
  }
}

function mouseReleased() {
  //carpenter finishes sketch and builds the object
  if(carpenter.canSketch) {
    carpenter.build();
  }
}

function setup() {
  //create players
  narrator = new Narrator('rabal');
  carpenter = new Carpenter('poe');

  //all available colors
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

  createCanvas(_windowWidth, _windowHeight);
  background(backgroundColor);

  //whenever the engine hears the voice, parse the result
  myRec.onResult = parseResult;
  myRec.start(); //start engine



  stages[0] = new Array();
  initStage();
  // blocks.push(new Block(1));
  // blocks[0].stable=true;
  // blocks[0].color=colors.white;
}

function initStage() {
  stages[0].push(new Block( 1, _windowWidth, _windowHeight*0.1, createVector(0, _windowHeight*0.9), colors.white, true ));
  stages[0].push(new Block( 1, _windowWidth*0.05, _windowHeight*0.5, createVector(0, _windowHeight*0.5), colors.white, true ));
  stages[0].push(new Block( 1, _windowWidth*0.3, _windowHeight*0.05, createVector(0, _windowHeight*0.5), colors.white, true ));
  stages[0].push(new Block( 1, _windowWidth*0.25, _windowHeight*0.5, createVector(_windowWidth*0.5, _windowHeight*0.8 ), colors.white, true ));

  //
  // stages[0].forEach(block => {
  //   block.stable = true;
  //   block.color = colors.white;
  // });

}
// }
// density,
//   width = random(100)+100,
//   height = random(100)+100,
//   position=createVector(
//     random(0.8)*_windowWidth+0.1*_windowWidth,
//     random(0.8)*_windowHeight+0.1*_windowHeight),
//   color = colors.orange,
//   stable = false) {


let pause = false;
let help = false;

function draw() {
  if (!pause) {
    background(backgroundColor);
    fill(colors.white);
    textAlign(RIGHT);
    text("\"h\" lub \"pomoc\" - tutorial", _windowWidth*0.98, 20);
    textAlign(LEFT);
    if (!carpenter.canSketch) {
      text("sketching cooldown", 10, 20);
    }

    //if carpenter is sketching
    if (carpenterBlock) {
      //draw the carpenter block
      carpenterBlock.sketching(mouseX - pmouseX, mouseY - pmouseY);
      if (!carpenter.isRightSize()) {
        carpenterBlock.color = color(255, 50, 80, 100);
      } else {
        carpenterBlock.color = colors.transparent;
      }
      carpenterBlock.draw();
    }

    blocks.forEach(block => {
      if (!block.stable) {
        if(!block.collisionDetection()) {
          block.resetAcceleration();
          block.applyForce(createVector(0, 150));
          block.updateVelocity();
          block.updatePosition();
        }
      }
      block.draw();
    });

    stages[stageNumber].forEach(block => {
      block.draw();
    })

    frame++;
  } else if (pause) {
    push();
    textAlign(CENTER);
    fill(color(140+70*Math.sin(0.005*millis())));
    textSize(200);
    text('PAUZA', _windowWidth*0.5, _windowHeight*0.5+50);
    textSize(46);
    text('naciśnij spację  /  powiedz graj', _windowWidth*0.5, _windowHeight*0.5+100);
    pop();
  }
  if (help) {
    push();
    background(backgroundColor);
    textAlign(CENTER);
    fill(240, 240, 240);
    textSize(50);
    text('CARPENTER', _windowWidth*0.25, _windowHeight*0.1);
    text('NARRATOR', _windowWidth*0.75, _windowHeight*0.1);
    textSize(30);
    text('STEROWANIE:', _windowWidth*0.25, _windowHeight*0.2);
    text('KOMENDY GŁOSOWE:', _windowWidth*0.75, _windowHeight*0.2);
    textSize(20);
    text('naciśnij LPM - szkicowanie', _windowWidth*0.25, _windowHeight*0.3);
    text('puść LPM - budowanie', _windowWidth*0.25, _windowHeight*0.35);
    text('spacja - pauza', _windowWidth*0.25, _windowHeight*0.4);
    text('h - pomoc', _windowWidth*0.25, _windowHeight*0.45);
    text('1 - rysowanie bloczków', _windowWidth*0.25, _windowHeight*0.5);
    text('2 - rysowanie kul', _windowWidth*0.25, _windowHeight*0.55);


    text('lewo, prawo, góra, dół - pchnięcie bloczka', _windowWidth*0.75, _windowHeight*0.3);
    text('pauza - pauza', _windowWidth*0.75, _windowHeight*0.35);
    text('graj - wznowienie gry', _windowWidth*0.75, _windowHeight*0.4);
    text('następne - następny poziom', _windowWidth*0.75, _windowHeight*0.45);
    text('pomoc - menu z komendami', _windowWidth*0.75, _windowHeight*0.5);

    pop();
  }
}
function parseResult() {
  // recognition system will often append words into phrases.
  // so hack here is to only use the last word:
  var mostrecentword = myRec.resultString.split(' ').pop();
  narrator.processInput(mostrecentword.toLowerCase(), 2);
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

  //if stable is true, the narrator doesn't have control over it
  this.stable = stable;
  this.density = density;
  this.position = position;
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(0, 0);
  this.width = width;
  this.height = height;
  // this.mass = this.width * this.height * this.density;
  this.mass = 10000;
  this.color = color;

  //when carpenter is currently sketching the block
  this.sketching = (xOffset, yOffset) => {
    this.width += xOffset;
    this.height += yOffset;
  }

  this.resetAcceleration = () => {
    this.acceleration.mult(0);
  }

  this.applyForce = (force) => {
    this.acceleration.add(force.div(this.mass));
  }

  this.updateVelocity = () => {
    this.velocity.add(this.acceleration);
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

  //detect collision between all stable blocks (including those drawn by carpenter as well as those in the stage from the beginning)
  this.collisionDetection = () => {
    blocks.concat(stages[stageNumber])
    .filter(block => block.stable)
    .forEach(collider => {
      if (
        this.position.x + this.width >= collider.position.x
        && this.position.x <= collider.position.x + collider.width
        && this.position.y +this.height >= collider.position.y
        && this.position.y <= collider.position.y + collider.height
      ) {
        this.stable = true;
        this.color = colors.white;
        return true;
      }
    });
  }
}
