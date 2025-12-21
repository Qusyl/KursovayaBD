const API_URL = "https://localhost:7071/api/auth/login";

const modal = document.getElementById('loginModal');
const btn = document.getElementById('authBtn');
const closeBtn = document.querySelector('.close');
const roleText = document.getElementById('userRole');
const errorText = document.getElementById('error');
const form = document.getElementById('loginForm');


btn.onclick = () => {
    if (localStorage.getItem('token')) {
        logout();
    } else {
        modal.style.display = 'block';
    }
};


closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = e => {
    if (e.target === modal) modal.style.display = 'none';
};


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) throw new Error('Неверный логин или пароль');

        const data = await res.json();

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        modal.style.display = 'none';
        updateAuthUI();
    } catch (err) {
        errorText.textContent = err.message;
    }
});


function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    updateAuthUI();
}


function updateAuthUI() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
        btn.textContent = 'ВЫХОД';
        roleText.textContent = role;
    } else {
        btn.textContent = 'ВОЙТИ';
        roleText.textContent = '';
    }
}

updateAuthUI();
