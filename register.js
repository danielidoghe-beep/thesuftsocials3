import { auth, googleProvider, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const firstName =
    document.getElementById("firstName").value.trim();

  const lastName =
    document.getElementById("lastName").value.trim();

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });
const notifications =
JSON.parse(
localStorage.getItem("notifications")
) || [];

notifications.push({

title:"Account Created",

message:"Your account was created successfully."

});

localStorage.setItem(
"notifications",
JSON.stringify(notifications)
);

localStorage.setItem(
"notificationCount",
1
);
    await setDoc(doc(db, "users", user.uid), {
      firstName,
      lastName,
      email,
      balance: 0,
      purchases: 0,
      inventory: 0,
      logs: 0,
      tools: 0,
      createdAt: Date.now()
    });

    window.location.href = "dashboard.html";

  } catch (error) {

    alert(error.message);

  }

});

const googleBtn = document.querySelector(".google-btn");

if (googleBtn) {

  googleBtn.addEventListener("click", async () => {

    try {

      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );

      const user = result.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          firstName:
            user.displayName?.split(" ")[0] || "",
          lastName:
            user.displayName?.split(" ").slice(1).join(" ") || "",
          email: user.email,
          balance: 0,
          purchases: 0,
          inventory: 0,
          logs: 0,
          tools: 0,
          createdAt: Date.now()
        },
        { merge: true }
      );

      window.location.href =
        "dashboard.html";

    } catch (error) {

      alert(error.message);

    }

  });

}
