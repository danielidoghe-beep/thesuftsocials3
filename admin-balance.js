import { db } from "./firebase.js";

import {
collection,
getDocs,
doc,
updateDoc,
getDoc,
addDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const userSelect =
document.getElementById("userSelect");

const amountInput =
document.getElementById("amount");

const creditBtn =
document.getElementById("creditBtn");

async function loadUsers(){

const snapshot =
await getDocs(
collection(db,"users")
);

snapshot.forEach((userDoc)=>{

const data = userDoc.data();

userSelect.innerHTML += `
<option value="${userDoc.id}">
${data.firstName} ${data.lastName}
(${data.email})
</option>
`;

});

}

loadUsers();

creditBtn.addEventListener(
"click",
async()=>{

const uid =
userSelect.value;

const amount =
Number(amountInput.value);

if(!uid || !amount){

alert("Fill all fields");

return;

}

const userRef =
doc(db,"users",uid);

const userSnap =
await getDoc(userRef);

const currentBalance =
userSnap.data().balance || 0;

await updateDoc(userRef,{
balance:
currentBalance + amount
});

await addDoc(
collection(db,"transactions"),
{
userId:uid,
type:"credit",
amount:amount,
createdAt:Date.now()
}
);

await addDoc(
collection(db,"notifications"),
{
userId:uid,
title:"Wallet Credited",
message:`₦${amount.toLocaleString()} has been added to your wallet.`,
read:false,
createdAt:Date.now()
}
);

alert("Balance added successfully");

amountInput.value = "";

}
);
