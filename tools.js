import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    getDoc,
    runTransaction,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*==================================
ELEMENTS
==================================*/

const toolsList =
document.getElementById("toolsList");

const emptyTools =
document.getElementById("emptyTools");

const totalTools =
document.getElementById("totalTools");

const allCount =
document.getElementById("allCount");

const pictureCount =
document.getElementById("pictureCount");

const toolCount =
document.getElementById("toolCount");

const searchTools =
document.getElementById("searchTools");

let currentUser = null;

let allProducts = [];
/*==================================
AUTH
==================================*/

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.replace("login.html");

        return;

    }

    currentUser = user;

    watchTools();

});
/*==================================
WATCH TOOLS
==================================*/

function watchTools(){

    const q = query(

        collection(db,"tools"),

        where("active","==",true),

        orderBy("createdAt","desc")

    );

    onSnapshot(q,(snapshot)=>{

        allProducts = [];

        toolsList.innerHTML = "";

        let pictures = 0;

        let tools = 0;

        if(snapshot.empty){

            emptyTools.style.display = "block";

            totalTools.textContent =
            "0 tools available";

            allCount.textContent = 0;

            pictureCount.textContent = 0;

            toolCount.textContent = 0;

            return;

        }

        emptyTools.style.display = "none";

        snapshot.forEach((document)=>{

            const data = document.data();

            data.id = document.id;

            allProducts.push(data);

            if(data.category === "working_pictures"){

                pictures++;

            }

            if(data.category === "working_tools"){

                tools++;

            }

            createToolCard(data);

        });

        totalTools.textContent =
        `${allProducts.length} tools available`;

        allCount.textContent =
        allProducts.length;

        pictureCount.textContent =
        pictures;

        toolCount.textContent =
        tools;

    });

}
/*==================================
CREATE TOOL CARD
==================================*/

function createToolCard(product){

    const card =
    document.createElement("div");

    card.className =
    "tool-card";

    card.dataset.category =
    product.category || "working_tools";

    card.innerHTML = `

        <img
            class="tool-image"
            src="${product.imageUrl}"
            alt="${product.title}">

        <div class="tool-content">

            <h2 class="tool-title">

                ${product.title}

            </h2>

            <p class="tool-description">

                ${product.description}

            </p>

            <span class="tool-category">

                ${product.category
                    .replace("_"," ")
                    .replace("_"," ")}

            </span>

            <h1 class="tool-price">

                ₦${Number(
                    product.price || 0
                ).toLocaleString("en-NG")}

            </h1>

            <button
                class="buy-tool"
                data-id="${product.id}">

                <i class="ri-shopping-cart-line"></i>

                Buy Now

            </button>

        </div>

    `;

    toolsList.appendChild(card);

}
/*==================================
BUY BUTTON
==================================*/

document.addEventListener("click",async(e)=>{

    const button =
    e.target.closest(".buy-tool");

    if(!button) return;

    const productId =
    button.dataset.id;

    const product =
    allProducts.find(item=>{

        return item.id === productId;

    });

    if(!product) return;

    buyTool(product);

});
/*==================================
BUY TOOL
==================================*/

async function buyTool(product){

    try{

        const userRef =
        doc(db,"users",currentUser.uid);

        await runTransaction(db,async(transaction)=>{

            const userSnap =
            await transaction.get(userRef);

            if(!userSnap.exists()){

                alert("User not found.");

                return;

            }

            const userData =
            userSnap.data();

            const balance =
            Number(userData.walletBalance || 0);

            const price =
            Number(product.price || 0);

            if(balance < price){

                alert("Insufficient wallet balance.");

                return;

            }

            const newBalance =
            balance - price;

            transaction.update(userRef,{

                walletBalance:newBalance

            });

            const reference =

            "TS" +
            Date.now();

            const orderRef =
            doc(
                collection(db,"orders")
            );

            transaction.set(orderRef,{

                userId:currentUser.uid,

                productId:product.id,

                title:product.title,

                description:
                product.description,

                imageUrl:
                product.imageUrl,

                category:
                product.category,

                price:price,

                status:"Completed",

                reference:reference,

                createdAt:
                serverTimestamp()

            });

            const transactionRef =
            doc(
                collection(db,"transactions")
            );

            transaction.set(transactionRef,{

                userId:currentUser.uid,

                type:"Purchase",

                description:
                product.title,

                amount:price,

                status:"Completed",

                reference:reference,

                createdAt:
                serverTimestamp()

            });

        });

        alert("Purchase successful!");

    }catch(error){

        console.error(error);

        alert("Purchase failed.");

    }

}
