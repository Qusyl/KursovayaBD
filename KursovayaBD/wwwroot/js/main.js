document.addEventListener('DOMContentLoaded', function() {
    loadStatistics();
    
    setActiveNav();
});

async function loadStatistics() {
    try
{
    document.getElementById('workerCount').textContent = '45';
    document.getElementById('productCount').textContent = '278';
    document.getElementById('totalFund').textContent = '1,450,000 ₽';
}

catch (error) {
    console .error('Ошибка загрузки статистики:', error);
}

function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');
    navItems .forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast .className = `toast toast-$

{
    type
}

`;
toast.textContent = message;
toast.style.cssText = `
position: fixed;
top: 20px;
right: 20px;
background: $ {
    type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#4f46e5'
}

;
color: white;
padding: 12px 20px;
border-radius: 6px;
z-index: 1000;
animation: slideIn 0.3s ease-out;
`;

document.body.appendChild(toast);

setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from

{
    transform: translateX(100%);
    opacity: 0;
}

to {
    transform: translateX(0);
    opacity: 1;
}

}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }

    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

`;
document.head.appendChild(style);
