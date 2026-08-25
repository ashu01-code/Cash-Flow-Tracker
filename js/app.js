let appState = {
    salary: 0,
    expenses: [],
    currency: 'INR',
    exchangeRate: 1,
    isThresholdAlert: false
};

const elements = {
    form: document.getElementById('expenseForm'),
    salaryInput: document.getElementById('salaryInput'),
    expenseNameInput: document.getElementById('expenseName'),
    expenseAmountInput: document.getElementById('expenseAmount'),
    errorMessage: document.getElementById('errorMessage'),
    totalSalaryDisplay: document.getElementById('totalSalaryDisplay'),
    totalExpensesDisplay: document.getElementById('totalExpensesDisplay'),
    balanceDisplay: document.getElementById('balanceDisplay'),
    expenseList: document.getElementById('expenseList'),
    currencySelect: document.getElementById('currencySelect'),
    exchangeRateDisplay: document.getElementById('exchangeRate'),
    alertBanner: document.getElementById('alertBanner'),
    downloadBtn: document.getElementById('downloadReportBtn'),
    clearAllBtn: document.getElementById('clearAllDataBtn'),
    themeToggle: document.getElementById('themeToggle'),
    themeLabel: document.getElementById('themeLabel')
};

function renderAll() {
    const totalExpenses = calculateTotalExpenses(appState.expenses);
    const balance = appState.salary - totalExpenses;
    const rate = appState.exchangeRate;

    elements.totalSalaryDisplay.textContent =
        formatCurrency(appState.salary, appState.currency, rate);
    elements.totalExpensesDisplay.textContent =
        formatCurrency(totalExpenses, appState.currency, rate);
    elements.balanceDisplay.textContent =
        formatCurrency(balance, appState.currency, rate);

    const belowThreshold = isBelowThreshold(balance, appState.salary);
    if (belowThreshold && appState.salary > 0) {
        elements.balanceDisplay.classList.add('danger');
        elements.alertBanner.classList.remove('hidden');
        appState.isThresholdAlert = true;
    } else {
        elements.balanceDisplay.classList.remove('danger');
        elements.alertBanner.classList.add('hidden');
        appState.isThresholdAlert = false;
    }

    renderExpenseList();
    updateChart(balance, totalExpenses);
}

function renderExpenseList() {
    const list = elements.expenseList;

    if (appState.expenses.length === 0) {
        list.innerHTML = `
            <li class="empty-state">
                📭 No expenses recorded yet. Add your first expense above!
            </li>
        `;
        return;
    }

    const sorted = [...appState.expenses].reverse();
    const rate = appState.exchangeRate;

    list.innerHTML = sorted.map(expense => `
        <li data-id="${expense.id}">
            <div class="expense-info">
                <span class="expense-name">${escapeHtml(expense.name)}</span>
                <span class="expense-amount">
                    ${formatCurrency(expense.amount, appState.currency, rate)}
                </span>
                <span style="font-size:0.75rem; color:#a0aec0;">
                    ${new Date(expense.createdAt).toLocaleDateString()}
                </span>
            </div>
            <div class="expense-actions">
                <button class="delete-btn" data-id="${expense.id}" aria-label="Delete expense">
                    🗑️
                </button>
            </div>
        </li>
    `).join('');

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteExpense);
    });
}

function showError(message) {
    const errorEl = elements.errorMessage;
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');

    clearTimeout(errorEl._timeout);
    errorEl._timeout = setTimeout(() => {
        errorEl.classList.add('hidden');
    }, 5000);
}

function hideError() {
    elements.errorMessage.classList.add('hidden');
}

function updateCurrencySymbols(currency) {
    const symbol = getCurrencySymbol(currency);
    
    const salarySymbol = document.getElementById('salaryCurrencySymbol');
    const expenseSymbol = document.getElementById('expenseCurrencySymbol');
    
    if (salarySymbol) salarySymbol.textContent = symbol;
    if (expenseSymbol) expenseSymbol.textContent = symbol;
}

function handleFormSubmit(event) {
    event.preventDefault();
    hideError();

    const salary = Number(elements.salaryInput.value);
    const expenseName = elements.expenseNameInput.value.trim();
    const expenseAmount = Number(elements.expenseAmountInput.value);

    if (appState.salary === 0 && salary === 0) {
        showError('⚠️ Please set your salary first before adding expenses.');
        elements.salaryInput.focus();
        return;
    }

    const validation = validateInputs(salary, expenseName, expenseAmount);
    if (!validation.isValid) {
        showError(validation.message);
        return;
    }

    if (salary !== appState.salary && salary > 0) {
        appState.salary = salary;
        saveSalary(salary);
    }

    const newExpense = {
        id: generateId(),
        name: expenseName,
        amount: expenseAmount,
        createdAt: Date.now()
    };

    appState.expenses.push(newExpense);
    saveExpenses(appState.expenses);

    elements.expenseNameInput.value = '';
    elements.expenseAmountInput.value = '';

    renderAll();
    elements.expenseNameInput.focus();
}

function handleDeleteExpense(event) {
    const btn = event.currentTarget;
    const expenseId = btn.dataset.id;

    if (!expenseId) return;

    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    appState.expenses = appState.expenses.filter(exp => exp.id !== expenseId);
    saveExpenses(appState.expenses);
    renderAll();
}

function handleCurrencyChange(event) {
    const newCurrency = event.target.value;
    appState.currency = newCurrency;
    saveCurrency(newCurrency);

    updateCurrencySymbols(newCurrency);

    if (newCurrency !== 'INR') {
        fetchExchangeRate(newCurrency);
    } else {
        appState.exchangeRate = 1;
        elements.exchangeRateDisplay.textContent = '1 INR = 1.00 INR';
        renderAll();
    }
}

async function fetchExchangeRate(targetCurrency) {
    try {
        let url = `https://api.frankfurter.app/latest?from=INR&to=${targetCurrency}`;
        let response = await fetch(url);
        
        if (!response.ok) {
            console.warn('Frankfurter API failed, trying ExchangeRate-API...');
            url = `https://api.exchangerate-api.com/v4/latest/INR`;
            response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                if (data.rates && data.rates[targetCurrency]) {
                    const rate = data.rates[targetCurrency];
                    appState.exchangeRate = rate;
                    elements.exchangeRateDisplay.textContent =
                        `1 INR = ${rate.toFixed(4)} ${targetCurrency}`;
                    renderAll();
                    return;
                }
            }
        }
        
        if (response.ok) {
            const data = await response.json();
            if (data.rates && data.rates[targetCurrency]) {
                const rate = data.rates[targetCurrency];
                appState.exchangeRate = rate;
                elements.exchangeRateDisplay.textContent =
                    `1 INR = ${rate.toFixed(4)} ${targetCurrency}`;
                renderAll();
                return;
            }
        }
        
        throw new Error('All APIs failed');
        
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        };
        
        if (fallbackRates[targetCurrency]) {
            appState.exchangeRate = fallbackRates[targetCurrency];
            elements.exchangeRateDisplay.textContent =
                `1 INR ≈ ${fallbackRates[targetCurrency].toFixed(4)} ${targetCurrency} (approx)`;
        } else {
            appState.exchangeRate = 1;
            elements.exchangeRateDisplay.textContent =
                '⚠️ Using default rate (1:1)';
        }
        renderAll();
    }

function downloadReport() {
    if (typeof window.jspdf === 'undefined') {
        alert('jsPDF library not loaded. Please check your internet connection.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const totalExpenses = calculateTotalExpenses(appState.expenses);
    const balance = appState.salary - totalExpenses;
    const rate = appState.exchangeRate;
    const currency = appState.currency;

    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text('Cash-Flow Report', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28);
    doc.text(`Currency: ${currency}`, 20, 34);

    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text(`Total Salary: ${formatCurrency(appState.salary, currency, rate)}`, 20, 45);
    doc.text(`Total Expenses: ${formatCurrency(totalExpenses, currency, rate)}`, 20, 53);
    doc.text(`Remaining Balance: ${formatCurrency(balance, currency, rate)}`, 20, 61);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 67, 190, 67);

    doc.setFontSize(13);
    doc.setTextColor(44, 62, 80);
    doc.text('Expense Details', 20, 77);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('S.No.', 20, 87);
    doc.text('Name', 45, 87);
    doc.text('Amount', 140, 87);
    doc.text('Date', 165, 87);

    doc.line(20, 90, 190, 90);

    let yPos = 97;
    const sortedExpenses = [...appState.expenses].reverse();

    sortedExpenses.forEach((expense, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        doc.text(`${index + 1}`, 20, yPos);
        doc.text(expense.name.substring(0, 30), 45, yPos);
        doc.text(
            formatCurrency(expense.amount, currency, rate),
            140, yPos
        );
        doc.text(
            new Date(expense.createdAt).toLocaleDateString(),
            165, yPos
        );
        yPos += 8;
    });

    if (yPos < 270) {
        yPos = 270;
    }

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Total ${appState.expenses.length} expenses`, 20, yPos + 10);

    if (appState.isThresholdAlert) {
        doc.setTextColor(200, 50, 50);
        doc.setFontSize(10);
        doc.text('⚠️ ALERT: Balance below 10% threshold!', 20, yPos + 20);
    }

    if (currency !== 'INR') {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Exchange Rate: 1 INR = ${rate.toFixed(4)} ${currency}`, 20, yPos + 30);
    }

    doc.save(`cashflow_report_${Date.now()}.pdf`);
}

function clearAllDataHandler() {
    if (confirm('⚠️ Delete ALL data? This cannot be undone!')) {
        clearAllData();
        appState.salary = 0;
        appState.expenses = [];
        appState.exchangeRate = 1;
        elements.salaryInput.value = '';
        elements.expenseNameInput.value = '';
        elements.expenseAmountInput.value = '';
        renderAll();
        updateChart(0, 0);
        alert('✅ All data cleared!');
    }
}

function toggleTheme() {
    const body = document.body;
    const isDarkMode = body.classList.toggle('dark-mode');

    elements.themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    elements.themeLabel.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';

    saveTheme(isDarkMode ? 'dark' : 'light');
}

function loadTheme() {
    const savedTheme = getTheme();
    const isDarkMode = savedTheme === 'dark';

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        elements.themeToggle.textContent = '☀️';
        elements.themeLabel.textContent = 'Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        elements.themeToggle.textContent = '🌙';
        elements.themeLabel.textContent = 'Dark Mode';
    }
}

function initApp() {
    validateData();

    appState.salary = getSalary();
    appState.expenses = getExpenses();
    appState.currency = getCurrency();

    elements.currencySelect.value = appState.currency;

    if (appState.salary > 0) {
        elements.salaryInput.value = appState.salary;
    }

    if (appState.currency !== 'INR') {
        fetchExchangeRate(appState.currency);
    } else {
        appState.exchangeRate = 1;
        elements.exchangeRateDisplay.textContent = '1 INR = 1.00 INR';
    }

    renderAll();
    loadTheme();
    updateCurrencySymbols(appState.currency);

    elements.form.addEventListener('submit', handleFormSubmit);
    elements.currencySelect.addEventListener('change', handleCurrencyChange);
    elements.downloadBtn.addEventListener('click', downloadReport);
    elements.clearAllBtn.addEventListener('click', clearAllDataHandler);
    elements.themeToggle.addEventListener('click', toggleTheme);

    console.log('💼 Cash-Flow Tracker initialized');
    console.log(`💰 Salary: ${appState.salary}`);
    console.log(`📋 Expenses: ${appState.expenses.length}`);
    console.log(`💱 Currency: ${appState.currency}`);
}

document.addEventListener('DOMContentLoaded', initApp);

window.addEventListener('beforeunload', function() {
    saveSalary(appState.salary);
    saveExpenses(appState.expenses);
    saveCurrency(appState.currency);
});
