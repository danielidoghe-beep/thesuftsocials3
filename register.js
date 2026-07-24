import { auth, googleProvider } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const firstName =
    document.querySelector("#firstName").value;

  const lastName =
    document.querySelector("#lastName").value;

  const email =
    document.querySelector('input[type="email"]').value;

  const password =
    document.querySelector('input[type="password"]').value;

  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    await updateProfile(
      userCredential.user,
      {
        displayName:
          `${firstName} ${lastName}`
      }
    );

    alert("Account created");

    window.location.href =
      "dashboard.html";

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
