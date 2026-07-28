// ==========================================
// dashboard.js
// Part 1 - Authentication & User Profile
// ==========================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// ==========================================
// HTML ELEMENTS
// ==========================================

const loadingScreen = document.getElementById("loadingScreen");

const username = document.getElementById("username");
const topUsername = document.getElementById("topUsername");
const dropdownUsername = document.getElementById("dropdownUsername");

const welcomeName = document.getElementById("welcomeName");

const topEmail = document.getElementById("topEmail");
const dropdownEmail = document.getElementById("dropdownEmail");

const profileImage = document.getElementById("profileImage");
const topProfileImage = document.getElementById("topProfileImage");
const dropdownProfileImage = document.getElementById("dropdownProfileImage");

const walletBalance = document.getElementById("walletBalance");
const availableBalance = document.getElementById("availableBalance");

const accountStatus = document.getElementById("accountStatus");


// ==========================================
// AUTHENTICATION
// ==========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    await loadUser(user);

});


// ==========================================
// LOAD USER
// ==========================================

async function loadUser(user){

    try{

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if(!userSnap.exists()){

            alert("User profile not found.");

            return;

        }

        const data = userSnap.data();

        const fullName =
            `${data.firstName || ""} ${data.lastName || ""}`.trim();

        username.textContent = fullName;

        if(welcomeName)
            welcomeName.textContent = data.firstName || "";

        topUsername.textContent = fullName;
        dropdownUsername.textContent = fullName;

        topEmail.textContent = data.email || user.email;
        dropdownEmail.textContent = data.email || user.email;

        accountStatus.textContent =
            data.accountStatus || "Premium Member";

        walletBalance.textContent =
            "₦" + Number(data.balance || 0).toLocaleString("en-NG");

        availableBalance.textContent =
            "₦" + Number(data.balance || 0).toLocaleString("en-NG");

        const avatar =
        data.photoURL ||
        "https://ui-avatars.com/api/?background=6d5cff&color=ffffff&name=" +
        encodeURIComponent(fullName);

        profileImage.src = avatar;
        topProfileImage.src = avatar;
        dropdownProfileImage.src = avatar;

        if(loadingScreen){

            loadingScreen.style.display = "none";

        }

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}
// ==========================================
// Part 2 - Orders & Wallet Statistics
// ==========================================

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// ==========================================
// HTML ELEMENTS
// ==========================================

const recentOrders =
document.getElementById("recentOrders");

const recentActivity =
document.getElementById("recentActivity");

const totalDeposits =
document.getElementById("totalDeposits");

const totalWithdrawals =
document.getElementById("totalWithdrawals");

const totalSpent =
document.getElementById("totalSpent");

const totalOrders =
document.getElementById("totalOrders");



// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard(uid){

    await Promise.all([

        loadOrders(uid),

        loadTransactions(uid)

    ]);

}



// ==========================================
// LOAD ORDERS
// ==========================================

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

        recentOrders.innerHTML="";

        let orderCount=0;

        if(snapshot.empty){

            recentOrders.innerHTML=`

            <div class="empty-card">

                No orders yet.

            </div>

            `;

            totalOrders.textContent="0";

            return;

        }

        snapshot.forEach(doc=>{

            orderCount++;

            const data=doc.data();

            const amount=
            Number(data.amount || 0);

            const service=
            data.service || "Service";

            const status=
            data.status || "Pending";

            const created=
            data.createdAt
            ? new Date(
                data.createdAt
              ).toLocaleDateString("en-NG")
            : "--";

            recentOrders.innerHTML += `

            <div class="order-item">

                <div class="order-left">

                    <div class="order-icon">

                        <i class="ri-shopping-bag-fill"></i>

                    </div>

                    <div>

                        <div class="order-name">

                            ${service}

                        </div>

                        <div class="order-date">

                            ${created}

                        </div>

                    </div>

                </div>

                <div class="order-price">

                    ₦${amount.toLocaleString("en-NG")}

                </div>

            </div>

            `;

        });

        totalOrders.textContent=
        orderCount;

    }

    catch(error){

        console.error(error);

    }

}



// ==========================================
// LOAD TRANSACTIONS
// ==========================================

async function loadTransactions(uid){

    try{

        const q=query(

            collection(db,"transactions"),

            where("userId","==",uid),

            orderBy("createdAt","desc"),

            limit(10)

        );

        const snapshot=
        await getDocs(q);

        recentActivity.innerHTML="";

        let deposits=0;
        let withdrawals=0;
        let spent=0;

        if(snapshot.empty){

            recentActivity.innerHTML=`

            <div class="empty-card">

                No recent activity.

            </div>

            `;

        }

        snapshot.forEach(doc=>{

            const data=
            doc.data();

            const amount=
            Number(data.amount || 0);

            const type=
            (data.type || "").toLowerCase();

            if(type==="credit"){

                deposits += amount;

            }

            if(type==="debit"){

                withdrawals += amount;

                spent += amount;

            }

            const created=
            data.createdAt
            ? new Date(
                data.createdAt
              ).toLocaleString("en-NG")
            : "--";

            recentActivity.innerHTML += `

            <div class="activity-item">

                <div class="activity-dot"></div>

                <div class="activity-content">

                    <h4>

                        ${data.description || "Transaction"}

                    </h4>

                    <p>

                        ₦${amount.toLocaleString("en-NG")}

                    </p>

                    <span>

                        ${created}

                    </span>

                </div>

            </div>

            `;

        });

        totalDeposits.textContent=
        "₦"+deposits.toLocaleString("en-NG");

        totalWithdrawals.textContent=
        "₦"+withdrawals.toLocaleString("en-NG");

        totalSpent.textContent=
        "₦"+spent.toLocaleString("en-NG");

    }

    catch(error){

        console.error(error);

    }

}



// ==========================================
// START DASHBOARD
// ==========================================

if(auth.currentUser){

    loadDashboard(auth.currentUser.uid);

}
// ==========================================
// Part 3 - UI Controls
// ==========================================

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



// ==========================================
// LOAD NOTIFICATIONS
// ==========================================

async function loadNotifications(uid){

    try{

        const q=query(

            collection(db,"notifications"),

            where("userId","==",uid),

            orderBy("createdAt","desc"),

            limit(20)

        );

        const snapshot=
        await getDocs(q);

        notificationList.innerHTML="";

        let unread=0;

        if(snapshot.empty){

            notificationList.innerHTML=`

            <div class="empty-card">

                No notifications

            </div>

            `;

            notificationCount.textContent="0";

            return;

        }

        snapshot.forEach(doc=>{

            const data=doc.data();

            if(data.read===false){

                unread++;

            }

            notificationList.innerHTML +=`

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
                        ? new Date(
                        data.createdAt
                        ).toLocaleString("en-NG")
                        : "--"
                    }

                </small>

            </div>

            `;

        });

        notificationCount.textContent=unread;

    }

    catch(error){

        console.log(error);

    }

}



// ==========================================
// OPEN NOTIFICATIONS
// ==========================================

notificationBtn.onclick=()=>{

notificationPanel.classList.toggle("show");

};

closeNotifications.onclick=()=>{

notificationPanel.classList.remove("show");

};



// ==========================================
// PROFILE MENU
// ==========================================

profileBox.onclick=()=>{

profileDropdown.classList.toggle("show");

};



// ==========================================
// SIDEBAR
// ==========================================

menuToggle.onclick=()=>{

sidebar.classList.toggle("show");

};



// ==========================================
// CLOSE POPUPS
// ==========================================

window.addEventListener("click",(e)=>{

if(

!notificationPanel.contains(e.target)

&&

!notificationBtn.contains(e.target)

){

notificationPanel.classList.remove("show");

}

if(

!profileDropdown.contains(e.target)

&&

!profileBox.contains(e.target)

){

profileDropdown.classList.remove("show");

}

});



// ==========================================
// DARK / LIGHT MODE
// ==========================================

const savedTheme=
localStorage.getItem("theme");

if(savedTheme){

document.body.classList.add(savedTheme);

}

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



// ==========================================
// LOGOUT
// ==========================================

async function logout(){

try{

await signOut(auth);

window.location.href="login.html";

}

catch(error){

alert(error.message);

}

}

logoutBtn.onclick=logout;

logoutDropdown.onclick=logout;



// ==========================================
// REFRESH DATA
// ==========================================

setInterval(()=>{

const user=auth.currentUser;

if(user){

loadOrders(user.uid);

loadTransactions(user.uid);

loadNotifications(user.uid);

}

},30000);



// ==========================================
// HIDE LOADER
// ==========================================

window.addEventListener("load",()=>{

setTimeout(()=>{

if(loadingScreen){

loadingScreen.style.display="none";

}

},500);

});



// ==========================================
// START NOTIFICATIONS
// ==========================================

onAuthStateChanged(auth,(user)=>{

if(user){

loadNotifications(user.uid);

}

});



console.log("Dashboard Ready");
// ==========================================
// Part 4 - Premium Dashboard Features
// ==========================================

// QUICK ACTION BUTTONS
const depositBtn = document.getElementById("depositBtn");
const withdrawBtn = document.getElementById("withdrawBtn");
const historyBtn = document.getElementById("historyBtn");

const vpnService = document.getElementById("vpnService");
const esimService = document.getElementById("esimService");
const numberService = document.getElementById("numberService");
const boostService = document.getElementById("boostService");
const digitalService = document.getElementById("digitalService");

const refreshDashboard =
document.getElementById("refreshDashboard");



// ==========================================
// NAVIGATION
// ==========================================

if(depositBtn){

depositBtn.onclick=()=>{

window.location.href="wallet.html";

};

}

if(withdrawBtn){

withdrawBtn.onclick=()=>{

window.location.href="wallet.html";

};

}

if(historyBtn){

historyBtn.onclick=()=>{

window.location.href="history.html";

};

}



// ==========================================
// SERVICES
// ==========================================

if(vpnService){

vpnService.onclick=()=>{

window.location.href="vpn.html";

};

}

if(esimService){

esimService.onclick=()=>{

window.location.href="esim.html";

};

}

if(numberService){

numberService.onclick=()=>{

window.location.href="numbers.html";

};

}

if(boostService){

boostService.onclick=()=>{

window.location.href="boost.html";

};

}

if(digitalService){

digitalService.onclick=()=>{

window.location.href="services.html";

};

}



// ==========================================
// REFRESH DASHBOARD
// ==========================================

if(refreshDashboard){

refreshDashboard.onclick=()=>{

const user=auth.currentUser;

if(!user) return;

loadUser(user);

loadDashboard(user.uid);

loadNotifications(user.uid);

};

}



// ==========================================
// IMAGE FALLBACK
// ==========================================

document.querySelectorAll("img").forEach(img=>{

img.onerror=function(){

this.src="https://ui-avatars.com/api/?background=6d5cff&color=ffffff&name=User";

};

});



// ==========================================
// CARD ANIMATION
// ==========================================

const cards=document.querySelectorAll(

".service-card,.dashboard-card,.analytics-box"

);

cards.forEach((card,index)=>{

card.style.opacity="0";

card.style.transform="translateY(30px)";

setTimeout(()=>{

card.style.transition=".45s";

card.style.opacity="1";

card.style.transform="translateY(0)";

},index*120);

});



// ==========================================
// BALANCE COUNT ANIMATION
// ==========================================

function animateBalance(element,value){

let start=0;

const end=Number(value);

const duration=800;

const increment=end/40;

const timer=setInterval(()=>{

start+=increment;

if(start>=end){

start=end;

clearInterval(timer);

}

element.textContent=

"₦"+Math.floor(start).toLocaleString("en-NG");

},duration/40);

}



// ==========================================
// ANIMATE BALANCE AFTER LOAD
// ==========================================

const observer=new MutationObserver(()=>{

const amount=

walletBalance.textContent

.replace(/[₦,]/g,"");

if(!isNaN(amount)){

animateBalance(walletBalance,amount);

animateBalance(availableBalance,amount);

observer.disconnect();

}

});

observer.observe(walletBalance,{

childList:true

});



// ==========================================
// CLOSE SIDEBAR MOBILE
// ==========================================

window.addEventListener("resize",()=>{

if(window.innerWidth>992){

sidebar.classList.remove("show");

}

});



// ==========================================
// ESC KEY
// ==========================================

document.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

notificationPanel.classList.remove("show");

profileDropdown.classList.remove("show");

sidebar.classList.remove("show");

}

});



// ==========================================
// REMOVE LOADING SCREEN
// ==========================================

setTimeout(()=>{

if(loadingScreen){

loadingScreen.style.opacity="0";

setTimeout(()=>{

loadingScreen.remove();

},400);

}

},700);



// ==========================================
// FINISHED
// ==========================================

console.log("thesuftsocials Dashboard Ready 🚀");
