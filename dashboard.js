import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*==================================
ELEMENTS
==================================*/

const loadingScreen = document.getElementById("loadingScreen");

const menuBtn = document.getElementById("menuBtn");

const sidebar = document.getElementById("sidebar");

const sidebarOverlay = document.getElementById("sidebarOverlay");

const logoutBtn = document.getElementById("logoutBtn");

/*==================================
HELPERS
==================================*/

function showLoading(){

    loadingScreen.classList.remove("hide");

}

function hideLoading(){

    loadingScreen.classList.add("hide");

    setTimeout(()=>{

        loadingScreen.style.display="none";

    },300);

}

function openSidebar(){

    sidebar.classList.add("active");

    sidebarOverlay.classList.add("active");

}

function closeSidebar(){

    sidebar.classList.remove("active");

    sidebarOverlay.classList.remove("active");

}

/*==================================
SIDEBAR
==================================*/

menuBtn.addEventListener("click",openSidebar);

sidebarOverlay.addEventListener("click",closeSidebar);

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeSidebar();

    }

});

/*==================================
AUTH
==================================*/

onAuthStateChanged(auth,async(user)=>{

    if(!user){

        window.location.replace("login.html");

        return;

    }

    await loadDashboard(user);

});

/*==================================
LOAD DASHBOARD
==================================*/

async function loadDashboard(user){

    try{

        const userRef = doc(db,"users",user.uid);

        const userSnap = await getDoc(userRef);

        if(!userSnap.exists()){

            hideLoading();

            return;

        }

        const data = userSnap.data();

        /*==============================
        USER NAME
        ==============================*/

        document.getElementById("userName").textContent =
            data.firstName || user.displayName || "User";

        document.getElementById("sideUsername").textContent =
            data.firstName || user.displayName || "User";

        /*==============================
        EMAIL
        ==============================*/

        document.getElementById("sideEmail").textContent =
            user.email || "";

        /*==============================
        WALLET
        ==============================*/

        const wallet =
            Number(data.walletBalance || 0);

        document.getElementById("walletBalance").textContent =
            "₦" + wallet.toLocaleString("en-NG");

        document.getElementById("headerBalance").textContent =
            "₦" + wallet.toLocaleString("en-NG");

        /*==============================
        SUMMARY
        ==============================*/

        document.getElementById("purchaseCount").textContent =
            data.totalPurchases || 0;

        document.getElementById("inventoryCount").textContent =
            data.inventory || 0;

        /*==============================
        PROFILE AVATAR
        ==============================*/

        const avatars = document.querySelectorAll(".profile-avatar");

        avatars.forEach((avatar)=>{

            if(user.photoURL){

                avatar.innerHTML =
                `<img src="${user.photoURL}" alt="Profile">`;

            }else{

                avatar.textContent =
                (data.firstName || user.email || "U")
                .charAt(0)
                .toUpperCase();

            }

        });

        /*==============================
        LOAD OTHER DATA
        ==============================*/

        await loadRecentOrders(user.uid);

        await loadRecentTransactions(user.uid);

        loadNotifications(user.uid);

        watchUserData(user.uid);

    }catch(error){

        console.error("Dashboard Error:",error);

    }finally{

        hideLoading();

    }

}
/*==================================
RECENT ORDERS
==================================*/

async function loadRecentOrders(userId){

    const container =
        document.getElementById("recentOrders");

    try{

        const q = query(
            collection(db,"orders"),
            where("userId","==",userId),
            orderBy("createdAt","desc"),
            limit(5)
        );

        const snapshot = await getDocs(q);

        if(snapshot.empty){

            return;

        }

        container.innerHTML = "";

        snapshot.forEach((doc)=>{

            const order = doc.data();

            container.innerHTML += `

            <div class="order-item">

                <div class="order-left">

                    <div class="order-icon">

                        <i class="ri-shopping-bag-3-line"></i>

                    </div>

                    <div>

                        <h4>${order.productName}</h4>

                        <p>${order.status}</p>

                    </div>

                </div>

                <div class="order-right">

                    ₦${Number(order.amount || 0).toLocaleString("en-NG")}

                </div>

            </div>

            `;

        });

    }catch(error){

        console.error("Orders Error:",error);

    }

}

/*==================================
RECENT TRANSACTIONS
==================================*/

async function loadRecentTransactions(userId){

    const container =
        document.getElementById("recentTransactions");

    try{

        const q = query(
            collection(db,"transactions"),
            where("userId","==",userId),
            orderBy("createdAt","desc"),
            limit(5)
        );

        const snapshot = await getDocs(q);

        if(snapshot.empty){

            return;

        }

        container.innerHTML = "";

        snapshot.forEach((doc)=>{

            const transaction = doc.data();

            const sign =
                transaction.type === "Credit"
                ? "+"
                : "-";

            container.innerHTML += `

            <div class="transaction-item">

                <div class="transaction-left">

                    <div class="transaction-icon">

                        <i class="ri-exchange-funds-line"></i>

                    </div>

                    <div>

                        <h4>${transaction.type}</h4>

                        <p>${transaction.status}</p>

                    </div>

                </div>

                <div class="transaction-right">

                    ${sign}₦${Number(transaction.amount || 0).toLocaleString("en-NG")}

                </div>

            </div>

            `;

        });

    }catch(error){

        console.error("Transactions Error:",error);

    }

}
/*==================================
REAL-TIME NOTIFICATIONS
==================================*/

function loadNotifications(userId){

    const badge =
        document.getElementById("notificationBadge");

    const notificationQuery = query(
        collection(db,"notifications"),
        where("userId","==",userId)
    );

    onSnapshot(notificationQuery,(snapshot)=>{

        let unread = 0;

        snapshot.forEach((doc)=>{

            const notification = doc.data();

            if(notification.read === false){

                unread++;

            }

        });

        badge.textContent = unread;

        badge.style.display =
            unread > 0 ? "flex" : "none";

    },(error)=>{

        console.error("Notification Error:",error);

    });

}

/*==================================
REAL-TIME USER DATA
==================================*/

function watchUserData(userId){

    const userRef = doc(db,"users",userId);

    onSnapshot(userRef,(snapshot)=>{

        if(!snapshot.exists()) return;

        const data = snapshot.data();

        const wallet =
            Number(data.walletBalance || 0);

        document.getElementById("walletBalance").textContent =
            "₦" + wallet.toLocaleString("en-NG");

        document.getElementById("headerBalance").textContent =
            "₦" + wallet.toLocaleString("en-NG");

        document.getElementById("purchaseCount").textContent =
            data.totalPurchases || 0;

        document.getElementById("inventoryCount").textContent =
            data.inventory || 0;

    },(error)=>{

        console.error("Realtime User Error:",error);

    });

}
/*==================================
UTILITY FUNCTIONS
==================================*/

window.addEventListener("online",()=>{

    console.log("Internet Connected");

});

window.addEventListener("offline",()=>{

    console.log("Internet Disconnected");

});

/*==================================
GLOBAL ERRORS
==================================*/

window.addEventListener("error",(event)=>{

    console.error("JavaScript Error:",event.error);

    hideLoading();

});

window.addEventListener("unhandledrejection",(event)=>{

    console.error("Promise Error:",event.reason);

    hideLoading();

});

/*==================================
WINDOW LOAD
==================================*/

window.addEventListener("load",()=>{

    showLoading();

});

/*==================================
PAGE VISIBILITY
==================================*/

document.addEventListener("visibilitychange",()=>{

    if(document.hidden){

        console.log("Dashboard Hidden");

    }else{

        console.log("Dashboard Visible");

    }

});

/*==================================
SAFE LOGOUT
==================================*/

logoutBtn.addEventListener("click",async()=>{

    try{

        showLoading();

        await signOut(auth);

        window.location.replace("login.html");

    }catch(error){

        console.error(error);

        hideLoading();

        alert("Unable to logout. Please try again.");

    }

});
