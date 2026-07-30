import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*==================================
ELEMENTS
==================================*/

const smsList =
document.getElementById("smsList");

const emptySms =
document.getElementById("emptySms");

const searchInput =
document.getElementById("searchInput");

const countryButtons =
document.querySelectorAll(".country-btn");

const serviceButtons =
document.querySelectorAll(".service-btn");

let selectedCountry = "all";

let selectedService = "all";

let smsProducts = [];
/*==================================
AUTH
==================================*/

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.replace(
            "login.html"
        );

        return;

    }

    loadSmsNumbers();

});
/*==================================
DISPLAY SMS NUMBERS
==================================*/

function displaySms(){

    smsList.innerHTML = "";

    let found = false;

    smsProducts.forEach((item)=>{

        if(
            selectedCountry !== "all" &&
            item.country !== selectedCountry
        ){
            return;
        }

        if(
            selectedService !== "all" &&
            item.service !== selectedService
        ){
            return;
        }

        const keyword =
        searchInput.value
        .toLowerCase()
        .trim();

        if(
            keyword &&
            !(
                item.country.toLowerCase().includes(keyword) ||
                item.service.toLowerCase().includes(keyword)
            )
        ){
            return;
        }

        found = true;

        const card =
        document.createElement("div");

        card.className =
        "sms-card";

        card.innerHTML = `

            <div class="sms-content">

                <div class="sms-top">

                    <div class="sms-country">

                        <span class="sms-flag">

                            ${item.flag}

                        </span>

                        <span class="sms-country-name">

                            ${item.country}

                        </span>

                    </div>

                </div>

                <div class="sms-service">

                    ${getServiceIcon(item.service)}

                    <span>

                        ${item.service}

                    </span>

                </div>

                <div class="sms-price">

                    ₦${Number(
                        item.price || 0
                    ).toLocaleString("en-NG")}

                </div>

                <span class="sms-status available">

                    ✔ Available

                </span>

                <button
                    class="buy-whatsapp"
                    data-id="${item.id}">

                    <i class="ri-whatsapp-fill"></i>

                    Buy on WhatsApp

                </button>

            </div>

        `;

        smsList.appendChild(card);

    });

    if(!found){

        smsList.appendChild(emptySms);

        emptySms.style.display = "block";

    }else{

        emptySms.style.display = "none";

    }

}
/*==================================
SERVICE ICONS
==================================*/

function getServiceIcon(service){

    switch(service){

        case "WhatsApp":
            return '<i class="ri-whatsapp-fill"></i>';

        case "Telegram":
            return '<i class="ri-telegram-2-fill"></i>';

        case "Facebook":
            return '<i class="ri-facebook-circle-fill"></i>';

        case "Instagram":
            return '<i class="ri-instagram-fill"></i>';

        case "TikTok":
            return '<i class="ri-tiktok-fill"></i>';

        case "Discord":
            return '<i class="ri-discord-fill"></i>';

        case "X":
            return '<i class="ri-twitter-x-fill"></i>';

        case "Signal":
            return '<i class="ri-message-3-fill"></i>';

        case "Google":
            return '<i class="ri-google-fill"></i>';

        default:
            return '<i class="ri-apps-2-fill"></i>';

    }

}
/*==================================
COUNTRY FILTER
==================================*/

countryButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        countryButtons.forEach(item=>{

            item.classList.remove("active");

        });

        button.classList.add("active");

        selectedCountry =
        button.dataset.country;

        displaySms();

    });

});

/*==================================
SERVICE FILTER
==================================*/

serviceButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        serviceButtons.forEach(item=>{

            item.classList.remove("active");

        });

        button.classList.add("active");

        selectedService =
        button.dataset.service;

        displaySms();

    });

});

/*==================================
SEARCH
==================================*/

searchInput.addEventListener("input",()=>{

    displaySms();

});

/*==================================
BUY ON WHATSAPP
==================================*/

document.addEventListener("click",(e)=>{

    const button =
    e.target.closest(".buy-whatsapp");

    if(!button) return;

    const id =
    button.dataset.id;

    const item =
    smsProducts.find(product=>{

        return product.id===id;

    });

    if(!item) return;

    const whatsappNumber =
    item.whatsappNumber ||
    "2349117412352";

    const message =

`Hello ThesuftSocials,

I would like to buy an SMS verification number.

Country: ${item.flag} ${item.country}

Service: ${item.service}

Price: ₦${Number(item.price).toLocaleString("en-NG")}

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
ERROR HANDLING
==================================*/

window.addEventListener("error",(error)=>{

    console.error(error);

});

window.addEventListener(
    "unhandledrejection",
    (error)=>{

        console.error(error);

    }
);
