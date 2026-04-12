// 1. പുതിയ അക്കൗണ്ട് ഉണ്ടാക്കാൻ (Sign Up)
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

    // വിവരങ്ങൾ സേവ് ചെയ്യുന്നു
    localStorage.setItem('user', JSON.stringify({ name, age, gender, email }));
    localStorage.setItem('savedPassword', password); // പാസ്‌വേഡ് സേവ് ചെയ്യുന്നു

    alert("Profile Created Successfully!");
    window.location.href = "home.html";
}

// 2. ആൾറെഡി അക്കൗണ്ട് ഉള്ളവർക്ക് ലോഗിൻ ചെയ്യാൻ (Log In Feature)
function showLogin() {
    const enteredName = prompt("Enter your Name:");

    if (enteredName) {
        const enteredPass = prompt("Enter your Password:");

        // നേരത്തെ സേവ് ചെയ്ത പാസ്‌വേഡുമായി ഒത്തുനോക്കുന്നു
        const savedPass = localStorage.getItem('savedPassword');

        if (enteredPass === savedPass) {
            alert("Login Successful!");
            window.location.href = "home.html";
        } else {
            alert("Invalid Name or Password. Please try again.");
        }
    }
}

// 3. ഗസ്റ്റ് ആയി ലോഗിൻ ചെയ്യാൻ
function handleGuest() {
    const name = prompt("Enter your name:");
    if (name) {
        localStorage.setItem('user', JSON.stringify({ name: name, age: 'N/A', gender: 'N/A', email: 'N/A' }));
        window.location.href = "home.html";
    }
}