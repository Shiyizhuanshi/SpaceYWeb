var usernameElement = document.getElementById("usernameLabel");
var dynamicUsername = localStorage.getItem("username");
usernameElement.textContent = dynamicUsername;