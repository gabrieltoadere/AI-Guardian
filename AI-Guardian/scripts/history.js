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
                <div class="item-status safe" id="status-12345">
                    <i class="fas fa-check-circle"></i> <span id="status-${scan.scan_id}" class="status-text">${scan.status}</span>
                </div>

                <!-- The toggle button must stop the parent click -->
               <button class="toggle-status" data-id="${scan.scan_id}">
                    <i class="fas fa-pen"></i>
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


function toggleStatus(scan_id) {
    const statusText = document.getElementById(`status-${scan_id}`);
    const currentStatus = statusText.textContent.trim();

    let updatedStatus = currentStatus === 'safe' ? 'unsafe' : 'safe';

    fetch('http://localhost:5501/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_id, updatedStatus })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Status saved:', data);
        statusText.textContent = updatedStatus;

        // Optionally update the class (safe/unsafe)
        const statusContainer = statusText.closest('.item-status');
        statusContainer.classList.remove('safe', 'unsafe');
        statusContainer.classList.add(updatedStatus);
    })
    .catch(err => console.error('Failed to update status:', err));
}


document.addEventListener('DOMContentLoaded', () => {
    const chatbotIcon = document.getElementById('chatbotIcon');
    
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', () => {
            window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
        });
    }
});

