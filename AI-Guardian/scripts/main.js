let listActive = false;

async function displayAllergens(){
    const allergensList = document.getElementById('allergens-list')
    const user = JSON.parse(localStorage.getItem('currentUser'));
    console.log('user:',user);
    

    const allergens =JSON.parse(user.allergens);
    if(allergens===null || allergens.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No allergens'; 
        allergensList.appendChild(li);
    }
    else if(allergens.length > 0) {
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
  listButton.textContent = `List ${new Date().toLocaleDateString()}`;
}

function makeNewItem() {
  window.location.replace("scanning.html");
}

document.addEventListener('DOMContentLoaded', () => {
  const chatbotIcon = document.getElementById('chatbotIcon');
  chatbotIcon?.addEventListener('click', () => {
    window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
  });

  // Personalized greeting
  const user = JSON.parse(localStorage.getItem("currentUser"));
  document.getElementById("greetingName").textContent = user?.username || "";

  // Safety tips rotation
  const tips = [
    "Always check ingredient labels, even for familiar brands!",
    "Store scanned items to track your safe picks!",
    "Beware of hidden allergens in processed foods.",
    "Scan receipts to get monthly safety reports.",
    "Update your profile when your allergens change."
  ];
  let tipIndex = 0;
  setInterval(() => {
    document.getElementById("tip-box").innerHTML = `<strong>Tip:</strong> ${tips[tipIndex]}`;
    tipIndex = (tipIndex + 1) % tips.length;
  }, 8000);



  displayAllergens();
});

async function loadRecentScans(userId) {
  const res = await fetch('http://localhost:5501/loadHistory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });

  const data = await res.json();
  const latest = data.slice(-3).reverse();
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

async function loadMonthlyScanSummary(userId) {
  try {
    const res = await fetch(`http://localhost:5501/api/monthly-scan-summary/${userId}`);
    const data = await res.json();

    document.getElementById("safeCount").textContent = data.safe || 0;
    document.getElementById("unsafeCount").textContent = data.unsafe || 0;

    const summaryEl = document.getElementById('monthlyScanSummary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="scan-summary-box">
          <p>📅 <strong>This Month:</strong></p>
          <p>✅ Safe Scans: ${data.safe}</p>
          <p>❌ Unsafe Scans: ${data.unsafe}</p>
        </div>
      `;
    }
  } catch (err) {
    console.error("Failed to load scan summary:", err);
  }
}
