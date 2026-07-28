// ===============================
// dashboard.js (Part 1)
// Authentication + User Profile
// ===============================

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
  getDocs,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// ===============================
// HTML ELEMENTS
// ===============================

const username = document.getElementById("username");
const welcomeName = document.getElementById("welcomeName");
const topUsername = document.getElementById("topUsername");
const dropdownUsername = document.getElementById("dropdownUsername");

const topEmail = document.getElementById("topEmail");
const dropdownEmail = document.getElementById("dropdownEmail");

const walletBalance = document.getElementById("walletBalance");
const availableBalance = document.getElementById("availableBalance");

const totalOrders = document.getElementById("totalOrders");
const totalSpent = document.getElementById("totalSpent");

const totalDeposits = document.getElementById("totalDeposits");
const totalWithdrawals = document.getElementById("totalWithdrawals");

const accountStatus = document.getElementById("accountStatus");
const accountBadge = document.getElementById("accountBadge");
const accountLevel = document.getElementById("accountLevel");

const profileImage = document.getElementById("profileImage");
const topProfileImage = document.getElementById("topProfileImage");
const dropdownProfileImage = document.getElementById("dropdownProfileImage");

const loadingScreen = document.getElementById("loadingScreen");


// ===============================
// AUTH CHECK
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    await loadDashboard(user);

});


// ===============================
// LOAD USER
// ===============================

async function loadDashboard(user){

    try{

        const userRef = doc(db,"users",user.uid);

        const userSnap = await getDoc(userRef);

        if(!userSnap.exists()){

            alert("User data not found.");

            return;

        }

        const data = userSnap.data();

        const fullName =
        `${data.firstName || ""} ${data.lastName || ""}`;

        username.textContent = fullName;

        welcomeName.textContent = data.firstName || "";

        topUsername.textContent = fullName;

        dropdownUsername.textContent = fullName;

        topEmail.textContent = data.email;

        dropdownEmail.textContent = data.email;

        walletBalance.textContent =
        "₦" + Number(data.balance || 0).toLocaleString();

        availableBalance.textContent =
        "₦" + Number(data.balance || 0).toLocaleString();

        totalOrders.textContent =
        data.purchases || 0;

        accountStatus.textContent =
        "Verified";

        accountBadge.textContent =
        "Active";

        accountLevel.textContent =
        "Premium User";

        // default avatar

        const avatar =
        "https://ui-avatars.com/api/?background=7C4DFF&color=fff&name=" +
        encodeURIComponent(fullName);

        profileImage.src = avatar;

        topProfileImage.src = avatar;

        dropdownProfileImage.src = avatar;

        // load dashboard data

        await loadTransactions(user.uid);

        await loadNotifications(user.uid);

        loadingScreen.style.display = "none";

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}
// ===============================
// PART 2
// Transactions + Dashboard Stats
// ===============================

const recentTransactions =
document.getElementById("recentTransactions");


// Load Transactions

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

                <td colspan="5"
                style="text-align:center;padding:30px;">

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
            (data.type || "").toLowerCase();

            // Calculate totals

            if(type === "credit"){

                deposits += amount;

            }

            if(type === "debit"){

                withdrawals += amount;

                spent += amount;

            }

            const date = data.createdAt
                ? new Date(
                    data.createdAt
                ).toLocaleDateString()
                : "--";

            recentTransactions.innerHTML += `

            <tr>

                <td>

                    ${capitalize(type)}

                </td>

                <td>

                    Wallet ${capitalize(type)}

                </td>

                <td>

                    ₦${amount.toLocaleString()}

                </td>

                <td>

                    <span class="status-completed">

                        Successful

                    </span>

                </td>

                <td>

                    ${date}

                </td>

            </tr>

            `;

        });

        totalDeposits.textContent =
        "₦" +
        deposits.toLocaleString();

        totalWithdrawals.textContent =
        "₦" +
        withdrawals.toLocaleString();

        totalSpent.textContent =
        "₦" +
        spent.toLocaleString();

    }

    catch(error){

        console.error(error);

    }

}



// Helper

function capitalize(text){

    if(!text) return "";

    return text.charAt(0).toUpperCase() +
    text.slice(1);

}
// ==========================================
// PART 3
// Notifications + Logout + UI Controls
// ==========================================

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// ===============================
// ELEMENTS
// ===============================

const notificationList =
document.getElementById("notificationList");

const notificationCount =
document.getElementById("notificationCount");

const notificationPanel =
document.getElementById("notificationPanel");

const notificationBtn =
document.getElementById("notificationBtn");

const closeNotifications =
document.getElementById("closeNotifications");

const profileDropdown =
document.getElementById("profileDropdown");

const profileBox =
document.getElementById("profileBox");

const logoutBtn =
document.getElementById("logoutBtn");

const logoutDropdown =
document.getElementById("logoutDropdown");


// ===============================
// LOAD NOTIFICATIONS
// ===============================

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

        notificationList.innerHTML="";

        let unread=0;

        if(snapshot.empty){

            notificationList.innerHTML=`

                <div class="empty-box">

                    No notifications yet.

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

            const amountDate =
            data.createdAt
            ? new Date(data.createdAt).toLocaleString()
            : "";

            notificationList.innerHTML +=`

            <div class="notification-item">

                <h4>${data.title}</h4>

                <p>${data.message}</p>

                <small>${amountDate}</small>

            </div>

            `;

        });

        notificationCount.textContent=unread;

    }

    catch(error){

        console.log(error);

    }

}



// ===============================
// Notification Panel
// ===============================

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



// ===============================
// Profile Menu
// ===============================

if(profileBox){

profileBox.onclick=()=>{

profileDropdown.classList.toggle("show");

};

}



// ===============================
// Close when clicking outside
// ===============================

window.addEventListener("click",(e)=>{

if(
notificationBtn &&
notificationPanel &&
!notificationPanel.contains(e.target) &&
!notificationBtn.contains(e.target)
){

notificationPanel.classList.remove("show");

}

if(
profileBox &&
profileDropdown &&
!profileDropdown.contains(e.target) &&
!profileBox.contains(e.target)
){

profileDropdown.classList.remove("show");

}

});



// ===============================
// LOGOUT
// ===============================

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

logoutBtn.onclick=logout;

}

if(logoutDropdown){

logoutDropdown.onclick=logout;

}
// ==========================================
// PART 4
// Sidebar • Theme • Dashboard Initialization
// ==========================================

// ===============================
// ELEMENTS
// ===============================

const sidebar =
document.getElementById("sidebar");

const menuToggle =
document.getElementById("menuToggle");

const themeToggle =
document.getElementById("themeToggle");

const currentDate =
document.getElementById("currentDate");

const currentTime =
document.getElementById("currentTime");



// ===============================
// SIDEBAR
// ===============================

if(menuToggle){

    menuToggle.addEventListener("click",()=>{

        sidebar.classList.toggle("show");

    });

}



// ===============================
// CLOSE SIDEBAR ON MOBILE
// ===============================

document.addEventListener("click",(e)=>{

    if(

        window.innerWidth <= 992 &&

        sidebar &&

        menuToggle &&

        !sidebar.contains(e.target) &&

        !menuToggle.contains(e.target)

    ){

        sidebar.classList.remove("show");

    }

});



// ===============================
// THEME
// ===============================

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



// ===============================
// LIVE DATE
// ===============================

function updateDate(){

    if(!currentDate) return;

    const today =
    new Date();

    currentDate.textContent =
    today.toLocaleDateString(
        "en-NG",
        {
            weekday:"long",
            day:"numeric",
            month:"long",
            year:"numeric"
        }
    );

}

updateDate();



// ===============================
// LIVE CLOCK
// ===============================

function updateClock(){

    if(!currentTime) return;

    const now =
    new Date();

    currentTime.textContent =
    now.toLocaleTimeString(
        "en-NG",
        {
            hour:"2-digit",
            minute:"2-digit",
            second:"2-digit"
        }
    );

}

updateClock();

setInterval(updateClock,1000);



// ===============================
// LOADING SCREEN
// ===============================

window.addEventListener("load",()=>{

    if(loadingScreen){

        setTimeout(()=>{

            loadingScreen.style.opacity="0";

            setTimeout(()=>{

                loadingScreen.style.display="none";

            },400);

        },500);

    }

});



// ===============================
// PAGE ANIMATION
// ===============================

document.querySelectorAll(".stat-card").forEach(card=>{

    card.style.opacity="0";

    card.style.transform="translateY(25px)";

});

setTimeout(()=>{

document.querySelectorAll(".stat-card").forEach((card,index)=>{

setTimeout(()=>{

card.style.transition=".45s";

card.style.opacity="1";

card.style.transform="translateY(0)";

},index*120);

});

},300);



// ===============================
// REFRESH EVERY 30 SECONDS
// ===============================

setInterval(()=>{

    const user = auth.currentUser;

    if(user){

        loadTransactions(user.uid);

        loadNotifications(user.uid);

    }

},30000);



// ===============================
// PREVENT IMAGE ERROR
// ===============================

document.querySelectorAll("img").forEach(img=>{

img.onerror=function(){

this.src="https://ui-avatars.com/api/?background=7C4DFF&color=ffffff&name=User";

};

});



// ===============================
// FINISHED
// ===============================

console.log("Dashboard Loaded Successfully");
