// Select the form element
const loginForm = document.getElementById("loginForm");



// Add event listener for form submission
// loginForm.addEventListener("submit", function(event) {
//     event.preventDefault(); // Prevent default form submission

//     // Retrieve values from input fields
//     const username = document.getElementById("username").value;
//     const password = document.getElementById("password").value;

//     // Simple validation
//     if (username === "" || password === "") {
//         alert("Please fill in all fields.");
//         return;
//     }

//     // Simulate login process (Replace with actual authentication logic)
//     //alert(`Welcome, ${username}! Redirecting to dashboard...`);
//     window.location.href = "main.html"; // Redirect to dashboard
//     //MAIN PAGE FILE WILL GO HERE!!!!
// });
document.querySelector(".login-btn").addEventListener("click",async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const rejectDiv = document.getElementById('reject-div');

    try {
        const response = await fetch('http://localhost:5501/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: username, pass: password }),
        });

        const data = await response.json(); // Parse JSON response

        if (data.success) {
            localStorage.setItem('currentUser', JSON.stringify({
                id: data.user.id,          // Unique user ID (required for future requests)
                username: data.user.username, // Username for display
                // Add other safe fields (e.g., email, name)
                // ❌ NEVER store passwords/tokens here!
            }));
            window.location.href = "main.html"; // Login success
        } else {
            rejectDiv.style.display = 'block'; // Show error
        }
    } catch (error) {
        console.error('Fetch error:', error);
        rejectDiv.style.display = 'block'; // Show error if server fails
    };
})





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
