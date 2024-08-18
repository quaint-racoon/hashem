const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext("2d")
const gravity = 0.5
game = {

  clear: function() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
class player {
  constructor({ position, velocity, size }) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
  }
  update() {
    this.velocity.y += gravity
    if (pressed.space === true) {
      this.velocity.y -= 10
      pressed.space = false;
    }
    if (this.position.y + this.size + this.velocity.y >= canvas.height) {
      this.velocity.y = 0;
    }
    if (this.position.y - this.size + this.velocity.y <= 0) {
      this.velocity.y = 0;
    }
    this.position.y += this.velocity.y
  }
  draw() {
    ctx.beginPath()
    ctx.fillStyle = "#64eb34"
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fill()
  }
}
var ball = new player({
  size: 10,
  velocity: {
    y: -10
  },

  position: {
    x: 50,
    y: canvas.height / 2 - 15,
  }
})
class wall {
  constructor({ position, velocity = 10, height }) {
    this.position = position;
    this.velocity = velocity;
    this.height = height;
  }
  update() {
    if (this.position.y + this.size + this.velocity.y >= canvas.height) {
      this.velocity.y = 0;
    }
    if (this.position.y - this.size + this.velocity.y <= 0) {
      this.velocity.y = 0;
    }
    this.position += this.velocity
  }
  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.position.x, this.position.y, 25, this.height);

  }
}
var ball = new player({
  size: 10,
  velocity: {
    y: -10
  },

  position: {
    x: 50,
    y: canvas.height / 2 - 15,
  }
})
var wall_1 = new wall({
  position:{
    x:0,
    y:canvas.width,
  },
  
})
var pressed = {
  space: false,
}
var loop = false
function animate() {
  window.requestAnimationFrame(animate)
  game.clear()
  ball.update()
  ball.draw()
}
window.addEventListener("keydown", (event) => {
  key = event.key
  if (loop === false && key === " ") pressed.space = true
  if (key === " ") return loop = true
})
window.addEventListener("keyup", (event) => {
  key = event.key
  if (key === " ") return loop = false
})
animate()