function buy(item01,price){
money=getCookie("money")-price
buymsg=document.getElementById("buymsg")
if(money<0)return error(`you dont have that much money`)
setCookie("money",money,1000)
item_ammount = document.getElementById(item01)
let cammount=item_ammount.innerHTML
item_ammount.innerHTML=cammount+1
buymsg.innerHTML=`bought a ${item01} for ${price} coins`
fade(document.getElementById("buymsg"))
let items=getCookie("items")
if(items===null) setCookie("items",["test=0"], 1000)
items=getCookie("items")
console.log(items)
items=items.split(",")
console.log(items)
for(let item02 of items){
if(item02.startsWith(item01))i=>{
let index=items.indexOf(i)
console.log(index,i)
let ammount=item02.split("=").pop()
items=items.splice(index, 1 ,`${item01}=${ammount +1} `)
setCookie("items",items,1000)
}
items2=getCookie("items").split(/[,=]/)

if(items2.includes(item01)===false){
items.push(`${item01}=1`)
setCookie("items",items,1000)
}}
}

function error(msg) {
buymsg.innerHTML=msg
fade(document.getElementById("buymsg"))
}
function fade(element) {
  element.style.display = 'block';
    let op = 1;
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
element.style.filter = 'alpha(opacity=' + op * 100+ ")";
        op -= op * 0.1;
    }, 50);}
