const apiKey = '64eb36356c646964a70ae2ef537bd463'; 
const fileInput = document.getElementById('receiptUpload');
const receiptContent = document.getElementById('receiptContent');
const matchedProducts = document.getElementById('matchedProducts');
const receiptSection = document.getElementById('receiptSection');
const addItemButton = document.getElementById('addItemButton');
const confirmItemsButton = document.getElementById('confirmItemsButton');

fileInput.addEventListener('change', handleReceiptUpload);
addItemButton.addEventListener('click', addNewItem);
confirmItemsButton.addEventListener('click', confirmItems);

async function handleReceiptUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    try {
        const response = await fetch('https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`
            },
            body: formData
        });

        const data = await response.json();
        const prediction = data.document.inference.prediction;

        const date = prediction.date?.value || 'N/A';
        const time = prediction.time?.value || '';
        const purchaseDateTime = `${date} ${time}`;
        const supplierName = prediction.supplier_name?.value || '';
        const supplierAddress = prediction.supplier_address?.value || '';

        const items = prediction.line_items?.map(item => ({
            description: item.description,  
            total_amount: item.total_amount
        })) || [];

        renderProductList(items);

        const total = prediction.total_amount?.value ?? 'N/A';

        receiptContent.textContent =
            `Purchase Time: ${purchaseDateTime}\n\n` +
            `Supplier Name: ${supplierName}\n\n` +
            `Supplier Address: ${supplierAddress}\n\n` + 
            `Total Paid: £${total}`;

        receiptSection.classList.remove('hidden');

    } catch (error) {
        console.error('Error analyzing receipt:', error);
        receiptContent.textContent = 'Error parsing receipt.';
        matchedProducts.textContent = '-';
    }
}

function renderProductList(items, editableIndices = new Set()) {
    const container = document.getElementById('productList');
    container.innerHTML = ''; 

    items.forEach((item, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'product-item';

        const inputName = document.createElement('input');
        inputName.type = 'text';
        inputName.value = item.description || '';

        const inputPrice = document.createElement('input');
        inputPrice.type = 'number';
        inputPrice.step = '0.01';
        inputPrice.value = item.total_amount ?? '';

        const isEditable = editableIndices.has(index);
        inputName.disabled = !isEditable;
        inputPrice.disabled = !isEditable;

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => {
            inputName.disabled = !inputName.disabled;
            inputPrice.disabled = !inputPrice.disabled;
            editBtn.textContent = inputName.disabled ? 'Edit' : 'Done';
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => {
            items.splice(index, 1);
            renderProductList(items);
        };

        wrapper.appendChild(inputName);
        wrapper.appendChild(inputPrice);
        wrapper.appendChild(editBtn);
        wrapper.appendChild(deleteBtn);

        container.appendChild(wrapper);
    });

    window._currentItems = items;
}

function addNewItem() {
    window._currentItems.push({ description: '', total_amount: '' });
    const editableIndex = new Set([window._currentItems.length - 1]);
    renderProductList(window._currentItems, editableIndex);
}

function confirmItems() {
    const confirmed = Array.from(document.querySelectorAll('.product-item')).map(row => {
        const [nameInput, priceInput] = row.querySelectorAll('input');
        return {
            description: nameInput.value.trim(),
            total_amount: parseFloat(priceInput.value)
        };
    });

    let total = 0;
    confirmed.forEach(item => {
        if (!isNaN(item.total_amount)) {
            total += item.total_amount;
        }
    });

    const totalDisplay = document.getElementById('totalValueDisplay');
    if (totalDisplay) {
        totalDisplay.textContent = `Total Paid (Updated): £${total.toFixed(2)}`;
    }
}