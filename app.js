// Order Management System - Main Application Logic

class OrderManagementSystem {
    constructor() {
        this.orders = [];
        this.completedOrders = [];
        this.alertActive = false;
        this.alertInterval = null;
        this.timeUpdateInterval = null;
        this.selectedOrderId = null;
        
        // System settings
        this.settings = {
            alertThresholdMinutes: 5,
            blinkIntervalSeconds: 2,
            maxDisplayOrders: 10
        };
        
        this.initializeApp();
        this.loadSampleData();
        this.startTimeUpdates();
    }
    
    initializeApp() {
        this.bindEvents();
        this.updateCurrentTime();
        this.updateStats();
        this.renderOrders();
    }
    
    bindEvents() {
        // Add test order button
        const addTestBtn = document.getElementById('addTestOrder');
        if (addTestBtn) {
            addTestBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addTestOrder();
            });
        }
        
        // Clear completed orders button
        const clearBtn = document.getElementById('clearCompleted');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearCompletedOrders();
            });
        }
        
        // Modal events - using more robust event binding
        const modalClose = document.getElementById('modalClose');
        const modalBackdrop = document.getElementById('modalBackdrop');
        const modalCancel = document.getElementById('modalCancel');
        const modalComplete = document.getElementById('modalComplete');
        
        if (modalClose) {
            modalClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal();
            });
        }
        
        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal();
            });
        }
        
        if (modalCancel) {
            modalCancel.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal();
            });
        }
        
        if (modalComplete) {
            modalComplete.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.completeOrderFromModal();
            });
        }
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !document.getElementById('orderModal').classList.contains('hidden')) {
                this.closeModal();
            }
        });
    }
    
    loadSampleData() {
        const sampleOrders = [
            {
                id: "Z001",
                customerName: "Anna Kowalska",
                items: ["Pizza Margherita", "Coca Cola"],
                timeReceived: new Date(Date.now() - 3 * 60000), // 3 minutes ago
                status: "new",
                totalAmount: "35.50 zł"
            },
            {
                id: "Z002", 
                customerName: "Piotr Nowak",
                items: ["Burger Classic", "Frytki", "Sprite"],
                timeReceived: new Date(Date.now() - 4 * 60000), // 4 minutes ago
                status: "in_progress",
                totalAmount: "28.90 zł"
            },
            {
                id: "Z003",
                customerName: "Maria Wiśniewska",
                items: ["Sałatka Cezar", "Sok pomarańczowy"],
                timeReceived: new Date(Date.now() - 7 * 60000), // 7 minutes ago (overdue)
                status: "new",
                totalAmount: "22.00 zł"
            }
        ];
        
        this.orders = sampleOrders;
        this.updateOrderStatuses();
        this.renderOrders();
        this.updateStats();
    }
    
    addTestOrder() {
        const testCustomers = [
            "Jan Kowalski", "Anna Nowak", "Piotr Wiśniewski", "Katarzyna Wójcik",
            "Tomasz Kowalczyk", "Agnieszka Kaczmarek", "Michał Zieliński", "Magdalena Szymański"
        ];
        
        const testItems = [
            ["Pizza Pepperoni", "Coca Cola"],
            ["Spaghetti Carbonara", "Woda gazowana"],
            ["Kurczak w sosie czosnkowym", "Frytki", "Pepsi"],
            ["Ryba z grilla", "Sałatka mieszana"],
            ["Kotlet schabowy", "Ziemniaki", "Surówka"],
            ["Pierogi ruskie", "Śmietana"],
            ["Rosół z makaronem", "Chleb"]
        ];
        
        const randomCustomer = testCustomers[Math.floor(Math.random() * testCustomers.length)];
        const randomItems = testItems[Math.floor(Math.random() * testItems.length)];
        const randomAmount = (Math.random() * 50 + 15).toFixed(2) + " zł";
        
        const newOrder = {
            id: `Z${String(Date.now()).slice(-3)}`,
            customerName: randomCustomer,
            items: randomItems,
            timeReceived: new Date(),
            status: "new",
            totalAmount: randomAmount
        };
        
        this.orders.unshift(newOrder);
        this.renderOrders();
        this.updateStats();
        
        // Show notification
        this.showNotification(`Nowe zamówienie: ${newOrder.id} - ${newOrder.customerName}`);
    }
    
    updateOrderStatuses() {
        const now = new Date();
        let overdueOrdersExist = false;
        
        this.orders.forEach(order => {
            const elapsedMinutes = (now - order.timeReceived) / (1000 * 60);
            
            if (elapsedMinutes >= this.settings.alertThresholdMinutes) {
                order.status = "overdue";
                overdueOrdersExist = true;
            } else if (order.status === "overdue" && elapsedMinutes < this.settings.alertThresholdMinutes) {
                order.status = "in_progress";
            }
        });
        
        // Handle alert system based on current overdue orders
        this.handleAlertSystem(overdueOrdersExist);
    }
    
    handleAlertSystem(shouldShowAlert) {
        if (shouldShowAlert && !this.alertActive) {
            this.startAlert();
        } else if (!shouldShowAlert && this.alertActive) {
            this.stopAlert();
        }
    }
    
    startAlert() {
        this.alertActive = true;
        const overlay = document.getElementById('alertOverlay');
        
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('blinking');
        }
        
        console.log('Alert system activated - orders overdue!');
    }
    
    stopAlert() {
        this.alertActive = false;
        const overlay = document.getElementById('alertOverlay');
        
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('blinking');
        }
        
        console.log('Alert system deactivated - no overdue orders');
    }
    
    startTimeUpdates() {
        // Update every 30 seconds
        this.timeUpdateInterval = setInterval(() => {
            this.updateCurrentTime();
            this.updateOrderStatuses();
            this.renderOrders();
            this.updateStats();
        }, 30000);
        
        // Update current time every second
        setInterval(() => {
            this.updateCurrentTime();
        }, 1000);
    }
    
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pl-PL', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('pl-PL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const timeElement = document.getElementById('currentTime');
        const dateElement = document.getElementById('currentDate');
        
        if (timeElement) timeElement.textContent = timeString;
        if (dateElement) dateElement.textContent = dateString;
    }
    
    renderOrders() {
        const container = document.getElementById('ordersQueue');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;
        
        if (this.orders.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }
        
        if (emptyState) emptyState.classList.add('hidden');
        
        // Sort orders by time received (oldest first)
        const sortedOrders = [...this.orders].sort((a, b) => a.timeReceived - b.timeReceived);
        
        container.innerHTML = sortedOrders.map(order => this.createOrderElement(order)).join('');
        
        // Add click events to order items
        container.querySelectorAll('.order-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const orderId = item.dataset.orderId;
                if (orderId) {
                    this.showOrderDetails(orderId);
                }
            });
        });
    }
    
    createOrderElement(order) {
        const now = new Date();
        const elapsedMs = now - order.timeReceived;
        const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
        const elapsedSeconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);
        
        const elapsedTime = elapsedMinutes > 0 
            ? `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')}` 
            : `0:${elapsedSeconds.toString().padStart(2, '0')}`;
        
        const receivedTime = order.timeReceived.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const itemsText = order.items.join(', ');
        
        return `
            <div class="order-item order-item--${order.status}" data-order-id="${order.id}">
                <div class="order-status order-status--${order.status}"></div>
                <div class="order-details">
                    <div class="order-header">
                        <span class="order-id">${order.id}</span>
                        <span class="customer-name">${order.customerName}</span>
                    </div>
                    <div class="order-items">${itemsText}</div>
                    <div class="order-amount">${order.totalAmount}</div>
                </div>
                <div class="order-time">
                    <div class="elapsed-time">${elapsedTime}</div>
                    <div class="received-time">${receivedTime}</div>
                </div>
            </div>
        `;
    }
    
    showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        this.selectedOrderId = orderId;
        
        const modal = document.getElementById('orderModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalTitle || !modalBody) return;
        
        modalTitle.textContent = `Szczegóły zamówienia ${order.id}`;
        
        const now = new Date();
        const elapsedMs = now - order.timeReceived;
        const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
        const elapsedSeconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);
        const elapsedTime = `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')}`;
        
        const statusLabels = {
            'new': 'Nowe',
            'in_progress': 'W realizacji',
            'overdue': 'Przeterminowane'
        };
        
        modalBody.innerHTML = `
            <div class="order-detail-row">
                <span class="order-detail-label">Numer zamówienia:</span>
                <span class="order-detail-value">${order.id}</span>
            </div>
            <div class="order-detail-row">
                <span class="order-detail-label">Klient:</span>
                <span class="order-detail-value">${order.customerName}</span>
            </div>
            <div class="order-detail-row">
                <span class="order-detail-label">Status:</span>
                <span class="order-detail-value status status--${order.status}">${statusLabels[order.status]}</span>
            </div>
            <div class="order-detail-row">
                <span class="order-detail-label">Czas oczekiwania:</span>
                <span class="order-detail-value">${elapsedTime}</span>
            </div>
            <div class="order-detail-row">
                <span class="order-detail-label">Czas przyjęcia:</span>
                <span class="order-detail-value">${order.timeReceived.toLocaleString('pl-PL')}</span>
            </div>
            <div class="order-detail-row">
                <span class="order-detail-label">Kwota:</span>
                <span class="order-detail-value">${order.totalAmount}</span>
            </div>
            <div class="order-detail-row">
                <span class="order-detail-label">Pozycje:</span>
                <div class="order-detail-value">
                    <ul class="order-items-list">
                        ${order.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        const modal = document.getElementById('orderModal');
        if (!modal) return;
        
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        this.selectedOrderId = null;
    }
    
    completeOrderFromModal() {
        if (!this.selectedOrderId) return;
        
        const orderId = this.selectedOrderId;
        
        // Complete the order
        this.completeOrder(orderId);
        
        // Close modal
        this.closeModal();
    }
    
    completeOrder(orderId) {
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        const completedOrder = this.orders.splice(orderIndex, 1)[0];
        completedOrder.completedAt = new Date();
        this.completedOrders.push(completedOrder);
        
        // Force immediate update of all systems
        this.renderOrders();
        this.updateStats();
        this.updateOrderStatuses();
        
        this.showNotification(`Zamówienie ${orderId} zostało zrealizowane`);
        
        // Log for debugging
        console.log(`Order ${orderId} completed. Remaining orders:`, this.orders.length);
        console.log('Overdue orders:', this.orders.filter(o => o.status === 'overdue').length);
    }
    
    clearCompletedOrders() {
        this.completedOrders = [];
        this.updateStats();
        this.showNotification('Wyczyszczono listę zrealizowanych zamówień');
    }
    
    updateStats() {
        const totalOrders = this.orders.length;
        const overdueOrders = this.orders.filter(o => o.status === 'overdue').length;
        const completedToday = this.completedOrders.filter(o => {
            const today = new Date();
            const completedDate = o.completedAt;
            return completedDate && 
                   completedDate.toDateString() === today.toDateString();
        }).length;
        
        const totalElement = document.getElementById('totalOrders');
        const overdueElement = document.getElementById('overdueOrders');
        const completedElement = document.getElementById('completedToday');
        
        if (totalElement) totalElement.textContent = totalOrders;
        if (overdueElement) overdueElement.textContent = overdueOrders;
        if (completedElement) completedElement.textContent = completedToday;
    }
    
    showNotification(message) {
        // Remove any existing notifications first
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-success);
            color: var(--color-btn-primary-text);
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
            font-size: 14px;
            max-width: 300px;
        `;
        
        // Add animation styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Cleanup method
    destroy() {
        if (this.timeUpdateInterval) {
            clearInterval(this.timeUpdateInterval);
        }
        if (this.alertInterval) {
            clearInterval(this.alertInterval);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.orderSystem = new OrderManagementSystem();
        console.log('Order Management System initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Order Management System:', error);
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.orderSystem) {
        window.orderSystem.destroy();
    }
});
