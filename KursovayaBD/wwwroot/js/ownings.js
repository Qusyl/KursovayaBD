const API_URL = 'https://localhost:7071/api/Ownings';


let currentOwnings = [];
let sortColumn = 'idOwnings';
let sortDirection = 'asc'; 

document.addEventListener('DOMContentLoaded', function () {
    loadOwnings();
    setupEventListeners();
});

function getAuthHeader() {
    const token = localStorage.getItem('token');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}

async function loadOwnings() {
    const table = document.getElementById('owningsTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(API_URL, {
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const ownings = await response.json();
        currentOwnings = ownings; 

        if (ownings.length === 0) {
            empty.style.display = 'block';
            table.style.display = 'none';
        } else {
            empty.style.display = 'none';
            table.style.display = '';
            sortOwnings(); 
        }

    } catch (error) {
        showError('Не удалось загрузить владения: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function renderOwnings(ownings) {
    const table = document.getElementById('owningsTable');
    table.innerHTML = '';

    ownings.forEach(owning => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${owning.idOwnings}</td>
            <td>${owning.shop}</td>
            <td>${owning.owner}</td>
            <td class="holding-percent">${formatHolding(owning.holding)}</td>
            <td>
                <div class="actions">
                    <button class="btn-action btn-edit" onclick="editOwning(${owning.idOwnings})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteOwning(${owning.idOwnings})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        table.appendChild(row);
    });
}


function sortOwnings() {
    if (!currentOwnings || currentOwnings.length === 0) return;

    const sortedOwnings = [...currentOwnings].sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

     
        if (sortColumn === 'holding') {
            aValue = a.holding || 0;
            bValue = b.holding || 0;
        }
     
        else if (sortColumn === 'shop') {
            aValue = a.shop || 0;
            bValue = b.shop || 0;
        }
       
        else if (sortColumn === 'owner') {
            aValue = a.owner || 0;
            bValue = b.owner || 0;
        }
        
        else if (sortColumn === 'idOwnings') {
            aValue = a.idOwnings || 0;
            bValue = b.idOwnings || 0;
        }

        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    renderOwnings(sortedOwnings);
    updateSortIndicators();
}


function changeSort(column) {
    if (sortColumn === column) {
        
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      
        sortColumn = column;
        sortDirection = 'asc';
    }

    sortOwnings();
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

async function searchOwnings() {
    const holdingInput = document.getElementById('searchHolding');
    const holding = holdingInput.value;

    if (!holding || holding === '') {
        loadOwnings();
        return;
    }

    const table = document.getElementById('owningsTable');
    const loading = document.getElementById('loading');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(`${API_URL}/search?holding=${holding}`, {
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const ownings = await response.json();
        currentOwnings = ownings; 

        if (ownings.length === 0) {
            document.getElementById('empty').style.display = 'block';
            table.style.display = 'none';
        } else {
            document.getElementById('empty').style.display = 'none';
            table.style.display = '';
            sortOwnings(); 
        }

    } catch (error) {
        showError('Ошибка поиска: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function clearSearch() {
    document.getElementById('searchHolding').value = '';
    loadOwnings();
}

function openModal(owningId = null) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('owningsForm');

    form.reset();

    if (owningId) {
        title.textContent = 'Редактировать владение';
        loadOwningForEdit(owningId);
    } else {
        title.textContent = 'Добавить владение';

        document.getElementById('holding').value = 0.5;
        document.getElementById('owningsId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

async function loadOwningForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
        });
        if (!response.ok) throw new Error('Владение не найдено');

        const owning = await response.json();

        document.getElementById('owningsId').value = owning.idOwnings;
        document.getElementById('shop').value = owning.shop || '';
        document.getElementById('owner').value = owning.owner || '';
        document.getElementById('holding').value = owning.holding || 0.5;

    } catch (error) {
        showError('Не удалось загрузить владение: ' + error.message);
        closeModal();
    }
}

async function saveOwnings(event) {
    event.preventDefault();

    const owningIdInput = document.getElementById('owningsId').value;

    if (!owningIdInput || parseInt(owningIdInput) <= 0) {
        showError('Введите корректный ID владения (должен быть больше 0)');
        return;
    }

    const owningId = parseInt(owningIdInput);
    const shopId = document.getElementById('shop').value;
    const ownerId = document.getElementById('owner').value;
    const holding = document.getElementById('holding').value;

    if (!shopId || parseInt(shopId) < 1) {
        showError('Введите корректный ID магазина');
        return;
    }

    if (!ownerId || parseInt(ownerId) < 1) {
        showError('Введите корректный ID владельца');
        return;
    }

    if (!holding || parseFloat(holding) < 0 || parseFloat(holding) > 1) {
        showError('Доля владения должна быть в диапазоне от 0 до 1');
        return;
    }

    const owning = {
        idOwnings: owningId,
        shop: parseInt(shopId),
        owner: parseInt(ownerId),
        holding: parseFloat(holding)
    };

    try {
        let response = await fetch(`${API_URL}/${owningId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(owning)
        });

        if (!response.ok) {
            if (response.status === 404) {
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                    body: JSON.stringify(owning)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || `Ошибка ${response.status}`);
                }

                showSuccess('Владение добавлено');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || `Ошибка ${response.status}`);
            }
        } else {
            showSuccess('Владение обновлено');
        }

        closeModal();
        await loadOwnings();

    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
        console.error('Save error:', error);
    }
}

async function deleteOwning(id) {
    if (!confirm('Удалить это владение?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        loadOwnings();
        showSuccess('Владение удалено');

    } catch (error) {
        showError('Не удалось удалить владение: ' + error.message);
    }
}

function editOwning(id) {
    openModal(id);
}

function formatHolding(holding) {
    return `${(holding * 100).toFixed(1)}%`;
}

function showSuccess(message) {
    alert('✓ ' + message);
}

function showError(message) {
    alert('✗ ' + message);
}

function setupEventListeners() {
    const searchHoldingInput = document.getElementById('searchHolding');
    if (searchHoldingInput) {
        searchHoldingInput.addEventListener('input', searchOwnings);
    }

    const btnClear = document.querySelector('.btn-clear-search');
    if (btnClear) {
        btnClear.addEventListener('click', clearSearch);
    }

    const btnAdd = document.querySelector('.btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => openModal());
    }

    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this || e.target.classList.contains('close')) {
                closeModal();
            }
        });
    }

    const owningsForm = document.getElementById('owningsForm');
    if (owningsForm) {
        owningsForm.addEventListener('submit', saveOwnings);
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    const holdingInput = document.getElementById('holding');
    if (holdingInput) {
        holdingInput.addEventListener('input', function (e) {
            let value = parseFloat(this.value);
            if (value < 0) this.value = 0;
            if (value > 1) this.value = 1;
            if (isNaN(value)) this.value = 0;
        });
    }

    const searchInput = document.getElementById('searchHolding');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            let value = parseFloat(this.value);
            if (value < 0) this.value = 0;
            if (value > 1) this.value = 1;
            if (isNaN(value)) this.value = '';
        });
    }
}