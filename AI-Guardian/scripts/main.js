let listActive = false;
function makeNewList()
{
    listActive = true;

    // Get elements properly
    const listButton = document.getElementById("createNewList");
    const itemSection = document.querySelector(".newItem");
    const listCurrent = document.querySelector(".currentItems");
    
    // Add active classes
    listButton.classList.add('active');
    itemSection.classList.add('active');
    listCurrent.classList.add('active');

    const today = new Date();
    listButton.textContent = `List ${today.toLocaleDateString()}`;
}
function makeNewItem()
{
    window.location.replace("scanning.html");
}

document.addEventListener('DOMContentLoaded', () => {
    const chatbotIcon = document.getElementById('chatbotIcon');
    
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', () => {
            window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
        });
    }
});

// document.addEventListener('DOMContentLoaded', async () => {
//     // 1. Check if user is logged in
//     const user = JSON.parse(localStorage.getItem('currentUser'));

//     if (!user) {
//         window.location.href = 'login.html'; // Redirect if not logged in
//         return;
//     }

//     // 2. Fetch user's allergens from backend
//     try {
//         const response = await fetch(`http://localhost:5501/allergens`,{method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ id: user.id })}
//         );
//         const allergens = await response.json();

//         // 3. Populate the HTML list
//         const allergensList = document.getElementById('allergens-list');
//         allergensList.innerHTML = ''; // Clear existing items

//         if (allergens.length === 0) {
//             allergensList.innerHTML = '<li>No allergens saved</li>';
//         } else {
//             allergens.forEach(allergen => {
//                 const li = document.createElement('li');
//                 li.textContent = allergen.allergen_name; // Adjust property name
//                 allergensList.appendChild(li);
//             });
//         }
//     } catch (error) {
//         document.getElementById('allergens-list').innerHTML = '<li>Error loading allergens</li>';
//     }
// });