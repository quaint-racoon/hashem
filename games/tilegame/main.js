const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
if(innerHeight>innerWidth) {canvas.height = innerWidth;canvas.width=innerWidth}
if(innerHeight<innerWidth) {canvas.height = innerHeight;canvas.width=innerHeight}
let image_tree; let image_grass;let image_player;
window.onload = () => {
  image_tree = document.getElementById("tree")
  image_grass = document.getElementById("grass")
  image_player = document.getElementById("player")
  animate()
}

const map = [
  ["1","1","1","1","1","1","1","1","1","1","1","1"],
  ["1","0","0","0","0","0","0","0","0","0","0","1"],
  ["1","0","0","0","0","0","0","0","0","0","0","1"],
  ["1","0","0","0","0","0","0","0","0","0","0","1"],
  ["1","0","0","0","0","0","1","0","0","0","0","1"],
  ["1","0","0","0","0","1","1","0","0","0","0","1"],
  ["1","0","0","0","0","0","1","0","0","0","0","1"],
  ["1","0","0","0","0","1","1","0","0","0","0","1"],
  ["1","0","0","0","0","0","0","0","0","0","0","1"],
  ["1","0","0","0","0","0","0","0","0","0","0","1"],
  ["1","0","0","0","0","0","0","0","0","0","0","1"],
  ["1","1","1","1","1","1","1","1","1","1","1","1"],
];
const pressed = {
  a:false,
  w:false,
  s:false,
  d:false,
}
const size = canvas.width / map[0].length
//define player
class Player{
  constructor(x,y){
    this.size = size
    this.x = x
    this.y = y  
    this.velocity = {
      x:0,
      y:0
    }
  }
  update(){
  if( pressed.a === true)
     this.velocity.x = -0.1
  if( pressed.d === true)
     this.velocity.x = 0.1
  if( pressed.w === true)
     this.velocity.y = -0.1
  if( pressed.s === true)
     this.velocity.y = 0.1
  if( pressed.a===false && pressed.d===false)
     this.velocity.x=0
  if( pressed.w===false && pressed.s===false)
     this.velocity.y=0
  this.x += this.velocity.x
  this.y += this.velocity.y
  }
  draw(){
    ctx.drawImage(image_player,this.x*this.size,this.y*this.size,this.size,this.size)
  }
}
//create the player
const player = new Player(1,5)
//animate the canvas
function animate(){
  window.requestAnimationFrame(animate)
  //clear board
  ctx.fillStyle="Green"
  ctx.fillRect(0,0,canvas.width,canvas.height)
  //render tiles
  map.forEach((tile,y)=>{
    tile.forEach((row,x)=>{
      if(row==="1"){
        ctx.drawImage(image_tree,x*size,y*size,size,size)
      }
    })
  })
  //render player
  player.draw()
  //update player
  player.update()
}

addEventListener('keydown',(e)=>{
  let key = e.key
  if( key === "a")
    return pressed.a = true
  if( key === "w")
    return pressed.w = true
  if( key === "s")
    return pressed.s = true
  if( key === "d")
    return pressed.d = true
})

addEventListener('keyup',(e)=>{
  let key = e.key
  if( key === "a")
    return pressed.a = false
  if( key === "w")
    return pressed.w = false
  if( key === "s")
    return pressed.s = false
  if( key === "d")
    return pressed.d = false
})

