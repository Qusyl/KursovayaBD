
const API_URL = 'https://localhost:7071/api/ProductAudit'; 


let currentSearchType = 'new';

function getAuthHeader() {
    const token = localStorage.getItem('token');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}
document.addEventListener('DOMContentLoaded', function () {
    loadAudit();
    setupEventListeners();
});

async function loadAudit() {
    const table = document.getElementById('auditTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(API_URL, { headers: { 'Content-Type': "application/json", ...getAuthHeader() }});

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const audit = await response.json();

        if (audit.length === 0) {
            empty.style.display = 'block';
            table.style.display = 'none';
        } else {
            empty.style.display = 'none';
            table.style.display = '';
            renderAudit(audit);
        }

    } catch (error) {
        showError('Не удалось загрузить аудит: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}


function renderAudit(audit) {
    const table = document.getElementById('auditTable');
    table.innerHTML = '';

    audit.forEach(item => {
        const row = document.createElement('tr');
        row.onclick = () => showAuditDetails(item);

     
        const changedFields = getChangedFields(item);
        const mainChange = changedFields[0] || { field: 'Название', old: item.oldName, new: item.newName };

        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.product}</td>
            <td>${formatDateTime(item.changedAt)}</td>
            <td><span class="action-badge badge-${item.action.toLowerCase()}">${item.action}</span></td>
            <td>${formatValue(mainChange.old)}</td>
            <td>${formatValue(mainChange.new)}</td>
            <td><span class="changed-field">${mainChange.field}</span></td>
        `;

        table.appendChild(row);
    });
}


function getChangedFields(item) {
    const changes = [];

    if (item.oldName !== item.newName && (item.oldName || item.newName)) {
        changes.push({
            field: 'Название',
            old: item.oldName,
            new: item.newName
        });
    }

    if (item.oldPrice !== item.newPrice && (item.oldPrice || item.newPrice)) {
        changes.push({
            field: 'Цена',
            old: item.oldPrice ? formatCurrency(item.oldPrice) : null,
            new: item.newPrice ? formatCurrency(item.newPrice) : null
        });
    }

    if (item.oldProducer !== item.newProducer && (item.oldProducer || item.newProducer)) {
        changes.push({
            field: 'Производитель',
            old: item.oldProducer,
            new: item.newProducer
        });
    }

    if (item.oldCategory !== item.newCategory && (item.oldCategory || item.newCategory)) {
        changes.push({
            field: 'Категория',
            old: item.oldCategory,
            new: item.newCategory
        });
    }

    return changes;
}


async function searchAudit() {
    const searchTerm = document.getElementById('searchInput').value.trim();

    if (!searchTerm) {
        loadAudit();
        return;
    }

    const table = document.getElementById('auditTable');
    const loading = document.getElementById('loading');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        let searchUrl;
        if (currentSearchType === 'old') {
            searchUrl = `${API_URL}/search/old?OldName=${encodeURIComponent(searchTerm)}`;
        } else {
            searchUrl = `${API_URL}/search/new?name=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(searchUrl, { headers: { 'Content-Type': "application/json" }, ...getAuthHeader() });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const audit = await response.json();

        if (audit.length === 0) {
            document.getElementById('empty').style.display = 'block';
            table.style.display = 'none';
        } else {
            document.getElementById('empty').style.display = 'none';
            table.style.display = '';
            renderAudit(audit);
        }

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
        'new': 'Поиск по новому имени...',
        'old': 'Поиск по старому имени...'
    };
    searchInput.placeholder = placeholders[tabType] || 'Введите для поиска...';

    
    if (searchInput.value.trim()) {
        searchAudit();
    }
}


function clearSearch() {
    document.getElementById('searchInput').value = '';
    loadAudit();
}


function showAuditDetails(item) {
    const modal = document.getElementById('modal');
    const changedFields = getChangedFields(item);

  
    document.getElementById('detailAuditId').textContent = item.id;
    document.getElementById('detailProductId').textContent = item.product;
    document.getElementById('detailChangedAt').textContent = formatDateTime(item.changedAt);

    const actionBadge = document.getElementById('detailAction');
    actionBadge.textContent = item.action;
    actionBadge.className = `action-badge badge-${item.action.toLowerCase()}`;

  
    const changesGrid = document.getElementById('changesGrid');
    changesGrid.innerHTML = '';

    if (changedFields.length === 0) {
        changesGrid.innerHTML = '<div class="change-card">Нет деталей изменений</div>';
    } else {
        changedFields.forEach(change => {
            const changeCard = document.createElement('div');
            changeCard.className = 'change-card';

            changeCard.innerHTML = `
                <div class="change-field">${change.field}</div>
                <div class="change-values">
                    <div class="change-old" title="Старое значение">${formatValue(change.old)}</div>
                    <i class="fas fa-arrow-right" style="color: var(--primary); align-self: center;"></i>
                    <div class="change-new" title="Новое значение">${formatValue(change.new)}</div>
                </div>
            `;

            changesGrid.appendChild(changeCard);
        });
    }

    modal.style.display = 'block';
}


function closeModal() {
    document.getElementById('modal').style.display = 'none';
}


function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatValue(value) {
    if (value === null || value === undefined || value === '') {
        return '<span style="color: #9ca3af; font-style: italic;">не указано</span>';
    }
    return value;
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

   
    document.getElementById('searchInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchAudit();
        }
    });
}