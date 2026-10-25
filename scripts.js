document.addEventListener("DOMContentLoaded", function () {
    let activeChatOrderId = null;

    // 0. Интерактивный фоновый Canvas с частицами (Партиклы)
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    let particlesArray = [];
    let numberOfParticles = 55;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let mouse = {
        x: null,
        y: null,
        radius: 130
    };

    window.addEventListener('mousemove', function(event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    window.addEventListener('mouseout', function() {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 20) + 5;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let maxDistance = mouse.radius;
                    let force = (maxDistance - distance) / maxDistance;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }
        }
        draw() {
            const isLight = document.body.classList.contains('light-theme');
            ctx.fillStyle = isLight ? 'rgba(0, 119, 255, 0.6)' : 'rgba(0, 242, 254, 0.7)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }
    initParticles();

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const isLight = document.body.classList.contains('light-theme');
        const lineColor = isLight ? 'rgba(0, 119, 255, 0.12)' : 'rgba(0, 242, 254, 0.15)';

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();

            for (let j = i; j < particlesArray.length; j++) {
                let dx = particlesArray[i].x - particlesArray[j].x;
                let dy = particlesArray[i].y - particlesArray[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 110) {
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // --- СИСТЕМА УВЕДОМЛЕНИЙ И ЗВУКОВ (Toasts) ---[cite: 37]
    window.playNotificationSound = function() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            console.log("Звук заблокирован браузером");
        }
    };

    window.showToast = function(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${message}</span>`;

        container.appendChild(toast);
        playNotificationSound();

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    };

    window.logAction = function(actionText) {
        const logs = JSON.parse(localStorage.getItem('admin_activity_logs') || '[]');
        const timestamp = new Date().toLocaleString("uk-UA");
        logs.unshift({ text: actionText, time: timestamp });
        if (logs.length > 50) logs.pop();
        localStorage.setItem('admin_activity_logs', JSON.stringify(logs));
    };

    // 1. Переключение темы[cite: 37]
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
    } else {
        if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            themeToggleBtn.textContent = isLight ? '☀️' : '🌙';
        });
    }

    // 2. Подсчет стоимости[cite: 37]
    const checkboxes = document.querySelectorAll('.service-item input[type="checkbox"]');
    const totalPriceElement = document.getElementById('total-price');
    const totalPriceInput = document.getElementById('total-price-input');

    function calculateTotal() {
        let total = 0;
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                total += parseInt(checkbox.getAttribute('data-price')) || 0;
            }
        });
        if (totalPriceElement) totalPriceElement.textContent = total;
        if (totalPriceInput) totalPriceInput.value = total + " грн";
    }

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateTotal);
    });
    calculateTotal();

    // 3. Отправка формы заказа[cite: 37]
    const form = document.getElementById("my-form");
    const status = document.getElementById("form-status");
    const submitBtn = document.getElementById("submit-btn");

    if (form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            
            const selectedServices = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            const orderId = "ORD-" + Math.floor(10000 + Math.random() * 90000);

            const rawPriceText = totalPriceElement ? totalPriceElement.textContent : "0";
            const numericPrice = parseInt(rawPriceText.replace(/\D/g, '')) || 0;

            const newOrder = {
                id: orderId,
                timestamp: Date.now(),
                date: new Date().toLocaleString("uk-UA"),
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                contact: document.getElementById('contact').value,
                details: document.getElementById('details').value,
                services: selectedServices,
                numericPrice: numericPrice,
                totalPrice: numericPrice + " грн",
                status: "Новий",
                messages: []
            };

            if (status) {
                status.innerHTML = "Надсилання...";
                status.style.color = "var(--accent-color)";
            }
            if (submitBtn) submitBtn.disabled = true;

            const data = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            }).then(() => {
                saveOrderLocally(newOrder);
                showSuccessStatus();
            }).catch(() => {
                saveOrderLocally(newOrder);
                showSuccessStatus();
            }).finally(() => {
                if (submitBtn) submitBtn.disabled = false;
            });
        });
    }

    function showSuccessStatus() {
        if (status) {
            status.innerHTML = `Дякуємо! Ваше замовлення успішно прийнято!<br>Ви можете відстежувати його та переписуватися на вкладці <a href="status.html" style="color:var(--accent-color);">"Статус"</a>.`;
            status.style.color = "#4caf50";
        }
        showToast("Замовлення успішно створено!", "success");
        logAction(`Створено нове замовлення`);
        if (form) form.reset();
        calculateTotal();
    }

    function saveOrderLocally(order) {
        let orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        orders.unshift(order);
        localStorage.setItem('admin_orders', JSON.stringify(orders));

        let myOrders = JSON.parse(localStorage.getItem('my_personal_orders') || '[]');
        myOrders.unshift(order.id);
        localStorage.setItem('my_personal_orders', JSON.stringify(myOrders));
    }

    // 4. Отзывы[cite: 37]
    const reviewsList = document.getElementById('reviews-list');
    const reviewForm = document.getElementById('review-form');
    const reviewStatus = document.getElementById('review-status');

    const defaultReviews = [
        { id: 1, name: "Олександр (Адмін сервера)", rating: 5, text: "Дуже швидко зробив сайт під мій проєкт! Все працює чітко, код чистий, допоміг із публікацією на хостинг. Рекомендую!" },
        { id: 2, name: "Дмитро (Фрілансер)", rating: 5, text: "Чудова робота! Зробив красиву верстку з темною темою за пару днів. Завжди на зв'язку та відповідає на всі питання." },
        { id: 3, name: "Максим (Розробник)", rating: 5, text: "Замовляв доробку дизайну та форм. Зробив все точно за ТЗ і за дуже адекватну ціну. Дякую!" }
    ];

    function getStoredReviews() {
        const stored = localStorage.getItem('site_reviews');
        if (!stored) {
            localStorage.setItem('site_reviews', JSON.stringify(defaultReviews));
            return defaultReviews;
        }
        return JSON.parse(stored);
    }

    function getMyReviewIds() {
        return JSON.parse(localStorage.getItem('my_review_ids') || '[]');
    }

    function renderReviews() {
        if (!reviewsList) return;
        const reviews = getStoredReviews();
        const myReviewIds = getMyReviewIds();
        
        reviewsList.innerHTML = reviews.map(rev => {
            const isMyReview = myReviewIds.includes(rev.id);
            return `
                <div class="review-card">
                    <div style="color: #ffc107; font-size: 1.1rem; margin-bottom: 10px;">${'⭐'.repeat(parseInt(rev.rating) || 5)}</div>
                    <p style="color: var(--text-dim); font-size: 0.9rem; line-height: 1.5; margin-bottom: 15px; font-style: italic;">«${rev.text}»</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-weight: bold; color: var(--accent-color); font-size: 0.9rem;">— ${rev.name}</div>
                        ${isMyReview ? `<button onclick="deleteMyReview(${rev.id})" class="btn secondary-btn" style="padding: 3px 8px; font-size: 0.75rem; border-color: #f44336; color: #f44336;">Видалити мій відгук</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    window.deleteMyReview = function(id) {
        if (confirm('Ви впевнені, що хочете видалити свій відгук?')) {
            let reviews = getStoredReviews();
            reviews = reviews.filter(r => r.id !== id);
            localStorage.setItem('site_reviews', JSON.stringify(reviews));

            let myReviewIds = getMyReviewIds();
            myReviewIds = myReviewIds.filter(myId => myId !== id);
            localStorage.setItem('my_review_ids', JSON.stringify(myReviewIds));

            renderReviews();
            renderAdminReviews();
            showToast("Відгук видалено", "success");
        }
    };

    renderReviews();

    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('review-name').value;
            const rating = document.getElementById('review-rating').value;
            const text = document.getElementById('review-text').value;

            const newReviewId = Date.now();
            const newReview = {
                id: newReviewId,
                name: name,
                rating: parseInt(rating),
                text: text
            };

            let reviews = getStoredReviews();
            reviews.unshift(newReview);
            localStorage.setItem('site_reviews', JSON.stringify(reviews));

            let myReviewIds = getMyReviewIds();
            myReviewIds.push(newReviewId);
            localStorage.setItem('my_review_ids', JSON.stringify(myReviewIds));

            renderReviews();
            reviewForm.reset();
            showToast("Дякуємо за ваш відгук!", "success");

            if (reviewStatus) {
                reviewStatus.textContent = "Дякуємо за ваш відгук!";
                reviewStatus.style.color = "#4caf50";
                setTimeout(() => { reviewStatus.textContent = ""; }, 4000);
            }
        });
    }

    // 5. Авторизация и Админ-панель (Модальная и admin_3.html)[cite: 37]
    const loginBtn = document.getElementById('admin-login-btn');
    const loginModal = document.getElementById('login-modal');
    const adminPanelModal = document.getElementById('admin-panel-modal');
    const closeLogin = document.getElementById('close-modal');
    const closeAdminPanel = document.getElementById('close-admin-panel');
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const clearOrdersBtn = document.getElementById('clear-orders-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (localStorage.getItem('isAdminLoggedIn') === 'true') {
                openAdminPanel();
            } else {
                if (loginModal) loginModal.style.display = 'flex';
            }
        });
    }

    if (closeLogin) closeLogin.addEventListener('click', () => { if (loginModal) loginModal.style.display = 'none'; });
    if (closeAdminPanel) closeAdminPanel.addEventListener('click', () => { if (adminPanelModal) adminPanelModal.style.display = 'none'; });

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const loginInput = document.getElementById('admin-login').value;
            const passInput = document.getElementById('admin-pass').value;

            if (loginInput === 'Angel' && passInput === 'kira19boss') {
                localStorage.setItem('isAdminLoggedIn', 'true');
                if (loginModal) loginModal.style.display = 'none';
                loginForm.reset();
                if (loginError) loginError.textContent = '';
                openAdminPanel();
                showToast("Успішний вхід в адмін-панель!", "success");
                logAction("Адміністратор увійшов у систему");
            } else {
                if (loginError) loginError.textContent = 'Невірний логін або пароль!';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAdminLoggedIn');
            if (adminPanelModal) adminPanelModal.style.display = 'none';
            showToast("Ви вийшли з адмін-панелі", "info");
        });
    }

    function openAdminPanel() {
        renderEarningsStats();
        renderKanbanBoard();
        renderAdminReviews();
        if (adminPanelModal) adminPanelModal.style.display = 'flex';
    }

    function renderEarningsStats() {
        let statsContainer = document.getElementById('admin-earnings-stats');
        if (!statsContainer) {
            const adminContent = document.querySelector('.admin-modal-content');
            if (adminContent) {
                statsContainer = document.createElement('div');
                statsContainer.id = 'admin-earnings-stats';
                adminContent.insertBefore(statsContainer, adminContent.children[2]);
            }
        }

        if (!statsContainer) return;

        let totalEarned = parseInt(localStorage.getItem('admin_total_earned')) || 0;
        let completedCount = parseInt(localStorage.getItem('admin_completed_count')) || 0;

        statsContainer.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: var(--input-bg); border: 1px solid var(--border-color); padding: 15px; border-radius: 10px; text-align: center;">
                    <span style="font-size: 0.85rem; color: var(--text-dim);">Загальний заробіток</span>
                    <h3 style="color: #4caf50; font-size: 1.6rem; margin-top: 5px;">${totalEarned} грн</h3>
                </div>
                <div style="background: var(--input-bg); border: 1px solid var(--border-color); padding: 15px; border-radius: 10px; text-align: center;">
                    <span style="font-size: 0.85rem; color: var(--text-dim);">Здано / Виконано замовлень</span>
                    <h3 style="color: var(--accent-color); font-size: 1.6rem; margin-top: 5px;">${completedCount}</h3>
                </div>
            </div>
        `;
    }

    // Поддержка канбана для admin_3.html и модального окна
    function renderKanbanBoard() {
        renderEarningsStats();

        // Проверяем элементы для модального канбана
        const colReview = document.getElementById('col-review');
        const colDev = document.getElementById('col-dev');
        const colDone = document.getElementById('col-done');

        // Проверяем элементы для admin_3.html (Kanban вкладка)
        const colPendingAdmin3 = document.getElementById('colPending');
        const colProgressAdmin3 = document.getElementById('colProgress');
        const colCompletedAdmin3 = document.getElementById('colCompleted');

        let orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        orders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Рендер для старого модального окна
        if (colReview && colDev && colDone) {
            const reviewOrders = orders.filter(o => !o.status || o.status === 'Взяти на розгляд' || o.status === 'Новий' || o.status === 'pending');
            const devOrders = orders.filter(o => o.status === 'В розробку' || o.status === 'В розробці' || o.status === 'progress');

            colReview.innerHTML = reviewOrders.map(o => createKanbanCardHTML(o)).join('') || '<p style="color:var(--text-dim); text-align:center;">Пусто</p>';
            colDev.innerHTML = devOrders.map(o => createKanbanCardHTML(o)).join('') || '<p style="color:var(--text-dim); text-align:center;">Пусто</p>';
            colDone.innerHTML = '<p style="color:var(--text-dim); text-align:center; font-size: 0.85rem;">Виконані замовлення автоматично архівуються із зарахуванням коштів</p>';
        }

        // Рендер для admin_3.html (расширенная вкладка)
        if (colPendingAdmin3 && colProgressAdmin3 && colCompletedAdmin3) {
            const searchVal = (document.getElementById('adminSearchInput')?.value || '').toLowerCase();
            const filterVal = document.getElementById('statusFilter')?.value || 'all';

            const filteredOrders = orders.filter(order => {
                const matchesSearch = (order.name || '').toLowerCase().includes(searchVal) || 
                                      (order.details || '').toLowerCase().includes(searchVal);
                const matchesFilter = filterVal === 'all' || order.status === filterVal;
                return matchesSearch && matchesFilter;
            });

            colPendingAdmin3.innerHTML = '';
            colProgressAdmin3.innerHTML = '';
            colCompletedAdmin3.innerHTML = '';

            filteredOrders.forEach(order => {
                const cardHTML = createKanbanCardHTML(order);
                if (order.status === 'progress' || order.status === 'В розробку' || order.status === 'В розробці') {
                    colProgressAdmin3.innerHTML += cardHTML;
                } else if (order.status === 'completed' || order.status === 'Завершено' || order.status === 'Сдано') {
                    colCompletedAdmin3.innerHTML += cardHTML;
                } else {
                    colPendingAdmin3.innerHTML += cardHTML;
                }
            });
        }
    }

    function createKanbanCardHTML(order) {
        return `
            <div class="kanban-card" data-status="${order.status || 'Новий'}" style="background: var(--card-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 12px; font-size: 0.85rem;">
                <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--accent-color); margin-bottom:6px;">
                    <span><strong>${order.id}</strong> (${order.status || 'Новий'})</span>
                    <span>${order.totalPrice || '0 грн'}</span>
                </div>
                <p><strong>Клієнт:</strong> ${order.name}</p>
                <p><strong>Контакт:</strong> ${order.contact}</p>
                <p style="margin-top:4px; font-size:0.8rem; color:var(--text-dim);"><strong>Деталі:</strong> ${order.details || 'Не вказано'}</p>
                <p style="font-size:0.75rem; color:var(--text-dim); margin-top:4px;">Дата: ${order.date}</p>
                
                <div style="display:flex; gap:4px; flex-wrap:wrap; margin-top:8px;">
                    <button onclick="changeOrderStatus('${order.id}', 'pending')" class="btn secondary-btn" style="padding:2px 6px; font-size:0.7rem; border-color:#ffb74d; color:#ffb74d;">Розгляд</button>
                    <button onclick="changeOrderStatus('${order.id}', 'progress')" class="btn secondary-btn" style="padding:2px 6px; font-size:0.7rem; border-color:var(--accent-color); color:var(--accent-color);">Розробка</button>
                    <button onclick="changeOrderStatus('${order.id}', 'completed')" class="btn primary-btn" style="padding:2px 6px; font-size:0.7rem; border-color:#4caf50; color:#4caf50;">Готово</button>
                </div>

                <div style="display:flex; justify-content:space-between; margin-top:8px;">
                    <button onclick="toggleAdminChat('${order.id}')" class="btn primary-btn" style="padding:3px 8px; font-size:0.75rem;">💬 Чат (${order.messages ? order.messages.length : 0})</button>
                    <button onclick="deleteOrder('${order.id}')" class="btn secondary-btn" style="padding:3px 8px; font-size:0.75rem; border-color:#f44336; color:#f44336;">🗑️</button>
                </div>

                <div id="admin-chat-box-${order.id}" style="display:none; margin-top:10px; border-top:1px solid var(--border-color); padding-top:8px;">
                    <div id="admin-chat-msgs-${order.id}" class="chat-messages" style="max-height:150px;"></div>
                    <div class="chat-input-group">
                        <input type="text" id="admin-chat-input-${order.id}" placeholder="Відповідь..." style="padding:6px; font-size:0.8rem; background:var(--bg-color); border:1px solid var(--border-color); color:var(--text-color); border-radius:4px; flex:1;">
                        <button onclick="sendAdminMessage('${order.id}')" class="btn primary-btn" style="padding:6px 10px; font-size:0.8rem;">></button>
                    </div>
                </div>
            </div>
        `;
    }

    function renderAdminReviews() {
        const adminReviewsBox = document.getElementById('admin-reviews-list');
        if (!adminReviewsBox) return;
        
        const reviews = getStoredReviews();
        if (reviews.length === 0) {
            adminReviewsBox.innerHTML = '<p style="color: var(--text-dim);">Відгуків немає.</p>';
            return;
        }

        adminReviewsBox.innerHTML = reviews.map(rev => `
            <div style="background: var(--input-bg); padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid var(--border-color); text-align: left;">
                <p><strong>${rev.name}</strong> (${'⭐'.repeat(rev.rating)}):</p>
                <p style="color: var(--text-dim); font-size: 0.85rem; margin: 4px 0;">"${rev.text}"</p>
                <button onclick="deleteReview(${rev.id})" class="btn secondary-btn" style="padding: 2px 8px; font-size: 0.75rem; border-color: #f44336; color: #f44336;">Видалити відгук</button>
            </div>
        `).join('');
    }

    window.deleteReview = function(id) {
        let reviews = getStoredReviews();
        reviews = reviews.filter(r => r.id !== id);
        localStorage.setItem('site_reviews', JSON.stringify(reviews));
        renderReviews();
        renderAdminReviews();
        showToast("Відгук видалено адміністратором", "success");
    };

    window.changeOrderStatus = function(id, newStatus) {
        let orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const order = orders.find(o => String(o.id) === String(id));
        
        if (order) {
            if ((newStatus === 'completed' || newStatus === 'Завершено' || newStatus === 'Сдано') && order.status !== 'completed' && order.status !== 'Завершено') {
                let currentEarned = parseInt(localStorage.getItem('admin_total_earned')) || 0;
                let currentCount = parseInt(localStorage.getItem('admin_completed_count')) || 0;

                let p = order.numericPrice;
                if (!p && order.totalPrice) {
                    p = parseInt(order.totalPrice.replace(/\D/g, '')) || 0;
                }

                localStorage.setItem('admin_total_earned', currentEarned + p);
                localStorage.setItem('admin_completed_count', currentCount + 1);
            }

            order.status = newStatus;
            localStorage.setItem('admin_orders', JSON.stringify(orders));
            renderKanbanBoard();
            showToast(`Замовлення ${id} оновлено!`, "success");
            logAction(`Замовлення ${id} переведено в статус "${newStatus}"`);
        }
    };

    window.deleteOrder = function(id) {
        if (confirm('Видалити замовлення?')) {
            let orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
            orders = orders.filter(o => String(o.id) !== String(id));
            localStorage.setItem('admin_orders', JSON.stringify(orders));
            renderKanbanBoard();
            showToast("Замовлення видалено", "success");
            logAction(`Видалено замовлення ${id}`);
        }
    };

    if (clearOrdersBtn) {
        clearOrdersBtn.addEventListener('click', () => {
            if (confirm('Ви впевнені, що хочете видалити всі замовлення?')) {
                localStorage.removeItem('admin_orders');
                renderKanbanBoard();
                showToast("Всі замовлення очищено", "info");
            }
        });
    }

    window.toggleAdminChat = function(orderId) {
        const box = document.getElementById(`admin-chat-box-${orderId}`);
        if (!box) return;
        const isHidden = box.style.display === 'none';
        box.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            activeChatOrderId = orderId;
            renderAdminChatMessages(orderId);
        }
    };

    function renderAdminChatMessages(orderId) {
        const msgsBox = document.getElementById(`admin-chat-msgs-${orderId}`);
        if (!msgsBox) return;

        let orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const order = orders.find(o => String(o.id) === String(orderId));
        if (!order || !order.messages) {
            msgsBox.innerHTML = '<p style="font-size:0.75rem; color:var(--text-dim);">Повідомлень немає</p>';
            return;
        }

        msgsBox.innerHTML = order.messages.map(m => `
            <div class="chat-message ${m.sender}">
                <strong>${m.sender === 'admin' ? 'Адмін' : 'Клієнт'}:</strong> ${m.text}
                <div style="font-size:0.65rem; color:var(--text-dim); text-align:right;">${m.time}</div>
            </div>
        `).join('');
        msgsBox.scrollTop = msgsBox.scrollHeight;
    }

    window.sendAdminMessage = function(orderId) {
        const input = document.getElementById(`admin-chat-input-${orderId}`);
        if (!input || !input.value.trim()) return;

        let orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const order = orders.find(o => String(o.id) === String(orderId));

        if (order) {
            if (!order.messages) order.messages = [];
            order.messages.push({
                sender: 'admin',
                text: input.value.trim(),
                time: new Date().toLocaleTimeString("uk-UA", {hour: '2-digit', minute:'2-digit'})
            });

            localStorage.setItem('admin_orders', JSON.stringify(orders));
            input.value = '';
            renderAdminChatMessages(orderId);
        }
    };

    // 6. ОФОРМЛЕННЯ ДЛЯ КЛИЕНТА (status.html)[cite: 37]
    const searchResult = document.getElementById('search-result');

    function getStatusClass(status) {
        if (status === 'Взяти на розгляд' || status === 'pending') return 'status-review';
        if (status === 'В розробку' || status === 'В розробці' || status === 'progress') return 'status-dev';
        if (status === 'Сдано' || status === 'Завершено' || status === 'completed') return 'status-done';
        return 'status-new';
    }

    function loadClientPersonalOrders() {
        if (!searchResult) return;

        const myPersonalOrderIds = JSON.parse(localStorage.getItem('my_personal_orders') || '[]');
        const allOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');

        const myOrders = allOrders.filter(o => myPersonalOrderIds.includes(o.id));

        if (myOrders.length === 0) {
            searchResult.innerHTML = `
                <div style="text-align: center; color: var(--text-dim); padding: 50px 20px; background: var(--card-bg); border-radius: 16px; border: 1px solid var(--border-color);">
                    <div style="font-size: 3rem; margin-bottom: 15px;">🛍️</div>
                    <h3 style="color: var(--text-color); margin-bottom: 10px;">У вас поки немає активних замовлень</h3>
                    <p style="font-size: 0.95rem; margin-bottom: 20px;">Оформіть замовлення на сторінці послуг, і воно автоматично з'явиться тут для відстеження та чату.</p>
                    <a href="forma.html" class="btn primary-btn btn-pulse">Замовити послугу</a>
                </div>
            `;
            return;
        }

        searchResult.innerHTML = myOrders.map(order => {
            const statusClass = getStatusClass(order.status || 'Новий');
            return `
                <div class="order-status-card">
                    <div class="order-card-header">
                        <div>
                            <span style="font-size: 0.85rem; color: var(--text-dim);">Замовлення від ${order.date}</span>
                            <h3 style="color: var(--text-color); font-size: 1.2rem; margin-top: 2px;">${order.name}</h3>
                        </div>
                        <span class="order-status-badge ${statusClass}" id="badge-status-${order.id}">
                            ● <span id="client-order-status-${order.id}">${order.status || 'Новий'}</span>
                        </span>
                    </div>

                    <div class="order-info-grid">
                        <div class="order-info-item">
                            <span>Обрані послуги</span>
                            <strong>${order.services && order.services.length > 0 ? order.services.join(', ') : 'Розробка'}</strong>
                        </div>
                        <div class="order-info-item">
                            <span>Сума замовлення</span>
                            <strong style="color: var(--accent-color);">${order.totalPrice || '0 грн'}</strong>
                        </div>
                        <div class="order-info-item">
                            <span>Контактні дані</span>
                            <strong>${order.contact}</strong>
                        </div>
                    </div>

                    <div class="chat-box">
                        <h4 style="margin-bottom: 12px; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                            💬 Чат з Адміністратором
                        </h4>
                        <div id="client-chat-msgs-${order.id}" class="chat-messages"></div>
                        <div class="chat-input-group">
                            <input type="text" id="client-chat-input-${order.id}" placeholder="Напишіть повідомлення адміну..." style="padding:12px; background:var(--card-bg); border:1px solid var(--border-color); color:var(--text-color); border-radius:8px; flex:1;">
                            <button onclick="sendClientMessage('${order.id}')" class="btn primary-btn">Надіслати</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        myOrders.forEach(o => {
            renderClientChatMessages(o.id);
        });
    }

    if (searchResult) {
        loadClientPersonalOrders();
    }

    function renderClientChatMessages(orderId) {
        const msgsBox = document.getElementById(`client-chat-msgs-${orderId}`);
        if (!msgsBox) return;

        let orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const order = orders.find(o => String(o.id) === String(orderId));

        if (!order || !order.messages || order.messages.length === 0) {
            msgsBox.innerHTML = '<p style="color:var(--text-dim); text-align:center; font-size:0.85rem; padding: 10px 0;">Залиште повідомлення для розробника...</p>';
            return;
        }

        msgsBox.innerHTML = order.messages.map(m => `
            <div class="chat-message ${m.sender}">
                <strong>${m.sender === 'client' ? 'Ви' : 'Адмін'}:</strong> ${m.text}
                <div style="font-size:0.65rem; color:var(--text-dim); text-align:right; margin-top:2px;">${m.time}</div>
            </div>
        `).join('');
        msgsBox.scrollTop = msgsBox.scrollHeight;
    }

    window.sendClientMessage = function(orderId) {
        const input = document.getElementById(`client-chat-input-${orderId}`);
        if (!input || !input.value.trim()) return;

        let orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const order = orders.find(o => String(o.id) === String(orderId));

        if (order) {
            if (!order.messages) order.messages = [];
            order.messages.push({
                sender: 'client',
                text: input.value.trim(),
                time: new Date().toLocaleTimeString("uk-UA", {hour: '2-digit', minute:'2-digit'})
            });

            localStorage.setItem('admin_orders', JSON.stringify(orders));
            input.value = '';
            renderClientChatMessages(orderId);
        }
    };

    // 7. Аккордеон FAQ[cite: 37]
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            item.classList.toggle('active');
        });
    });

    // 8. Инициализация графиков Chart.js для admin_3.html (если подключен Chart.js)
    if (typeof Chart !== 'undefined') {
        const ordersCtx = document.getElementById('ordersChart');
        if (ordersCtx) {
            const orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
            const totalOrders = orders.length;
            const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'Готово' || o.status === 'Завершено').length;
            const pendingOrders = totalOrders - completedOrders;

            new Chart(ordersCtx, {
                type: 'doughnut',
                data: {
                    labels: ['В работе / Обработка', 'Готово'],
                    datasets: [{
                        data: [pendingOrders || 1, completedOrders],
                        backgroundColor: ['#ffb74d', '#4caf50'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: 'inherit' } }
                    }
                }
            });
        }

        const servicesCtx = document.getElementById('servicesChart');
        if (servicesCtx) {
            new Chart(servicesCtx, {
                type: 'bar',
                data: {
                    labels: ['Сайт под ключ', 'Верстка', 'Дизайн', 'Скрипты'],
                    datasets: [{
                        label: 'Запросы',
                        data: [12, 8, 5, 7],
                        backgroundColor: '#00f2fe',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: 'inherit' }, grid: { display: false } },
                        y: { ticks: { color: 'inherit' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    }
                }
            });
        }
    }

    // Обработчики вкладок admin_3.html
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetTabId = link.getAttribute('data-tab');
            document.querySelectorAll('.admin-tab-content').forEach(tab => {
                tab.style.display = 'none';
                tab.classList.remove('active');
            });

            const targetTab = document.getElementById(targetTabId);
            if (targetTab) {
                targetTab.style.display = 'block';
                targetTab.classList.add('active');
            }
        });
    });

    const adminSearchInput = document.getElementById('adminSearchInput');
    const statusFilter = document.getElementById('statusFilter');
    if (adminSearchInput) adminSearchInput.addEventListener('input', renderKanbanBoard);
    if (statusFilter) statusFilter.addEventListener('change', renderKanbanBoard);

    // Экспорт JSON
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('admin_orders') || '[]');
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "angel_studio_orders.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast("Дані успішно експортовані в JSON", "success");
        });
    }

    // Первичный вызов канбана
    renderKanbanBoard();

    // 9. Авто-обновление чата и статусов[cite: 37]
    setInterval(() => {
        const myPersonalOrderIds = JSON.parse(localStorage.getItem('my_personal_orders') || '[]');
        const allOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');

        myPersonalOrderIds.forEach(orderId => {
            renderClientChatMessages(orderId);

            const statusElem = document.getElementById(`client-order-status-${orderId}`);
            const badgeElem = document.getElementById(`badge-status-${orderId}`);
            const orderData = allOrders.find(o => String(o.id) === String(orderId));
            
            if (statusElem && orderData) {
                const currentStatus = orderData.status || 'Новий';
                statusElem.textContent = currentStatus;
                
                if (badgeElem) {
                    badgeElem.className = `order-status-badge ${getStatusClass(currentStatus)}`;
                }
            }
        });

        if (activeChatOrderId) {
            renderAdminChatMessages(activeChatOrderId);
        }
    }, 1000);
});