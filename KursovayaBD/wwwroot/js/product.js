
const API_URL = 'https://localhost:7071/api/Product'; 

// Основные функции
document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
    setupEventListeners();
});


async function loadProducts() {
    const table = document.getElementById('productsTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const products = await response.json();

        if (products.length === 0) {
            empty.style.display = 'block';
            table.style.display = 'none';
        } else {
            empty.style.display = 'none';
            table.style.display = '';
            renderProducts(products);
        }

    } catch (error) {
        showError('Не удалось загрузить товары: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}


function renderProducts(products) {
    const table = document.getElementById('productsTable');
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
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const table = document.getElementById('productsTable');

    try {
        const response = await fetch(API_URL);
        const products = await response.json();

        if (searchTerm) {
            const filtered = products.filter(product =>
            (product.productName?.toLowerCase().includes(searchTerm) ||
                product.producer?.toLowerCase().includes(searchTerm) ||
                product.category?.toLowerCase().includes(searchTerm))
            );
            renderProducts(filtered);
        } else {
            renderProducts(products);
        }
    } catch (error) {
        showError('Ошибка поиска: ' + error.message);
    }
}


function openModal(productId = null) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');

    if (productId) {
        title.textContent = 'Редактировать товар';
        loadProductForEdit(productId);
    } else {
        title.textContent = 'Добавить товар';
        form.reset();
        document.getElementById('productId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}


async function loadProductForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Товар не найден');

        const product = await response.json();

        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.productName || '';
        document.getElementById('productPrice').value = product.productPrice || 0;
        document.getElementById('producer').value = product.producer || '';
        document.getElementById('category').value = product.category || '';

    } catch (error) {
        showError('Не удалось загрузить товар: ' + error.message);
        closeModal();
    }
}


async function saveProduct(event) {
    event.preventDefault();

    const productId = document.getElementById('productId').value;
    const product = {
        id: productId ? parseInt(productId) : 0,
        productName: document.getElementById('productName').value,
        productPrice: parseFloat(document.getElementById('productPrice').value),
        producer: document.getElementById('producer').value,
        category: document.getElementById('category').value
    };


    if (!product.productName.trim()) {
        showError('Название товара обязательно');
        return;
    }

    if (product.productPrice < 0) {
        showError('Цена не может быть отрицательной');
        return;
    }

    const method = productId ? 'PUT' : 'POST';
    const url = productId ? `${API_URL}/${productId}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Ошибка ${response.status}`);
        }

        closeModal();
        loadProducts();
        showSuccess(productId ? 'Товар обновлен' : 'Товар добавлен');

    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
    }
}


async function deleteProduct(id) {
    if (!confirm('Удалить этот товар?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        loadProducts();
        showSuccess('Товар удален');

    } catch (error) {
        showError('Не удалось удалить товар: ' + error.message);
    }
}


function editProduct(id) {
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
}