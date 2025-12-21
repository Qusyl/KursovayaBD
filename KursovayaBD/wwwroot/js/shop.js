const API_URL = 'https://localhost:7071/api/Shop';


let currentShops = [];
let sortColumn = 'id';
let sortDirection = 'asc'; 

document.addEventListener('DOMContentLoaded', function () {
    loadShops();
    setupEventListeners();
});

function getAuthHeader() {
    const token = localStorage.getItem('token');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}

async function loadShops() {
    const table = document.getElementById('shopsTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(API_URL, {
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
        });

        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

        const shops = await response.json();
        currentShops = shops; 

        if (!shops || shops.length === 0) {
            empty.style.display = 'block';
            table.style.display = 'none';
        } else {
            empty.style.display = 'none';
            table.style.display = '';
            sortShops(); 
        }
    } catch (error) {
        showError('Не удалось загрузить магазины: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function renderShops(shops) {
    const table = document.getElementById('shopsTable');
    table.innerHTML = '';

    shops.forEach(shop => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${shop.id}</td>
            <td>${shop.shopName || ''}</td>
            <td>${shop.shopType || ''}</td>
            <td>${shop.geoposition || ''}</td>
            <td>${formatCurrency(shop.fund)}</td>
            <td>
                <div class="actions">
                    <button class="btn-action btn-edit" onclick="editShop(${shop.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteShop(${shop.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        table.appendChild(row);
    });
}


function sortShops() {
    if (!currentShops || currentShops.length === 0) return;

    const sortedShops = [...currentShops].sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

      
        if (sortColumn === 'fund') {
            aValue = a.fund || 0;
            bValue = b.fund || 0;
        }
      
        else if (sortColumn === 'shopName') {
            aValue = (a.shopName || '').toLowerCase();
            bValue = (b.shopName || '').toLowerCase();
        }
        
        else if (sortColumn === 'shopType') {
            aValue = (a.shopType || '').toLowerCase();
            bValue = (b.shopType || '').toLowerCase();
        }
    
        else if (sortColumn === 'geoposition') {
            aValue = (a.geoposition || '').toLowerCase();
            bValue = (b.geoposition || '').toLowerCase();
        }

       
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    renderShops(sortedShops);
    updateSortIndicators();
}

function changeSort(column) {
    if (sortColumn === column) {
       
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        
        sortColumn = column;
        sortDirection = 'asc';
    }

    sortShops();
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

async function searchShops() {
    const searchTerm = document.getElementById('searchShop').value.toLowerCase();
    if (!searchTerm) {
        loadShops();
        return;
    }

    const table = document.getElementById('shopsTable');
    const loading = document.getElementById('loading');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(API_URL, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

        const shops = await response.json();
        const filtered = shops.filter(shop =>
            shop.shopName?.toLowerCase().includes(searchTerm) ||
            shop.shopType?.toLowerCase().includes(searchTerm) ||
            shop.geoposition?.toLowerCase().includes(searchTerm)
        );

        currentShops = filtered; 

        if (filtered.length === 0) {
            document.getElementById('empty').style.display = 'block';
            table.style.display = 'none';
        } else {
            document.getElementById('empty').style.display = 'none';
            table.style.display = '';
            sortShops(); 
        }
    } catch (error) {
        showError('Ошибка поиска: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function clearSearch() {
    document.getElementById('searchShop').value = '';
    loadShops();
}

function openModal(shopId = null) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('shopForm');
    form.reset();

    if (shopId) {
        title.textContent = 'Редактировать магазин';
        loadShopForEdit(shopId);
    } else {
        title.textContent = 'Добавить магазин';
        document.getElementById('fund').value = 0;
        document.getElementById('shopId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

async function loadShopForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        if (!response.ok) throw new Error('Магазин не найден');

        const shop = await response.json();
        document.getElementById('shopId').value = shop.id;
        document.getElementById('shopName').value = shop.shopName || '';
        document.getElementById('shopType').value = shop.shopType || '';
        document.getElementById('geoposition').value = shop.geoposition || '';
        document.getElementById('fund').value = shop.fund || 0;
    } catch (error) {
        showError('Не удалось загрузить магазин: ' + error.message);
        closeModal();
    }
}

async function saveShop(event) {
    event.preventDefault();

    const shopIdInput = document.getElementById('shopId').value;
    if (!shopIdInput || parseInt(shopIdInput) <= 0) {
        showError('Введите корректный ID магазина (должен быть больше 0)');
        return;
    }

    const shopId = parseInt(shopIdInput);
    const shop = {
        id: shopId,
        shopName: document.getElementById('shopName').value.trim(),
        shopType: document.getElementById('shopType').value,
        geoposition: document.getElementById('geoposition').value.trim(),
        fund: parseFloat(document.getElementById('fund').value)
    };

    // Валидация
    if (!shop.shopName) {
        showError('Название магазина обязательно');
        return;
    }
    if (!shop.shopType) {
        showError('Тип магазина обязателен');
        return;
    }
    if (!shop.geoposition) {
        showError('Местоположение обязательно');
        return;
    }
    if (shop.fund < 0 || isNaN(shop.fund)) {
        showError('Фонд должен быть положительным числом');
        return;
    }

    try {
        let response = await fetch(`${API_URL}/${shopId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(shop),
        });

        if (!response.ok) {
            if (response.status === 404) {
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader()
                    },
                    body: JSON.stringify(shop),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || `Ошибка ${response.status}`);
                }
                showSuccess('Магазин добавлен');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || `Ошибка ${response.status}`);
            }
        } else {
            showSuccess('Магазин обновлен');
        }

        closeModal();
        await loadShops();
    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
        console.error('Save error:', error);
    }
}

async function deleteShop(id) {
    if (!confirm('Удалить этот магазин?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        loadShops();
        showSuccess('Магазин удален');
    } catch (error) {
        showError('Не удалось удалить магазин: ' + error.message);
    }
}

function editShop(id) {
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
    const searchInput = document.getElementById('searchShop');
    if (searchInput) searchInput.addEventListener('input', searchShops);

    const btnClear = document.querySelector('.btn-clear-search');
    if (btnClear) btnClear.addEventListener('click', clearSearch);

    const btnAdd = document.querySelector('.btn-add');
    if (btnAdd) btnAdd.addEventListener('click', () => openModal());

    const modal = document.getElementById('modal');
    if (modal) modal.addEventListener('click', function (e) {
        if (e.target === this || e.target.classList.contains('btn-close')) closeModal();
    });

    const shopForm = document.getElementById('shopForm');
    if (shopForm) shopForm.addEventListener('submit', saveShop);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });
}