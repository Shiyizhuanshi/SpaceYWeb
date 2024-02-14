db = config.db;
function register() {
    event.preventDefault();
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;

    const path = `users/${username}.json`;

    // Register the user
    fetch(db + path)
    .then(response => response.json())
    .then(data => {
        if (!data || data.error === 'User not found') {
            // User does not exist, continue with registration
            return fetch(db + path, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
        } else {
            // User already exists, throw an error
            alert("Username already exists. Please choose a different username.");
            throw new Error('Username already exists. Please choose a different username.');
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('User registered successfully.');
            alert("User registered successfully.");
        } else {
            throw new Error(`Could not register user: ${response.statusText}`);
        }
    })
    .catch(error => {
        console.error(error);
    });
}



function login() {
    event.preventDefault();
    var username = document.getElementById('usernameInput').value;
    var password = document.getElementById('passwordInput').value;
    localStorage.setItem("username", username);
    

    const path = `users/${username}.json`;

    // Fetch user data from the database
    fetch(db + path)
        .then(response => {
            console.log(response);
            if (response.ok) {
                return response.json();
            } else if (response.status === 404) {
                throw new Error('User not found');
            } else {
                throw new Error(`Could not fetch user data: ${response.statusText}`);
            }
        })
        .then(userData => {
            // Check if the username and password match
            if (userData && userData.password === password) {
                console.log('Login successful');
                alert("Login successful");
                // Redirect to another HTML page (replace 'redirect.html' with your actual page)
                window.location.href = 'userPanel.html';
            } else {
                console.log('Invalid username or password');
                alert("Invalid username or password");
            }
        })
        .catch(error => {
            console.error(error);
        });
}



function accessDatabase() {
    const path = ".json";

    fetch(db + path)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`Could not access database: ${response.statusText}`);
            }
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error(error);
        });
}