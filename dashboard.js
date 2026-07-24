import { auth } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const db = getFirestore();

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {

    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {

      const data = userSnap.data();

      document.getElementById("welcomeText").textContent =
        `Welcome back, ${data.firstName || "User"}`;

      document.getElementById("balance").textContent =
        `₦${(data.balance || 0).toLocaleString()}`;

      document.getElementById("purchases").textContent =
        data.purchases || 0;

      document.getElementById("inventory").textContent =
        data.inventory || 0;

      document.getElementById("inventoryDetails").textContent =
        `${data.logs || 0} logs • ${data.tools || 0} tools`;

      const initials =
        (data.firstName?.charAt(0) || "") +
        (data.lastName?.charAt(0) || "");

      document.getElementById("profileInitials").textContent =
        initials.toUpperCase();

    }

  } catch (error) {

    console.error("Dashboard Error:", error);

  }

});

const logoutBtn = document.querySelector(".logout-btn");

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

  });

}
const badge =
document.getElementById(
"notificationBadge"
);

const count =
parseInt(
localStorage.getItem(
"notificationCount"
)
) || 0;

if(count > 0){

badge.textContent = count;

}else{

badge.style.display = "none";

}
const menuBtn = document.querySelector(".menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");

menuBtn.addEventListener("click", () => {
  sidebar.classList.add("show");
  overlay.classList.add("show");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("show");
  overlay.classList.remove("show");
});
