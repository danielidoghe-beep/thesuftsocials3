const popup =
document.getElementById("buyPopup");

const cancelBuy =
document.getElementById("cancelBuy");

const continueBuy =
document.getElementById("continueBuy");

window.openBuyPopup = () => {
popup.style.display = "flex";
};

cancelBuy.onclick = () => {
popup.style.display = "none";
};

continueBuy.onclick = () => {

popup.style.display = "none";

alert(
"Purchase system will be connected to wallet, orders and transactions next."
);

};
