const transactionList =
document.getElementById("transactionList");

const emptyCard =
document.getElementById("emptyTransactions");

const transactions =
JSON.parse(localStorage.getItem("transactions")) || [];

if(transactions.length > 0){

emptyCard.style.display = "none";

transactionList.innerHTML =
transactions.map(item => `

<div class="transaction-item">

<div class="transaction-top">

<div>
<strong>${item.title}</strong>
<div class="transaction-date">
${item.date}
</div>
</div>

<div class="${item.type}">
${item.amount}
</div>

</div>

</div>

`).join("");

}
