let currentOrder = [];

// Inicjalizacja strony menu
function initMenu() {
    // Pobierz numer stolika z URL
    const deskNumber = getUrlParameter('desk');
    
    // Wyświetl numer stolika
    const deskNumberElement = document.getElementById('desk-number');
    if (deskNumber) {
        deskNumberElement.textContent = deskNumber;
    } else {
        deskNumberElement.textContent = 'Nieznany';
    }
    
    // Sprawdź limit zamówień
    updateOrderLimitInfo(deskNumber);
    
    // Wygeneruj menu
    generateMenuCategories();
    
    // Obsługa formularza
    document.getElementById('order-form').addEventListener('submit', submitOrder);
    document.getElementById('clear-order').addEventListener('click', clearOrder);
    document.getElementById('new-order-btn').addEventListener('click', resetOrderForm);
    
    // Ukryj sekcje na początku
    document.getElementById('order-confirmation').style.display = 'none';
    document.getElementById('order-limit-warning').style.display = 'none';
    document.getElementById('order-summary').style.display = 'none';
    
    // Aktualizuj limit co minute
    setInterval(() => updateOrderLimitInfo(deskNumber), 60000);
}

// Funkcja generująca kategorie menu
function generateMenuCategories() {
    const menuContainer = document.getElementById('menu-categories');
    
    Object.keys(menuData).forEach((categoryKey, index) => {
        const category = menuData[categoryKey];
        const isFirstCategory = index === 0;
        
        const categoryElement = document.createElement('div');
        categoryElement.className = 'menu-category';
        
        categoryElement.innerHTML = `
            <div class="category-header ${isFirstCategory ? '' : 'collapsed'}" onclick="toggleCategory('${categoryKey}')">
                <h3>${category.name}</h3>
                <span class="category-toggle">−</span>
            </div>
            <div class="category-items ${isFirstCategory ? '' : 'collapsed'}" id="category-${categoryKey}">
                ${category.items.map((item, itemIndex) => `
                    <div class="menu-item">
                        <div class="item-number">${itemIndex + 1}</div>
                        <div class="item-details">
                            <div class="item-name">${item.name}</div>
                            <div class="item-description">${item.description}</div>
                        </div>
                        <div class="item-price">${item.price.toFixed(2)} PLN</div>
                        <div class="item-quantity">
                            <div class="quantity-controls">
                                <button type="button" class="quantity-btn" onclick="changeQuantity('${item.id}', -1)">−</button>
                                <input type="number" class="quantity-input" id="quantity-${item.id}" 
                                       value="0" min="0" max="20" onchange="updateQuantity('${item.id}', this.value)">
                                <button type="button" class="quantity-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        menuContainer.appendChild(categoryElement);
    });
}

// Funkcja przełączania kategorii (akordeon)
function toggleCategory(categoryKey) {
    const header = document.querySelector(`#category-${categoryKey}`).parentElement.querySelector('.category-header');
    const content = document.getElementById(`category-${categoryKey}`);
    const toggle = header.querySelector('.category-toggle');
    
    header.classList.toggle('collapsed');
    content.classList.toggle('collapsed');
    toggle.textContent = header.classList.contains('collapsed') ? '+' : '−';
}

// Funkcja zmiany ilości
function changeQuantity(itemId, delta) {
    const input = document.getElementById(`quantity-${itemId}`);
    const currentValue = parseInt(input.value) || 0;
    const newValue = Math.max(0, Math.min(20, currentValue + delta));
    input.value = newValue;
    updateQuantity(itemId, newValue);
}

// Funkcja aktualizacji ilości
function updateQuantity(itemId, quantity) {
    quantity = parseInt(quantity) || 0;
    
    // Znajdź produkt w danych menu
    let product = null;
    for (const categoryKey in menuData) {
        product = menuData[categoryKey].items.find(item => item.id === itemId);
        if (product) break;
    }
    
    if (!product) return;
    
    // Usuń produkt z zamówienia jeśli ilość to 0
    currentOrder = currentOrder.filter(item => item.id !== itemId);
    
    // Dodaj produkt do zamówienia jeśli ilość > 0
    if (quantity > 0) {
        currentOrder.push({
            id: itemId,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }
    
    updateOrderSummary();
}

// Funkcja aktualizacji podsumowania zamówienia
function updateOrderSummary() {
    const summaryElement = document.getElementById('order-summary');
    const summaryItems = document.getElementById('summary-items');
    const totalPrice = document.getElementById('total-price');
    
    if (currentOrder.length === 0) {
        summaryElement.style.display = 'none';
        return;
    }
    
    summaryElement.style.display = 'block';
    
    const itemsHtml = currentOrder.map(item => `
        <div class="summary-item">
            <span>${item.name} x${item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)} PLN</span>
        </div>
    `).join('');
    
    summaryItems.innerHTML = itemsHtml;
    
    const total = calculateOrderTotal(currentOrder);
    totalPrice.textContent = total.toFixed(2);
}

// Funkcja czyszczenia zamówienia
function clearOrder() {
    currentOrder = [];
    
    // Wyzeruj wszystkie pola ilości
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.value = '0';
    });
    
    updateOrderSummary();
}

// Funkcja aktualizacji informacji o limicie zamówień
function updateOrderLimitInfo(deskNumber) {
    if (!deskNumber) return;
    
    const limitInfo = checkOrderLimit(deskNumber);
    const infoElement = document.getElementById('order-limit-info');
    
    if (limitInfo.remaining === ORDER_LIMIT_COUNT) {
        infoElement.textContent = '';
    } else {
        infoElement.textContent = `Pozostało: ${limitInfo.remaining}/${ORDER_LIMIT_COUNT} zamówień`;
    }
    
    // Sprawdź czy formularz powinien być zablokowany
    const formElement = document.getElementById('order-form');
    const warningElement = document.getElementById('order-limit-warning');
    const remainingTimeElement = document.getElementById('remaining-time');
    
    if (!limitInfo.allowed) {
        formElement.style.display = 'none';
        warningElement.style.display = 'block';
        
        if (limitInfo.timeRemaining > 0) {
            remainingTimeElement.textContent = formatTimeRemaining(limitInfo.timeRemaining);
        }
    } else {
        formElement.style.display = 'block';
        warningElement.style.display = 'none';
    }
}

// Funkcja składania zamówienia
function submitOrder(e) {
    e.preventDefault();
    
    const deskNumber = getUrlParameter('desk');
    const customerName = document.getElementById('customer-name').value.trim();
    
    // Sprawdź limit zamówień
    const limitInfo = checkOrderLimit(deskNumber);
    if (!limitInfo.allowed) {
        updateOrderLimitInfo(deskNumber);
        return;
    }
    
    if (!customerName) {
        alert('Proszę podać swoje imię');
        return;
    }
    
    if (currentOrder.length === 0) {
        alert('Proszę wybrać przynajmniej jeden produkt');
        return;
    }
    
    // Pobierz istniejące zamówienia
    const orders = getOrders();
    
    // Utwórz nowe zamówienie
    const newOrder = {
        id: generateOrderId(),
        customerName: customerName,
        deskNumber: deskNumber,
        items: [...currentOrder],
        timestamp: new Date().toISOString(),
        completed: false
    };
    
    // Dodaj zamówienie do listy
    orders.push(newOrder);
    
    // Zapisz zaktualizowaną listę
    saveOrders(orders);
    
    // Dodaj do limitu zamówień
    addOrderToLimit(deskNumber);
    
    // Pokaż potwierdzenie
    showOrderConfirmation(newOrder);
}

// Funkcja pokazująca potwierdzenie zamówienia
function showOrderConfirmation(order) {
    // Ukryj formularz
    document.getElementById('order-form').style.display = 'none';
    
    // Pokaż potwierdzenie
    const confirmationElement = document.getElementById('order-confirmation');
    confirmationElement.style.display = 'block';
    
    // Ustaw dane zamówienia
    document.getElementById('confirmation-order-id').textContent = order.id;
    document.getElementById('confirmation-total').textContent = calculateOrderTotal(order.items).toFixed(2);
}

// Funkcja resetująca formularz zamówienia
function resetOrderForm() {
    // Wyczyść zamówienie
    clearOrder();
    
    // Wyczyść imię klienta
    document.getElementById('customer-name').value = '';
    
    // Pokaż formularz
    document.getElementById('order-form').style.display = 'block';
    
    // Ukryj potwierdzenie
    document.getElementById('order-confirmation').style.display = 'none';
    
    // Aktualizuj informacje o limicie
    const deskNumber = getUrlParameter('desk');
    updateOrderLimitInfo(deskNumber);
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', initMenu);
