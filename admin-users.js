import { db } from "./firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const usersContainer =
document.getElementById("usersContainer");

async function loadUsers(){

try{

const snapshot =
await getDocs(
collection(db,"users")
);

let html = "";

snapshot.forEach((doc)=>{

const user = doc.data();

const initials =
(
(user.firstName?.[0] || "") +
(user.lastName?.[0] || "")
).toUpperCase();

html += `

<div class="user-card">

<div class="user-top">

<div class="avatar">
${initials}
</div>

<div>

<div class="user-name">
${user.firstName || ""}
${user.lastName || ""}
</div>

<div class="user-email">
${user.email || ""}
</div>

</div>

</div>

<div class="info">

<div>
Balance:
<span class="balance">
₦${Number(
user.balance || 0
).toLocaleString()}
</span>
</div>

<div>
Purchases:
${user.purchases || 0}
</div>

<div>
Inventory:
${user.inventory || 0}
</div>

</div>

</div>

`;

});

if(html === ""){

html = `
<div class="loading">
No users found
</div>
`;

}

usersContainer.innerHTML = html;

}catch(error){

console.error(error);

usersContainer.innerHTML =
`
<div class="loading">
Failed to load users
</div>
`;

}

}

loadUsers();
