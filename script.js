let orders = [];
let orderCounter = 1;
let alertInterval = null;

// Funkcja dodawania nowego zamówienia
function addOrder() {
    const customerName = document.getElementById('customer-name').value.trim();
    const orderDetails = document.getElementById('order-details').value.trim();
    
    if (!customerName || !orderDetails) {
        alert('Proszę wypełnić wszystkie pola');
        return;
    }
    
    const order = {
        id: orderCounter++,
        customerName: customerName,
        details: orderDetails,
        timestamp: new Date(),
        status: 'pending',
        completed: false
    };
    
    orders.push(order);
    
    // Czyszczenie formularza
    document.getElementById('customer-name').value = '';
    document.getElementById('order-details').value = '';
    
    updateOrdersDisplay();
    updateStats();
    checkAlerts();
}

// Funkcja aktualizacji wyświetlania zamówień
function updateOrdersDisplay() {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = `order-item ${order.completed ? 'completed' : ''}`;
        
        // Sprawdzenie czy zamówienie jest przeterminowane (ponad 5 minut)
        const now = new Date();
        const orderAge = (now - order.timestamp) / 1000 / 60; // w minutach
        const isOverdue = orderAge > 5 && !order.completed;
        
        if (isOverdue) {
            orderElement.classList.add('overdue');
        }
        
        orderElement.innerHTML = `
            <div class="order-header">
                <span class="order-id">Zamówienie #${order.id}</span>
                <span class="order-time">${formatTime(order.timestamp)}</span>
            </div>
            <div class="customer-name">${order.customerName}</div>
            <div class="order-details">${order.details}</div>
            <div class="order-status ${order.completed ? 'status-completed' : 'status-pending'}">
                ${order.completed ? 'Ukończone' : 'Oczekujące'}
            </div>
        `;
        
        // Dodanie funkcji kliknięcia
        orderElement.addEventListener('click', () => toggleOrderStatus(order.id));
        
        ordersList.appendChild(orderElement);
    });
}

// Funkcja przełączania statusu zamówienia
function toggleOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.completed = !order.completed;
        updateOrdersDisplay();
        updateStats();
        checkAlerts();
    }
}

// Funkcja formatowania czasu
function formatTime(date) {
    return date.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Funkcja aktualizacji statystyk
function updateStats() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => !o.completed).length;
    
    document.getElementById('total-orders').textContent = `Zamówienia: ${totalOrders}`;
    document.getElementById('pending-orders').textContent = `Oczekujące: ${pendingOrders}`;
}

// Funkcja sprawdzania alertów
function checkAlerts() {
    const now = new Date();
    const overdueOrders = orders.filter(order => {
        if (order.completed) return false;
        const orderAge = (now - order.timestamp) / 1000 / 60; // w minutach
        return orderAge > 5;
    });
    
    const alertOverlay = document.getElementById('alert-overlay');
    
    if (overdueOrders.length > 0) {
        alertOverlay.classList.add('active');
        if (!alertInterval) {
            alertInterval = setInterval(checkAlerts, 30000); // sprawdzaj co 30 sekund
        }
    } else {
        alertOverlay.classList.remove('active');
        if (alertInterval) {
            clearInterval(alertInterval);
            alertInterval = null;
        }
    }
}

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', function() {
    updateOrdersDisplay();
    updateStats();
    
    // Sprawdzanie alertów co minutę
    setInterval(checkAlerts, 60000);
    
    // Aktualizacja wyświetlania co 30 sekund
    setInterval(updateOrdersDisplay, 30000);
});
