function hide(ID){
result=document.getElementById(ID).getAttribute("hidden")
if(result==="") return false 
else return true
}
document.addEventListener("keydown", function onEvent(event) {
let player = document.getElementById("player01")
let location= player.getBoundingClientRect()
let lx=location.left ;let ly = location.top
    if (event.key === "ArrowLeft") {
   
nl = lx-3+"px"
player.style.left=nl
    }
  if(event.key === "ArrowRight") {
nl = lx+3+"px"
player.style.left=nl
    }
if(event.key === "ArrowUp") {
nl = ly-3+"px"
player.style.top=nl
    }
if(event.key === "ArrowDown") {
nl = ly+3+"px"
player.style.top=nl
    }
   if (event.key === "Enter") {
let shop = document.getElementById("shop");
let check = hide("shop");
shop.hidden = check;
  }
});