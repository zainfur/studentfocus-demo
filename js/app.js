function loadComponent(id, file) {
    const element = document.getElementById(id);
    if (!element) return; 
    fetch(file).then(res => res.text()).then(data => {
        element.innerHTML = data;
        if (window.lucide) lucide.createIcons();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const isAuth = window.location.pathname.includes('/authenticated/');
    const prefix = isAuth ? '../' : '';
    loadComponent("sidebar-placeholder", prefix + "authenticated/sidebar.html");
});

function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal && id === 'semester-modal') {
        window.location.href = 'dashboard.html';
        return;
    }
    if (modal) modal.style.display = 'flex';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

// SEMESTER LOGIC
function addSemester() {
    const nameEl = document.getElementById('sem-name');
    const startEl = document.getElementById('sem-start');
    const endEl = document.getElementById('sem-end');
    const descEl = document.getElementById('sem-desc');

    if (!nameEl.value) return alert("Please enter a name");

    const semId = 'sem-' + Date.now();
    const grid = document.getElementById('semester-grid');
    if (grid) {
        const empty = document.getElementById('empty-state');
        if (empty) empty.remove();
        
        const card = document.createElement('div');
        card.className = 'module-card';
        card.id = semId;
        card.innerHTML = `
            <button class="delete-btn" onclick="removeSemester('${semId}')"><i data-lucide="x" class="icon-sm"></i></button>
            <div class="module-icon"><i data-lucide="calendar"></i></div>
            <h3>${nameEl.value}</h3>
            <p class="module-description">${descEl.value || 'No description'}</p>
            <div class="module-stats">${startEl.value} — ${endEl.value}</div>
            <a href="semester.html" class="btn-primary" style="margin-top: auto; width: 100%; text-align: center;">View Modules</a>
        `;
        grid.appendChild(card);
    }

    const sideList = document.getElementById('sidebar-semesters-list');
    if (sideList) {
        const item = document.createElement('a');
        item.href = "semester.html";
        item.className = "nav-item";
        item.setAttribute('data-id', semId);
        item.innerHTML = `<i data-lucide="calendar" class="icon-sm"></i><span>${nameEl.value}</span>`;
        sideList.appendChild(item);
    }

    nameEl.value = ''; startEl.value = ''; endEl.value = ''; descEl.value = '';
    closeModal('semester-modal');
    if (window.lucide) lucide.createIcons();
}

function removeSemester(id) {
    if (confirm("Delete this semester?")) {
        document.getElementById(id).remove();
        const sideItem = document.querySelector(`[data-id="${id}"]`);
        if (sideItem) sideItem.remove();
    }
}


function addModule() {
    const nameEl = document.getElementById('mod-name');
    const descEl = document.getElementById('mod-desc');

    if (!nameEl.value) return alert("Please enter a name");

    const modId = 'mod-' + Date.now();
    const grid = document.getElementById('module-grid');
    if (grid) {
        const empty = document.getElementById('empty-state');
        if (empty) empty.remove();
        
        const card = document.createElement('div');
        card.className = 'module-card';
        card.id = modId;
        card.innerHTML = `
            <button class="delete-btn" onclick="removeModule('${modId}')"><i data-lucide="x" class="icon-sm"></i></button>
            <div class="module-icon"><i data-lucide="book"></i></div>
            <h3>${nameEl.value}</h3>
            <p class="module-description">${descEl.value || 'No description'}</p>
            <a href="lectures.html" class="btn-primary" style="margin-top: auto; width: 100%; text-align: center;">View Lectures</a>
        `;
        grid.appendChild(card);
    }
    nameEl.value = ''; descEl.value = '';
    closeModal('module-modal');
    if (window.lucide) lucide.createIcons();
}

function removeModule(id) {
    if (confirm("Delete this module?")) {
        const card = document.getElementById(id);
        if (card) card.remove();

        const grid = document.getElementById('module-grid');
        if (grid && grid.children.length === 0) {
            grid.innerHTML = `
                <div id="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 0;">
                    <i data-lucide="book" style="width: 48px; height: 48px; color: #EBEBE9; margin-bottom: 16px;"></i>
                    <h2 style="color: var(--notion-secondary);">No modules yet</h2>
                    <p style="color: var(--notion-secondary); margin-top: 8px;">Click "+ New Module" to start adding subjects.</p>
                </div>
            `;
            lucide.createIcons();
        }
    }
}


// LECTURE LOGIC
function addLecture() {
    const titleEl = document.getElementById('lecture-title');
    const dateEl = document.getElementById('lecture-date');

    if (!titleEl.value) return alert("Please enter a title");

    const lecId = 'lec-' + Date.now();
    const grid = document.getElementById('lecture-grid');
    if (grid) {
        const empty = document.getElementById('empty-state');
        if (empty) empty.remove();
        
        const card = document.createElement('div');
        card.className = 'module-card';
        card.id = lecId;
        card.innerHTML = `
            <button class="delete-btn" onclick="removeLecture('${lecId}')"><i data-lucide="x" class="icon-sm"></i></button>
            <div class="module-icon"><i data-lucide="mic"></i></div>
            <h3>${titleEl.value}</h3>
            <p class="module-description">${dateEl.value || 'No date'}</p>
            <a href="lecture-detail.html" class="btn-primary" style="margin-top: auto; width: 100%; text-align: center;">Study Now</a>
        `;
        grid.appendChild(card);
    }
    titleEl.value = ''; dateEl.value = '';
    closeModal('lecture-modal');
    if (window.lucide) lucide.createIcons();
}

function removeLecture(id) {
    if (confirm("Delete this lecture?")) document.getElementById(id).remove();
}