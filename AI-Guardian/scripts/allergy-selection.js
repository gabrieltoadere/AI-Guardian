document.addEventListener("DOMContentLoaded", async function () {
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    let selectedAllergies = [];

    const userId = 1; // Replace with dynamic value when login is available

    // Load allergies from DB
    try {
        const res = await fetch(`http://localhost:5000/api/preferences/${userId}`);
        selectedAllergies = await res.json();
    } catch (err) {
        console.error("Failed to load preferences from DB:", err);
    }

    // Pre-check previously selected allergies
    checkboxes.forEach((checkbox) => {
        if (selectedAllergies.includes(checkbox.value)) {
            checkbox.checked = true;
        }

        checkbox.addEventListener("change", async function () {
            if (this.checked) {
                selectedAllergies.push(this.value);
            } else {
                selectedAllergies = selectedAllergies.filter(a => a !== this.value);
            }

            try {
                await fetch("http://localhost:5000/api/preferences", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, allergens: selectedAllergies })
                });
                console.log("Preferences updated:", selectedAllergies);
            } catch (err) {
                console.error("Failed to save preferences:", err);
            }
        });
    });
});
