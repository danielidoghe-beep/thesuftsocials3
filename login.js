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
