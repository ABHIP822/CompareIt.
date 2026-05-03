document.addEventListener('DOMContentLoaded', function() {
    // ലോക്കൽ സ്റ്റോറേജിൽ നിന്ന് യൂസർ ഡാറ്റ എടുക്കുന്നു
    const userData = JSON.parse(localStorage.getItem('user'));

    if (userData) {
        document.getElementById('display-name').innerText = userData.name;

        // ഗസ്റ്റ് അക്കൗണ്ട് ആണോ എന്ന് പരിശോധിക്കുന്നു
        if (userData.age === 'N/A' || !userData.age) {
            // ഗസ്റ്റ് ആണെങ്കിൽ ബാക്കി വിവരങ്ങൾ മറച്ചു വെക്കുന്നു
            document.getElementById('extra-details').style.display = 'none';
        } else {
            // ലോഗിൻ ചെയ്ത യൂസർ ആണെങ്കിൽ വിവരങ്ങൾ കാണിക്കുന്നു
            document.getElementById('display-age').innerText = userData.age;
            document.getElementById('display-gender').innerText = userData.gender;
            document.getElementById('display-email').innerText = userData.email;
        }
    } else {
        // ഡാറ്റ ഒന്നുമില്ലെങ്കിൽ ലോഗിൻ പേജിലേക്ക് വിടുന്നു
        window.location.href = "login.html";
    }
});

// ലോഗൗട്ട് ഫംഗ്ഷൻ
function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        // ലോഗിൻ പേജിലേക്ക് പോകുന്നു (യൂസർ ഡാറ്റ ക്ലിയർ ചെയ്യണമെങ്കിൽ localStorage.removeItem('user') ചേർക്കാം)
        window.location.href = "login.html"; 
    }
}