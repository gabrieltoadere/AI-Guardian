

// Select the form element
const loginForm = document.getElementById("loginForm");

// Add event listener for form submission
loginForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    // Retrieve values from input fields
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Simple validation
    if (username === "" || password === "") {
        alert("Please fill in all fields.");
        return;
    }




    // Simulate login process (Replace with actual authentication logic)
    //alert(`Welcome, ${username}! Redirecting to dashboard...`);
    window.location.href = "main.html"; // Redirect to dashboard
    //MAIN PAGE FILE WILL GO HERE!!!!





    
});

// Button redirects
document.querySelector(".google").addEventListener("click", function() {
    window.location.href = "google-login.html";
});

document.querySelector(".apple").addEventListener("click", function() {
    window.location.href = "apple-login.html";
});

document.querySelector(".phone").addEventListener("click", function() {
    window.location.href = "phone-login.html";
});

document.querySelector(".email").addEventListener("click", function() {
    window.location.href = "email.login.html";
    
});

// Initialize Google Sign-In
function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log("Google ID: " + profile.getId());
    console.log("Full Name: " + profile.getName());
    console.log("Email: " + profile.getEmail());

    // Send the token to the server to handle authentication
    var id_token = googleUser.getAuthResponse().id_token;
    // Send the token to your backend server for verification and further actions
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}



document.addEventListener('DOMContentLoaded', () => {
    const chatbotIcon = document.getElementById('chatbotIcon');
    
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', () => {
            window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
        });
    }
});
