// Panel zarządzania zamówieniami - Flask API
import { 
  fetchOrders, 
  toggleOrderStatus, 
  formatTime, 
  parseItemsString
} from './script.js';

let alertActive = false;
let lastAlertTime = 0;
let lastOrderCount = 0;

// Inicjalizacja panelu
function initPanel() {
  loadAndDisplayOrders();
  
  // Sprawdzanie nowych zamówień co 5 sekund
  setInterval(loadAndDisplayOrders, 5000);
  
  // Obsługa kliknięcia w dowolne miejsce na stronie (wyłączenie alertu)
  document.addEventListener('click', function() {
    if (alertActive) {
      disableAlert();
      lastAlertTime = Date.now();
    }
  });
}

// Ładowanie i wyświetlanie zamówień
async function loadAndDisplayOrders() {
  try {
    const data = await fetchOrders();
    updateOrdersDisplay(data.active, data.done);
    updateStats(data.active, data.done);
    checkForNewOrders(data.active);
  } catch (error) {
    console.error('Błąd podczas ładowania zamówień:', error);
  }
}

// Funkcja tworzenia elementu zamówienia
function createOrderElement(order, isCompleted) {
  const orderElement = document.createElement('div');
  orderElement.className = `order-item ${isCompleted ? 'completed' : ''}`;
  
  // Parsowanie pozycji zamówienia ze stringa
  const items = parseItemsString(order.items);
  
  // Formatowanie pozycji zamówienia
  const itemsHtml = items.map(item => `
    <div class="order-item-row">
      <span class="item-name">${item.name}</span>
      <span class="item-quantity">x${item.quantity}</span>
    </div>
  `).join('');
  
  orderElement.innerHTML = `
    <div class="order-header">
      <span class="order-id">Zamówienie #${order.id}</span>
      <span class="order-time">Stolik ${order.desk}</span>
    </div>
    <div class="customer-info">
      ${order.desk ? `<span class="desk-number">Stolik ${order.desk}</span>` : ''}
    </div>
    <div class="order-items">
      ${itemsHtml}
    </div>
    <div class="order-status ${isCompleted ? 'status-completed' : 'status-pending'}">
      ${isCompleted ? 'Ukończone' : 'Oczekujące'}
    </div>
  `;
  
  // Dodanie funkcji kliknięcia
  orderElement.addEventListener('click', () => handleOrderToggle(order.id));
  
  return orderElement;
}

// Obsługa przełączania statusu zamówienia
async function handleOrderToggle(orderId) {
  try {
    await toggleOrderStatus(orderId);
    loadAndDisplayOrders();
  } catch (error) {
    console.error('Błąd podczas zmiany statusu zamówienia:', error);
  }
}

document.addEventListener('DOMContentLoaded', initPanel);
