import { auth, googleProvider } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const email =
    document.querySelector('input[type="email"]').value;

  const password =
    document.querySelector('input[type="password"]').value;

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("Login successful");
const notifications =
JSON.parse(
localStorage.getItem("notifications")
) || [];

notifications.push({

title:"Login Successful",

message:"You logged into your account."

});

localStorage.setItem(
"notifications",
JSON.stringify(notifications)
);

const currentCount =
parseInt(
localStorage.getItem("notificationCount")
) || 0;

localStorage.setItem(
"notificationCount",
currentCount + 1
);
    window.location.href = "dashboard.html";

  } catch (error) {

    alert(error.message);

  }

});

document
.querySelector(".google-btn")
.addEventListener("click", async () => {

  try {

    await signInWithPopup(
      auth,
      googleProvider
    );

    window.location.href =
      "dashboard.html";

  } catch (error) {

    alert(error.message);

  }

});
