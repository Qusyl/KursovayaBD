
const API_URL = 'https://localhost:7071/api/Worker';


let currentSearchType = 'name';


document.addEventListener('DOMContentLoaded', function () {
    loadWorkers();
    setupEventListeners();
});


async function loadWorkers() {
    const table = document.getElementById('workersTable');
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');

    try {
        loading.style.display = 'block';
        table.innerHTML = '';

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const workers = await response.json();

        if (workers.length === 0) {
            empty.style.display = 'block';
            table.style.display = 'none';
        } else {
            empty.style.display = 'none';
            table.style.display = '';
            renderWorkers(workers);
        }

    } catch (error) {
        showError('Не удалось загрузить работников: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}


function renderWorkers(workers) {
    const table = document.getElementById('workersTable');
    table.innerHTML = '';

    workers.forEach(worker => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${worker.id}</td>
            <td>${worker.workerName || ''}</td>
            <td>${worker.workerSurname || ''}</td>
            <td>${worker.workerLastname || ''}</td>
            <td>${formatPhone(worker.phone)}</td>
            <td>${worker.shop}</td>
            <td>
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


async function loadWorkersWithShops() {
    try {
        const response = await fetch(`${API_URL}/workers-with-shops`);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();

      
        document.getElementById('shopsStats').style.display = 'block';
        document.getElementById('workersWithShopsCount').textContent = data.count || 0;

        if (data.workers && data.workers.length > 0) {
            renderWorkersWithShops(data.workers);
        } else {
            showInfo('Работники с информацией о магазинах не найдены');
        }

    } catch (error) {
        showError('Ошибка загрузки статистики: ' + error.message);
    }
}


function renderWorkersWithShops(workers) {
    const table = document.getElementById('workersTable');
    table.innerHTML = '';

    workers.forEach(worker => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${worker.id}</td>
            <td>${worker.workerName || ''}</td>
            <td>${worker.workerSurname || ''}</td>
            <td>${worker.workerLastname || ''}</td>
            <td>${formatPhone(worker.phone)}</td>
            <td>${worker.shop}</td>
            <td>
                <span class="shop-info">Магазин #${worker.shop}</span>
            </td>
        `;

        table.appendChild(row);
    });
}


async function searchWorkers() {
    const searchTerm = document.getElementById('searchInput').value.trim();

    if (!searchTerm) {
        loadWorkers();
        return;
    }

    const table = document.getElementById('workersTable');
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
                searchUrl = `${API_URL}/search/lastname?Lastname=${encodeURIComponent(searchTerm)}`;
                break;
            default:
                searchUrl = `${API_URL}/search/name?name=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(searchUrl);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const workers = await response.json();
        renderWorkers(workers);

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
        searchWorkers();
    }
}


function clearSearch() {
    document.getElementById('searchInput').value = '';
    loadWorkers();
}


function openModal(workerId = null) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('workerForm');

    if (workerId) {
        title.textContent = 'Редактировать работника';
        loadWorkerForEdit(workerId);
    } else {
        title.textContent = 'Добавить работника';
        form.reset();
        document.getElementById('workerId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}


async function loadWorkerForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Работник не найден');

        const worker = await response.json();

        document.getElementById('workerId').value = worker.id;
        document.getElementById('workerName').value = worker.workerName || '';
        document.getElementById('workerSurname').value = worker.workerSurname || '';
        document.getElementById('workerLastname').value = worker.workerLastname || '';
        document.getElementById('phone').value = worker.phone || '';
        document.getElementById('shop').value = worker.shop || '';
        document.getElementById('avatar').value = worker.avatar || '';

    } catch (error) {
        showError('Не удалось загрузить работника: ' + error.message);
        closeModal();
    }
}


async function saveWorker(event) {
    event.preventDefault();

    const workerId = document.getElementById('workerId').value;
    const worker = {
        id: workerId ? parseInt(workerId) : 0,
        workerName: document.getElementById('workerName').value.trim(),
        workerSurname: document.getElementById('workerSurname').value.trim(),
        workerLastname: document.getElementById('workerLastname').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        shop: parseInt(document.getElementById('shop').value),
        avatar: document.getElementById('avatar').value.trim()
    };

  
    if (!worker.workerName || !worker.workerSurname || !worker.workerLastname) {
        showError('Имя, фамилия и отчество обязательны');
        return;
    }

    if (worker.shop < 1) {
        showError('ID магазина должен быть положительным числом');
        return;
    }

    if (!/^\d{11}$/.test(worker.phone)) {
        showError('Телефон должен содержать 11 цифр (формат: 79991234567)');
        return;
    }

    const method = workerId ? 'PUT' : 'POST';
    const url = workerId ? `${API_URL}/${workerId}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(worker)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Ошибка ${response.status}`);
        }

        closeModal();
        loadWorkers();
        showSuccess(workerId ? 'Работник обновлен' : 'Работник добавлен');

    } catch (error) {
        showError('Ошибка сохранения: ' + error.message);
    }
}


async function deleteWorker(id) {
    if (!confirm('Удалить этого работника?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        loadWorkers();
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

/
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