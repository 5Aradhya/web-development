const DB_NAME = "ExpenseTrackerDB";
const DB_VERSION = 1;
const STORE_NAME = "expenses";

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function getAllExpensesFromDB() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveExpenseToDB(expense) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(expense);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function deleteExpenseFromDB(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function migrateFromLocalStorage() {
    const existing = await getAllExpensesFromDB();
    if (existing.length > 0) return;

    const oldData = localStorage.getItem("expenses");
    if (!oldData) return;

    const oldExpenses = JSON.parse(oldData);
    if (oldExpenses.length === 0) return;

    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    oldExpenses.forEach(exp => store.put(exp));

    return new Promise((resolve) => {
        tx.oncomplete = () => {
            localStorage.removeItem("expenses");
            resolve();
        };
    });
}

function debounce(func, delay = 400) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

const expenseForm = document.getElementById("expenseForm");
const expenseTitle = document.getElementById("expenseTitle");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");
const expenseError = document.getElementById("expenseError");

const budgetInput = document.getElementById("budgetInput");
const setBudgetBtn = document.getElementById("setBudgetBtn");
const budgetAlert = document.getElementById("budgetAlert");

const searchExpense = document.getElementById("searchExpense");
const filterCategory = document.getElementById("filterCategory");
const filterStartDate = document.getElementById("filterStartDate");
const filterEndDate = document.getElementById("filterEndDate");
const applyFilterBtn = document.getElementById("applyFilterBtn");
const clearFilterBtn = document.getElementById("clearFilterBtn");

const expenseTableBody = document.getElementById("expenseTableBody");
const expenseEmptyMsg = document.getElementById("expenseEmptyMsg");
const expenseSentinel = document.getElementById("expenseSentinel");
const expenseTotal = document.getElementById("expenseTotal");

if (expenseForm) {

    let editingId = null;
    let visibleCount = 8;
    const PAGE_SIZE = 8;
    let migrated = false;

    let pieChartInstance = null;
    let barChartInstance = null;

    async function getExpenses() {
        if (!migrated) {
            await migrateFromLocalStorage();
            migrated = true;
        }
        return getAllExpensesFromDB();
    }

    function loadChartJsLibrary() {
        return new Promise((resolve, reject) => {
            if (window.Chart) {
                resolve();
                return;
            }
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/chart.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Chart.js failed to load"));
            document.head.appendChild(script);
        });
    }

    async function renderCharts(expenses) {
        await loadChartJsLibrary();

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

    function getBudget() {
        const data = localStorage.getItem("monthlyBudget");
        return data ? parseFloat(data) : null;
    }

    function saveBudget(amount) {
        localStorage.setItem("monthlyBudget", amount);
    }

    function generateId() {
        return Date.now().toString();
    }

    async function getFilteredExpenses() {
        let expenses = await getExpenses();

        const searchTerm = searchExpense.value.trim().toLowerCase();
        const category = filterCategory.value;
        const startDate = filterStartDate.value;
        const endDate = filterEndDate.value;

        if (searchTerm) {
            expenses = expenses.filter(exp =>
                exp.title.toLowerCase().includes(searchTerm)
            );
        }

        if (category) {
            expenses = expenses.filter(exp => exp.category === category);
        }

        if (startDate) {
            expenses = expenses.filter(exp => exp.date >= startDate);
        }

        if (endDate) {
            expenses = expenses.filter(exp => exp.date <= endDate);
        }

        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        return expenses;
    }

    async function renderTable() {
        const filtered = await getFilteredExpenses();
        const toShow = filtered.slice(0, visibleCount);

        expenseTableBody.innerHTML = "";
        expenseEmptyMsg.style.display = filtered.length === 0 ? "block" : "none";

        toShow.forEach(exp => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${exp.title}</td>
                <td>${exp.category}</td>
                <td>${exp.date}</td>
                <td>₹${exp.amount.toFixed(2)}</td>
                <td>
                    <button class="btn btn-outline edit-btn" data-id="${exp.id}">✏️ Edit</button>
                    <button class="btn btn-outline delete-btn" data-id="${exp.id}">🗑️ Delete</button>
                </td>
            `;
            expenseTableBody.appendChild(row);
        });

        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => startEdit(btn.getAttribute("data-id")));
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteExpense(btn.getAttribute("data-id")));
        });

        const totalAmount = filtered.reduce((sum, exp) => sum + exp.amount, 0);
        expenseTotal.textContent = `Total: ₹${totalAmount.toFixed(2)}`;

        await renderCharts(filtered);
    }

    expenseForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = expenseTitle.value.trim();
        const amount = parseFloat(expenseAmount.value);
        const category = expenseCategory.value;
        const date = expenseDate.value;

        if (!title || !amount || amount <= 0 || !category || !date) {
            expenseError.textContent = "⚠️ Please fill all fields correctly!";
            return;
        }
        expenseError.textContent = "";

        const expense = {
            id: editingId || generateId(),
            title,
            amount,
            category,
            date
        };

        await saveExpenseToDB(expense);

        if (editingId) {
            editingId = null;
            expenseForm.querySelector("button[type=submit]").textContent = "Add Expense";
        }

        expenseForm.reset();
        visibleCount = PAGE_SIZE;
        await renderTable();
        await checkBudgetAlert();
    });

    async function startEdit(id) {
        const expenses = await getExpenses();
        const exp = expenses.find(e => e.id === id);
        if (!exp) return;

        expenseTitle.value = exp.title;
        expenseAmount.value = exp.amount;
        expenseCategory.value = exp.category;
        expenseDate.value = exp.date;

        editingId = id;
        expenseForm.querySelector("button[type=submit]").textContent = "Update Expense";
        expenseForm.scrollIntoView({ behavior: "smooth" });
    }

    async function deleteExpense(id) {
        await deleteExpenseFromDB(id);
        await renderTable();
        await checkBudgetAlert();
    }

    setBudgetBtn.addEventListener("click", async () => {
        const value = parseFloat(budgetInput.value);
        if (!value || value <= 0) {
            budgetAlert.textContent = "⚠️ Please enter a valid budget amount!";
            budgetAlert.style.color = "red";
            return;
        }
        saveBudget(value);
        budgetInput.value = "";
        await checkBudgetAlert();
    });

    async function checkBudgetAlert() {
        const budget = getBudget();
        if (!budget) {
            budgetAlert.textContent = "";
            return;
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const expenses = await getExpenses();
        const monthTotal = expenses
            .filter(exp => {
                const d = new Date(exp.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);

        const percentUsed = (monthTotal / budget) * 100;

        if (percentUsed >= 100) {
            budgetAlert.textContent = `🚨 Budget exceeded! Spent ₹${monthTotal.toFixed(2)} of ₹${budget.toFixed(2)}`;
            budgetAlert.style.color = "red";
        } else if (percentUsed >= 80) {
            budgetAlert.textContent = `⚠️ You've used ${percentUsed.toFixed(0)}% of your budget (₹${monthTotal.toFixed(2)} / ₹${budget.toFixed(2)})`;
            budgetAlert.style.color = "orange";
        } else {
            budgetAlert.textContent = `✅ Spent ₹${monthTotal.toFixed(2)} of ₹${budget.toFixed(2)} this month`;
            budgetAlert.style.color = "var(--primary-color)";
        }
    }

    searchExpense.addEventListener("input", debounce(async () => {
        visibleCount = PAGE_SIZE;
        await renderTable();
    }, 400));

    applyFilterBtn.addEventListener("click", async () => {
        visibleCount = PAGE_SIZE;
        await renderTable();
    });

    clearFilterBtn.addEventListener("click", async () => {
        filterCategory.value = "";
        filterStartDate.value = "";
        filterEndDate.value = "";
        searchExpense.value = "";
        visibleCount = PAGE_SIZE;
        await renderTable();
    });

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
                const filtered = await getFilteredExpenses();
                if (visibleCount < filtered.length) {
                    visibleCount += PAGE_SIZE;
                    await renderTable();
                }
            }
        });
    });

    if (expenseSentinel) {
        scrollObserver.observe(expenseSentinel);
    }

    renderTable();
    checkBudgetAlert();
}
