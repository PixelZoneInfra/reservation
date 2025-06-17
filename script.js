// Wspólne funkcje dla obu stron
const STORAGE_KEY = 'restaurant_orders';
const ORDER_LIMIT_KEY = 'order_limits';
const ORDER_LIMIT_COUNT = 2;
const ORDER_LIMIT_TIME = 5 * 60 * 1000; // 5 minut w milisekundach

// Funkcja zapisująca zamówienia do localStorage
function saveOrders(orders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// Funkcja pobierająca zamówienia z localStorage
function getOrders() {
    const orders = localStorage.getItem(STORAGE_KEY);
    return orders ? JSON.parse(orders) : [];
}

// Funkcja generująca nowy ID zamówienia
function generateOrderId() {
    const orders = getOrders();
    return orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
}

// Funkcja formatowania czasu
function formatTime(date) {
    return new Date(date).toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Funkcja formatowania daty
function formatDate(date) {
    return new Date(date).toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Funkcja pobierająca parametry z URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Funkcje zarządzania limitami zamówień
function getOrderLimits() {
    const limits = localStorage.getItem(ORDER_LIMIT_KEY);
    return limits ? JSON.parse(limits) : {};
}

function saveOrderLimits(limits) {
    localStorage.setItem(ORDER_LIMIT_KEY, JSON.stringify(limits));
}

function checkOrderLimit(deskNumber) {
    const limits = getOrderLimits();
    const deskLimits = limits[deskNumber];
    
    if (!deskLimits) {
        return { allowed: true, remaining: ORDER_LIMIT_COUNT, timeRemaining: 0 };
    }
    
    const now = Date.now();
    
    // Usuń stare wpisy (starsze niż 5 minut)
    const validOrders = deskLimits.filter(timestamp => now - timestamp < ORDER_LIMIT_TIME);
    
    if (validOrders.length !== deskLimits.length) {
        limits[deskNumber] = validOrders;
        saveOrderLimits(limits);
    }
    
    const remaining = ORDER_LIMIT_COUNT - validOrders.length;
    let timeRemaining = 0;
    
    if (remaining <= 0 && validOrders.length > 0) {
        const oldestOrder = Math.min(...validOrders);
        timeRemaining = ORDER_LIMIT_TIME - (now - oldestOrder);
    }
    
    return {
        allowed: remaining > 0,
        remaining: Math.max(0, remaining),
        timeRemaining: Math.max(0, timeRemaining)
    };
}

function addOrderToLimit(deskNumber) {
    const limits = getOrderLimits();
    
    if (!limits[deskNumber]) {
        limits[deskNumber] = [];
    }
    
    limits[deskNumber].push(Date.now());
    saveOrderLimits(limits);
}

// Funkcja formatowania czasu pozostałego
function formatTimeRemaining(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Funkcja obliczająca sumę zamówienia
function calculateOrderTotal(items) {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}
