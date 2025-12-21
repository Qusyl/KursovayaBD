const API_URL = 'https://localhost:7071/api/Product';

document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
    setupEventListeners();
});

async function loadProducts() {
    const table = document.getElementById('productsTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');

    try {
        if (loading) loading.style.display = 'block';
        if (table) table.innerHTML = '';

        const response = await fetch(API_URL, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const products = await response.json();

        if (products.length === 0) {
            if (empty) empty.style.display = 'block';
            if (table) table.style.display = 'none';
        } else {
            if (empty) empty.style.display = 'none';
            if (table) {
                table.style.display = '';
                renderProducts(products);
            }
        }

    } catch (error) {
        showError('Не удалось загрузить товары: ' + error.message);
    } finally {
        if (loading) loading.style.display = 'none';
    }
}
function getAuthHeader() {
    const token = localStorage.getItem('token');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}
function renderProducts(products) {
    const table = document.getElementById('productsTable');
    if (!table) return;

    table.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.productName || ''}</td>
            <td>${formatCurrency(product.productPrice)}</td>
            <td>${product.producer || ''}</td>
            <td>${product.category || ''}</td>
            <td>
                <div class="actions">
                    <button class="btn-action btn-edit" onclick="editProduct(${product.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        table.appendChild(row);
    });
}

async function searchProducts() {
    const searchInput = document.getElementById('search');
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase();
    const table = document.getElementById('productsTable');

    try {
        const response = await fetch(API_URL, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }

        const products = await response.json();

        if (searchTerm) {
            const filtered = products.filter(product =>
            (product.productName?.toLowerCase().includes(searchTerm) ||
                product.producer?.toLowerCase().includes(searchTerm) ||
                product.category?.toLowerCase().includes(searchTerm))
            );
            renderProducts(filtered);

            const empty = document.getElementById('empty');
            if (empty) {
                empty.style.display = filtered.length === 0 ? 'block' : 'none';
            }
            if (table) {
                table.style.display = filtered.length === 0 ? 'none' : '';
            }
        } else {
            renderProducts(products);
            const empty = document.getElementById('empty');
            if (empty) empty.style.display = 'none';
            if (table) table.style.display = '';
        }
    } catch (error) {
        showError('Ошибка поиска: ' + error.message);
    }
}

function openModal(productId = null) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');

    if (!modal || !form) {
        console.error('Модальное окно или форма не найдены');
        showError('Модальное окно не найдено');
        return;
    }

   
    form.reset();

    if (productId) {
        if (title) title.textContent = 'Редактировать товар';
        loadProductForEdit(productId);
    } else {
        if (title) title.textContent = 'Добавить товар';
        
        const productIdInput = document.getElementById('productIdInput');
        if (productIdInput) productIdInput.value = '';
    }

    modal.style.display = 'block';
    console.log('Modal opened'); 
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
        console.log('Modal closed'); 
    }
}

async function loadProductForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });
        if (!response.ok) throw new Error('Товар не найден');

        const product = await response.json();

        const productIdInput = document.getElementById('productIdInput');
        const productNameInput = document.getElementById('productName');
        const productPriceInput = document.getElementById('productPrice');
        const producerInput = document.getElementById('producer');
        const categoryInput = document.getElementById('category');

        if (productIdInput) productIdInput.value = product.id;
        if (productNameInput) productNameInput.value = product.productName || '';
        if (productPriceInput) productPriceInput.value = product.productPrice || 0;
        if (producerInput) producerInput.value = product.producer || '';
        if (categoryInput) categoryInput.value = product.category || '';

    } catch (error) {
        showError('Не удалось загрузить товар: ' + error.message);
        closeModal();
    }
}

async function saveProduct(event) {
    event.preventDefault();

    const productIdInput = document.getElementById('productIdInput');
    const productNameInput = document.getElementById('productName');
    const productPriceInput = document.getElementById('productPrice');
    const producerInput = document.getElementById('producer');
    const categoryInput = document.getElementById('category');

    if (!productIdInput || !productNameInput || !productPriceInput || !producerInput || !categoryInput) {
        showError('Не все обязательные поля найдены');
        return;
    }

    const productIdValue = productIdInput.value;
    if (!productIdValue || parseInt(productIdValue) <= 0) {
        showError('Введите корректный ID товара (должен быть больше 0)');
        return;
    }

    const productId = parseInt(productIdValue);

    const product = {
        id: productId,
        productName: productNameInput.value.trim(),
        productPrice: parseFloat(productPriceInput.value),
        producer: producerInput.value.trim(),
        category: categoryInput.value.trim()
    };

    if (!product.productName) {
        showError('Название товара обязательно');
        return;
    }

    if (product.productPrice < 0 || isNaN(product.productPrice)) {
        showError('Цена должна быть положительным числом');
        return;
    }

    if (!product.producer) {
        showError('Производитель обязателен');
        return;
    }

    if (!product.category) {
        showError('Категория обязательна');
        return;
    }

    try {
     
        let response = await fetch(`${API_URL}/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            
            if (response.status === 404) {
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                    body: JSON.stringify(product)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || `Ошибка ${response.status}`);
                }

                showSuccess('Товар добавлен');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || `Ошибка ${response.status}`);
            }
        } else {
            showSuccess('Товар обновлен');
        }

        closeModal();
        await loadProducts();

    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
        console.error('Save error:', error);
    }
}

async function deleteProduct(id) {
    if (!confirm('Удалить этот товар?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        await loadProducts();
        showSuccess('Товар удален');

    } catch (error) {
        showError('Не удалось удалить товар: ' + error.message);
    }
}

function editProduct(id) {
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

    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', searchProducts);
    }
}