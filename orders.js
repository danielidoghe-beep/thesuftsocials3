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

const loadingScreen =
document.getElementById("loadingScreen");

const ordersList =
document.getElementById("ordersList");

const emptyOrders =
document.getElementById("emptyOrders");

const orderModal =
document.getElementById("orderModal");

const orderOverlay =
document.getElementById("orderOverlay");

const closeOrder =
document.getElementById("closeOrder");

/*==================================
MODAL ELEMENTS
==================================*/

const modalProductImage =
document.getElementById("modalProductImage");

const modalProductName =
document.getElementById("modalProductName");

const modalOrderId =
document.getElementById("modalOrderId");

const modalAmount =
document.getElementById("modalAmount");

const modalQuantity =
document.getElementById("modalQuantity");

const modalStatus =
document.getElementById("modalStatus");

const modalDate =
document.getElementById("modalDate");

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
AUTH CHECK
==================================*/

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.replace("login.html");

        return;

    }

    watchOrders(user.uid);

});

/*==================================
WATCH ORDERS
==================================*/

function watchOrders(userId){

    const ordersQuery = query(

        collection(db,"orders"),

        where("userId","==",userId),

        orderBy("createdAt","desc")

    );

    onSnapshot(

        ordersQuery,

        (snapshot)=>{

            ordersList.innerHTML = "";

            if(snapshot.empty){

                emptyOrders.style.display = "flex";

                ordersList.appendChild(emptyOrders);

                hideLoading();

                return;

            }

            emptyOrders.style.display = "none";

            snapshot.forEach((document)=>{

                const order = document.data();

                createOrderCard(
                    document.id,
                    order
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
CREATE ORDER CARD
==================================*/

function createOrderCard(orderId,order){

    const card =
    document.createElement("div");

    card.className =
    "order-item";

    card.innerHTML = `

        <div class="order-image">

            <img
                src="${order.productImage || ''}"
                alt="${order.productName}">

        </div>

        <div class="order-details">

            <h3>

                ${order.productName}

            </h3>

            <p class="order-date">

                ${formatDate(order.createdAt)}

            </p>

            <div class="order-bottom">

                <span class="order-price">

                    ₦${Number(
                        order.amount || 0
                    ).toLocaleString("en-NG")}

                </span>

                <span class="order-status ${String(order.status).toLowerCase()}">

                    ${order.status}

                </span>

            </div>

        </div>

    `;

    card.addEventListener("click",()=>{

        openOrderModal(
            orderId,
            order
        );

    });

    ordersList.appendChild(card);

}
/*==================================
OPEN ORDER MODAL
==================================*/

function openOrderModal(orderId,order){

    modalProductImage.src =
    order.productImage || "";

    modalProductName.textContent =
    order.productName || "Unknown Product";

    modalOrderId.textContent =
    orderId;

    modalAmount.textContent =
    "₦" + Number(
        order.amount || 0
    ).toLocaleString("en-NG");

    modalQuantity.textContent =
    order.quantity || 1;

    modalStatus.textContent =
    order.status || "Pending";

    modalDate.textContent =
    formatDate(order.createdAt);

    orderModal.classList.add("show");

    orderOverlay.classList.add("show");

}

/*==================================
CLOSE ORDER MODAL
==================================*/

function closeOrderModal(){

    orderModal.classList.remove("show");

    orderOverlay.classList.remove("show");

}

closeOrder.addEventListener(
    "click",
    closeOrderModal
);

orderOverlay.addEventListener(
    "click",
    closeOrderModal
);

/*==================================
FORMAT DATE
==================================*/

function formatDate(timestamp){

    if(!timestamp){

        return "--";

    }

    let date;

    if(timestamp.toDate){

        date = timestamp.toDate();

    }else{

        date = new Date(timestamp);

    }

    return date.toLocaleString("en-NG",{

        day:"2-digit",

        month:"short",

        year:"numeric",

        hour:"2-digit",

        minute:"2-digit"

    });

}
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
IMAGE ERROR
==================================*/

document.addEventListener("error",(event)=>{

    if(event.target.tagName==="IMG"){

        event.target.style.display="none";

    }

},true);

/*==================================
STATUS COLOR
==================================*/

function getStatusClass(status){

    if(!status){

        return "pending";

    }

    status = status.toLowerCase();

    switch(status){

        case "completed":
        case "success":
            return "completed";

        case "processing":
            return "processing";

        case "failed":
        case "cancelled":
            return "failed";

        default:
            return "pending";

    }

}
