const notifications =
JSON.parse(
localStorage.getItem("notifications")
) || [];

const container =
document.getElementById(
"notificationsList"
);

if(notifications.length > 0){

container.innerHTML = "";

notifications.reverse().forEach(item => {

container.innerHTML += `

<div class="stats-card">

<h3>${item.title}</h3>

<p style="margin-top:8px;color:#666;">
${item.message}
</p>

</div>

`;

});

localStorage.setItem(
"notificationCount",
0
);

}
