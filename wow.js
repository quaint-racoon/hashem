const canvas = document.getElementsByTagName("canvas")[0]
canvas.width = innerWidth
canvas.height = innerHeight

const ctx = canvas.getContext("2d")
var time = 100
var x=canvas.width/2;
var y=canvas.height/2
class Ball{
  constructor(x,y,velocity,color,delay){
    this.x=x
    this.y=y
    this.velocity=velocity
    this.color=color
    this.speed=10
    this.delay=delay
  }
  draw(){
    ctx.beginPath()
    ctx.fillStyle= this.color
    ctx.arc(this.x,this.y,15,0,Math.PI*2)
    ctx.fill()
  }
  update(){
 

    this.draw()
    
        setTimeout(()=>{
    const dist = Math.hypot(x - this.x, y - this.y)
    if(this.speed>dist) this.speed = dist
    if(dist<5)this.speed=10
    const angle = Math.atan2(y - this.y, x - this.x)
    this.velocity = {
      x: Math.cos(angle)*this.speed,
      y: Math.sin(angle)*this.speed
    }
    if(dist<5)this.velocity = {x:0,y:0}
    this.x+=this.velocity.x
    this.y+=this.velocity.y
    },this.delay)
     
  }
}
const balls = []
for(let i=0;i<5;i++){
  let delay = i*1000
  const ball = new Ball(100,100,{
    x:1,
    y:0
  },`hsl(${Math.random() * 360},50%,50%)`,delay)
  balls.push(ball)
}
addEventListener('mousemove',function(e){
  x=e.clientX
  y=e.clientY
})
function animate(){
  requestAnimationFrame(animate)
ctx.fillStyle = "rgb(0,0,0)"
  ctx.fillRect(0 ,0 ,canvas.width ,canvas.height)
  balls.forEach((ball)=>{
    setTimeout(ball.update(),ball.delay)
      
    
    
  })
}
animate()



