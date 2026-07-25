import { db } from "./firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const toolsContainer =
document.getElementById("toolsContainer");

const totalTools =
document.getElementById("totalTools");

async function loadTools(){

const snapshot =
await getDocs(
collection(db,"tools")
);

let html = "";

let total = 0;
let pictures = 0;
let tools = 0;

snapshot.forEach((doc)=>{

const data = doc.data();

total++;

if(data.category === "working-pictures"){
pictures++;
}

if(data.category === "working-tools"){
tools++;
}

html += `
<div class="tool-card">

<img
src="${data.image}"
class="tool-image"
>

<div class="tool-content">

<div class="tool-title">
${data.title}
</div>

<div class="tool-description">
${data.description}
</div>

<div class="tool-price">
₦${Number(data.price).toLocaleString()}
</div>

<button
class="buy-btn"
onclick="openBuyPopup()"
>
Buy Now
</button>

</div>

</div>
`;

});

document.getElementById(
"totalTools"
).textContent = total;

if(total === 0){

toolsContainer.innerHTML = `
<div class="empty-tools">

<h2>No tools available</h2>

<p>
Tools uploaded from the admin panel
will appear here automatically.
</p>

</div>
`;

}else{

toolsContainer.innerHTML = html;

}

}

loadTools();
