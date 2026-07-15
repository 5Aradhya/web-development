let pieChartInstance = null;
let barChartInstance = null;

export function renderCharts(expenses) {
    const categoryTotals = {};
    expenses.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const pieCtx = document.getElementById("pieChart");
    if (pieChartInstance) pieChartInstance.destroy();

    pieChartInstance = new Chart(pieCtx, {
        type: "pie",
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: ["#2ecc71", "#3498db", "#f1c40f", "#e74c3c", "#9b59b6", "#1abc9c"]
            }]
        },
        options: { responsive: true }
    });

    const dateTotals = {};
    expenses.forEach(exp => {
        dateTotals[exp.date] = (dateTotals[exp.date] || 0) + exp.amount;
    });

    const sortedDates = Object.keys(dateTotals).sort();

    const barCtx = document.getElementById("barChart");
    if (barChartInstance) barChartInstance.destroy();

    barChartInstance = new Chart(barCtx, {
        type: "bar",
        data: {
            labels: sortedDates,
            datasets: [{
                label: "Amount Spent (₹)",
                data: sortedDates.map(date => dateTotals[date]),
                backgroundColor: "#2ecc71"
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}
