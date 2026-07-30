/*==================================
WHATSAPP NUMBER
==================================*/

const whatsappNumber =
"2349117412352";

/*==================================
ELEMENTS
==================================*/

const searchInput =
document.getElementById("searchBoost");

const platformButtons =
document.querySelectorAll(".platform-btn");

const cards =
document.querySelectorAll(".boost-card");

let currentPlatform = "all";
/*==================================
PLATFORM FILTER
==================================*/

platformButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        platformButtons.forEach(item=>{

            item.classList.remove("active");

        });

        button.classList.add("active");

        currentPlatform =
        button.dataset.platform;

        filterCards();

    });

});
/*==================================
SEARCH
==================================*/

searchInput.addEventListener("input",()=>{

    filterCards();

});
/*==================================
FILTER CARDS
==================================*/

function filterCards(){

    const keyword =
    searchInput.value
    .toLowerCase()
    .trim();

    cards.forEach(card=>{

        const platform =
        card.dataset.platform;

        const text =
        card.innerText
        .toLowerCase();

        const matchPlatform =

            currentPlatform==="all" ||

            currentPlatform===platform;

        const matchSearch =

            text.includes(keyword);

        if(matchPlatform && matchSearch){

            card.style.display="flex";

        }else{

            card.style.display="none";

        }

    });

}
/*==================================
BUY BUTTON
==================================*/

document.addEventListener("click",(e)=>{

    const button =
    e.target.closest(".buy-btn");

    if(!button) return;

    const platform =
    button.dataset.platform;

    const service =
    button.dataset.service;

    const price =
    button.dataset.price;

    const message =

`Hello ThesuftSocials,

I want to buy a boost service.

Platform: ${platform}

Service: ${service}

Price: ${price}

Please assist me.

Thank you.`;

    const url =

`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(

        url,

        "_blank"

    );

});
/*==================================
ERRORS
==================================*/

window.addEventListener("error",(e)=>{

    console.error(e);

});

window.addEventListener(

"unhandledrejection",

(e)=>{

    console.error(e);

});
