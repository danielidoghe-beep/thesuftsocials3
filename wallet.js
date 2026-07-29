import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*==================================
ELEMENTS
==================================*/

const loadingScreen =
document.getElementById("loadingScreen");

const walletBalance =
document.getElementById("walletBalance");

const backBtn =
document.getElementById("backBtn");

/*==================================
HELPERS
==================================*/

function hideLoading(){

    loadingScreen.classList.add("hide");

    setTimeout(()=>{

        loadingScreen.style.display="none";

    },300);

}

/*==================================
BACK BUTTON
==================================*/

backBtn.addEventListener("click",()=>{

    window.location.href="dashboard.html";

});

/*==================================
AUTH CHECK
==================================*/

onAuthStateChanged(auth,async(user)=>{

    if(!user){

        window.location.replace("login.html");

        return;

    }

    await loadWallet(user);

});

/*==================================
LOAD WALLET
==================================*/

async function loadWallet(user){

    try{

        const userRef =
        doc(db,"users",user.uid);

        const userSnap =
        await getDoc(userRef);

        if(!userSnap.exists()){

            hideLoading();

            return;

        }

        const data =
        userSnap.data();

        const balance =
        Number(data.walletBalance || 0);

        walletBalance.textContent =
        "₦" + balance.toLocaleString("en-NG");

    }catch(error){

        console.error(error);

    }finally{

        hideLoading();

    }

}
/*==================================
PAYMENT
==================================*/

const amountInput =
document.getElementById("amountInput");

const quickButtons =
document.querySelectorAll(".quickBtn");

const openPaymentBtn =
document.getElementById("openPaymentBtn");

const paymentModal =
document.getElementById("paymentModal");

const paymentOverlay =
document.getElementById("paymentOverlay");

const paymentAmount =
document.getElementById("paymentAmount");

const paymentReference =
document.getElementById("paymentReference");

const bankName =
document.getElementById("bankName");

const minimumToast =
document.getElementById("minimumToast");

/*==================================
QUICK AMOUNT
==================================*/

quickButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        amountInput.value =
        button.dataset.amount;

    });

});

/*==================================
BANK ROTATION
==================================*/

function getNextBank(){

    const lastBank =
    localStorage.getItem("lastBank");

    let nextBank;

    if(lastBank === "PalmPay"){

        nextBank = "OPay";

    }else{

        nextBank = "PalmPay";

    }

    localStorage.setItem(
        "lastBank",
        nextBank
    );

    return nextBank;

}

/*==================================
REFERENCE
==================================*/

function generateReference(){

    return "TS" +
    Date.now().toString().slice(-8);

}

/*==================================
WARNING
==================================*/

function showMinimumToast(){

    minimumToast.classList.add("show");

    setTimeout(()=>{

        minimumToast.classList.remove("show");

    },3000);

}

/*==================================
OPEN PAYMENT
==================================*/

openPaymentBtn.addEventListener("click",()=>{

    const amount =
    Number(amountInput.value);

    if(!amount || amount < 1000){

        showMinimumToast();

        return;

    }

    paymentAmount.textContent =
    "₦" + amount.toLocaleString("en-NG");

    paymentReference.textContent =
    generateReference();

    bankName.textContent =
    getNextBank();

    paymentModal.classList.add("show");

    paymentOverlay.classList.add("show");

});
/*==================================
PAYMENT ACTIONS
==================================*/

const accountNumber =
document.getElementById("accountNumber");

const copyAccount =
document.getElementById("copyAccount");

const sendProofBtn =
document.getElementById("sendProofBtn");

const closePayment =
document.getElementById("closePayment");

const cancelPayment =
document.getElementById("cancelPayment");

/*==================================
COPY ACCOUNT NUMBER
==================================*/

copyAccount.addEventListener("click",async()=>{

    try{

        await navigator.clipboard.writeText(
            accountNumber.textContent
        );

        copyAccount.textContent="Copied";

        setTimeout(()=>{

            copyAccount.textContent="Copy";

        },2000);

    }catch(error){

        console.error(error);

    }

});

/*==================================
SEND TO WHATSAPP
==================================*/

sendProofBtn.addEventListener("click",()=>{

    const amount =
    paymentAmount.textContent;

    const reference =
    paymentReference.textContent;

    const bank =
    bankName.textContent;

    const message =

`Hello ThesuftSocials,

I have made a bank transfer.

Amount: ${amount}

Bank: ${bank}

Reference: ${reference}

Please find my payment receipt attached below for confirmation.

Thank you.`;

    const whatsappNumber =
    "2349117412352";

    const url =

`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url,"_blank");

});

/*==================================
CLOSE PAYMENT
==================================*/

function closePaymentModal(){

    paymentModal.classList.remove("show");

    paymentOverlay.classList.remove("show");

}

closePayment.addEventListener(
"click",
closePaymentModal
);

cancelPayment.addEventListener(
"click",
closePaymentModal
);

paymentOverlay.addEventListener(
"click",
closePaymentModal
);
/*==================================
REALTIME WALLET
==================================*/

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*==================================
WATCH WALLET
==================================*/

function watchWallet(userId){

    const userRef = doc(db,"users",userId);

    onSnapshot(userRef,(snapshot)=>{

        if(!snapshot.exists()) return;

        const data = snapshot.data();

        walletBalance.textContent =
        "₦" + Number(
            data.walletBalance || 0
        ).toLocaleString("en-NG");

    });

}

/*==================================
RECENT TRANSACTIONS
==================================*/

async function loadTransactions(userId){

    const list =
    document.getElementById("transactionList");

    try{

        const q = query(
            collection(db,"transactions"),
            where("userId","==",userId),
            orderBy("createdAt","desc"),
            limit(5)
        );

        const snapshot =
        await getDocs(q);

        if(snapshot.empty){

            return;

        }

        list.innerHTML = "";

        snapshot.forEach((doc)=>{

            const item = doc.data();

            list.innerHTML += `

            <div class="transaction-item">

                <div class="transaction-left">

                    <div class="transaction-icon">

                        <i class="ri-wallet-3-line"></i>

                    </div>

                    <div>

                        <h4>${item.type}</h4>

                        <p>${item.status}</p>

                    </div>

                </div>

                <div class="transaction-right">

                    ₦${Number(
                        item.amount || 0
                    ).toLocaleString("en-NG")}

                </div>

            </div>

            `;

        });

    }catch(error){

        console.error(error);

    }

}

/*==================================
START
==================================*/

onAuthStateChanged(auth,async(user)=>{

    if(!user){

        window.location.replace("login.html");

        return;

    }

    await loadWallet(user);

    await loadTransactions(user.uid);

    watchWallet(user.uid);

});

/*==================================
ERRORS
==================================*/

window.addEventListener("error",()=>{

    hideLoading();

});

window.addEventListener("unhandledrejection",()=>{

    hideLoading();

});
