const apiKey = '64eb36356c646964a70ae2ef537bd463'; 
const fileInput = document.getElementById('receiptUpload');
const receiptContent = document.getElementById('receiptContent');
const matchedProducts = document.getElementById('matchedProducts');
const receiptSection = document.getElementById('receiptSection');
const productList = document.getElementById('productList');
const totalValueDisplay = document.getElementById('totalValueDisplay');
const addItemButton = document.getElementById('addItemButton');
const confirmItemsButton = document.getElementById('confirmItemsButton');

let extractedItems = [];

fileInput.addEventListener('change', handleReceiptUpload);
addItemButton.addEventListener('click', addNewItem);
confirmItemsButton.addEventListener('click', confirmItems);

async function handleReceiptUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file.");
        return;
    }

    const formData = new FormData();
    formData.append('document', file);

    try {
        const response = await fetch('https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict', {
            method: 'POST',
            headers: { 'Authorization': `Token ${apiKey}` },
            body: formData
        });

        const result = await response.json();
        const prediction = result.document.inference.prediction;

        const vendor = prediction.supplier_name?.value || "";
        const date = prediction.date?.value || new Date().toISOString().slice(0, 10);
        
        let total = prediction.total_incl?.value;

        if (total === undefined || total === 0) {
            total = (prediction.line_items || []).reduce((sum, item) => {
                const val = item.total_amount;
                return sum + (typeof val === "number" ? val : 0);
            }, 0);
        }


        const extractedText = result.document.inference?.ocr?.raw || "No OCR data available.";

        extractedItems = (prediction.line_items || []).map(item => ({
            name: item.description || "",
            price: item.total_amount || 0
        }));

        const receiptData = { vendor, date, total, items: extractedItems, text: extractedText };

        displayReceipt(receiptData);

        document.getElementById('receiptSection').classList.remove('hidden');

    } catch (error) {
        console.error("OCR error:", error);
        alert("Error extracting receipt text.");
    }
}


function displayReceipt(data) {
    const section = document.getElementById("receiptSection");
    section.classList.remove("hidden");

    document.getElementById("receiptContent").innerHTML = `
        Vendor: <input type="text" id="vendorInput" value="${data.vendor}" /><br>
        Date: <input type="date" id="dateInput" value="${data.date}" /><br><br>
    `;

    document.getElementById("matchedProducts").innerHTML = data.items.map(item =>
        `• ${item.name} - €${item.price.toFixed(2)}`
    ).join('<br>');

    document.getElementById("totalValueDisplay").innerHTML =
        `<strong>Total: €${data.total.toFixed(2)}</strong>`;

    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    data.items.forEach((item, index) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <input type="text" value="${item.name}" data-index="${index}" placeholder="Item name">
            €<input type="number" value="${item.price}" step="0.01" data-index="${index}">
        `;
        productList.appendChild(div);
    });


    const priceInputs = productList.querySelectorAll('input[type="number"]');
    priceInputs.forEach(input => {
        input.addEventListener('input', () => {
            const index = parseInt(input.dataset.index);
            const newValue = parseFloat(input.value);
            if (!isNaN(newValue)) {
                extractedItems[index].price = newValue;
                updateTotalDisplay();
            }
        });
    });

    function updateTotalDisplay() {
        const newTotal = calculateTotal();
        totalValueDisplay.innerHTML = `<strong>Total: €${newTotal.toFixed(2)}</strong>`;
    }

}


function addNewItem() {
    extractedItems.push({ name: "", price: 0.00 });
    displayReceipt({
        vendor: document.getElementById("vendorInput")?.value || "Manual",
        date: document.getElementById("dateInput")?.value || new Date().toISOString().slice(0, 10),
        total: calculateTotal(),
        items: extractedItems
    });
}


function confirmItems() {
    const vendor = document.getElementById("vendorInput")?.value || "Unknown";
    const date = document.getElementById("dateInput")?.value || new Date().toISOString().slice(0, 10);

    const inputs = productList.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i += 2) {
        const nameInput = inputs[i];
        const priceInput = inputs[i + 1];
        const index = parseInt(nameInput.dataset.index);

        extractedItems[index].name = nameInput.value;
        extractedItems[index].price = parseFloat(priceInput.value);
    }

    const receipt = {
        vendor,
        date,
        items: extractedItems,
        total: calculateTotal()
    };

    const receipts = JSON.parse(localStorage.getItem('receipts')) || [];
    receipts.push(receipt);
    localStorage.setItem('receipts', JSON.stringify(receipts));

    if (confirm("Receipt saved! Do you wish to view your receipts?")) {
        window.location.href = "overview.html";
    } else {
        alert("You can view your saved receipts anytime from the Overview page.");
    }
}


function calculateTotal() {
    return extractedItems.reduce((sum, item) => sum + item.price, 0);
}

function saveReceiptToLocalStorage(receipt) {
    const receipts = JSON.parse(localStorage.getItem('receipts')) || [];
    receipts.push(receipt);
    localStorage.setItem('receipts', JSON.stringify(receipts));
    localStorage.setItem('latestReceipt', JSON.stringify(receipt));
}

//receipts will be saved locally for now