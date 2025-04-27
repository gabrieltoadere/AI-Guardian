document.addEventListener('DOMContentLoaded', async () => {
    let chartInstance = null;
    let scanChart = null;
    let sugarChart = null;

    const monthSelector = document.getElementById('monthSelectorDropdown');

    const receiptList = document.getElementById('receiptList');
    const monthlySummary = document.getElementById('monthlySummary');
    const monthlyChartCanvas = document.getElementById('monthlyChart');
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = "block";

    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || !user.id) {
        console.error("No logged-in user found.");
        return;
    }

    let receipts = [];
    let scanData = {};
    let sugarData = {};

    try {
        const receiptRes = await fetch(`http://localhost:5501/getReceipts/${user.id}`);
        receipts = await receiptRes.json();

        const scanRes = await fetch(`http://localhost:5501/api/monthly-scan-data/${user.id}`);
        scanData = await scanRes.json();

        const sugarRes = await fetch(`http://localhost:5501/api/sugar-summary/${user.id}`);
        sugarData = await sugarRes.json();

    } catch (err) {
        console.error("Failed to fetch data:", err);
        loadingSpinner.style.display = "none";
        return;
    }
    loadingSpinner.style.display = "none";

    const monthlyData = {};

    receipts.forEach(r => {
        const month = r.date.slice(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = { total: 0, items: {}, receipts: [] };
        }

        monthlyData[month].total += r.total;

        const items = JSON.parse(r.items || "[]");
        items.forEach(item => {
            if (!monthlyData[month].items[item.name]) {
                monthlyData[month].items[item.name] = { count: 0, total: 0 };
            }
            monthlyData[month].items[item.name].count++;
            monthlyData[month].items[item.name].total += item.price;
        });

        monthlyData[month].receipts.push({ ...r, items });
    });

    // Populate months
    Object.keys(monthlyData).sort().forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = new Date(month + "-01").toLocaleString('default', {
            month: 'long',
            year: 'numeric'
        });
        monthSelector.appendChild(option);
    });

    monthSelector.addEventListener('change', () => {
        const selected = monthSelector.value;
        if (!selected || !monthlyData[selected]) return;
    
        const data = monthlyData[selected];
        renderReceipts(data.receipts);
        renderSummary(data);
        renderSugarChart(data.receipts);
        renderAllergenAlerts(data.receipts);
    });
    

    function renderReceipts(receipts) {
        receiptList.innerHTML = '<h3>Receipts</h3>';

        if (receipts.length === 0) {
            receiptList.innerHTML += `
                <div class="empty-state">
                    <img src="/AI-Guardian/assets/empty-box.png" alt="No Receipts" style="width:150px; margin-top: 10px;">
                    <p>No receipts yet for this month 📭</p>
                </div>
            `;
            return;
        }
        

        receipts.forEach((r, index) => {
            const div = document.createElement('div');
            div.classList.add('receipt-entry');
            div.innerHTML = `
                <button class="receipt-toggle" data-index="${index}">
                    <strong>${r.vendor}</strong> — ${r.date} (€${r.total.toFixed(2)})
                </button>
                <div class="receipt-details hidden" id="details-${index}">
                    <ul>
                        ${r.items.map((i, iIndex) =>
                            `<li>${i.name} — €${i.price.toFixed(2)}</li>`
                        ).join('')}
                    </ul>
                </div>
            `;
            receiptList.appendChild(div);
        });

        document.querySelectorAll('.receipt-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                const details = document.getElementById(`details-${index}`);
                details.classList.toggle('hidden');
            });
        });
    }

    function renderSummary(selectedMonth, data) {
        monthlySummary.innerHTML = '<h3>Monthly Summary</h3>';

        const topItems = Object.entries(data.items)
            .filter(([_, info]) => info.total > 0)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([name, info]) => `${name} (x${info.count}, €${info.total.toFixed(2)})`);

        monthlySummary.innerHTML += `
            <p><strong>Total Spent:</strong> €${data.total.toFixed(2)}</p>
            <p><strong>Top Items:</strong> ${topItems.join(', ') || 'No valid items'}</p>
            <p><strong>Safe Scans:</strong> ${scanData[selectedMonth]?.safe || 0}</p>
            <p><strong>Unsafe Scans:</strong> ${scanData[selectedMonth]?.unsafe || 0}</p>
            <p><strong>Total Sugar Consumed:</strong> ${sugarData[selectedMonth] ? sugarData[selectedMonth].toFixed(2) + "g" : "0g"}</p>
        `;

        drawCharts();
    }

    function renderSugarChart(receipts) {
        const ctx = document.getElementById('sugarChartTab').getContext('2d');
    
        const dates = [];
        const sugarLevels = [];
    
        receipts.forEach(receipt => {
            receipt.items.forEach(item => {
                if (item.sugar_level) {
                    dates.push(receipt.date);
                    const sugar = parseFloat(item.sugar_level.split(' ')[0]);
                    if (!isNaN(sugar)) {
                        sugarLevels.push(sugar);
                    }
                }
            });
        });
    
        if (chartInstance) {
            chartInstance.destroy();
        }
    
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Sugar (g)',
                    data: sugarLevels,
                    borderColor: '#ff6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.4,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    function renderAllergenAlerts(receipts) {
        const allergenAlertsTab = document.getElementById('allergenAlertsTab');
        allergenAlertsTab.innerHTML = '<h3>Allergen Alerts</h3>';
    
        const unsafeItems = [];
    
        receipts.forEach(receipt => {
            if (receipt.items && receipt.items.length > 0) {
                receipt.items.forEach(item => {
                    if (item.status === 'unsafe') {
                        unsafeItems.push({
                            name: item.name,
                            date: receipt.date
                        });
                    }
                });
            }
        });
    
        if (unsafeItems.length === 0) {
            allergenAlertsTab.innerHTML += `<p style="color: green;">✅ No allergen alerts found for this month.</p>`;
        } else {
            const ul = document.createElement('ul');
            unsafeItems.forEach(u => {
                const li = document.createElement('li');
                li.textContent = `${u.name} (Scanned on ${u.date})`;
                ul.appendChild(li);
            });
            allergenAlertsTab.appendChild(ul);
        }
    }
    
    

    function drawCharts() {
        const months = Object.keys(monthlyData).sort();
        const spends = months.map(m => monthlyData[m].total.toFixed(2));
        const safeScans = months.map(m => scanData[m]?.safe || 0);
        const unsafeScans = months.map(m => scanData[m]?.unsafe || 0);
        const sugarLevels = months.map(m => sugarData[m] || 0);

        if (chartInstance) chartInstance.destroy();
        if (scanChart) scanChart.destroy();
        if (sugarChart) sugarChart.destroy();

        // Total Spend Chart
        chartInstance = new Chart(monthlyChartCanvas, {
            type: 'bar',
            data: {
                labels: months.map(m => new Date(m + "-01").toLocaleString('default', { month: 'short', year: 'numeric' })),
                datasets: [{
                    label: 'Total Spent (€)',
                    data: spends,
                    backgroundColor: '#4caf50'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            color: '#555'
                        },
                        grid: {
                            color: '#eee'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#555'
                        },
                        grid: {
                            color: '#eee'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#4caf50',
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
            
        });

        // Safe/Unsafe Scans Chart
        const scanCanvas = document.createElement('canvas');
        scanCanvas.id = "scanChart";
        document.getElementById('monthlySummary').appendChild(scanCanvas);

        scanChart = new Chart(scanCanvas, {
            type: 'bar',
            data: {
                labels: months.map(m => new Date(m + "-01").toLocaleString('default', { month: 'short' })),
                datasets: [
                    { label: 'Safe Scans', data: safeScans, backgroundColor: '#4caf50' },
                    { label: 'Unsafe Scans', data: unsafeScans, backgroundColor: '#f44336' }
                ]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        // Sugar Consumption Chart
        const sugarCanvas = document.createElement('canvas');
        sugarCanvas.id = "sugarChart";
        document.getElementById('monthlySummary').appendChild(sugarCanvas);

        sugarChart = new Chart(sugarCanvas, {
            type: 'line',
            data: {
                labels: months.map(m => new Date(m + "-01").toLocaleString('default', { month: 'short' })),
                datasets: [{
                    label: 'Total Sugar (g)',
                    data: sugarLevels,
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(255,152,0,0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }
});





document.getElementById('tabBtnPurchases').addEventListener('click', () => {
    document.getElementById('tabContentPurchases').classList.remove('hidden');
    document.getElementById('tabContentAllergens').classList.add('hidden');
    document.getElementById('tabBtnPurchases').classList.add('active');
    document.getElementById('tabBtnAllergens').classList.remove('active');
});

document.getElementById('tabBtnAllergens').addEventListener('click', () => {
    document.getElementById('tabContentAllergens').classList.remove('hidden');
    document.getElementById('tabContentPurchases').classList.add('hidden');
    document.getElementById('tabBtnAllergens').classList.add('active');
    document.getElementById('tabBtnPurchases').classList.remove('active');
});
