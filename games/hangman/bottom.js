document.getElementById("word").innerHTML=dash.repeat(word_arr.length)
var parent=document.getElementById("parent")
for(let letter of alphabet){
let button=document.createElement("button")
button.innerHTML=letter
button.setAttribute('onclick',`guess("${letter}")`)
button.id=letter
parent.append(button)
  }
function end(msg){
end=document.getElementById("end")
end.style.display="block"
document.getElementById("msg").innerHTML=msg
document.getElementById("wrapper").innerHTML=null
if(msg=="LOSE")return end.style.color="red"
else return end.style.color="green"
}