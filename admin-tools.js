import { db } from "./firebase.js";

import {
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const form =
document.getElementById("toolForm");

form.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

try{

await addDoc(
collection(db,"tools"),
{
title:
document.getElementById("title").value,

description:
document.getElementById("description").value,

price:Number(
document.getElementById("price").value
),

image:
document.getElementById("image").value,
toolLink:
document.getElementById("toolLink").value,
category:
document.getElementById("category").value,

createdAt:
Date.now()
}
);

alert(
"Tool uploaded successfully"
);

form.reset();

}catch(error){

alert(error.message);

}

});
