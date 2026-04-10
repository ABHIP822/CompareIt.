function handleLogin() {
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!name || !age || !gender || !email || password.length < 6) {
        alert("Please provide all details correctly");
        return;
    }

    // Save user data in LocalStorage
    localStorage.setItem('user', JSON.stringify({ name, age, gender, email }));

    // Move to home screen
    window.location.href = "home.html";
}

function showLogin() {
    alert("Redirect to login logic can be added here");
}

function handleGuest() {
    const name = prompt("Enter your name:");
    if (name) {
        localStorage.setItem('user', JSON.stringify({ name, age: 'N/A', gender: 'N/A', email: 'N/A' }));
        window.location.href = "home.html";
    }
}
