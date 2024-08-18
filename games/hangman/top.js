var word;
var dash ="— "

var errnum=1
var alphabet = ["a","b","c","d","e","f","g","h","i","j", "k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]

word()
function word(){word = prompt("pick a word").toLowerCase()}
if(word===""||word.split("").includes(" ")){
location.reload()
}
let word_arr = word.split("")
let guess_word = dash.repeat(word_arr.length).split(" ")
function guess(letter){
document.getElementById(letter).disabled=true
if(word_arr.includes(letter)){
for(let letter2 of word_arr){
if(letter===letter2){
index01=word_arr.indexOf(letter2)
word_arr.splice(index01,1,"-")
guess_word.splice(index01,1,letter)}}
document.getElementById("word").innerHTML=guess_word.join(" ")
if(guess_word.includes("—")===false)return end("WIN")
}else{
errnum=errnum+1
let guessed=document.getElementById("guess")
guessed.innerHTML=`${guessed.innerHTML+" "+letter}`
document.getElementById("hangman").src=`/files-docs/hangman/${errnum}.png`
if(errnum==4)return end("LOSE")
}
}
;