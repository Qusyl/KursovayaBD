
const API_URL = 'https://localhost:7071/api/Sales';


document.addEventListener('DOMContentLoaded', function () {
    loadSales();
    loadBestProfitCount();
    setupEventListeners();
});


async function loadSales() {
    const table = document.getElementById('salesTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const sales = await response.json();

        if (sales.length === 0) {
            empty.style.display = 'block';
            table.style.display = 'none';
        } else {
            empty.style.display = 'none';
            table.style.display = '';
            renderSales(sales);
        }

    } catch (error) {
        showError('Не удалось загрузить продажи: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function renderSales(sales) {
    const table = document.getElementById('salesTable');
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


async function loadBestProfitCount() {
    try {
        const response = await fetch(`${API_URL}/best-profit-products-count`);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById('bestProfitCount').textContent = data.count;

    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}


async function searchSales() {
    const profitInput = document.getElementById('searchProfit');
    const profit = profitInput.value;

    if (!profit || profit === '') {
        loadSales();
        return;
    }

    const table = document.getElementById('salesTable');
    const loading = document.getElementById('loading');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(`${API_URL}/search?profit=${profit}`);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const sales = await response.json();
        renderSales(sales);

    } catch (error) {
        showError('Ошибка поиска: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}


function clearSearch() {
    document.getElementById('searchProfit').value = '';
    loadSales();
}


function openModal(saleId = null) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('saleForm');

    if (saleId) {
        title.textContent = 'Редактировать продажу';
        loadSaleForEdit(saleId);
    } else {
        title.textContent = 'Добавить продажу';
        form.reset();
        document.getElementById('saleId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}


async function loadSaleForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Продажа не найдена');

        const sale = await response.json();

        document.getElementById('saleId').value = sale.id;
        document.getElementById('product').value = sale.product;
        document.getElementById('shop').value = sale.shop;
        document.getElementById('profit').value = sale.profit;

    } catch (error) {
        showError('Не удалось загрузить продажу: ' + error.message);
        closeModal();
    }
}


async function saveSale(event) {
    event.preventDefault();

    const saleId = document.getElementById('saleId').value;
    const sale = {
        id: saleId ? parseInt(saleId) : 0,
        product: parseInt(document.getElementById('product').value),
        shop: parseInt(document.getElementById('shop').value),
        profit: parseFloat(document.getElementById('profit').value)
    };

 
    if (sale.product < 1 || sale.shop < 1) {
        showError('ID товара и магазина должны быть положительными числами');
        return;
    }

    if (sale.profit < 0) {
        showError('Прибыль не может быть отрицательной');
        return;
    }

    const method = saleId ? 'PUT' : 'POST';
    const url = saleId ? `${API_URL}/${saleId}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sale)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Ошибка ${response.status}`);
        }

        closeModal();
        loadSales();
        loadBestProfitCount();
        showSuccess(saleId ? 'Продажа обновлена' : 'Продажа добавлена');

    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
    }
}


async function deleteSale(id) {
    if (!confirm('Удалить эту продажу?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        loadSales();
        loadBestProfitCount();
        showSuccess('Продажа удалена');

    } catch (error) {
        showError('Не удалось удалить продажу: ' + error.message);
    }
}


function editSale(id) {
    openModal(id);
}

function formatCurrency(amount) {
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
    
    document.getElementById('modal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

   
    document.getElementById('profit').addEventListener('input', function (e) {
        if (this.value < 0) this.value = 0;
    });

    
    document.getElementById('searchProfit').addEventListener('input', function (e) {
        if (this.value < 0) this.value = 0;
    });
}