import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* ==========================
ELEMENTS
========================== */

const loadingScreen = document.getElementById("loadingScreen");

const menuBtn = document.getElementById("menuBtn");

const sidebar = document.getElementById("sidebar");

const sidebarOverlay = document.getElementById("sidebarOverlay");

const logoutBtn = document.getElementById("logoutBtn");

/* ==========================
SIDEBAR
========================== */

menuBtn.addEventListener("click", () => {

    sidebar.classList.add("active");

    sidebarOverlay.classList.add("active");

});

sidebarOverlay.addEventListener("click", () => {

    sidebar.classList.remove("active");

    sidebarOverlay.classList.remove("active");

});

/* ==========================
AUTH CHECK
========================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    loadUser(user);

});

/* ==========================
LOAD USER
========================== */

async function loadUser(user) {

    try {

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

            const data = userSnap.data();

            console.log(data);

        }

    } catch (error) {

        console.error(error);

    }
await loadRecentOrders(user.uid);
await loadRecentTransactions(user.uid);
   loadNotifications(user.uid);
    loadingScreen.classList.add("hide");

}

/* ==========================
LOGOUT
========================== */

logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

});
/* ==========================
LOAD USER DATA
========================== */

async function loadUser(user) {

    try {

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            loadingScreen.classList.add("hide");

            return;

        }

        const data = userSnap.data();

        /* =====================
        USER NAME
        ===================== */

        document.getElementById("userName").textContent =
            data.firstName || user.displayName || "User";

        document.getElementById("sideUsername").textContent =
            data.firstName || user.displayName || "User";

        /* =====================
        EMAIL
        ===================== */

        document.getElementById("sideEmail").textContent =
            user.email;

        /* =====================
        WALLET
        ===================== */

        const balance =
            Number(data.walletBalance || 0);

        document.getElementById("walletBalance").textContent =
            "₦" + balance.toLocaleString();

        document.getElementById("headerBalance").textContent =
            "₦" + balance.toLocaleString();

        /* =====================
        SUMMARY
        ===================== */

        document.getElementById("purchaseCount").textContent =
            data.totalPurchases || 0;

        document.getElementById("inventoryCount").textContent =
            data.inventory || 0;

        /* =====================
        PROFILE
        ===================== */

        const avatar =
            document.querySelector(".profile-avatar");

        const sidebarAvatar =
            document.querySelector(".profile-avatar.large");

        if (user.photoURL) {

            avatar.innerHTML =
                `<img src="${user.photoURL}" alt="">`;

            sidebarAvatar.innerHTML =
                `<img src="${user.photoURL}" alt="">`;

        } else {

            const firstLetter =
                (data.firstName || user.email)
                .charAt(0)
                .toUpperCase();

            avatar.textContent = firstLetter;

            sidebarAvatar.textContent = firstLetter;

        }

    } catch (error) {

        console.error(error);

    }

    loadingScreen.classList.add("hide");

}
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
   onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* ==========================
LOAD RECENT ORDERS
========================== */

async function loadRecentOrders(userId) {

    const container =
        document.getElementById("recentOrders");

    try {

        const q = query(
            collection(db, "orders"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            limit(3)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            return;

        }

        container.innerHTML = "";

        snapshot.forEach((docSnap) => {

            const order = docSnap.data();

            container.innerHTML += `

            <div class="order-card">

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

                    ₦${Number(order.amount).toLocaleString()}

                </div>

            </div>

            `;

        });

    } catch (error) {

        console.error(error);

    }

}

/* ==========================
LOAD RECENT TRANSACTIONS
========================== */

async function loadRecentTransactions(userId) {

    const container =
        document.getElementById("recentTransactions");

    try {

        const q = query(
            collection(db, "transactions"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            limit(3)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            return;

        }

        container.innerHTML = "";

        snapshot.forEach((docSnap) => {

            const transaction = docSnap.data();

            container.innerHTML += `

            <div class="transaction-card">

                <div class="transaction-left">

                    <div class="transaction-icon">

                        <i class="ri-wallet-3-line"></i>

                    </div>

                    <div>

                        <h4>${transaction.type}</h4>

                        <p>${transaction.status}</p>

                    </div>

                </div>

                <div class="transaction-right">

                    ₦${Number(transaction.amount).toLocaleString()}

                </div>

            </div>

            `;

        });

    } catch (error) {

        console.error(error);

    }

}
/* ==========================
LOAD NOTIFICATIONS
========================== */

function loadNotifications(userId) {

    const badge =
        document.getElementById("notificationBadge");

    const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {

        let unread = 0;

        snapshot.forEach((doc) => {

            const notification = doc.data();

            if (!notification.read) {

                unread++;

            }

        });

        badge.textContent = unread;

        if (unread === 0) {

            badge.style.display = "none";

        } else {

            badge.style.display = "flex";

        }

    });

}
/* ==========================
REALTIME USER DATA
========================== */

function watchUserData(userId) {

    const userRef = doc(db, "users", userId);

    onSnapshot(userRef, (snapshot) => {

        if (!snapshot.exists()) {

            return;

        }

        const data = snapshot.data();

        const balance =
            Number(data.walletBalance || 0);

        document.getElementById("walletBalance").textContent =
            "₦" + balance.toLocaleString();

        document.getElementById("headerBalance").textContent =
            "₦" + balance.toLocaleString();

        document.getElementById("purchaseCount").textContent =
            data.totalPurchases || 0;

        document.getElementById("inventoryCount").textContent =
            data.inventory || 0;

    });

}
/* ==========================
UTILITY FUNCTIONS
========================== */

function closeSidebar() {

    sidebar.classList.remove("active");

    sidebarOverlay.classList.remove("active");

}

function hideLoading() {

    if (!loadingScreen) return;

    loadingScreen.classList.add("hide");

    setTimeout(() => {

        loadingScreen.style.display = "none";

    }, 300);

}

/* ==========================
ESC KEY
========================== */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeSidebar();

    }

});

/* ==========================
CLICK OUTSIDE
========================== */

sidebarOverlay.addEventListener("click", closeSidebar);

/* ==========================
WINDOW ERROR
========================== */

window.addEventListener("error", (error) => {

    console.error("Dashboard Error:", error);

    hideLoading();

});

/* ==========================
UNHANDLED PROMISES
========================== */

window.addEventListener("unhandledrejection", (event) => {

    console.error("Promise Error:", event.reason);

    hideLoading();

});

/* ==========================
ONLINE / OFFLINE
========================== */

window.addEventListener("offline", () => {

    console.warn("No internet connection.");

});

window.addEventListener("online", () => {

    console.log("Internet connection restored.");

});
