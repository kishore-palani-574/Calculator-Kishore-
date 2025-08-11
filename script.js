/**
 * ===================================================================
 * Scientific Calculator - Simplified
 * ===================================================================
 */

// --- STATE VARIABLES & DOM REFERENCES ---
const display = document.getElementById('display');
const historyList = document.getElementById('history-list');
const themeSwitcherBtn = document.getElementById('theme-switcher-btn'); // New
const htmlEl = document.documentElement; // New

let isDegrees = true;
let memory = 0;
let history = [];

// --- CORE DISPLAY & INPUT FUNCTIONS ---
function appendToDisplay(input) {
    const currentInput = display.value;
    const lastSegment = currentInput.split(/[\+\-\*\/\(\)^%]/).pop();
    if (input === '.' && lastSegment.includes('.')) { return; }
    display.value += input;
}
function clearDisplay() { display.value = ""; }

// --- SCIENTIFIC & CALCULATION LOGIC ---
function handleScientific(func) {
    const funcsWithParen = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'];
    if (funcsWithParen.includes(func)) { display.value += `Math.${func}(`; }
    else if (func === 'pow') { display.value += '**'; }
    else if (func === 'percent') { calculateAndSet(display.value + '/100'); }
}
function calculate() {
    if (!display.value) return;
    calculateAndSet(display.value, true);
}
function calculateAndSet(expression, addToHistory = false) {
    try {
        let originalExpr = expression.replace(/Math\./g, "").replace(/\*\*/g, "^");
        let processedExpr = expression.replace(/π/g, 'Math.PI');
        const trigRegex = /(Math\.sin|Math\.cos|Math\.tan)\(([^)]+)\)/g;
        processedExpr = processedExpr.replace(trigRegex, (match, func, value) => {
            const angle = new Function('return ' + value)();
            if (isDegrees) { return `${func}(${angle} * Math.PI / 180)`; }
            return `${func}(${angle})`;
        });
        const result = new Function('return ' + processedExpr)();
        display.value = result;
        if (addToHistory) { updateHistory(`${originalExpr} = ${result}`); }
    } catch (error) { display.value = "Error"; }
}

// --- NEW: THEME MANAGEMENT ---
/**
 * Toggles the theme between 'light' and 'dark' and updates the button icon.
 */
function toggleTheme() {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlEl.setAttribute('data-theme', newTheme);
    themeSwitcherBtn.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

// --- MEMORY FUNCTIONS ---
function memoryClear() { memory = 0; }
function memoryRecall() { display.value = memory; }
function memoryAdd() { if (display.value) { memory += parseFloat(new Function('return ' + display.value)()); } }
function memorySubtract() { if (display.value) { memory -= parseFloat(new Function('return ' + display.value)()); } }

// --- HISTORY MANAGEMENT ---
function updateHistory(entry) { history.unshift(entry); renderHistory(); }
function renderHistory() {
    historyList.innerHTML = "";
    if (history.length === 0) { historyList.innerHTML = "<p>Your calculations will appear here.</p>"; return; }
    history.forEach(entry => {
        const div = document.createElement('div');
        div.textContent = entry;
        historyList.appendChild(div);
    });
}
function clearHistory() { history = []; renderHistory(); }

// --- EVENT LISTENERS & INITIALIZATION ---
document.addEventListener('keydown', function(event) {
    const key = event.key;
    if ((key >= '0' && key <= '9') || key === '.') appendToDisplay(key);
    else if (['+', '-', '*', '/'].includes(key)) appendToDisplay(key);
    else if (key === 'Enter' || key === '=') { event.preventDefault(); calculate(); }
    else if (key === 'Backspace') { display.value = display.value.slice(0, -1); }
    else if (key === 'Escape') { clearDisplay(); }
    else if (key === '(' || key === ')') { appendToDisplay(key); }
});

renderHistory();