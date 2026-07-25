import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  updateProfile,
  updatePassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firstNameInput =
document.getElementById("firstName");

const lastNameInput =
document.getElementById("lastName");

const emailInput =
document.getElementById("email");

const profileName =
document.getElementById("profileName");

const profileEmail =
document.getElementById("profileEmail");

const profileInitials =
document.getElementById("profileInitials");

const saveBtn =
document.getElementById("saveProfile");

onAuthStateChanged(auth, async(user)=>{

if(!user){
window.location.href = "login.html";
return;
}

const snap = await getDoc(
doc(db,"users",user.uid)
);

if(!snap.exists()) return;

const data = snap.data();

firstNameInput.value =
data.firstName || "";

lastNameInput.value =
data.lastName || "";

emailInput.value =
data.email || "";

profileName.textContent =
`${data.firstName} ${data.lastName}`;

profileEmail.textContent =
data.email;

profileInitials.textContent =
`${data.firstName.charAt(0)}${data.lastName.charAt(0)}`;

});

saveBtn.addEventListener("click", async()=>{

const user = auth.currentUser;

if(!user) return;

const firstName =
firstNameInput.value.trim();

const lastName =
lastNameInput.value.trim();

await updateDoc(
doc(db,"users",user.uid),
{
firstName,
lastName
}
);

await updateProfile(user,{
displayName:`${firstName} ${lastName}`
});

profileName.textContent =
`${firstName} ${lastName}`;

profileInitials.textContent =
`${firstName.charAt(0)}${lastName.charAt(0)}`;

alert("Profile updated");
});
