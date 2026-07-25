const themeBtn =
document.getElementById("themeToggle");

function updateThemeIcon(){

const icon =
themeBtn.querySelector("i");

if(document.body.classList.contains("dark")){

icon.setAttribute(
"data-lucide",
"moon"
);

}else{

icon.setAttribute(
"data-lucide",
"sun"
);

}

lucide.createIcons();
}

const savedTheme =
localStorage.getItem("theme");

if(savedTheme === "dark"){

document.body.classList.add("dark");

}

updateThemeIcon();

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

updateThemeIcon();

});
