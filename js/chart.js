let chartInstance = null;

function renderChart(balance, totalExpenses, currency = 'INR') {
    const ctx = document.getElementById('expenseChart');

    if (!ctx) {
        console.error('Chart canvas not found');
        return;
    }

    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    const hasData = balance > 0 || totalExpenses > 0;

    const data = {
        labels: ['Remaining Balance', 'Total Expenses'],
        datasets: [{
            data: hasData ? [balance, totalExpenses] : [1, 0],
            backgroundColor: hasData ? ['#48bb78', '#fc8181'] : ['#e2e8f0', 'transparent'],
            borderColor: hasData ? ['#38a169', '#e53e3e'] : ['#cbd5e0', 'transparent'],
            borderWidth: 2,
            hoverOffset: 8
        }]
    };

    if (!hasData) {
        data.labels = ['No Data', ''];
    }

    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);

                            if (label === 'No Data' || label === '' || total === 0) {
                                return 'No data to display';
                            }

                            const percentage = Math.round((value / total) * 100);
                            const symbol = getCurrencySymbol(currency);

                            return `${label}: ${symbol} ${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '45%'
        }
    });
}

function updateChart(balance, totalExpenses) {
    if (chartInstance) {
        const hasData = balance > 0 || totalExpenses > 0;

        if (hasData) {
            chartInstance.data.datasets[0].data = [balance, totalExpenses];
            chartInstance.data.labels = ['Remaining Balance', 'Total Expenses'];
            chartInstance.data.datasets[0].backgroundColor = ['#48bb78', '#fc8181'];
            chartInstance.data.datasets[0].borderColor = ['#38a169', '#e53e3e'];
        } else {
            chartInstance.data.datasets[0].data = [1, 0];
            chartInstance.data.labels = ['No Data', ''];
            chartInstance.data.datasets[0].backgroundColor = ['#e2e8f0', 'transparent'];
            chartInstance.data.datasets[0].borderColor = ['#cbd5e0', 'transparent'];
        }

        chartInstance.update();
    } else {
        renderChart(balance, totalExpenses);
    }
}
