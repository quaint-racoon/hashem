const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext("2d")
var gravity = 0.5
var bouncy = -1;
game = {

  clear: function() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
class obj {
  constructor({ position, velocity, size }) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
  }
  update() {
    this.velocity.y += gravity
    if (this.position.y + this.size + this.velocity.y >= canvas.height) {
      this.velocity.y = (this.velocity.y - 0.5) * bouncy;
    }
    if (this.position.y - this.size + this.velocity.y <= 0) {
      this.velocity.y = (this.velocity.y - 0.5) * bouncy;
    }
    this.position.y += this.velocity.y;

    if (this.position.x + this.size + this.velocity.x >= canvas.width) {
      this.velocity.x = this.velocity.x * bouncy;
    }
    if (this.position.x - this.size + this.velocity.x <= 0) {
      this.velocity.x = this.velocity.x * bouncy;
    }
    this.position.x += this.velocity.x
  }
  draw() {
    ctx.beginPath()
    ctx.fillStyle = "#64eb34"
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fill()
  }
}
let vx_input = document.getElementById("vx")
let vy_input = document.getElementById("vy")
let size_input = document.getElementById("size")
let gravity_input = document.getElementById("gravity")
let bouncy_input = document.getElementById("bouncy")

function change(item) {
  if (item === "vx") {
    return ball.velocity.x = parseFloat(vx_input.value)
  }
  if (item === "vy") {
    return ball.velocity.y = parseFloat(vy_input.value)
  }
  if (item === "size") {
    return ball.size = parseFloat(size_input.value)
  }
  if (item === "gravity") {
    return gravity = parseFloat(gravity_input.value)
  }
  if (item === "bouncy") {
    if (bouncy_input.checked === true)
      return bouncy = -1
    else return bouncy = 0

  }

}
var ball = new obj({
  size: 10,
  velocity: {
    y: -10,
    x: 5,
  },
  position: {
    x: 50,
    y: canvas.height / 2 - 15,
  }
})

function animate() {
  window.requestAnimationFrame(animate)
  game.clear()
  ball.update()
  ball.draw()
}
animate()