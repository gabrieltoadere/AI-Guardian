document.getElementById("profilePicInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("profilePic").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function saveProfile() {
    const name = document.getElementById("userName").value;
}


document.addEventListener('DOMContentLoaded', () => {
    const chatbotIcon = document.getElementById('chatbotIcon');
    
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', () => {
            window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
        });
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const userNameInput = document.getElementById("userName");
    const displayName = document.getElementById("displayName");
    const saveNameBtn = document.getElementById("saveName");
    const editNameBtn = document.getElementById("editName");

    // Check if a name is saved in localStorage
    if (localStorage.getItem("userName")) {
        displayName.textContent = localStorage.getItem("userName");
        displayName.style.display = "inline"; // Show saved name
        userNameInput.style.display = "none"; // Hide input field
        saveNameBtn.style.display = "none"; // Hide save button
        editNameBtn.style.display = "inline"; // Show edit button
    }

    // Function to save and display name
    saveNameBtn.addEventListener("click", function () {
        const name = userNameInput.value.trim();
        if (name !== "") {
            localStorage.setItem("userName", name); // Store in localStorage
            displayName.textContent = name;
            displayName.style.display = "inline";
            userNameInput.style.display = "none";
            saveNameBtn.style.display = "none";
            editNameBtn.style.display = "inline";
        }
    });

    // Function to edit name
    editNameBtn.addEventListener("click", function () {
        userNameInput.style.display = "inline";
        saveNameBtn.style.display = "inline";
        editNameBtn.style.display = "none";
        displayName.style.display = "none";
        userNameInput.value = displayName.textContent; // Set input to current name
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const allergyList = document.getElementById("selectedAllergyList");
    const toggleButton = document.getElementById("toggleAllergyList");
    const savedAllergies = JSON.parse(localStorage.getItem("selectedAllergies")) || [];

    // Populate the allergy list
    function populateAllergyList() {
        allergyList.innerHTML = ""; // Clear the list
        
        if (savedAllergies.length) {
            savedAllergies.forEach((allergy) => {
                const listItem = document.createElement("li");
                listItem.textContent = allergy;
                allergyList.appendChild(listItem);
            });
        } else {
            const noAllergiesItem = document.createElement("li");
            noAllergiesItem.textContent = "No allergies selected";
            allergyList.appendChild(noAllergiesItem);
        }
    }

    // Initialize the list
    populateAllergyList();
    
    // Set initial state (hidden)
    allergyList.classList.remove('show');
    toggleButton.innerHTML = "Show Allergies ▼";

    // Toggle visibility on button click
    toggleButton.addEventListener("click", function () {
        allergyList.classList.toggle("show");
        
        // Update button text and arrow direction
        if (allergyList.classList.contains("show")) {
            toggleButton.innerHTML = "Hide Allergies ▲";
            // Optional: scroll into view if list is long
            allergyList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            toggleButton.innerHTML = "Show Allergies ▼";
        }
    });

    // Update the list when coming back from allergy selection page
    window.addEventListener('focus', function() {
        const updatedAllergies = JSON.parse(localStorage.getItem("selectedAllergies")) || [];
        if (JSON.stringify(updatedAllergies) !== JSON.stringify(savedAllergies)) {
            savedAllergies.length = 0; // Clear the array
            Array.prototype.push.apply(savedAllergies, updatedAllergies); // Update with new values
            populateAllergyList();
        }
    });
});