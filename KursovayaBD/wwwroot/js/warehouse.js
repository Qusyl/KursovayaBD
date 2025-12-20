const API_URL = 'https://localhost:7071/api/Warehouse';

document.addEventListener('DOMContentLoaded', function () {
    loadWarehouse();
    setupEventListeners();
});

async function loadWarehouse() {
    const table = document.getElementById('warehouseTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const warehouse = await response.json();

        if (warehouse.length === 0) {
            empty.style.display = 'block';
            table.style.display = 'none';
        } else {
            empty.style.display = 'none';
            table.style.display = '';
            renderWarehouse(warehouse);
        }

    } catch (error) {
        showError('Не удалось загрузить данные склада: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function renderWarehouse(warehouse) {
    const table = document.getElementById('warehouseTable');
    if (!table) return;

    table.innerHTML = '';

    warehouse.forEach(item => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.shop}</td>
            <td>${item.product}</td>
            <td>${item.productName || ''}</td>
            <td>${item.inStock}</td>
            <td><span class="stock-status ${getStockStatusClass(item.inStock)}">${getStockStatus(item.inStock)}</span></td>
            <td>
                <div class="actions">
                    <button class="btn-action btn-edit" onclick="editWarehouse(${item.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteWarehouse(${item.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        table.appendChild(row);
    });
}

function getStockStatus(quantity) {
    if (quantity === 0) return 'Нет в наличии';
    if (quantity < 10) return 'Мало';
    if (quantity < 50) return 'Достаточно';
    return 'Много';
}

function getStockStatusClass(quantity) {
    if (quantity === 0) return 'stock-high';
    if (quantity < 10) return 'stock-low';
    if (quantity < 50) return 'stock-normal';
    return 'stock-high';
}

async function searchWarehouse() {
    const searchTerm = document.getElementById('searchProduct').value.trim();

    if (!searchTerm) {
        loadWarehouse();
        return;
    }

    const table = document.getElementById('warehouseTable');
    const loading = document.getElementById('loading');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(`${API_URL}/search?name=${encodeURIComponent(searchTerm)}`);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const warehouse = await response.json();

        if (warehouse.length === 0) {
            const empty = document.getElementById('empty');
            if (empty) empty.style.display = 'block';
            table.style.display = 'none';
        } else {
            const empty = document.getElementById('empty');
            if (empty) empty.style.display = 'none';
            table.style.display = '';
            renderWarehouse(warehouse);
        }

    } catch (error) {
        showError('Ошибка поиска: ' + error.message);
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchProduct');
    if (searchInput) searchInput.value = '';
    loadWarehouse();
}

function checkStockLimit() {
    const limitModal = document.getElementById('limitModal');
    if (limitModal) limitModal.style.display = 'block';
}

function closeLimitModal() {
    const limitModal = document.getElementById('limitModal');
    if (limitModal) limitModal.style.display = 'none';
}

async function getTotalStock() {
    const shopIdCheck = document.getElementById('shopIdCheck');
    if (!shopIdCheck) return;

    const shopId = shopIdCheck.value;

    if (!shopId || shopId < 1) {
        showError('Введите корректный ID магазина');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/total-stock/${shopId}`);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();

        const stockStats = document.getElementById('stockStats');
        const totalStock = document.getElementById('totalStock');
        const stockMessage = document.getElementById('stockMessage');

        if (stockStats) stockStats.style.display = 'block';
        if (totalStock) totalStock.textContent = data.totalProductsInStock || 0;
        if (stockMessage) stockMessage.textContent = data.message || 'Данные не получены';

        closeLimitModal();

    } catch (error) {
        showError('Ошибка проверки лимита: ' + error.message);
    }
}

function openModal(warehouseId = null) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('warehouseForm');

    if (!modal || !form) {
        console.error('Модальное окно или форма не найдены');
        return;
    }

    form.reset();

    if (warehouseId) {
        if (title) title.textContent = 'Редактировать товар на складе';
        loadWarehouseForEdit(warehouseId);
    } else {
        if (title) title.textContent = 'Добавить товар на склад';
        const warehouseIdInput = document.getElementById('warehouseIdInput');
        if (warehouseIdInput) warehouseIdInput.value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none';
}

async function loadWarehouseForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Товар на складе не найден');

        const item = await response.json();

        const warehouseIdInput = document.getElementById('warehouseIdInput');
        const shopInput = document.getElementById('shop');
        const productInput = document.getElementById('product');
        const productNameInput = document.getElementById('productName');
        const inStockInput = document.getElementById('inStock');

        if (warehouseIdInput) warehouseIdInput.value = item.id;
        if (shopInput) shopInput.value = item.shop || '';
        if (productInput) productInput.value = item.product || '';
        if (productNameInput) productNameInput.value = item.productName || '';
        if (inStockInput) inStockInput.value = item.inStock || 0;

    } catch (error) {
        showError('Не удалось загрузить товар: ' + error.message);
        closeModal();
    }
}

async function saveWarehouse(event) {
    event.preventDefault();

    const warehouseIdInput = document.getElementById('warehouseIdInput');
    const shopInput = document.getElementById('shop');
    const productInput = document.getElementById('product');
    const productNameInput = document.getElementById('productName');
    const inStockInput = document.getElementById('inStock');

    if (!warehouseIdInput || !shopInput || !productInput || !productNameInput || !inStockInput) {
        showError('Не все обязательные поля найдены');
        return;
    }

    const warehouseIdValue = warehouseIdInput.value;
    if (!warehouseIdValue || parseInt(warehouseIdValue) <= 0) {
        showError('Введите корректный ID складской записи (должен быть больше 0)');
        return;
    }

    const warehouseId = parseInt(warehouseIdValue);

    const item = {
        id: warehouseId,
        shop: parseInt(shopInput.value),
        product: parseInt(productInput.value),
        productName: productNameInput.value.trim(),
        inStock: parseInt(inStockInput.value)
    };

    if (item.shop < 1 || item.product < 1) {
        showError('ID магазина и товара должны быть положительными числами');
        return;
    }

    if (!item.productName) {
        showError('Название товара обязательно');
        return;
    }

    if (item.inStock < 0 || isNaN(item.inStock)) {
        showError('Количество должно быть положительным числом');
        return;
    }

    try {
      
        let response = await fetch(`${API_URL}/${warehouseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
           
            if (response.status === 404) {
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(item)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || `Ошибка ${response.status}`);
                }

                showSuccess('Товар добавлен на склад');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || `Ошибка ${response.status}`);
            }
        } else {
            showSuccess('Товар обновлен');
        }

        closeModal();
        await loadWarehouse();

    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
        console.error('Save error:', error);
    }
}

async function deleteWarehouse(id) {
    if (!confirm('Удалить этот товар со склада?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        loadWarehouse();
        showSuccess('Товар удален со склада');

    } catch (error) {
        showError('Не удалось удалить товар: ' + error.message);
    }
}

function editWarehouse(id) {
    openModal(id);
}

function showSuccess(message) {
    alert('✓ ' + message);
}

function showError(message) {
    alert('✗ ' + message);
}

function setupEventListeners() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                if (this.id === 'limitModal') {
                    closeLimitModal();
                } else {
                    closeModal();
                }
            }
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
            closeLimitModal();
        }
    });
}