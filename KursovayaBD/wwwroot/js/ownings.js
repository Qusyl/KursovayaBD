
const API_URL = 'https://localhost:7071/api/Ownings';


document.addEventListener('DOMContentLoaded', function () {
    loadOwnings();
    setupEventListeners();
});


async function loadOwnings() {
    const table = document.getElementById('owningsTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const ownings = await response.json();

        if (ownings.length === 0) {
            empty.style.display = 'block';
            table.style.display = 'none';
        } else {
            empty.style.display = 'none';
            table.style.display = '';
            renderOwnings(ownings);
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

        const response = await fetch(`${API_URL}/search?holding=${holding}`);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const ownings = await response.json();

        if (ownings.length === 0) {
            document.getElementById('empty').style.display = 'block';
            table.style.display = 'none';
        } else {
            document.getElementById('empty').style.display = 'none';
            table.style.display = '';
            renderOwnings(ownings);
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

    if (owningId) {
        title.textContent = 'Редактировать владение';
        loadOwningForEdit(owningId);
    } else {
        title.textContent = 'Добавить владение';
        form.reset();
        document.getElementById('owningsId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

async function loadOwningForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Владение не найдено');

        const owning = await response.json();

        document.getElementById('owningsId').value = owning.idOwnings;
        document.getElementById('shop').value = owning.shop || '';
        document.getElementById('owner').value = owning.owner || '';
        document.getElementById('holding').value = owning.holding || 0;

    } catch (error) {
        showError('Не удалось загрузить владение: ' + error.message);
        closeModal();
    }
}

async function saveOwnings(event) {
    event.preventDefault();

    const owningId = document.getElementById('owningsId').value;
    const owning = {
        idOwnings: owningId ? parseInt(owningId) : 0,
        shop: parseInt(document.getElementById('shop').value),
        owner: parseInt(document.getElementById('owner').value),
        holding: parseFloat(document.getElementById('holding').value)
    };


    if (owning.shop < 1 || owning.owner < 1) {
        showError('ID магазина и владельца должны быть положительными числами');
        return;
    }

    if (owning.holding < 0 || owning.holding > 1) {
        showError('Доля владения должна быть в диапазоне от 0 до 1');
        return;
    }

    const method = owningId ? 'PUT' : 'POST';
    const url = owningId ? `${API_URL}/${owningId}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(owning)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Ошибка ${response.status}`);
        }

        closeModal();
        loadOwnings();
        showSuccess(owningId ? 'Владение обновлено' : 'Владение добавлено');

    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
    }
}

async function deleteOwning(id) {
    if (!confirm('Удалить это владение?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
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


    document.getElementById('holding').addEventListener('input', function (e) {
        let value = parseFloat(this.value);
        if (value < 0) this.value = 0;
        if (value > 1) this.value = 1;
    });

    document.getElementById('searchHolding').addEventListener('input', function (e) {
        let value = parseFloat(this.value);
        if (value < 0) this.value = 0;
    });
}