// =====================================
// THESUFTSOCIALS DASHBOARD
// dashboard.js
// Part 1
// =====================================

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
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =====================================
// ELEMENTS
// =====================================

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

const recentTransactions =
document.getElementById("recentTransactions");

const notificationList =
document.getElementById("notificationList");

const notificationCount =
document.getElementById("notificationCount");

const logoutBtn =
document.getElementById("logoutBtn");

const logoutDropdown =
document.getElementById("logoutDropdown");


// =====================================
// AUTH
// =====================================

onAuthStateChanged(auth, async (user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    await loadUser(user);

});


// =====================================
// LOAD USER
// =====================================

async function loadUser(user){

    try{

        const ref = doc(db,"users",user.uid);

        const snap = await getDoc(ref);

        if(!snap.exists()){

            alert("User account not found.");

            return;

        }

        const data = snap.data();

        const fullName =
        `${data.firstName ?? ""} ${data.lastName ?? ""}`;

        username.textContent = fullName;

        welcomeName.textContent =
        data.firstName ?? "";

        topUsername.textContent =
        fullName;

        dropdownUsername.textContent =
        fullName;

        topEmail.textContent =
        data.email ?? "";

        dropdownEmail.textContent =
        data.email ?? "";

        const balance =
        Number(data.balance ?? 0);

        walletBalance.textContent =
        "₦" + balance.toLocaleString();

        availableBalance.textContent =
        "₦" + balance.toLocaleString();

        totalOrders.textContent =
        Number(data.purchases ?? 0);

        accountStatus.textContent =
        "Verified";

        accountBadge.textContent =
        "Active";

        accountLevel.textContent =
        "Premium User";

        const avatar =
`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=7C4DFF&color=ffffff`;

        profileImage.src = avatar;

        topProfileImage.src = avatar;

        dropdownProfileImage.src = avatar;

        await loadTransactions(user.uid);

        await loadNotifications(user.uid);

    }

    catch(error){

        console.error(error);

    }

}
// =====================================
// PART 2
// TRANSACTIONS + DASHBOARD STATS
// =====================================

async function loadTransactions(uid){

    try{

        const q = query(

            collection(db,"transactions"),

            where("userId","==",uid),

            orderBy("createdAt","desc"),

            limit(20)

        );

        const snapshot = await getDocs(q);

        let deposits = 0;
        let withdrawals = 0;
        let spent = 0;

        if(recentTransactions){

            recentTransactions.innerHTML = "";

        }

        if(snapshot.empty){

            if(recentTransactions){

                recentTransactions.innerHTML = `

                <tr>

                    <td colspan="5">

                        No transactions found.

                    </td>

                </tr>

                `;

            }

            totalDeposits.textContent="₦0";
            totalWithdrawals.textContent="₦0";
            totalSpent.textContent="₦0";

            return;

        }

        snapshot.forEach((docSnap)=>{

            const data = docSnap.data();

            const amount =
            Number(data.amount ?? 0);

            const type =
            (data.type ?? "").toLowerCase();

            if(type==="credit"){

                deposits += amount;

            }

            if(type==="debit"){

                withdrawals += amount;

                spent += amount;

            }

            let date="--";

            if(data.createdAt){

                date =
                data.createdAt
                .toDate()
                .toLocaleDateString(
                    "en-NG"
                );

            }

            if(recentTransactions){

                recentTransactions.innerHTML += `

                <tr>

                    <td>

                        ${type.toUpperCase()}

                    </td>

                    <td>

                        ₦${amount.toLocaleString()}

                    </td>

                    <td>

                        Successful

                    </td>

                    <td>

                        ${date}

                    </td>

                </tr>

                `;

            }

        });

        totalDeposits.textContent =
        "₦" + deposits.toLocaleString();

        totalWithdrawals.textContent =
        "₦" + withdrawals.toLocaleString();

        totalSpent.textContent =
        "₦" + spent.toLocaleString();

    }

    catch(error){

        console.error("Transactions Error:",error);

    }

}



// =====================================
// HELPER FUNCTIONS
// =====================================

function formatMoney(amount){

    return "₦" +
    Number(amount)
    .toLocaleString("en-NG");

}

function formatDate(timestamp){

    if(!timestamp){

        return "--";

    }

    return timestamp
    .toDate()
    .toLocaleDateString(
        "en-NG",
        {

            day:"numeric",

            month:"short",

            year:"numeric"

        }

    );

}
// =====================================
// PART 3
// NOTIFICATIONS + LOGOUT
// =====================================

const notificationPanel =
document.getElementById("notificationPanel");

const notificationButton =
document.getElementById("notificationButton");

const closeNotification =
document.getElementById("closeNotification");

const profileDropdown =
document.getElementById("profileDropdown");

const profileButton =
document.getElementById("profileButton");



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

        const snapshot = await getDocs(q);

        if(notificationList){

            notificationList.innerHTML="";

        }

        let unread = 0;

        if(snapshot.empty){

            if(notificationList){

                notificationList.innerHTML=`

                <div class="empty-notification">

                    No notifications available.

                </div>

                `;

            }

            if(notificationCount){

                notificationCount.textContent="0";

            }

            return;

        }

        snapshot.forEach((docSnap)=>{

            const data = docSnap.data();

            if(data.read===false){

                unread++;

            }

            const date = data.createdAt
            ? formatDate(data.createdAt)
            : "--";

            if(notificationList){

                notificationList.innerHTML += `

                <div class="notification-item">

                    <h4>${data.title ?? ""}</h4>

                    <p>${data.message ?? ""}</p>

                    <small>${date}</small>

                </div>

                `;

            }

        });

        if(notificationCount){

            notificationCount.textContent = unread;

        }

    }

    catch(error){

        console.error("Notification Error:",error);

    }

}



// =====================================
// NOTIFICATION PANEL
// =====================================

if(notificationButton){

    notificationButton.onclick=()=>{

        notificationPanel.classList.toggle("show");

    };

}

if(closeNotification){

    closeNotification.onclick=()=>{

        notificationPanel.classList.remove("show");

    };

}



// =====================================
// PROFILE MENU
// =====================================

if(profileButton){

    profileButton.onclick=()=>{

        profileDropdown.classList.toggle("show");

    };

}



// =====================================
// CLOSE MENUS WHEN CLICKING OUTSIDE
// =====================================

window.addEventListener("click",(e)=>{

    if(

        notificationPanel &&

        notificationButton &&

        !notificationPanel.contains(e.target) &&

        !notificationButton.contains(e.target)

    ){

        notificationPanel.classList.remove("show");

    }

    if(

        profileDropdown &&

        profileButton &&

        !profileDropdown.contains(e.target) &&

        !profileButton.contains(e.target)

    ){

        profileDropdown.classList.remove("show");

    }

});



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

    logoutBtn.addEventListener("click",logout);

}

if(logoutDropdown){

    logoutDropdown.addEventListener("click",logout);

}
// =====================================
// PART 4
// SIDEBAR + THEME + STARTUP
// =====================================

// Sidebar

const sidebar =
document.getElementById("sidebar");

const menuToggle =
document.getElementById("menuToggle");

if(menuToggle && sidebar){

    menuToggle.addEventListener("click",()=>{

        sidebar.classList.toggle("show");

    });

}


// Close sidebar on mobile

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



// =====================================
// THEME
// =====================================

const themeToggle =
document.getElementById("themeToggle");

const savedTheme =
localStorage.getItem("theme");

if(savedTheme){

    document.body.classList.add(savedTheme);

}

if(themeToggle){

    themeToggle.addEventListener("click",()=>{

        document.body.classList.toggle("light-mode");

        if(document.body.classList.contains("light-mode")){

            localStorage.setItem(
                "theme",
                "light-mode"
            );

        }else{

            localStorage.removeItem("theme");

        }

    });

}



// =====================================
// AUTO REFRESH
// =====================================

setInterval(()=>{

    const user = auth.currentUser;

    if(user){

        loadTransactions(user.uid);

        loadNotifications(user.uid);

    }

},30000);



// =====================================
// DEFAULT PROFILE IMAGE
// =====================================

document.querySelectorAll("img").forEach((img)=>{

    img.onerror=function(){

        this.src="https://ui-avatars.com/api/?background=7C4DFF&color=ffffff&name=User";

    };

});



// =====================================
// PAGE READY
// =====================================

window.addEventListener("DOMContentLoaded",()=>{

    console.log("Dashboard Ready");

});



// =====================================
// LOGOUT BUTTON SAFETY
// =====================================

const logoutButtons =
document.querySelectorAll(".logout-btn");

logoutButtons.forEach((button)=>{

    button.addEventListener("click",logout);

});



// =====================================
// UTILITIES
// =====================================

function showMessage(message){

    console.log(message);

}

function showError(error){

    console.error(error);

}



// =====================================
// END
// =====================================

console.log("TheSuftSocials Dashboard Loaded");
