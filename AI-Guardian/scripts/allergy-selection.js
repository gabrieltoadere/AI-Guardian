    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    let selectedAllergies = [];
    const userString = localStorage.getItem('currentUser');
    const user = JSON.parse(userString);
    let allergens = JSON.parse(user.allergens);
    // Load allergies from DB

    // Pre-check previously selected allergies
    checkboxes.forEach((checkbox) => {
        if (allergens.includes(checkbox.value)) {
            checkbox.checked = true;
        }

        checkbox.addEventListener("change", async function () {
            if (this.checked) {
                allergens.push(this.value);
            } else {
                allergens = allergens.filter(a => a !== this.value);
            }
        });
    });

    function savePreferences() {
        const userId = user.id;
        fetch("http://localhost:5000/api/preferences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userId, allergens: allergens })
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to save");
            return response.json();
        })
        .then(data => console.log("Success:", data))
        .catch(error => console.error("Error:", error));
    }



//  try {
//                 
//                 console.log("Preferences updated:", selectedAllergies);
//             } catch (err) {
//                 console.error("Failed to save preferences:", err);
//             }