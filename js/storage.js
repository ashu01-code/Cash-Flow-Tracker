const STORAGE_KEYS = {
    SALARY: 'cashflow_salary',
    EXPENSES: 'cashflow_expenses',
    CURRENCY: 'cashflow_currency',
    THEME: 'cashflow_theme'
};

function saveSalary(salary) {
    try {
        localStorage.setItem(STORAGE_KEYS.SALARY, JSON.stringify(salary));
    } catch (error) {
        console.error('Error saving salary:', error);
    }
}

function getSalary() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SALARY);
        return data ? JSON.parse(data) : 0;
    } catch (error) {
        console.error('Error retrieving salary:', error);
        return 0;
    }
}

function saveExpenses(expenses) {
    try {
        if (!Array.isArray(expenses)) {
            expenses = [];
        }
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (error) {
        console.error('Error saving expenses:', error);
    }
}

function getExpenses() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
        if (!data) return [];
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch (error) {
        console.error('Error retrieving expenses:', error);
        return [];
    }
}

function saveCurrency(currency) {
    try {
        localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency));
    } catch (error) {
        console.error('Error saving currency:', error);
    }
}

function getCurrency() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENCY);
        return data ? JSON.parse(data) : 'INR';
    } catch (error) {
        console.error('Error retrieving currency:', error);
        return 'INR';
    }
}

function saveTheme(theme) {
    try {
        localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
    } catch (error) {
        console.error('Error saving theme:', error);
    }
}

function getTheme() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.THEME);
        return data ? JSON.parse(data) : 'light';
    } catch (error) {
        console.error('Error retrieving theme:', error);
        return 'light';
    }
}

function clearAllData() {
    try {
        localStorage.removeItem(STORAGE_KEYS.SALARY);
        localStorage.removeItem(STORAGE_KEYS.EXPENSES);
        localStorage.removeItem(STORAGE_KEYS.CURRENCY);
        console.log('🗑️ All data cleared from localStorage');
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
}

function validateData() {
    let fixed = false;

    const salary = getSalary();
    if (isNaN(salary) || salary < 0) {
        saveSalary(0);
        fixed = true;
        console.warn('⚠️ Fixed invalid salary');
    }

    const expenses = getExpenses();
    if (!Array.isArray(expenses)) {
        saveExpenses([]);
        fixed = true;
        console.warn('⚠️ Fixed invalid expenses array');
    } else {
        const validExpenses = expenses.filter(exp =>
            exp &&
            typeof exp === 'object' &&
            exp.id &&
            typeof exp.name === 'string' &&
            typeof exp.amount === 'number' &&
            exp.amount > 0
        );

        if (validExpenses.length !== expenses.length) {
            saveExpenses(validExpenses);
            fixed = true;
            console.warn('⚠️ Fixed invalid expense entries');
        }
    }

    return fixed;
}
