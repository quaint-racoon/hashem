document.addEventListener("click", function onclick(click) {

let lx=click.clientX; let ly=click.clientY;

let img=document.createElement("img")
img.src="images/click.png"
img.style.left=lx;img.style.top=ly;
img.style.position="fixed"
img.style.transform="translate(-50%,-50%)"
img.style.zIndex="-10"
document.getElementsByTagName("body")[0].appendChild(img)
setTimeout(()=>{img.remove()},800)
});
document.getElementById("coin").addEventListener("click",function() {let x=random(window.innerWidth);let y= random( window.innerHeight)
coin.style.top=y;
coin.style.left=x;})

function random(n){return Math.floor(Math.random()*n)}
