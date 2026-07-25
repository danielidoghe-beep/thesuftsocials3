import { db } from "./firebase.js";

import {
collection,
getDocs,
addDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const sendBtn =
document.getElementById("sendBtn");

sendBtn.addEventListener(
"click",
async()=>{

const title =
document.getElementById("title").value.trim();

const message =
document.getElementById("message").value.trim();

if(!title || !message){

alert("Fill all fields");

return;

}

try{

const users =
await getDocs(
collection(db,"users")
);

for(const user of users.docs){

await addDoc(
collection(db,"notifications"),
{
userId:user.id,
title:title,
message:message,
read:false,
createdAt:Date.now()
}
);

}

alert(
"Notification sent successfully"
);

document.getElementById("title").value = "";
document.getElementById("message").value = "";

}catch(error){

alert(error.message);

}

});
