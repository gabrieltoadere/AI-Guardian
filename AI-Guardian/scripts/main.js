let listActive = false;

async function displayAllergens() {
  const allergensList = document.getElementById('allergens-list');
  const user = JSON.parse(localStorage.getItem('currentUser'));
  console.log('user:', user);

  const allergens = JSON.parse(user.allergens);
  if (!allergens || allergens.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No allergens';
    allergensList.appendChild(li);
  } else {
    allergens.forEach(allergen => {
      const li = document.createElement('li');
      li.textContent = allergen;
      allergensList.appendChild(li);
    });
  }
}

function makeNewList() {
  listActive = true;

  const listButton = document.getElementById("createNewList");
  const itemSection = document.querySelector(".newItem");
  const listCurrent = document.querySelector(".currentItems");

  listButton.classList.add('active');
  itemSection?.classList.add('active');
  listCurrent?.classList.add('active');

  const today = new Date();
  listButton.textContent = `List ${today.toLocaleDateString()}`;
}

function makeNewItem() {
  window.location.replace("scanning.html");
}

document.addEventListener('DOMContentLoaded', () => {
  const chatbotIcon = document.getElementById('chatbotIcon');
  if (chatbotIcon) {
    chatbotIcon.addEventListener('click', () => {
      window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
    });
  }

  // Safety Tips Rotator
  const tips = [
    "Always check ingredient labels, even for familiar brands!",
    "Store scanned items to track your safe picks!",
    "Beware of hidden allergens in processed foods.",
    "Scan receipts to get monthly safety reports.",
    "Update your profile when your allergens change."
  ];
  let tipIndex = 0;
  setInterval(() => {
    const tipBox = document.getElementById("tip-box");
    if (tipBox) {
      tipBox.innerHTML = `<strong>Tip:</strong> ${tips[tipIndex]}`;
      tipIndex = (tipIndex + 1) % tips.length;
    }
  }, 8000);

  // Personalized Greeting
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user?.username) {
    const greeting = document.getElementById("greetingName");
    if (greeting) greeting.textContent = user.username;
  }

  // Smart Ingredient Search
  window.searchIngredient = function () {
    const input = document.getElementById("ingredientSearch").value.trim().toLowerCase();
    const allergens = JSON.parse(localStorage.getItem("currentUser")).allergens || [];
    const result = allergens.some(a => input.includes(a.toLowerCase()))
      ? `⚠️ "${input}" may trigger your allergies.`
      : `✅ "${input}" looks safe.`;
    document.getElementById("ingredientResult").textContent = result;
  };

 
});


// Load and show 3 most recent scanned products
async function loadRecentScans() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const res = await fetch('http://localhost:5501/loadHistory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
    });

    const data = await res.json();
    const latest = data.slice(-3).reverse(); // Last 3 scans
    const list = document.getElementById('recentScansList');
    list.innerHTML = "";

    latest.forEach(scan => {
        const li = document.createElement('li');
        const safe = scan.status === 'safe';
        li.className = safe ? 'safe' : 'unsafe';
        li.innerHTML = `${safe ? "✅" : "❌"} ${scan.product_name} <span style="font-size: 0.8rem; color: #999;">${new Date(scan.scan_date).toLocaleDateString()}</span>`;
        list.appendChild(li);
    });
}

loadRecentScans();
