// Wspólne funkcje dla systemu zamówień - Flask API
const ORDER_LIMIT_COUNT = 2;
const ORDER_LIMIT_TIME = 5 * 60 * 1000; // 5 minut

// Formatowanie czasu i daty
export function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('pl-PL', {
    hour: '2-digit', minute: '2-digit'
  });
}

export function getUrlParameter(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function calculateOrderTotal(items) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

// API: Pobierz wszystkie zamówienia (Flask zwraca {active: [], done: []})
export async function fetchOrders() {
  const response = await fetch('/api/orders');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// API: Złóż nowe zamówienie (POST /api/order - singular!)
export async function createOrder(orderData) {
  const response = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      desk: orderData.deskNumber,
      items: orderData.items.map(item => `${item.name} x${item.quantity}`)
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// API: Przełącz status zamówienia (PATCH /api/order/:id)
export async function toggleOrderStatus(id) {
  const response = await fetch(`/api/order/${id}`, { 
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// API: Sprawdź limit zamówień dla stolika (GET /api/limit/:desk)
export async function checkOrderLimit(desk) {
  if (!desk) {
    return { 
      allowed: true, 
      remaining: ORDER_LIMIT_COUNT, 
      timeRemaining: 0 
    };
  }
  
  const response = await fetch(`/api/limit/${desk}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    allowed: data.remaining > 0,
    remaining: data.remaining,
    timeRemaining: data.reset_in_sec || 0
  };
}

// Parsowanie items ze stringa (format: "Item1 x2,Item2 x1")
export function parseItemsString(itemsString) {
  if (!itemsString) return [];
  
  return itemsString.split(',').map(item => {
    const trimmed = item.trim();
    const match = trimmed.match(/^(.+?)\s+x(\d+)$/);
    if (match) {
      return {
        name: match[1].trim(),
        quantity: parseInt(match[2])
      };
    }
    return {
      name: trimmed,
      quantity: 1
    };
  });
}
