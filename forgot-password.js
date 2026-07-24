import { auth } from "./firebase.js";

import {
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

document
.querySelector(".reset-btn")
.addEventListener("click", async () => {

  const email =
    document.querySelector('input[type="email"]').value;

  if (!email) {

    alert("Enter your email address");

    return;
  }

  try {

    await sendPasswordResetEmail(
      auth,
      email
    );

    alert(
      "Password reset email sent. Check your inbox."
    );

  } catch (error) {

    alert(error.message);

  }

});
