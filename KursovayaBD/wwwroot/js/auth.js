const API_URL = "https://localhost:7071/api/auth/login";

const form = document.getElementById('loginForm');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error('Неверный логин или пароль');
            }

            const data = await response.json();

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);

            window.location.href = "../index.html";
        }
        catch (err) {
            document.getElementById('error').textContent = err.message;
        }
    });
}


function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = "/index.html";
}
