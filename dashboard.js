// =====================================
// dashboard.js - Part 1
// Firebase + Authentication + User Data
// =====================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =====================================
// HTML ELEMENTS
// =====================================

const loadingScreen = document.getElementById("loadingScreen");

const username = document.getElementById("username");
const welcomeName = document.getElementById("welcomeName");

const topUsername = document.getElementById("topUsername");
const topEmail = document.getElementById("topEmail");

const dropdownUsername =
document.getElementById("dropdownUsername");

const dropdownEmail =
document.getElementById("dropdownEmail");

const walletBalance =
document.getElementById("walletBalance");

const availableBalance =
document.getElementById("availableBalance");

const accountStatus =
document.getElementById("accountStatus");

const accountBadge =
document.getElementById("accountBadge");

const accountLevel =
document.getElementById("accountLevel");

const profileImage =
document.getElementById("profileImage");

const topProfileImage =
document.getElementById("topProfileImage");

const dropdownProfileImage =
document.getElementById("dropdownProfileImage");


// =====================================
// AUTH CHECK
// =====================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    await loadUser(user);

});


// =====================================
// LOAD USER
// =====================================

async function loadUser(user){

    try{

        const userRef = doc(db,"users",user.uid);

        const userSnap = await getDoc(userRef);

        if(!userSnap.exists()){

            alert("User record not found.");

            loadingScreen.style.display = "none";

            return;

        }

        const data = userSnap.data();

        const firstName =
        data.firstName || "";

        const lastName =
        data.lastName || "";

        const fullName =
        `${firstName} ${lastName}`;

        username.textContent = fullName;

        welcomeName.textContent = firstName;

        topUsername.textContent = fullName;

        dropdownUsername.textContent = fullName;

        topEmail.textContent =
        data.email || "";

        dropdownEmail.textContent =
        data.email || "";

        const balance =
        Number(data.balance || 0);

        walletBalance.textContent =
        "₦" + balance.toLocaleString("en-NG");

        availableBalance.textContent =
        "₦" + balance.toLocaleString("en-NG");

        accountStatus.textContent =
        "Verified";

        accountBadge.textContent =
        "Active";

        accountLevel.textContent =
        "Premium User";

        const avatar =
        `https://ui-avatars.com/api/?background=6d5cff&color=ffffff&name=${encodeURIComponent(fullName)}`;

        profileImage.src = avatar;

        topProfileImage.src = avatar;

        dropdownProfileImage.src = avatar;

        // Load the remaining dashboard data
        loadDashboard(user.uid);

    }

    catch(error){

        console.error(error);

        alert(error.message);

        loadingScreen.style.display = "none";

    }

}
// =====================================
// dashboard.js - Part 2
// Transactions + Orders + Dashboard Stats
// =====================================

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =====================================
// HTML ELEMENTS
// =====================================

const recentTransactions =
document.getElementById("recentTransactions");

const recentOrders =
document.getElementById("recentOrders");

const totalOrders =
document.getElementById("totalOrders");

const totalSpent =
document.getElementById("totalSpent");

const totalDeposits =
document.getElementById("totalDeposits");

const totalWithdrawals =
document.getElementById("totalWithdrawals");


// =====================================
// LOAD DASHBOARD
// =====================================

async function loadDashboard(uid){

    await Promise.all([

        loadTransactions(uid),

        loadOrders(uid)

    ]);

    // Dashboard finished loading
    if(loadingScreen){

        loadingScreen.style.display = "none";

    }

}



// =====================================
// LOAD TRANSACTIONS
// =====================================

async function loadTransactions(uid){

    try{

        const q = query(

            collection(db,"transactions"),

            where("userId","==",uid),

            orderBy("createdAt","desc"),

            limit(10)

        );

        const snapshot =
        await getDocs(q);

        recentTransactions.innerHTML = "";

        let deposits = 0;
        let withdrawals = 0;
        let spent = 0;

        if(snapshot.empty){

            recentTransactions.innerHTML = `

            <tr>

                <td colspan="5">

                    No transactions found.

                </td>

            </tr>

            `;

        }

        snapshot.forEach(docSnap=>{

            const data = docSnap.data();

            const amount =
            Number(data.amount || 0);

            const type =
            data.type || "Credit";

            if(type.toLowerCase()=="credit"){

                deposits += amount;

            }

            if(type.toLowerCase()=="debit"){

                withdrawals += amount;

                spent += amount;

            }

            const date =
            data.createdAt
            ? new Date(
            data.createdAt
            ).toLocaleDateString("en-NG")
            : "--";

            recentTransactions.innerHTML += `

            <tr>

                <td>${type}</td>

                <td>

                ${data.description || "Wallet Transaction"}

                </td>

                <td>

                ₦${amount.toLocaleString("en-NG")}

                </td>

                <td>

                Successful

                </td>

                <td>

                ${date}

                </td>

            </tr>

            `;

        });

        totalDeposits.textContent =
        "₦" + deposits.toLocaleString("en-NG");

        totalWithdrawals.textContent =
        "₦" + withdrawals.toLocaleString("en-NG");

        totalSpent.textContent =
        "₦" + spent.toLocaleString("en-NG");

    }

    catch(error){

        console.error(error);

    }

}



// =====================================
// LOAD ORDERS
// =====================================

async function loadOrders(uid){

    try{

        const q = query(

            collection(db,"orders"),

            where("userId","==",uid),

            orderBy("createdAt","desc"),

            limit(5)

        );

        const snapshot =
        await getDocs(q);

        recentOrders.innerHTML = "";

        let count = 0;

        if(snapshot.empty){

            recentOrders.innerHTML = `

            <div class="empty-orders">

                No Orders Yet

            </div>

            `;

            totalOrders.textContent = "0";

            return;

        }

        snapshot.forEach(docSnap=>{

            count++;

            const data = docSnap.data();

            recentOrders.innerHTML += `

            <div class="order-card">

                <img
                src="${data.image || ''}"
                class="order-image">

                <div>

                    <h4>

                    ${data.productName || "Product"}

                    </h4>

                    <p>

                    ₦${Number(data.amount||0).toLocaleString("en-NG")}

                    </p>

                </div>

                <span>

                ${data.status || "Pending"}

                </span>

            </div>

            `;

        });

        totalOrders.textContent = count;

    }

    catch(error){

        console.error(error);

    }

}
// =====================================
// dashboard.js - Part 3
// Notifications + UI Controls
// =====================================

// HTML ELEMENTS

const notificationBtn =
document.getElementById("notificationBtn");

const notificationPanel =
document.getElementById("notificationPanel");

const notificationList =
document.getElementById("notificationList");

const notificationCount =
document.getElementById("notificationCount");

const closeNotifications =
document.getElementById("closeNotifications");

const profileBox =
document.getElementById("profileBox");

const profileDropdown =
document.getElementById("profileDropdown");

const logoutBtn =
document.getElementById("logoutBtn");

const logoutDropdown =
document.getElementById("logoutDropdown");

const menuToggle =
document.getElementById("menuToggle");

const sidebar =
document.getElementById("sidebar");

const themeToggle =
document.getElementById("themeToggle");

const refreshDashboard =
document.getElementById("refreshDashboard");



// =====================================
// LOAD NOTIFICATIONS
// =====================================

async function loadNotifications(uid){

    try{

        const q = query(

            collection(db,"notifications"),

            where("userId","==",uid),

            orderBy("createdAt","desc"),

            limit(20)

        );

        const snapshot =
        await getDocs(q);

        notificationList.innerHTML = "";

        let unread = 0;

        if(snapshot.empty){

            notificationList.innerHTML = `

            <div class="empty-card">

                No notifications yet.

            </div>

            `;

            notificationCount.textContent = "0";

            return;

        }

        snapshot.forEach(docSnap=>{

            const data = docSnap.data();

            if(data.read===false){

                unread++;

            }

            notificationList.innerHTML += `

            <div class="notification-item">

                <h4>

                    ${data.title || "Notification"}

                </h4>

                <p>

                    ${data.message || ""}

                </p>

                <small>

                    ${
                        data.createdAt
                        ? new Date(data.createdAt).toLocaleString("en-NG")
                        : "--"
                    }

                </small>

            </div>

            `;

        });

        notificationCount.textContent = unread;

    }

    catch(error){

        console.error(error);

    }

}



// =====================================
// OPEN/CLOSE NOTIFICATIONS
// =====================================

if(notificationBtn){

notificationBtn.onclick=()=>{

notificationPanel.classList.toggle("show");

};

}

if(closeNotifications){

closeNotifications.onclick=()=>{

notificationPanel.classList.remove("show");

};

}



// =====================================
// PROFILE MENU
// =====================================

if(profileBox){

profileBox.onclick=()=>{

profileDropdown.classList.toggle("show");

};

}



// =====================================
// SIDEBAR
// =====================================

if(menuToggle){

menuToggle.onclick=()=>{

sidebar.classList.toggle("show");

};

}



// =====================================
// REFRESH BUTTON
// =====================================

if(refreshDashboard){

refreshDashboard.onclick=()=>{

const user = auth.currentUser;

if(user){

loadUser(user);

loadDashboard(user.uid);

loadNotifications(user.uid);

}

};

}



// =====================================
// LIGHT / DARK MODE
// =====================================

const savedTheme =
localStorage.getItem("theme");

if(savedTheme){

document.body.classList.add(savedTheme);

}

if(themeToggle){

themeToggle.onclick=()=>{

document.body.classList.toggle("light-mode");

if(document.body.classList.contains("light-mode")){

localStorage.setItem(

"theme",

"light-mode"

);

}else{

localStorage.removeItem("theme");

}

};

}



// =====================================
// LOGOUT
// =====================================

async function logout(){

    try{

        await signOut(auth);

        window.location.href="login.html";

    }

    catch(error){

        alert(error.message);

    }

}

if(logoutBtn){

logoutBtn.onclick = logout;

}

if(logoutDropdown){

logoutDropdown.onclick = logout;

}



// =====================================
// AUTO REFRESH
// =====================================

setInterval(()=>{

const user = auth.currentUser;

if(user){

loadTransactions(user.uid);

loadOrders(user.uid);

loadNotifications(user.uid);

}

},30000);



// =====================================
// START NOTIFICATIONS
// =====================================

onAuthStateChanged(auth,(user)=>{

if(user){

loadNotifications(user.uid);

}

});
// =====================================
// dashboard.js - Part 4
// Final Initialization
// =====================================



// =====================================
// IMAGE FALLBACK
// =====================================

document.querySelectorAll("img").forEach(img=>{

    img.onerror=function(){

        this.src=
        "https://ui-avatars.com/api/?background=6d5cff&color=ffffff&name=User";

    };

});



// =====================================
// CARD ANIMATION
// =====================================

const cards=document.querySelectorAll(

".stat-card,.service-card,.dashboard-card,.action-card"

);

cards.forEach((card,index)=>{

    card.style.opacity="0";

    card.style.transform="translateY(20px)";

    setTimeout(()=>{

        card.style.transition=".45s ease";

        card.style.opacity="1";

        card.style.transform="translateY(0)";

    },index*80);

});



// =====================================
// CLOSE SIDEBAR ON MOBILE
// =====================================

window.addEventListener("resize",()=>{

    if(window.innerWidth>992){

        if(sidebar){

            sidebar.classList.remove("show");

        }

    }

});



// =====================================
// ESC KEY
// =====================================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        if(notificationPanel){

            notificationPanel.classList.remove("show");

        }

        if(profileDropdown){

            profileDropdown.classList.remove("show");

        }

        if(sidebar){

            sidebar.classList.remove("show");

        }

    }

});



// =====================================
// CLICK OUTSIDE
// =====================================

window.addEventListener("click",(e)=>{

    if(

        profileBox &&

        profileDropdown &&

        !profileBox.contains(e.target) &&

        !profileDropdown.contains(e.target)

    ){

        profileDropdown.classList.remove("show");

    }

    if(

        notificationBtn &&

        notificationPanel &&

        !notificationBtn.contains(e.target) &&

        !notificationPanel.contains(e.target)

    ){

        notificationPanel.classList.remove("show");

    }

});



// =====================================
// SAFE LOADING SCREEN
// =====================================

function hideLoading(){

    if(!loadingScreen) return;

    loadingScreen.style.opacity="0";

    setTimeout(()=>{

        loadingScreen.style.display="none";

    },300);

}



// Always hide loader after 5 seconds,
// even if something fails.

window.addEventListener("load",()=>{

    setTimeout(hideLoading,5000);

});



// =====================================
// GLOBAL ERROR HANDLER
// =====================================

window.addEventListener("error",(event)=>{

    console.error(event.error);

    hideLoading();

});



// =====================================
// UNHANDLED PROMISES
// =====================================

window.addEventListener(

"unhandledrejection",

(event)=>{

    console.error(event.reason);

    hideLoading();

}

);



// =====================================
// DASHBOARD READY
// =====================================

console.log("Dashboard initialized successfully.");
