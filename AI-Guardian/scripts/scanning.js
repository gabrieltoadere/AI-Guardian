// Modify your fetchProductInfo function to include this at the end:
function fetchProductInfo() {
    // ... your existing code ...
    
    // After processing allergens, automatically show status
    displayProductStatus(filteredAllergens.length > 0);
  }
  
  // Add these new functions:
  function displayProductStatus(isUnsafe) {
    const statusContainer = document.getElementById('productStatusContainer');
    const statusElement = document.getElementById('productStatus');
    
    statusContainer.classList.remove('hidden');
    
    if (isUnsafe) {
      statusElement.className = 'product-status status-unsafe';
      statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Be Aware - Contains Allergens';
    } else {
      statusElement.className = 'product-status status-safe';
      statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Safe - No Allergens Detected';
    }
    
    // Always show the add to purchase button after scan
    document.getElementById('addToPurchase').classList.remove('hidden');
  }
  
  function showPurchaseForm() {
    document.getElementById('purchaseForm').classList.remove('hidden');
    document.getElementById('foodNameInput').value = foodName || document.getElementById('productName').textContent;
  }
  
  function saveFoodHistory() {
    const quantity = document.getElementById('purchaseQuantity').value;
    const foodName = document.getElementById('foodNameInput').value;
    
    // Save to history logic here
    console.log(`Saved to history: ${quantity} x ${foodName}`);
    
    // Show confirmation and hide form
    document.getElementById('purchaseForm').classList.add('hidden');
    alert('Purchase saved to your history!');
  }