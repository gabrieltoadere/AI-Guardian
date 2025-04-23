function toggleOptions(optionsId, caretId) {
    let options = document.getElementById(optionsId);
    let caret = document.getElementById(caretId);
    options.classList.toggle("show");
    caret.classList.toggle("rotate");
    caret.textContent = options.classList.contains("show") ? "▾" : "▸";
}

document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    const chatbotIcon = document.getElementById('chatbotIcon');
    
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', () => {
            window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
        });
    }
});

async function loadHistory() {
    const historyDisplay = document.getElementById('history-container');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user.id;

    const response = await fetch('http://localhost:5501/loadHistory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });

    const history = await response.json();
    console.log(history);
    if(history.length > 0) {
        historyDisplay.innerHTML='';
        history.forEach(scan => {
            const readableDate = new Date(scan.scan_date).toLocaleDateString();
            historyDisplay.innerHTML += `
            <div class="history-item" onclick="viewProductDetails(${scan.scan_id})">
                <div class="item-info">
                    <span class="item-name">${scan.product_name}</span>
                    <span class="item-date">${readableDate}</span>
                </div>
                <div class="item-status ${scan.status}" id="status-${scan.scan_id}">

                    <i class="fas ${scan.status === 'safe' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> 
        <span class="status-text">${scan.status}</span>
                </div>

                <button class="toggle-status" data-id="${scan.scan_id}" onclick="event.stopPropagation(); toggleStatus(${scan.scan_id});">
        <i class="fas fa-pen"></i>
    </button>
    <button class="delete-scan" data-id="${scan.scan_id}" onclick="event.stopPropagation(); deleteScan(${scan.scan_id});">
        <i class="fas fa-trash"></i>
    </button>
            </div>`
        });

        document.querySelectorAll('.toggle-status').forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const scanId = button.getAttribute('data-id');
                toggleStatus(scanId);
            });
        });
    }
} 


function viewProductDetails(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}



function showToast(message = "Successfully deleted!") {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');
  
    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hidden');
    }, 3500); // Show for 2 seconds
  }
  


function toggleStatus(scan_id) {
    const statusContainer = document.getElementById(`status-${scan_id}`);
    const statusText = statusContainer.querySelector('.status-text');
    const icon = statusContainer.querySelector('i');

    const currentStatus = statusText.textContent.trim();
    const updatedStatus = currentStatus === 'safe' ? 'unsafe' : 'safe';

    fetch('http://localhost:5501/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_id, updatedStatus })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Status saved:', data);
        statusText.textContent = updatedStatus;
        statusContainer.classList.remove('safe', 'unsafe');
        statusContainer.classList.add(updatedStatus);
        icon.className = updatedStatus === 'safe' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
    })
    .catch(err => console.error('Failed to update status:', err));
}

function deleteScan(scanId) {
    if (!confirm("Are you sure you want to delete this scan?")) return;
  
    fetch('http://localhost:5501/delete-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scan_id: scanId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("Scan deleted:", data);
          loadHistory(); // ✅ Refresh the list without reloading the page
          showToast("Deleted successfully!");
        } else {
          alert("Failed to delete scan.");
        }
      })
      .catch(err => {
        console.error("Failed to delete scan:", err);
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





