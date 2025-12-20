
const API_URL = 'https://localhost:7071/api/Owner'; 


let currentSearchType = 'name';


document.addEventListener('DOMContentLoaded', function () {
    loadOwners();
    setupEventListeners();
});


async function loadOwners() {
    const table = document.getElementById('ownersTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const owners = await response.json();

        if (owners.length === 0) {
            empty.style.display = 'block';
            table.style.display = 'none';
        } else {
            empty.style.display = 'none';
            table.style.display = '';
            renderOwners(owners);
        }

    } catch (error) {
        showError('Не удалось загрузить владельцев: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}


function renderOwners(owners) {
    const table = document.getElementById('ownersTable');
    table.innerHTML = '';

    owners.forEach(owner => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${owner.id}</td>
            <td>${owner.name || ''}</td>
            <td>${owner.surname || ''}</td>
            <td>${owner.lastname || ''}</td>
            <td>${owner.address || ''}</td>
            <td>${formatPhone(owner.phone)}</td>
            <td>
                <div class="actions">
                    <button class="btn-action btn-edit" onclick="editOwner(${owner.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteOwner(${owner.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        table.appendChild(row);
    });
}


async function showOwnersWithNonProfitShops() {
    try {
        const response = await fetch(`${API_URL}/non-profit-shops`);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();

      
        document.getElementById('profitStats').style.display = 'block';
        document.getElementById('profitableOwnersCount').textContent = data.count || 0;

        if (data.owners && data.owners.length > 0) {
            renderProfitableOwners(data.owners);
        } else {
            showInfo('Владельцы с прибыльными магазинами не найдены');
        }

    } catch (error) {
        showError('Ошибка загрузки статистики: ' + error.message);
    }
}


function renderProfitableOwners(owners) {
    const table = document.getElementById('ownersTable');
    table.innerHTML = '';

    owners.forEach(owner => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${owner.id}</td>
            <td>${owner.name || ''}</td>
            <td>${owner.surname || ''}</td>
            <td>${owner.lastname || ''}</td>
            <td>${owner.address || ''}</td>
            <td>${formatPhone(owner.phone)}</td>
            <td>
                <span class="profit-badge">≥ 2.5 млн</span>
            </td>
        `;

        table.appendChild(row);
    });
}


async function searchOwners() {
    const searchTerm = document.getElementById('searchInput').value.trim();

    if (!searchTerm) {
        loadOwners();
        return;
    }

    const table = document.getElementById('ownersTable');
    const loading = document.getElementById('loading');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        let searchUrl;
        switch (currentSearchType) {
            case 'surname':
                searchUrl = `${API_URL}/search/surname?Surname=${encodeURIComponent(searchTerm)}`;
                break;
            case 'lastname':
                searchUrl = `${API_URL}/search/lastname?LastName=${encodeURIComponent(searchTerm)}`;
                break;
            default: 
                searchUrl = `${API_URL}/search/name?name=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(searchUrl);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const owners = await response.json();
        renderOwners(owners);

    } catch (error) {
        showError('Ошибка поиска: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}


function switchTab(tabType) {
    currentSearchType = tabType;


    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`.tab-btn[onclick*="${tabType}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

   
    const searchInput = document.getElementById('searchInput');
    const placeholders = {
        'name': 'Введите имя для поиска...',
        'surname': 'Введите фамилию для поиска...',
        'lastname': 'Введите отчество для поиска...'
    };
    searchInput.placeholder = placeholders[tabType] || 'Введите для поиска...';

   
    if (searchInput.value.trim()) {
        searchOwners();
    }
}


function clearSearch() {
    document.getElementById('searchInput').value = '';
    loadOwners();
}


function openModal(ownerId = null) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('ownerForm');

    if (ownerId) {
        title.textContent = 'Редактировать владельца';
        loadOwnerForEdit(ownerId);
    } else {
        title.textContent = 'Добавить владельца';
        form.reset();
        document.getElementById('ownerId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

async function loadOwnerForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Владелец не найден');

        const owner = await response.json();

        document.getElementById('ownerId').value = owner.id;
        document.getElementById('name').value = owner.name || '';
        document.getElementById('surname').value = owner.surname || '';
        document.getElementById('lastname').value = owner.lastname || '';
        document.getElementById('phone').value = owner.phone || '';
        document.getElementById('address').value = owner.address || '';

    } catch (error) {
        showError('Не удалось загрузить владельца: ' + error.message);
        closeModal();
    }
}

async function saveOwner(event) {
    event.preventDefault();

    const ownerId = document.getElementById('ownerId').value;
    const owner = {
        id: ownerId ? parseInt(ownerId) : 0,
        name: document.getElementById('name').value.trim(),
        surname: document.getElementById('surname').value.trim(),
        lastname: document.getElementById('lastname').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim()
    };


    if (!owner.name || !owner.surname) {
        showError('Имя и фамилия обязательны');
        return;
    }

    if (owner.phone && !/^\d{11}$/.test(owner.phone)) {
        showError('Телефон должен содержать 11 цифр (формат: 79991234567)');
        return;
    }

    const method = ownerId ? 'PUT' : 'POST';
    const url = ownerId ? `${API_URL}/${ownerId}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(owner)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Ошибка ${response.status}`);
        }

        closeModal();
        loadOwners();
        showSuccess(ownerId ? 'Владелец обновлен' : 'Владелец добавлен');

    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
    }
}

async function deleteOwner(id) {
    if (!confirm('Удалить этого владельца?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        loadOwners();
        showSuccess('Владелец удален');

    } catch (error) {
        showError('Не удалось удалить владельца: ' + error.message);
    }
}

function editOwner(id) {
    openModal(id);
}

function formatPhone(phone) {
    if (!phone) return '';
 
    return `+7 (${phone.substring(1, 4)}) ${phone.substring(4, 7)}-${phone.substring(7, 9)}-${phone.substring(9)}`;
}

function showSuccess(message) {
    alert('✓ ' + message);
}

function showError(message) {
    alert('✗ ' + message);
}

function showInfo(message) {
    alert('ℹ ' + message);
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

   
    document.getElementById('phone').addEventListener('input', function (e) {
        this.value = this.value.replace(/\D/g, '').substring(0, 11);
    });
}