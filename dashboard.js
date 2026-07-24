import { auth } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href =
      "login.html";

  }

});

const logoutBtn =
  document.querySelector(".logout-btn");

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      await signOut(auth);

      window.location.href =
        "login.html";

    }
  );

}
