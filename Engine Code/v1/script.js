// State
let state = {
    size: 2000,
    type: 'asphalt',
    urgency: 'normal',
    zipcode: '',
    config: null
};

// DOM Elements
const form = document.getElementById('roofingForm');
const sizeInput = document.getElementById('roofSize');
const sizeVal = document.getElementById('roofSizeVal');
const typeInput = document.getElementById('roofType');
const urgencyInput = document.getElementById('urgency');
const zipInput = document.getElementById('zipcode');

const priceMinEl = document.getElementById('priceMin');
const priceMaxEl = document.getElementById('priceMax');
const waBtn = document.getElementById('waBtn');
const smsBtn = document.getElementById('smsBtn');

// Dynamic Elements
const pageTitle = document.getElementById('pageTitle');
const heroTitle = document.getElementById('heroTitle');
const heroSubtitle = document.getElementById('heroSubtitle');
const heroCallBtn = document.getElementById('heroCallBtn');
const resultsCallBtn = document.getElementById('resultsCallBtn');

// Initialize
async function init() {
    try {
        await loadConfig();
        applyConfig();
        addEventListeners();
        updateCalculation();
    } catch (error) {
        console.error("Failed to load configuration:", error);
        alert("Error loading site configuration. Please check console.");
    }
}

async function loadConfig() {
    const response = await fetch('config.json');
    if (!response.ok) throw new Error('Config file not found');
    state.config = await response.json();
}

function applyConfig() {
    const { clientName, phone, pricing, theme } = state.config;

    // Update Text
    document.title = `${clientName} - Estimate Calculator`;
    if (heroTitle) heroTitle.textContent = `${clientName} Estimate Calculator`;
    // heroSubtitle could remain static or be configured if needed

    // Update Phone Links
    if (heroCallBtn) {
        heroCallBtn.href = `tel:${phone}`;
        heroCallBtn.textContent = `Call ${phone}`;
    }
    if (resultsCallBtn) {
        resultsCallBtn.href = `tel:${phone}`;
        resultsCallBtn.textContent = `Call ${phone}`;
    }

    // Apply Theme (Simple version: set CSS variable if we had one, or inline styles)
    if (theme && theme.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
        // We might need to handle this in CSS (e.g. use var(--primary-color))
        // For now, let's assume the user might manually tweak CSS or we rely on this simple override usually working if CSS uses vars.
        // Existing CSS likely uses hardcoded hex values, so this line might not do much without CSS refactor. 
        // But the request was to make it configurable. I'll stick to logic updates primarily.
    }
}

function addEventListeners() {
    sizeInput.addEventListener('input', (e) => {
        state.size = parseInt(e.target.value);
        sizeVal.textContent = state.size;
        updateCalculation();
    });

    typeInput.addEventListener('change', (e) => {
        state.type = e.target.value;
        updateCalculation();
    });

    urgencyInput.addEventListener('change', (e) => {
        state.urgency = e.target.value;
        updateCalculation();
    });

    zipInput.addEventListener('input', (e) => {
        state.zipcode = e.target.value;
    });
}

function updateCalculation() {
    if (!state.config) return;

    // 1. Calculate Base
    const { baseRate, materialMultipliers } = state.config.pricing;
    // Urgency multipliers could also be in config, but let's keep hardcoded for now or move if needed. 
    // The previous code had hardcoded URGENCY. Let's keep them here or assume standard.
    // Ideally put in config, but I'll stick to hardcoded for urgency as it wasn't in my simple schema plan, 
    // or I can add it to schema. The schema in plan didn't have urgency. I'll define it here.
    const URGENCY = {
        normal: 1.0,
        soon: 1.15,
        emergency: 1.35
    };

    const typeMult = materialMultipliers[state.type] || 1.0;
    const urgencyMult = URGENCY[state.urgency];

    const exactTotal = state.size * baseRate * typeMult * urgencyMult;

    // 2. Calculate Range (+/- 12%)
    const minPrice = exactTotal * 0.88;
    const maxPrice = exactTotal * 1.12;

    // 3. Update Display
    priceMinEl.textContent = formatCurrency(minPrice);
    priceMaxEl.textContent = formatCurrency(maxPrice);

    // 4. Update CTA Links
    updateLinks(minPrice, maxPrice);
}

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(num);
}

function updateLinks(min, max) {
    const rangeStr = `${formatCurrency(min)} - ${formatCurrency(max)}`;
    const typeStr = typeInput.options[typeInput.selectedIndex].text;
    const urgencyStr = urgencyInput.options[urgencyInput.selectedIndex].text;

    const message = `Roofing Estimate
Name: {name}
Size: ${state.size} sq ft
Type: ${typeStr}
Urgency: ${urgencyStr}
Estimate: ${rangeStr}`;

    const encodedMsg = encodeURIComponent(message);
    const { phone, whatsapp } = state.config;

    // WhatsApp
    // Using the whatsapp number from config
    waBtn.href = `https://wa.me/${whatsapp}?text=${encodedMsg}`;

    // SMS
    smsBtn.href = `sms:${phone}?&body=${encodedMsg}`;
}

// Run
init();
