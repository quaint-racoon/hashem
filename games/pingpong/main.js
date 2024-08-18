const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext("2d")
class character {
  constructor({ position, velocity, size, controls }) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
    this.controls = controls;
  }
  draw() {
    ctx.fillStyle = "white"
    ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height)
  }
  update() {
    this.position.y += this.velocity.y
    if (this.position.y + this.size.height + this.velocity.y >= canvas.height) {
      this.position.y = canvas.height - this.size.height
      this.velocity.y = 0
    };
    if (this.position.y + this.velocity.y <= 0) {
      this.position.y = 0
      this.velocity.y = 0
    }
    if (this.controls.up === true) return this.velocity.y = -5
    if (this.controls.down === true) return this.velocity.y = 5
    if (this.controls.up === false && this.controls.down === false) { this.velocity.y = 0 }
  }
}
class ball {
  constructor({ size, position, velocity }) {
    this.position = position;
    this.size = size;
    this.velocity = velocity;
  }
  hit(obj){
    let posy = this.position.y
    let posx = this.position.x
    let size = this.size/2
		let objleft = obj.position.x
		let objright = obj.position.x + obj.size.width
		let objtop = obj.position.y
		let objbottom = obj.position.y + obj.size.height
    if(objright>posx+size&&objleft<posx-size&&posy+size<objbottom&&posy-size>objtop)return true
		else return false
      }
  update() {
    this.position.x+=this.velocity.x;
    this.position.y+=this.velocity.y;
    if (this.position.y - this.size + this.velocity.y < 0) {
      this.velocity.y = this.velocity.y * -1
    }
    if (this.position.y + this.size + this.velocity.y > canvas.height) {
      this.velocity.y = this.velocity.y * -1
    }
    console.log(this.hit(player2))
    if (this.hit(player1)||this.hit(player2)) {
      this.velocity.x = this.velocity.x * -1
    }
    
  }
  
  draw() {
    ctx.beginPath()
    ctx.fillStyle = "white"
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI*2)
    ctx.stroke()
    ctx.fill()
  }
}

let player1 = new character({
  size: {
    width: 25,
    height: 75,
  },
  position: {
    x: 0,
    y: canvas.height/2-37.5,
  },
  velocity: {
    y: 0,
  },
  controls: {
    up: "up",
    down: "down",
  }
})
let player2 = new character({
  size: {
    width: 25,
    height: 75,
  },
  position: {
    x: canvas.width-25,
    y: canvas.height/2-37.5,
  },
  velocity: {
    y: 0,
  },
  controls: {
    up: "w",
    down: "s",
  }
})
let ping = new ball({
  size:10,
  position:{
    x:canvas.width/2,
    y:canvas.height/2,
  },
  velocity:{
    x:7.5,
    y:7.5,
  }
})
var pressedkeys = {
  "w": false,
  "s": false,
  "up": false,
  "down": false,
}
window.addEventListener("keydown", (event) => {
  key = event.key
  if (key === "w") return player1.controls.up = true
  if (key === "s") return player1.controls.down = true
  if (key === "ArrowUp") return player2.controls.up = true
  if (key === "ArrowDown") return player2.controls.down = true
})
window.addEventListener("keyup", (event) => {
  key = event.key
  if (key === "w") return player1.controls.up = false
  if (key === "s") return player1.controls.down = false
  if (key === "ArrowUp") return player2.controls.up = false
  if (key === "ArrowDown") return player2.controls.down = false
})
function animate() {
  window.requestAnimationFrame(animate)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player1.draw();
  player1.update();
  player2.draw();
  player2.update();
  ping.draw();
  ping.update();
}
animate()