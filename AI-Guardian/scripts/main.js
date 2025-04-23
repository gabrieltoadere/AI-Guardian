let listActive = false;

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
  window.location.replace("allergy-selection.html");
}

async function displayAllergens() {
  const allergensList = document.getElementById('allergens-list');
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) return;

  const allergens = JSON.parse(user.allergens || "[]");

  allergensList.innerHTML = '';
  if (allergens.length === 0) {
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

  if (user?.id) await loadMonthlyScanSummary(user.id);
}

async function loadRecentScans() {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || !user.id) return;

    const res = await fetch('http://localhost:5501/loadHistory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });

    const data = await res.json();
    const latest = data.slice(-3).reverse();
    const list = document.getElementById('recentScansList');

    if (!list) {
      console.error("Missing element with ID 'recentScansList'");
      return;
    }

    list.innerHTML = "";

    latest.forEach(scan => {
      const li = document.createElement('li');
      const isSafe = scan.status === 'safe';
      li.className = isSafe ? 'safe' : 'unsafe';
      li.innerHTML = `${isSafe ? "✅" : "❌"} ${scan.product_name} <span style="font-size: 0.8rem; color: #999;">${new Date(scan.scan_date).toLocaleDateString()}</span>`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Failed to load recent scans:", err);
  }
}

async function loadMonthlyScanSummary(userId) {
  try {
    const res = await fetch(`http://localhost:5501/api/monthly-scan-summary/${userId}`);
    const data = await res.json();

    const safeCount = document.getElementById("safeCount");
    const unsafeCount = document.getElementById("unsafeCount");

    if (safeCount && unsafeCount) {
      safeCount.textContent = data.safe || 0;
      unsafeCount.textContent = data.unsafe || 0;
    }

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

document.addEventListener('DOMContentLoaded', async () => {
  const chatbotIcon = document.getElementById('chatbotIcon');
  chatbotIcon?.addEventListener('click', () => {
    window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
  });

  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user?.username) {
    document.getElementById("greetingName").textContent = user.username;
  }

  await displayAllergens();
  await loadRecentScans();

  // Safety Tips Rotation
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
});
