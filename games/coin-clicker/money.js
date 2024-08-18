let money = getCookie("money")
document.getElementById("money").innerHTML = money
document.getElementById("coin").addEventListener( "click",function(){
if(!money)money=0
money=parseInt(money)+100
setCookie("money",money,1000)
document.getElementById("money").innerHTML = money
})
