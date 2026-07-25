const themeBtn =
document.getElementById("themeToggle");

const savedTheme =
localStorage.getItem("theme");

if(savedTheme === "dark"){
document.body.classList.add("dark");
}

themeBtn.addEventListener("click",()=>{

document.body.classList.toggle("dark");

if(
document.body.classList.contains("dark")
){
localStorage.setItem(
"theme",
"dark"
);
}else{
localStorage.setItem(
"theme",
"light"
);
}

});
