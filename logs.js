import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*==================================
ELEMENTS
==================================*/

const loadingScreen =
document.getElementById("loadingScreen");

const logsList =
document.getElementById("logsList");

const emptyLogs =
document.getElementById("emptyLogs");

const listingCount =
document.getElementById("listingCount");

const filterBtn =
document.getElementById("filterBtn");

/*==================================
CURRENT USER
==================================*/

let currentUser = null;

let currentBalance = 0;

/*==================================
LOADING
==================================*/

function hideLoading(){

    if(!loadingScreen) return;

    loadingScreen.classList.add("hide");

    setTimeout(()=>{

        loadingScreen.style.display="none";

    },300);

}

/*==================================
AUTH
==================================*/

onAuthStateChanged(auth,async(user)=>{

    if(!user){

        window.location.replace("login.html");

        return;

    }

    currentUser = user;

    await loadUserWallet(user.uid);

    watchLogs();

});
/*==================================
LOAD USER WALLET
==================================*/

async function loadUserWallet(userId){

    try{

        const userRef =
        doc(db,"users",userId);

        const userSnap =
        await getDoc(userRef);

        if(userSnap.exists()){

            const data =
            userSnap.data();

            currentBalance =
            Number(data.balance || 0);

        }

    }catch(error){

        console.error(error);

    }

}

/*==================================
WATCH LOGS STORE
==================================*/

function watchLogs(){

    const logsQuery = query(

        collection(db,"logs"),

        where("status","==","available"),

        orderBy("createdAt","desc")

    );

    onSnapshot(

        logsQuery,

        (snapshot)=>{

            logsList.innerHTML = "";

            if(snapshot.empty){

                emptyLogs.style.display="flex";

                logsList.appendChild(emptyLogs);

                listingCount.textContent =
                "0 accounts available";

                hideLoading();

                return;

            }

            emptyLogs.style.display="none";

            listingCount.textContent =
            `${snapshot.size} accounts available`;

            loadCategories(snapshot);

snapshot.forEach((document)=>{

    createLogCard(

        document.id,

        document.data()

    );

});

            hideLoading();

        },

        (error)=>{

            console.error(error);

            hideLoading();

        }

    );

}
/*==================================
CREATE PRODUCT CARD
==================================*/

function createLogCard(logId,log){

    const card =
    document.createElement("div");

    card.className =
    "log-card";
card.dataset.category =

log.category || "Other";
    card.innerHTML = `

        <div class="log-header">

            <h3 class="log-title">

                ${log.title}

            </h3>

            <p class="log-description">

                ${log.description}

            </p>

            <span class="log-stock">

                ${log.quantity} item${log.quantity > 1 ? "s" : ""}

            </span>

        </div>

        <div class="log-item">

            <img
                class="log-image"
                src="${log.image}"
                alt="${log.title}">

            <div class="log-details">

                <div class="log-top">

                    <h4 class="product-name">

                        ${log.platform}

                    </h4>

                    <span class="product-id">

                        #${logId.substring(0,6)}

                    </span>

                </div>

                <h2 class="product-price">

                    ₦${Number(
                        log.price || 0
                    ).toLocaleString("en-NG")}

                </h2>

                <p class="product-description">

                    ${log.description}

                </p>

                <button
                    class="buy-btn">

                    <i class="ri-shopping-cart-line"></i>

                    Buy

                </button>

            </div>

        </div>

    `;

    const buyButton =
    card.querySelector(".buy-btn");

    buyButton.addEventListener("click",()=>{

        buyLog(
            logId,
            log
        );

    });

    logsList.appendChild(card);

}
/*==================================
BUY PRODUCT
==================================*/

import{

    updateDoc,
    addDoc,
    serverTimestamp,
    increment

}from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

async function buyLog(logId,log){

    try{

        if(currentBalance < Number(log.price)){

            alert("Insufficient wallet balance.");

            return;

        }

        const userRef =
        doc(db,"users",currentUser.uid);

        const logRef =
        doc(db,"logs",logId);

        /*==========================
        DEDUCT WALLET
        ==========================*/

        await updateDoc(userRef,{

            balance:
            increment(-Number(log.price))

        });

        /*==========================
        REDUCE STOCK
        ==========================*/

        await updateDoc(logRef,{

            quantity:
            increment(-1)

        });

        /*==========================
        SAVE ORDER
        ==========================*/

        await addDoc(

            collection(db,"orders"),

            {

                userId:
                currentUser.uid,

                productId:
                logId,

                productName:
                log.title,

                productImage:
                log.image,

                platform:
                log.platform,

                amount:
                Number(log.price),

                quantity:1,

                status:"Completed",

                createdAt:
                serverTimestamp()

            }

        );

        /*==========================
        SAVE TRANSACTION
        ==========================*/

        await addDoc(

            collection(db,"transactions"),

            {

                userId:
                currentUser.uid,

                type:"Purchase",

                amount:
                Number(log.price),

                status:"Completed",

                description:
                log.title,

                createdAt:
                serverTimestamp()

            }

        );

        /*==========================
        SAVE NOTIFICATION
        ==========================*/

        await addDoc(

            collection(db,"notifications"),

            {

                userId:
                currentUser.uid,

                title:"Purchase Successful",

                message:
                `${log.title} has been added to your orders.`,

                read:false,

                createdAt:
                serverTimestamp()

            }

        );

        currentBalance -=
        Number(log.price);

        alert("Purchase successful!");

    }catch(error){

        console.error(error);

        alert("Purchase failed. Please try again.");

    }

}
/*==================================
REMOVE SOLD OUT ITEMS
==================================*/

async function updateStock(logId,currentQuantity){

    const logRef =
    doc(db,"logs",logId);

    if(currentQuantity <= 1){

        await updateDoc(logRef,{

            quantity:0,

            status:"unavailable"

        });

    }else{

        await updateDoc(logRef,{

            quantity:
            increment(-1)

        });

    }

}

/*==================================
IMAGE ERROR
==================================*/

document.addEventListener("error",(event)=>{

    if(event.target.tagName==="IMG"){

        event.target.style.display="none";

    }

},true);

/*==================================
WINDOW ERRORS
==================================*/

window.addEventListener("error",()=>{

    hideLoading();

});

window.addEventListener("unhandledrejection",()=>{

    hideLoading();

});

/*==================================
FILTER BUTTON
==================================*/

filterBtn.addEventListener("click",()=>{

    alert("Filter options coming soon.");

});
/*==================================
FILTER PANEL
==================================*/

const filterOverlay =
document.getElementById("filterOverlay");

const filterPanel =
document.getElementById("filterPanel");

const closeFilter =
document.getElementById("closeFilter");

const categorySearch =
document.getElementById("categorySearch");

const categoryList =
document.getElementById("categoryList");

/*==================================
OPEN FILTER
==================================*/

filterBtn.addEventListener("click",()=>{

    filterOverlay.classList.add("show");

    filterPanel.classList.add("show");

});

/*==================================
CLOSE FILTER
==================================*/

function closeFilterPanel(){

    filterOverlay.classList.remove("show");

    filterPanel.classList.remove("show");

}

closeFilter.addEventListener(
"click",
closeFilterPanel
);

filterOverlay.addEventListener(
"click",
closeFilterPanel
);

/*==================================
CATEGORY SEARCH
==================================*/

categorySearch.addEventListener("input",()=>{

    const value =
    categorySearch.value
    .toLowerCase()
    .trim();

    const items =
    document.querySelectorAll(".category-item");

    items.forEach(item=>{

        const text =
        item.innerText
        .toLowerCase();

        if(text.includes(value)){

            item.style.display="flex";

        }else{

            item.style.display="none";

        }

    });

});

/*==================================
CATEGORY FILTER
==================================*/

document.addEventListener("click",(e)=>{

    const button =
    e.target.closest(".category-item");

    if(!button) return;

    document
    .querySelectorAll(".category-item")
    .forEach(item=>{

        item.classList.remove("active");

    });

    button.classList.add("active");

    const category =
    button.dataset.category;

    document
    .querySelectorAll(".log-card")
    .forEach(card=>{

        if(category==="all"){

            card.style.display="block";

            return;

        }

        if(card.dataset.category===category){

            card.style.display="block";

        }else{

            card.style.display="none";

        }

    });

    closeFilterPanel();

});
/*==================================
LOAD CATEGORIES
==================================*/

function loadCategories(snapshot){

    const allCount =
    document.getElementById("allListingCount");

    allCount.textContent =
    snapshot.size;

    const categories = {};

    snapshot.forEach((document)=>{

        const data =
        document.data();

        const category =
        data.category || "Other";

        if(!categories[category]){

            categories[category] = 0;

        }

        categories[category]++;

    });

    document

    .querySelectorAll(".firebase-category")

    .forEach(item=>{

        item.remove();

    });

    Object.keys(categories)

    .sort()

    .forEach(category=>{

        const button =
        document.createElement("button");

        button.className =
        "category-item firebase-category";

        button.dataset.category =
        category;

        button.innerHTML = `

            <span>

                ${category}

            </span>

            <span class="category-count">

                ${categories[category]}

            </span>

        `;

        categoryList.appendChild(button);

    });

}
