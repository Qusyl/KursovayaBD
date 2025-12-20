
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
            document.getElementById('empty').style.display = 'block';
            table.style.display = 'none';
        } else {
            document.getElementById('empty').style.display = 'none';
            table.style.display = '';
            renderWarehouse(warehouse);
        }

    } catch (error) {
        showError('Ошибка поиска: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}


function clearSearch() {
    document.getElementById('searchProduct').value = '';
    loadWarehouse();
}


function checkStockLimit() {
    document.getElementById('limitModal').style.display = 'block';
}

function closeLimitModal() {
    document.getElementById('limitModal').style.display = 'none';
}

async function getTotalStock() {
    const shopId = document.getElementById('shopIdCheck').value;

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

        
        document.getElementById('stockStats').style.display = 'block';
        document.getElementById('totalStock').textContent = data.totalProductsInStock;
        document.getElementById('stockMessage').textContent = data.message;

        closeLimitModal();

    } catch (error) {
        showError('Ошибка проверки лимита: ' + error.message);
    }
}


function openModal(warehouseId = null) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('warehouseForm');

    if (warehouseId) {
        title.textContent = 'Редактировать товар на складе';
        loadWarehouseForEdit(warehouseId);
    } else {
        title.textContent = 'Добавить товар на склад';
        form.reset();
        document.getElementById('warehouseId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

async function loadWarehouseForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Товар на складе не найден');

        const item = await response.json();

        document.getElementById('warehouseId').value = item.id;
        document.getElementById('shop').value = item.shop || '';
        document.getElementById('product').value = item.product || '';
        document.getElementById('productName').value = item.productName || '';
        document.getElementById('inStock').value = item.inStock || 0;

    } catch (error) {
        showError('Не удалось загрузить товар: ' + error.message);
        closeModal();
    }
}


async function saveWarehouse(event) {
    event.preventDefault();

    const warehouseId = document.getElementById('warehouseId').value;
    const item = {
        id: warehouseId ? parseInt(warehouseId) : 0,
        shop: parseInt(document.getElementById('shop').value),
        product: parseInt(document.getElementById('product').value),
        productName: document.getElementById('productName').value.trim(),
        inStock: parseInt(document.getElementById('inStock').value)
    };

    
    if (item.shop < 1 || item.product < 1) {
        showError('ID магазина и товара должны быть положительными числами');
        return;
    }

    if (!item.productName) {
        showError('Название товара обязательно');
        return;
    }

    if (item.inStock < 0) {
        showError('Количество не может быть отрицательным');
        return;
    }

    const method = warehouseId ? 'PUT' : 'POST';
    const url = warehouseId ? `${API_URL}/${warehouseId}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Ошибка ${response.status}`);
        }

        closeModal();
        loadWarehouse();
        showSuccess(warehouseId ? 'Товар обновлен' : 'Товар добавлен на склад');

    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
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