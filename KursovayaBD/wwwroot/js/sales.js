const API_URL = 'https://localhost:7071/api/Sales';


let currentSales = [];
let sortColumn = 'id';
let sortDirection = 'asc'; 

document.addEventListener('DOMContentLoaded', function () {
    loadSales();
    loadBestProfitCount();
    setupEventListeners();
});

function getAuthHeader() {
    const token = localStorage.getItem('token');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}

async function loadSales() {
    const table = document.getElementById('salesTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');

    try {
        if (loading) loading.style.display = 'block';
        if (table) table.innerHTML = '';

        const response = await fetch(API_URL, {
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const sales = await response.json();
        currentSales = sales; 

        if (sales.length === 0) {
            if (empty) empty.style.display = 'block';
            if (table) table.style.display = 'none';
        } else {
            if (empty) empty.style.display = 'none';
            if (table) {
                table.style.display = '';
                sortSales(); 
            }
        }

    } catch (error) {
        showError('Не удалось загрузить продажи: ' + error.message);
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function renderSales(sales) {
    const table = document.getElementById('salesTable');
    if (!table) return;

    table.innerHTML = '';

    sales.forEach(sale => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${sale.id}</td>
            <td>${sale.product}</td>
            <td>${sale.shop}</td>
            <td>${formatCurrency(sale.profit)}</td>
            <td>
                <div class="actions">
                    <button class="btn-action btn-edit" onclick="editSale(${sale.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteSale(${sale.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        table.appendChild(row);
    });
}


function sortSales() {
    if (!currentSales || currentSales.length === 0) return;

    const sortedSales = [...currentSales].sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        if (sortColumn === 'profit') {
            aValue = a.profit || 0;
            bValue = b.profit || 0;
        }
    
        else if (sortColumn === 'product') {
            aValue = a.product || 0;
            bValue = b.product || 0;
        }
       
        else if (sortColumn === 'shop') {
            aValue = a.shop || 0;
            bValue = b.shop || 0;
        }
        
        else if (sortColumn === 'id') {
            aValue = a.id || 0;
            bValue = b.id || 0;
        }

     
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    renderSales(sortedSales);
    updateSortIndicators();
}


function changeSort(column) {
    if (sortColumn === column) {
        
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        
        sortColumn = column;
        sortDirection = 'asc';
    }

    sortSales();
}


function updateSortIndicators() {
    const headers = document.querySelectorAll('th[data-sortable]');
    headers.forEach(header => {
        const icon = header.querySelector('.sort-icon');
        if (header.dataset.column === sortColumn) {
            icon.className = `sort-icon fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;
            icon.style.opacity = '1';
        } else {
            icon.className = 'sort-icon fas fa-sort';
            icon.style.opacity = '0.3';
        }
    });
}

async function loadBestProfitCount() {
    try {
        const response = await fetch(`${API_URL}/best-profit-products-count`, {
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        const bestProfitCount = document.getElementById('bestProfitCount');
        if (bestProfitCount) {
            bestProfitCount.textContent = data.count || 0;
        }

    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

async function searchSales() {
    const profitInput = document.getElementById('searchProfit');
    if (!profitInput) return;

    const profit = profitInput.value;

    if (!profit || profit === '') {
        loadSales();
        return;
    }

    const table = document.getElementById('salesTable');
    const loading = document.getElementById('loading');

    try {
        if (loading) loading.style.display = 'block';
        if (table) table.innerHTML = '';

        const response = await fetch(`${API_URL}/search?profit=${profit}`, {
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const sales = await response.json();
        currentSales = sales; // Сохраняем отфильтрованные данные

        if (sales.length === 0) {
            const empty = document.getElementById('empty');
            if (empty) empty.style.display = 'block';
            if (table) table.style.display = 'none';
        } else {
            const empty = document.getElementById('empty');
            if (empty) empty.style.display = 'none';
            if (table) {
                table.style.display = '';
                sortSales(); // Сортируем отфильтрованные данные
            }
        }

    } catch (error) {
        showError('Ошибка поиска: ' + error.message);
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchProfit');
    if (searchInput) searchInput.value = '';
    loadSales();
}

function openModal(saleId = null) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('saleForm');

    if (!modal || !form) {
        console.error('Модальное окно или форма не найдены');
        return;
    }

    form.reset();

    if (saleId) {
        if (title) title.textContent = 'Редактировать продажу';
        loadSaleForEdit(saleId);
    } else {
        if (title) title.textContent = 'Добавить продажу';
        const saleIdInput = document.getElementById('saleIdInput');
        if (saleIdInput) saleIdInput.value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none';
}

async function loadSaleForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
        });
        if (!response.ok) throw new Error('Продажа не найдена');

        const sale = await response.json();

        const saleIdInput = document.getElementById('saleIdInput');
        const productInput = document.getElementById('product');
        const shopInput = document.getElementById('shop');
        const profitInput = document.getElementById('profit');

        if (saleIdInput) saleIdInput.value = sale.id;
        if (productInput) productInput.value = sale.product || '';
        if (shopInput) shopInput.value = sale.shop || '';
        if (profitInput) profitInput.value = sale.profit || 0;

    } catch (error) {
        showError('Не удалось загрузить продажу: ' + error.message);
        closeModal();
    }
}

async function saveSale(event) {
    event.preventDefault();

    const saleIdInput = document.getElementById('saleIdInput');
    const productInput = document.getElementById('product');
    const shopInput = document.getElementById('shop');
    const profitInput = document.getElementById('profit');

    if (!saleIdInput || !productInput || !shopInput || !profitInput) {
        showError('Не все обязательные поля найдены');
        return;
    }

    const saleIdValue = saleIdInput.value;
    if (!saleIdValue || parseInt(saleIdValue) <= 0) {
        showError('Введите корректный ID продажи (должен быть больше 0)');
        return;
    }

    const saleId = parseInt(saleIdValue);

    const sale = {
        id: saleId,
        product: parseInt(productInput.value),
        shop: parseInt(shopInput.value),
        profit: parseFloat(profitInput.value)
    };

    if (sale.product < 1 || sale.shop < 1) {
        showError('ID товара и магазина должны быть положительными числами');
        return;
    }

    if (sale.profit < 0 || isNaN(sale.profit)) {
        showError('Прибыль должна быть положительным числом');
        return;
    }

    try {
        let response = await fetch(`${API_URL}/${saleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(sale)
        });

        if (!response.ok) {
            if (response.status === 404) {
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                    body: JSON.stringify(sale)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || `Ошибка ${response.status}`);
                }

                showSuccess('Продажа добавлена');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || `Ошибка ${response.status}`);
            }
        } else {
            showSuccess('Продажа обновлена');
        }

        closeModal();
        await loadSales();
        await loadBestProfitCount();

    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
        console.error('Save error:', error);
    }
}

async function deleteSale(id) {
    if (!confirm('Удалить эту продажу?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        await loadSales();
        await loadBestProfitCount();
        showSuccess('Продажа удалена');

    } catch (error) {
        showError('Не удалось удалить продажу: ' + error.message);
    }
}

function editSale(id) {
    openModal(id);
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2
    }).format(amount);
}

function showSuccess(message) {
    alert('✓ ' + message);
}

function showError(message) {
    alert('✗ ' + message);
}

function setupEventListeners() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    const profitInput = document.getElementById('profit');
    if (profitInput) {
        profitInput.addEventListener('input', function (e) {
            let value = parseFloat(this.value);
            if (value < 0) this.value = 0;
            if (isNaN(value)) this.value = '';
        });
    }

    const searchProfitInput = document.getElementById('searchProfit');
    if (searchProfitInput) {
        searchProfitInput.addEventListener('input', function (e) {
            let value = parseFloat(this.value);
            if (value < 0) this.value = 0;
            if (isNaN(value)) this.value = '';
        });
    }
}