const API_URL = 'https://localhost:7071/api/Owner';
let currentSearchType = 'name';

document.addEventListener('DOMContentLoaded', function () {
    loadOwners();
    setupEventListeners();
});
function getAuthHeader() {
    const token = localStorage.getItem('token');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}
async function loadOwners() {
    const table = document.getElementById('ownersTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(API_URL, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });

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
    if (!table) return;

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
                    <button class="btn-action" onclick="viewOwnerDetails(${owner.id})" title="Подробнее" style="color: var(--secondary);">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </td>
        `;

        table.appendChild(row);
    });
}

async function searchOwners() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const searchTerm = searchInput.value.trim();

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
                searchUrl = `${API_URL}/search/surname?term=${encodeURIComponent(searchTerm)}`;
                break;
            case 'lastname':
                searchUrl = `${API_URL}/search/lastname?term=${encodeURIComponent(searchTerm)}`;
                break;
            default:
                searchUrl = `${API_URL}/search/name?term=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(searchUrl, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });

        if (!response.ok) {
            throw new Error('Поиск не доступен');
        }

        const owners = await response.json();

        if (owners.length === 0) {
            const empty = document.getElementById('empty');
            if (empty) {
                empty.style.display = 'block';
            }
            table.style.display = 'none';
        } else {
            const empty = document.getElementById('empty');
            if (empty) {
                empty.style.display = 'none';
            }
            table.style.display = '';
            renderOwners(owners);
        }

    } catch (error) {
        console.error('Search error:', error);
        await loadOwners();
        filterOwnersLocally(searchTerm);
    } finally {
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

function filterOwnersLocally(searchTerm) {
    const rows = document.querySelectorAll('#ownersTable tr');
    const empty = document.getElementById('empty');
    let hasResults = false;
    const searchText = searchTerm.toLowerCase();

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');

        let match = false;
        switch (currentSearchType) {
            case 'surname':
                match = cells[2]?.textContent.toLowerCase().includes(searchText);
                break;
            case 'lastname':
                match = cells[3]?.textContent.toLowerCase().includes(searchText);
                break;
            default:
                match = cells[1]?.textContent.toLowerCase().includes(searchText);
        }

        row.style.display = match ? '' : 'none';
        if (match) hasResults = true;
    });

    if (empty) {
        if (!hasResults) {
            empty.style.display = 'block';
        } else {
            empty.style.display = 'none';
        }
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
    if (searchInput) {
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
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    loadOwners();
}

function openModal(ownerId = null) {
    const modal = document.getElementById('modal');
    if (!modal) {
        console.error('Модальное окно не найдено!');
        showError('Модальное окно не найдено. Проверьте HTML.');
        return;
    }

    const title = document.getElementById('modalTitle');
    const form = document.getElementById('ownerForm');

    if (!form) {
        console.error('Форма не найдена!');
        return;
    }

    form.reset();

    if (ownerId) {
        if (title) title.textContent = 'Редактировать владельца';
        loadOwnerForEdit(ownerId);
    } else {
        if (title) title.textContent = 'Добавить владельца';
        const ownerIdInput = document.getElementById('ownerIdInput');
        if (ownerIdInput) {
            ownerIdInput.value = '';
        }
    }

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function loadOwnerForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });
        if (!response.ok) throw new Error('Владелец не найден');

        const owner = await response.json();

        const ownerIdInput = document.getElementById('ownerIdInput');
        const nameInput = document.getElementById('name');
        const surnameInput = document.getElementById('surname');
        const lastnameInput = document.getElementById('lastname');
        const phoneInput = document.getElementById('phone');
        const addressInput = document.getElementById('address');

        if (ownerIdInput) ownerIdInput.value = owner.id;
        if (nameInput) nameInput.value = owner.name || '';
        if (surnameInput) surnameInput.value = owner.surname || '';
        if (lastnameInput) lastnameInput.value = owner.lastname || '';
        if (phoneInput) phoneInput.value = owner.phone || '';
        if (addressInput) addressInput.value = owner.address || '';

    } catch (error) {
        showError('Не удалось загрузить владельца: ' + error.message);
        closeModal();
    }
}

async function saveOwner(event) {
    event.preventDefault();

    const ownerIdInput = document.getElementById('ownerIdInput');
    const nameInput = document.getElementById('name');
    const surnameInput = document.getElementById('surname');
    const lastnameInput = document.getElementById('lastname');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');

    if (!ownerIdInput || !nameInput || !surnameInput) {
        showError('Не все обязательные поля найдены');
        return;
    }

    const ownerIdValue = ownerIdInput.value;
    if (!ownerIdValue || parseInt(ownerIdValue) <= 0) {
        showError('Введите корректный ID владельца (должен быть больше 0)');
        return;
    }

    const ownerId = parseInt(ownerIdValue);

    const owner = {
        id: ownerId,
        name: nameInput.value.trim(),
        surname: surnameInput.value.trim(),
        lastname: lastnameInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: addressInput.value.trim()
    };

    if (!owner.name || !owner.surname) {
        showError('Имя и фамилия обязательны');
        return;
    }

    if (owner.phone && !/^\d{11}$/.test(owner.phone)) {
        showError('Телефон должен содержать 11 цифр (формат: 79991234567)');
        return;
    }

    try {
        let response = await fetch(`${API_URL}/${ownerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(owner)
        });

        if (!response.ok) {
            if (response.status === 404) {
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                    body: JSON.stringify(owner)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || `Ошибка ${response.status}`);
                }

                showSuccess('Владелец добавлен');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || `Ошибка ${response.status}`);
            }
        } else {
            showSuccess('Владелец обновлен');
        }

        closeModal();
        await loadOwners();

    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
        console.error('Save error:', error);
    }
}

async function deleteOwner(id) {
    if (!confirm('Удалить этого владельца?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE', headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
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

async function viewOwnerDetails(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });
        if (!response.ok) throw new Error('Данные не найдены');

        const owner = await response.json();

        const content = `
            <div class="owner-info">
                <h4>${owner.surname} ${owner.name} ${owner.lastname}</h4>
                <p><strong>ID:</strong> ${owner.id}</p>
                <p><strong>Адрес:</strong> ${owner.address || 'Не указан'}</p>
                <p><strong>Телефон:</strong> ${formatPhone(owner.phone) || 'Не указан'}</p>
            </div>
        `;

        const dataContent = document.getElementById('dataContent');
        const dataModalTitle = document.getElementById('dataModalTitle');
        const dataModal = document.getElementById('dataModal');

        if (dataContent && dataModalTitle && dataModal) {
            dataContent.innerHTML = content;
            dataModalTitle.textContent = 'Детали владельца';
            dataModal.style.display = 'block';
        } else {
            console.error('Элементы модального окна данных не найдены');
            showError('Не удалось открыть детали: элементы не найдены');
        }

    } catch (error) {
        showError('Не удалось загрузить детали: ' + error.message);
    }
}

async function showOwnersWithNonProfitShops() {
    try {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'block';
        }

        const response = await fetch(`${API_URL}/non-profit-shops`, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });
        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}. Проверьте название endpoint.`);
        }

        const data = await response.json();
        console.log('Response data:', data);

        const profitStats = document.getElementById('profitStats');
        const profitableOwnersCount = document.getElementById('profitableOwnersCount');
        const dataContent = document.getElementById('dataContent');
        const dataModalTitle = document.getElementById('dataModalTitle');
        const dataModal = document.getElementById('dataModal');

        if (profitStats) {
            profitStats.style.display = 'block';
        }

        let count = 0;
        let ownersList = [];

        if (data.count !== undefined) {
            count = data.count;
        } else if (Array.isArray(data)) {
            count = data.length;
            ownersList = data;
        } else if (data.owners && Array.isArray(data.owners)) {
            count = data.owners.length;
            ownersList = data.owners;
        }

        if (profitableOwnersCount) {
            profitableOwnersCount.textContent = count;
        }

        if (dataContent && dataModalTitle && dataModal) {
            let content = '<h4>Владельцы с прибыльными магазинами (≥ 2,500,000)</h4>';

            if (count === 0) {
                content += '<p>Нет владельцев с магазинами, имеющими указанную прибыль</p>';
            } else {
                content += `
                    <p><strong>Всего:</strong> ${count} владельцев</p>
                    <div class="shop-list">
                `;

                ownersList.forEach(owner => {
                    const ownerId = owner.id !== undefined ? owner.id : 'N/A';
                    const name = owner.name || '';
                    const surname = owner.surname || '';
                    const lastname = owner.lastname || '';
                    const shopId = owner.shopId !== undefined ? owner.shopId : 'N/A';

                    content += `
                        <div class="shop-item">
                            <strong>${surname} ${name} ${lastname}</strong><br>
                            <small>ID владельца: ${ownerId}</small>
                            ${shopId !== 'N/A' ? `<br><small>ID магазина: ${shopId}</small>` : ''}
                        </div>
                    `;
                });

                content += '</div>';
            }

            dataContent.innerHTML = content;
            dataModalTitle.textContent = 'Владельцы с прибыльными магазинами';
            dataModal.style.display = 'block';
        } else {
            console.error('Элементы модального окна данных не найдены');
            showError('Не удалось отобразить данные: элементы не найдены');
        }

    } catch (error) {
        console.error('Error loading profitable owners:', error);
        showError('Ошибка загрузки данных: ' + error.message);
    } finally {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

function closeDataModal() {
    const dataModal = document.getElementById('dataModal');
    if (dataModal) {
        dataModal.style.display = 'none';
    }
}

function formatPhone(phone) {
    if (!phone) return '';
    if (phone.length !== 11) return phone;

    return `+7 (${phone.substring(1, 4)}) ${phone.substring(4, 7)}-${phone.substring(7, 9)}-${phone.substring(9)}`;
}

function showSuccess(message) {
    alert('✓ ' + message);
}

function showError(message) {
    alert('✗ ' + message);
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchOwners);
    }

    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }

    const dataModal = document.getElementById('dataModal');
    if (dataModal) {
        dataModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeDataModal();
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
            closeDataModal();
        }
    });

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            this.value = this.value.replace(/\D/g, '').substring(0, 11);
        });
    }
}