import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*==================================
ELEMENTS
==================================*/

const transactionsList =
document.getElementById("transactionsList");

const emptyTransactions =
document.getElementById("emptyTransactions");

const searchTransaction =
document.getElementById("searchTransaction");
/*==================================
AUTH
==================================*/

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.replace(
            "login.html"
        );

        return;

    }

    loadTransactions(user.uid);

});
/*==================================
LOAD TRANSACTIONS
==================================*/

function loadTransactions(userId){

    const q = query(

        collection(db,"transactions"),

        where("userId","==",userId),

        orderBy("createdAt","desc")

    );

    onSnapshot(q,(snapshot)=>{

        transactionsList.innerHTML="";

        if(snapshot.empty){

            transactionsList.appendChild(
                emptyTransactions
            );

            emptyTransactions.style.display="block";

            return;

        }

        emptyTransactions.style.display="none";

        snapshot.forEach((document)=>{

            createTransactionCard(
                document.data()
            );

        });

    });

}
/*==================================
CREATE TRANSACTION CARD
==================================*/

function createTransactionCard(data){

    const card =
    document.createElement("div");

    card.className =
    "transaction-card";

    const isTopup =
    data.type === "Top Up";

    const icon =
    isTopup
    ? "ri-add-line"
    : "ri-subtract-line";

    const iconClass =
    isTopup
    ? "plus"
    : "minus";

    const amountSign =
    isTopup
    ? "+"
    : "-";

    const status =
    (data.status || "Pending")
    .toLowerCase();

    const date =

    data.createdAt
    ? new Date(
        data.createdAt.seconds * 1000
      ).toLocaleString("en-NG")
    : "Just now";

    card.innerHTML = `

        <div class="transaction-left">

            <div class="transaction-icon ${iconClass}">

                <i class="${icon}"></i>

            </div>

            <div class="transaction-info">

                <h3>

                    ${data.description || data.type}

                </h3>

                <p>

                    ${data.reference || "N/A"}

                    •

                    ${date}

                </p>

                <div class="transaction-bottom">

                    <span class="transaction-amount">

                        ${amountSign}₦${Number(
                            data.amount || 0
                        ).toLocaleString("en-NG")}

                    </span>

                    <span class="status ${status}">

                        ${data.status || "Pending"}

                    </span>

                </div>

            </div>

        </div>

    `;

    transactionsList.appendChild(card);

}
/*==================================
SEARCH TRANSACTIONS
==================================*/

searchTransaction.addEventListener("input",()=>{

    const value =
    searchTransaction.value
    .toLowerCase()
    .trim();

    const cards =
    document.querySelectorAll(
        ".transaction-card"
    );

    let found = false;

    cards.forEach(card=>{

        const text =
        card.innerText.toLowerCase();

        if(text.includes(value)){

            card.style.display="block";

            found = true;

        }else{

            card.style.display="none";

        }

    });

    if(cards.length===0){

        return;

    }

    if(!found){

        emptyTransactions.style.display="block";

        emptyTransactions.querySelector("h3").textContent =
        "No matching transactions";

        emptyTransactions.querySelector("p").textContent =
        "Try another search keyword.";

    }else{

        emptyTransactions.style.display="none";

    }

});

/*==================================
WINDOW ERRORS
==================================*/

window.addEventListener("error",()=>{

    console.error("Page Error");

});

window.addEventListener("unhandledrejection",(error)=>{

    console.error(error);

});
