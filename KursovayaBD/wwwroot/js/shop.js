
const API_URL = 'https://localhost:7071/api/Shop';


document.addEventListener('DOMContentLoaded', function () {
    loadShops();
    setupEventListeners();
});


async function loadShops() {
    const table = document.getElementById('shopsTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const shops = await response.json();

        if (shops.length === 0) {
            empty.style.display = 'block';
            table.style.display = 'none';
        } else {
            empty.style.display = 'none';
            table.style.display = '';
            renderShops(shops);
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

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const shops = await response.json();

        const filtered = shops.filter(shop =>
            shop.shopName?.toLowerCase().includes(searchTerm) ||
            shop.shopType?.toLowerCase().includes(searchTerm) ||
            shop.geoposition?.toLowerCase().includes(searchTerm)
        );

        if (filtered.length === 0) {
            document.getElementById('empty').style.display = 'block';
            table.style.display = 'none';
        } else {
            document.getElementById('empty').style.display = 'none';
            table.style.display = '';
            renderShops(filtered);
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

    if (shopId) {
        title.textContent = 'Редактировать магазин';
        loadShopForEdit(shopId);
    } else {
        title.textContent = 'Добавить магазин';
        form.reset();
        document.getElementById('shopId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}


async function loadShopForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
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

    const shopId = document.getElementById('shopId').value;
    const shop = {
        id: shopId ? parseInt(shopId) : 0,
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

    if (shop.fund < 0) {
        showError('Фонд не может быть отрицательным');
        return;
    }

    const method = shopId ? 'PUT' : 'POST';
    const url = shopId ? `${API_URL}/${shopId}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(shop)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Ошибка ${response.status}`);
        }

        closeModal();
        loadShops();
        showSuccess(shopId ? 'Магазин обновлен' : 'Магазин добавлен');

    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
    }
}


async function deleteShop(id) {
    if (!confirm('Удалить этот магазин?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
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
}