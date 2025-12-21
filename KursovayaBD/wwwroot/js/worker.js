const API_URL = 'https://localhost:7071/api/Worker';
let currentSearchType = 'name';
let isShowingWithShops = false; 

document.addEventListener('DOMContentLoaded', function () {
    loadWorkers();
    setupEventListeners();
});

async function loadWorkers() {
    const table = document.getElementById('workersTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');
    const showAllBtn = document.getElementById('showAllBtn');
    const showShopsBtn = document.getElementById('showShopsBtn');

    try {
        if (loading) loading.style.display = 'block';
        if (table) table.innerHTML = '';

        const response = await fetch(API_URL, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const workers = await response.json();

        if (workers.length === 0) {
            if (empty) empty.style.display = 'block';
            if (table) table.style.display = 'none';
        } else {
            if (empty) empty.style.display = 'none';
            if (table) {
                table.style.display = '';
                renderWorkers(workers);
            }
        }

       
        isShowingWithShops = false;
        if (showAllBtn) showAllBtn.style.display = 'none';
        if (showShopsBtn) showShopsBtn.style.display = 'block';

    } catch (error) {
        showError('Не удалось загрузить работников: ' + error.message);
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function renderWorkers(workers) {
    const table = document.getElementById('workersTable');
    if (!table) return;

    table.innerHTML = '';

    workers.forEach(worker => {
        const row = document.createElement('tr');

      
        const xmlDisplay = formatXmlForDisplay(worker.avatar || '');

        row.innerHTML = `
            <td>${worker.id}</td>
            <td>${worker.workerName || ''}</td>
            <td>${worker.workerSurname || ''}</td>
            <td>${worker.workerLastname || ''}</td>
            <td>${formatPhone(worker.phone)}</td>
            <td>${worker.shop}</td>
            <td class="xml-cell">
                ${xmlDisplay}
            </td>
            <td class="actions-column">
                <div class="actions">
                    <button class="btn-action btn-edit" onclick="editWorker(${worker.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteWorker(${worker.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        table.appendChild(row);
    });
}
function getAuthHeader() {
    const token = localStorage.getItem('token');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}

async function loadWorkersWithShops() {
    const table = document.getElementById('workersTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');
    const shopsStats = document.getElementById('shopsStats');
    const workersWithShopsCount = document.getElementById('workersWithShopsCount');
    const showAllBtn = document.getElementById('showAllBtn');
    const showShopsBtn = document.getElementById('showShopsBtn');

    try {
        if (loading) loading.style.display = 'block';
        if (table) table.innerHTML = '';

        const response = await fetch(`${API_URL}/workers-with-shops`, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (shopsStats) shopsStats.style.display = 'block';
        if (workersWithShopsCount) workersWithShopsCount.textContent = data.count || 0;

        if (data.workers && data.workers.length > 0) {
            if (empty) empty.style.display = 'none';
            if (table) {
                table.style.display = '';
                renderWorkersWithShops(data.workers);
            }
        } else {
            if (empty) empty.style.display = 'block';
            if (table) table.style.display = 'none';
            showInfo('Работники с информацией о магазинами не найдены');
        }

        isShowingWithShops = true;
        if (showAllBtn) showAllBtn.style.display = 'block';
        if (showShopsBtn) showShopsBtn.style.display = 'none';

    } catch (error) {
        showError('Ошибка загрузки статистики: ' + error.message);
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function renderWorkersWithShops(workers) {
    const table = document.getElementById('workersTable');
    if (!table) return;

    table.innerHTML = '';

    workers.forEach(worker => {
        const row = document.createElement('tr');

      
        const xmlData = worker.avatar || (worker.xmlData || '');
        const xmlDisplay = formatXmlForDisplay(xmlData);

        row.innerHTML = `
            <td>${worker.id}</td>
            <td>${worker.name || worker.workerName || ''}</td>
            <td>${worker.surname || worker.workerSurname || ''}</td>
            <td>${worker.lastname || worker.workerLastname || ''}</td>
            <td>${formatPhone(worker.phone || '')}</td>
            <td>${worker.shopName || worker.shop || ''}</td>
            <td class="xml-cell">
                ${xmlDisplay}
            </td>
            <td>
                <span class="shop-info">${worker.shopName ? `Магазин: ${worker.shopName}` : ''}</span>
            </td>
        `;

        table.appendChild(row);
    });
}
function formatXmlForDisplay(xmlString) {
    if (!xmlString || xmlString.trim() === '' || xmlString === 'string.Empty') {
        return '<span class="xml-content empty">Нет XML</span>';
    }

  
    const cleanXml = xmlString.trim()
        .replace(/\s+/g, ' ') 
        .replace(/>\s+</g, '><') 
        .replace(/\n/g, ' ') 
        .replace(/\r/g, ' ') 
        .replace(/\t/g, ' ');

 
    if (cleanXml.length <= 30) {
        return `<span class="xml-content has-xml" onclick="showFullXml('${escapeXml(cleanXml)}')" title="${cleanXml}">${escapeHtml(cleanXml)}</span>`;
    }

 
    const truncated = cleanXml.substring(0, 30) + '...';
    return `<span class="xml-content has-xml" onclick="showFullXml('${escapeXml(cleanXml)}')" title="Нажмите для просмотра полного XML">${escapeHtml(truncated)}</span>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeXml(xml) {
    return xml.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '&#10;')
        .replace(/\r/g, '&#13;');
}

function showFullXml(xmlContent) {
    currentXmlContent = xmlContent;
    const modal = document.getElementById('xmlModal');
    const modalBody = document.getElementById('xmlModalBody');

    if (modal && modalBody) {
        
        const decodedXml = xmlContent
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&#10;/g, '\n')
            .replace(/&#13;/g, '\r');

        
        const formattedXml = formatXml(decodedXml);
        modalBody.textContent = formattedXml;
        modal.style.display = 'block';

      
        const copySuccess = document.getElementById('copySuccess');
        if (copySuccess) copySuccess.style.display = 'none';
    }
}

function closeXmlModal() {
    const modal = document.getElementById('xmlModal');
    if (modal) modal.style.display = 'none';
}

function copyXmlToClipboard() {
    const modalBody = document.getElementById('xmlModalBody');
    if (!modalBody) return;

    const xmlText = modalBody.textContent;

    navigator.clipboard.writeText(xmlText).then(() => {
        const copySuccess = document.getElementById('copySuccess');
        if (copySuccess) {
            copySuccess.style.display = 'inline';
            setTimeout(() => {
                copySuccess.style.display = 'none';
            }, 2000);
        }
    }).catch(err => {
        console.error('Ошибка копирования: ', err);
        showError('Не удалось скопировать XML');
    });
}

function formatXml(xml) {
   
    let formatted = '';
    let indent = '';
    const tab = '  ';

    xml.split(/>\s*</).forEach((node, index) => {
        if (index === 0) formatted += node + '>\n';
        else if (node.match(/^\/\w/)) {
            indent = indent.substring(tab.length);
            formatted += indent + '<' + node + '>\n';
        } else {
            formatted += indent + '<' + node + '>\n';
            if (node.match(/^<?\w[^>]*[^/]$/)) indent += tab;
        }
    });

    return formatted.substring(1, formatted.length - 2);
}

async function searchWorkers() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {
        if (isShowingWithShops) {
            loadWorkersWithShops();
        } else {
            loadWorkers();
        }
        return;
    }

    const table = document.getElementById('workersTable');
    const loading = document.getElementById('loading');

    try {
        if (loading) loading.style.display = 'block';
        if (table) table.innerHTML = '';

        let searchUrl;
        switch (currentSearchType) {
            case 'surname':
                searchUrl = `${API_URL}/search/surname?Surname=${encodeURIComponent(searchTerm)}`;
                break;
            case 'lastname':
                searchUrl = `${API_URL}/search/lastname?Lastname=${encodeURIComponent(searchTerm)}`;
                break;
            default:
                searchUrl = `${API_URL}/search/name?name=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(searchUrl, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const workers = await response.json();

        if (workers.length === 0) {
            const empty = document.getElementById('empty');
            if (empty) empty.style.display = 'block';
            if (table) table.style.display = 'none';
        } else {
            const empty = document.getElementById('empty');
            if (empty) empty.style.display = 'none';
            if (table) {
                table.style.display = '';
                
                if (isShowingWithShops) {
                  
                    loadWorkersWithShops(); 
                } else {
                    renderWorkers(workers);
                }
            }
        }

    } catch (error) {
        showError('Ошибка поиска: ' + error.message);
    } finally {
        if (loading) loading.style.display = 'none';
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
            searchWorkers();
        }
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    if (isShowingWithShops) {
        loadWorkersWithShops();
    } else {
        loadWorkers();
    }
}

function showAllWorkers() {
    const shopsStats = document.getElementById('shopsStats');
    if (shopsStats) shopsStats.style.display = 'none';

    loadWorkers();
}

function openModal(workerId = null) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('workerForm');

    if (!modal || !form) {
        console.error('Модальное окно или форма не найдены');
        showError('Модальное окно не найдено');
        return;
    }

    form.reset();

    if (workerId) {
        if (title) title.textContent = 'Редактировать работника';
        loadWorkerForEdit(workerId);
    } else {
        if (title) title.textContent = 'Добавить работника';
        const workerIdInput = document.getElementById('workerIdInput');
        if (workerIdInput) workerIdInput.value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none';
}

async function loadWorkerForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });
        if (!response.ok) throw new Error('Работник не найден');

        const worker = await response.json();

        const workerIdInput = document.getElementById('workerIdInput');
        const workerNameInput = document.getElementById('workerName');
        const workerSurnameInput = document.getElementById('workerSurname');
        const workerLastnameInput = document.getElementById('workerLastname');
        const phoneInput = document.getElementById('phone');
        const shopInput = document.getElementById('shop');
        const avatarInput = document.getElementById('avatar');

        if (workerIdInput) workerIdInput.value = worker.id;
        if (workerNameInput) workerNameInput.value = worker.workerName || '';
        if (workerSurnameInput) workerSurnameInput.value = worker.workerSurname || '';
        if (workerLastnameInput) workerLastnameInput.value = worker.workerLastname || '';
        if (phoneInput) phoneInput.value = worker.phone || '';
        if (shopInput) shopInput.value = worker.shop || '';
        if (avatarInput) avatarInput.value = worker.avatar || '';

    } catch (error) {
        showError('Не удалось загрузить работника: ' + error.message);
        closeModal();
    }
}

async function saveWorker(event) {
    event.preventDefault();

    const workerIdInput = document.getElementById('workerIdInput');
    const workerNameInput = document.getElementById('workerName');
    const workerSurnameInput = document.getElementById('workerSurname');
    const workerLastnameInput = document.getElementById('workerLastname');
    const phoneInput = document.getElementById('phone');
    const shopInput = document.getElementById('shop');
    const avatarInput = document.getElementById('avatar');

    if (!workerIdInput || !workerNameInput || !workerSurnameInput || !workerLastnameInput || !phoneInput || !shopInput) {
        showError('Не все обязательные поля найдены');
        return;
    }

    const workerIdValue = workerIdInput.value;
    if (!workerIdValue || parseInt(workerIdValue) <= 0) {
        showError('Введите корректный ID работника (должен быть больше 0)');
        return;
    }

    const workerId = parseInt(workerIdValue);

    const worker = {
        id: workerId,
        workerName: workerNameInput.value.trim(),
        workerSurname: workerSurnameInput.value.trim(),
        workerLastname: workerLastnameInput.value.trim(),
        phone: phoneInput.value.trim(),
        shop: parseInt(shopInput.value),
        avatar: avatarInput ? avatarInput.value.trim() : ''
    };

    if (!worker.workerName || !worker.workerSurname || !worker.workerLastname) {
        showError('Имя, фамилия и отчество обязательны');
        return;
    }

    if (worker.shop < 1 || isNaN(worker.shop)) {
        showError('ID магазина должен быть положительным числом');
        return;
    }

    if (!/^\d{11}$/.test(worker.phone)) {
        showError('Телефон должен содержать 11 цифр (формат: 79991234567)');
        return;
    }

    try {
        let response = await fetch(`${API_URL}/${workerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(worker)
        });

        if (!response.ok) {
            if (response.status === 404) {
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                    body: JSON.stringify(worker)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || `Ошибка ${response.status}`);
                }

                showSuccess('Работник добавлен');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || `Ошибка ${response.status}`);
            }
        } else {
            showSuccess('Работник обновлен');
        }

        closeModal();
      
        if (isShowingWithShops) {
            await loadWorkersWithShops();
        } else {
            await loadWorkers();
        }

    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
        console.error('Save error:', error);
    }
}

async function deleteWorker(id) {
    if (!confirm('Удалить этого работника?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        
        if (isShowingWithShops) {
            await loadWorkersWithShops();
        } else {
            await loadWorkers();
        }

        showSuccess('Работник удален');

    } catch (error) {
        showError('Не удалось удалить работника: ' + error.message);
    }
}

function editWorker(id) {
    openModal(id);
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

function showInfo(message) {
    alert('ℹ ' + message);
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

   
    const xmlModal = document.getElementById('xmlModal');
    if (xmlModal) {
        xmlModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeXmlModal();
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
            closeXmlModal();
        }
    });

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            this.value = this.value.replace(/\D/g, '').substring(0, 11);
        });
    }
}