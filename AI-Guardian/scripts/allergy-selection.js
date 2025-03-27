document.addEventListener("DOMContentLoaded", function () {
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    let selectedAllergies = JSON.parse(localStorage.getItem("selectedAllergies")) || [];

    // Pre-check previously selected allergies
    checkboxes.forEach((checkbox) => {
        if (selectedAllergies.includes(checkbox.value)) {
            checkbox.checked = true;
        }

        // Listen for changes
        checkbox.addEventListener("change", function () {
            if (this.checked) {
                selectedAllergies.push(this.value);
            } else {
                selectedAllergies = selectedAllergies.filter(allergy => allergy !== this.value);
            }
            localStorage.setItem("selectedAllergies", JSON.stringify(selectedAllergies));
            console.log("Updated allergies:", selectedAllergies); // Debugging
        });
    });
});