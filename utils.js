function formatCurrency(amount, currency = 'INR', rate = 1) {
    const converted = amount * rate;
    const symbols = {
        INR: '₹',
        USD: '$',
        EUR: '€',
        GBP: '£'
    };

    const symbol = symbols[currency] || '₹';
    const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.round(converted));

    return `${symbol} ${formatted}`;
}

function validateInputs(salary, expenseName, expenseAmount) {
    if (isNaN(salary) || salary <= 0) {
        return {
            isValid: false,
            message: 'Please enter a valid salary (positive number)'
        };
    }

    if (!expenseName || expenseName.trim() === '') {
        return {
            isValid: false,
            message: 'Please enter an expense name'
        };
    }

    if (isNaN(expenseAmount) || expenseAmount <= 0) {
        return {
            isValid: false,
            message: 'Please enter a valid expense amount (positive number)'
        };
    }

    return { isValid: true, message: '' };
}

function calculateTotalExpenses(expenses) {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

function isBelowThreshold(balance, salary) {
    if (salary === 0) return false;
    const threshold = salary * 0.10;
    return balance < threshold;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getCurrencySymbol(currency) {
    const symbols = {
        INR: '₹',
        USD: '$',
        EUR: '€',
        GBP: '£'
    };
    return symbols[currency] || '₹';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}