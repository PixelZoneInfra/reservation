let orders = [];
let alertInterval = null;
let alertActive = false;
let lastAlertTime = 0;

// Inicjalizacja panelu
function initPanel() {
    loadOrders();
    updateOrdersDisplay();
    updateStats();
    
    // Nasłuchiwanie na zmiany w localStorage (nowe zamówienia)
    window.addEventListener('storage', function(e) {
        if (e.key === STORAGE_KEY) {
            loadOrders();
            updateOrdersDisplay();
            updateStats();
            checkForNewOrders();
        }
    });
    
    // Sprawdzanie alertów co 30 sekund
    setInterval(checkAlerts, 30000);
    
    // Aktualizacja wyświetlania co 30 sekund
    setInterval(updateOrdersDisplay, 30000);
    
    // Obsługa kliknięcia w dowolne miejsce na stronie (wyłączenie alertu)
    document.addEventListener('click', function() {
        if (alertActive) {
            disableAlert();
            lastAlertTime = Date.now();
        }
    });
}

// Ładowanie zamówień z localStorage
function loadOrders() {
    orders = getOrders();
}

// Funkcja aktualizacji wyświetlania zamówień
function updateOrdersDisplay() {
    const pendingOrdersList = document.getElementById('orders-list');
    const completedOrdersList = document.getElementById('completed-orders-list');
    
    pendingOrdersList.innerHTML = '';
    completedOrdersList.innerHTML = '';
    
    // Podział zamówień na oczekujące i zakończone
    const pendingOrders = orders.filter(o => !o.completed);
    const completedOrders = orders.filter(o => o.completed);
    
    // Sortowanie oczekujących - od najstarszych
    pendingOrders.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Sortowanie zakończonych - od najnowszych (stos)
    completedOrders.sort((a, b) => new Date(b.completedAt || b.timestamp) - new Date(a.completedAt || a.timestamp));
    
    // Wyświetlanie oczekujących zamówień
    pendingOrders.forEach(order => {
        const orderElement = createOrderElement(order, false);
        pendingOrdersList.appendChild(orderElement);
    });
    
    // Wyświetlanie zakończonych zamówień
    completedOrders.forEach(order => {
        const orderElement = createOrderElement(order, true);
        completedOrdersList.appendChild(orderElement);
    });
}

// Funkcja tworzenia elementu zamówienia
function createOrderElement(order, isCompleted) {
    const orderElement = document.createElement('div');
    orderElement.className = `order-item ${isCompleted ? 'completed' : ''}`;
    
    if (!isCompleted) {
        // Sprawdzenie czy zamówienie jest przeterminowane (ponad 5 minut)
        const now = new Date();
        const orderAge = (now - new Date(order.timestamp)) / 1000 / 60; // w minutach
        const isOverdue = orderAge > 5;
        
        if (isOverdue) {
            orderElement.classList.add('overdue');
        }
    }
    
    // Formatowanie pozycji zamówienia
    const itemsHtml = order.items.map(item => `
        <div class="order-item-row">
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">x${item.quantity}</span>
        </div>
    `).join('');
    
    const total = calculateOrderTotal(order.items);
    
    orderElement.innerHTML = `
        <div class="order-header">
            <span class="order-id">Zamówienie #${order.id}</span>
            <span class="order-time">${formatTime(order.timestamp)}</span>
        </div>
        <div class="customer-info">
            ${order.deskNumber ? `<span class="desk-number">Stolik ${order.deskNumber}</span>` : ''}
            <span class="customer-name">${order.customerName}</span>
        </div>
        <div class="order-items">
            ${itemsHtml}
        </div>
        <div class="order-total">
            Suma: ${total.toFixed(2)} PLN
        </div>
        <div class="order-status ${isCompleted ? 'status-completed' : 'status-pending'}">
            ${isCompleted ? 'Ukończone' : 'Oczekujące'}
        </div>
    `;
    
    // Dodanie funkcji kliknięcia
    orderElement.addEventListener('click', () => toggleOrderStatus(order.id));
    
    return orderElement;
}

// Funkcja przełączania statusu zamówienia
function toggleOrderStatus(orderId) {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].completed = !orders[orderIndex].completed;
        
        // Dodaj timestamp zakończenia
        if (orders[orderIndex].completed) {
            orders[orderIndex].completedAt = new Date().toISOString();
        } else {
            delete orders[orderIndex].completedAt;
        }
        
        saveOrders(orders);
        updateOrdersDisplay();
        updateStats();
        checkAlerts();
    }
}

// Funkcja aktualizacji statystyk
function updateStats() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => !o.completed).length;
    const completedOrders = orders.filter(o => o.completed).length;
    
    document.getElementById('total-orders').textContent = `Zamówienia: ${totalOrders}`;
    document.getElementById('pending-orders').textContent = `Oczekujące: ${pendingOrders}`;
    document.getElementById('completed-orders').textContent = `Zakończone: ${completedOrders}`;
}

// Funkcja sprawdzania alertów
function checkAlerts() {
    const now = new Date();
    const overdueOrders = orders.filter(order => {
        if (order.completed) return false;
        const orderAge = (now - new Date(order.timestamp)) / 1000 / 60; // w minutach
        return orderAge > 5;
    });
    
    // Jeśli są przeterminowane zamówienia i minęło co najmniej 30 sekund od ostatniego wyłączenia alertu
    if (overdueOrders.length > 0 && (Date.now() - lastAlertTime > 30000)) {
        enableAlert();
    }
}

// Funkcja sprawdzająca nowe zamówienia
function checkForNewOrders() {
    const now = Date.now();
    const newOrders = orders.filter(order => {
        // Sprawdzamy czy zamówienie jest nowe (dodane w ciągu ostatnich 10 sekund)
        return !order.completed && (now - new Date(order.timestamp).getTime() < 10000);
    });
    
    if (newOrders.length > 0) {
        enableAlert();
    }
}

// Włączenie alertu
function enableAlert() {
    const alertOverlay = document.getElementById('alert-overlay');
    alertOverlay.classList.add('active');
    alertActive = true;
}

// Wyłączenie alertu
function disableAlert() {
    const alertOverlay = document.getElementById('alert-overlay');
    alertOverlay.classList.remove('active');
    alertActive = false;
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', initPanel);
