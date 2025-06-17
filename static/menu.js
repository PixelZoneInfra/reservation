// Strona menu - Flask API
import { 
  getUrlParameter, 
  createOrder, 
  checkOrderLimit, 
  calculateOrderTotal
} from './script.js';

import { menuData } from './menu-data.js';

let currentOrder = [];

// Inicjalizacja strony menu
function initMenu() {
  const deskNumber = getUrlParameter('desk');
  
  // Wyświetl numer stolika
  const deskNumberElement = document.getElementById('desk-number');
  if (deskNumber) {
    deskNumberElement.textContent = deskNumber;
  }
  
  // Sprawdź limit zamówień
  updateOrderLimitInfo(deskNumber);
  
  // Wygeneruj menu z kategoriami
  generateMenuCategories();
  
  // Obsługa formularza
  document.getElementById('order-form').addEventListener('submit', submitOrder);
  document.getElementById('clear-order').addEventListener('click', clearOrder);
}

// Aktualizacja informacji o limicie zamówień
async function updateOrderLimitInfo(deskNumber) {
  if (!deskNumber) return;
  
  try {
    const limitInfo = await checkOrderLimit(deskNumber);
    const infoElement = document.getElementById('order-limit-info');
    
    if (limitInfo.remaining === 2) {
      infoElement.textContent = '';
    } else {
      infoElement.textContent = `Pozostało: ${limitInfo.remaining}/2 zamówień`;
    }
    
    // Sprawdź czy formularz powinien być zablokowany
    const formElement = document.getElementById('order-form');
    const warningElement = document.getElementById('order-limit-warning');
    
    if (!limitInfo.allowed) {
      formElement.style.display = 'none';
      warningElement.style.display = 'block';
    } else {
      formElement.style.display = 'block';
      warningElement.style.display = 'none';
    }
  } catch (error) {
    console.error('Błąd podczas sprawdzania limitu:', error);
  }
}

// Składanie zamówienia
async function submitOrder(e) {
  e.preventDefault();
  
  const deskNumber = getUrlParameter('desk');
  const customerName = document.getElementById('customer-name').value.trim();
  
  if (!customerName || currentOrder.length === 0) {
    alert('Proszę wypełnić wszystkie pola i wybrać produkty');
    return;
  }
  
  try {
    const orderData = {
      deskNumber: parseInt(deskNumber),
      customerName: customerName,
      items: [...currentOrder]
    };
    
    await createOrder(orderData);
    showOrderConfirmation();
    
  } catch (error) {
    console.error('Błąd podczas składania zamówienia:', error);
    alert(error.message);
  }
}

document.addEventListener('DOMContentLoaded', initMenu);
