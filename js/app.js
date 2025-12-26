// --- INITIALIZATION & COMPONENT LOADING ---
document.addEventListener("DOMContentLoaded", () => {
    const isAuth = window.location.pathname.includes('/authenticated/');
    const prefix = isAuth ? '../' : '';

    // Restore Nav and Footer loading
    loadComponent("nav-placeholder", prefix + "nav.html");
    loadComponent("footer-placeholder", prefix + "footer.html");

    // Sidebar and Data Rendering
    loadComponent("sidebar-placeholder", prefix + "authenticated/sidebar.html", () => {
        renderSidebar(); // Fill sidebar from memory after it loads
    });

    renderGrid(); // Fill the main grid from memory
});

function loadComponent(id, file, callback) {
    const element = document.getElementById(id);
    if (!element) return; 
    fetch(file).then(res => res.text()).then(data => {
        element.innerHTML = data;
        if (window.lucide) lucide.createIcons();
        if (callback) callback();
    });
}

// --- SESSION DATA HELPERS ---
function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// --- MODAL CONTROLS ---
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

// --- RENDERING LOGIC ---
function renderSidebar() {
    const sideList = document.getElementById('sidebar-semesters-list');
    if (!sideList) return;
    
    const semesters = getData('sf_semesters');
    sideList.innerHTML = '';
    semesters.forEach(sem => {
        const item = document.createElement('a');
        item.href = "semester.html";
        item.className = "nav-item";
        item.setAttribute('data-id', sem.id);
        item.innerHTML = `<i data-lucide="calendar" class="icon-sm"></i><span>${sem.name}</span>`;
        sideList.appendChild(item);
    });
    if (window.lucide) lucide.createIcons();
}

function renderGrid() {
    const semGrid = document.getElementById('semester-grid');
    const modGrid = document.getElementById('module-grid');
    const lecGrid = document.getElementById('lecture-grid');

    if (semGrid) {
        const data = getData('sf_semesters');
        if (data.length === 0) {
            semGrid.innerHTML = `
                <div id="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 0;">
                    <i data-lucide="calendar" style="width: 48px; height: 48px; color: #EBEBE9; margin-bottom: 16px;"></i>
                    <h2 style="color: var(--notion-secondary);">No semesters yet</h2>
                    <p style="color: var(--notion-secondary); margin-top: 8px;">Add your first semester to start organizing modules.</p>
                </div>`;
        } else {
            semGrid.innerHTML = '';
            data.forEach(item => appendSemesterCard(item));
        }
    }

    if (modGrid) {
        const data = getData('sf_modules');
        if (data.length === 0) {
            modGrid.innerHTML = `
                <div id="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 0;">
                    <i data-lucide="book" style="width: 48px; height: 48px; color: #EBEBE9; margin-bottom: 16px;"></i>
                    <h2 style="color: var(--notion-secondary);">No modules yet</h2>
                    <p style="color: var(--notion-secondary); margin-top: 8px;">Click "+ New Module" to start adding subjects.</p>
                </div>`;
        } else {
            modGrid.innerHTML = '';
            data.forEach(item => appendModuleCard(item));
        }
    }

    if (lecGrid) {
        const data = getData('sf_lectures');
        if (data.length === 0) {
            lecGrid.innerHTML = `
                <div id="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 0;">
                    <i data-lucide="mic" style="width: 48px; height: 48px; color: #EBEBE9; margin-bottom: 16px;"></i>
                    <h2 style="color: var(--notion-secondary);">No lectures yet</h2>
                    <p style="color: var(--notion-secondary); margin-top: 8px;">Upload a lecture recording or YouTube link to start.</p>
                </div>`;
        } else {
            lecGrid.innerHTML = '';
            data.forEach(item => appendLectureCard(item));
        }
    }
    if (window.lucide) lucide.createIcons();
}

// --- ADD FUNCTIONS ---
function addSemester() {
    const nameEl = document.getElementById('sem-name');
    const startEl = document.getElementById('sem-start');
    const endEl = document.getElementById('sem-end');
    const descEl = document.getElementById('sem-desc');

    if (!nameEl.value) return alert("Name required");

    const newSem = { id: 'sem-' + Date.now(), name: nameEl.value, start: startEl.value, end: endEl.value, desc: descEl.value };
    const semesters = getData('sf_semesters');
    semesters.push(newSem);
    saveData('sf_semesters', semesters);

    nameEl.value = ''; startEl.value = ''; endEl.value = ''; descEl.value = '';
    renderGrid();
    renderSidebar();
    closeModal('semester-modal');
}

function addModule() {
    const nameEl = document.getElementById('mod-name');
    const descEl = document.getElementById('mod-desc');

    if (!nameEl.value) return alert("Name required");

    const newMod = { id: 'mod-' + Date.now(), name: nameEl.value, desc: descEl.value };
    const modules = getData('sf_modules');
    modules.push(newMod);
    saveData('sf_modules', modules);

    nameEl.value = ''; descEl.value = '';
    renderGrid();
    closeModal('module-modal');
}

function addLecture() {
    const titleEl = document.getElementById('lecture-title');
    const dateEl = document.getElementById('lecture-date');

    if (!titleEl.value) return alert("Title required");

    const newLec = { id: 'lec-' + Date.now(), title: titleEl.value, date: dateEl.value };
    const lectures = getData('sf_lectures');
    lectures.push(newLec);
    saveData('sf_lectures', lectures);

    titleEl.value = ''; dateEl.value = '';
    renderGrid();
    closeModal('lecture-modal');
}

// --- REMOVE & RESET ---
function removeSemester(id) {
    if (!confirm("Delete semester?")) return;
    const filtered = getData('sf_semesters').filter(s => s.id !== id);
    saveData('sf_semesters', filtered);
    renderGrid();
    renderSidebar();
}

function removeModule(id) {
    if (!confirm("Delete module?")) return;
    const filtered = getData('sf_modules').filter(m => m.id !== id);
    saveData('sf_modules', filtered);
    renderGrid();
}

function removeLecture(id) {
    if (!confirm("Delete lecture?")) return;
    const filtered = getData('sf_lectures').filter(l => l.id !== id);
    saveData('sf_lectures', filtered);
    renderGrid();
}

function resetDemo() {
    if (confirm("Are you sure? This will delete all session data.")) {
        localStorage.removeItem('sf_semesters');
        localStorage.removeItem('sf_modules');
        localStorage.removeItem('sf_lectures');
        window.location.href = 'dashboard.html';
    }
}

// --- CARD TEMPLATES ---
function appendSemesterCard(sem) {
    const grid = document.getElementById('semester-grid');
    const card = document.createElement('div');
    card.className = 'module-card';
    card.id = sem.id;
    card.innerHTML = `
        <button class="delete-btn" onclick="removeSemester('${sem.id}')"><i data-lucide="x" class="icon-sm"></i></button>
        <div class="module-icon"><i data-lucide="calendar"></i></div>
        <h3>${sem.name}</h3>
        <p class="module-description">${sem.desc || ''}</p>
        <div class="module-stats">${sem.start || 'TBD'} — ${sem.end || 'TBD'}</div>
        <a href="semester.html" class="btn-primary" style="margin-top: auto; width: 100%; text-align: center;">View Modules</a>
    `;
    grid.appendChild(card);
}

function appendModuleCard(mod) {
    const grid = document.getElementById('module-grid');
    const card = document.createElement('div');
    card.className = 'module-card';
    card.id = mod.id;
    card.innerHTML = `
        <button class="delete-btn" onclick="removeModule('${mod.id}')"><i data-lucide="x" class="icon-sm"></i></button>
        <div class="module-icon"><i data-lucide="book"></i></div>
        <h3>${mod.name}</h3>
        <p class="module-description">${mod.desc || ''}</p>
        <a href="lectures.html" class="btn-primary" style="margin-top: auto; width: 100%; text-align: center;">View Lectures</a>
    `;
    grid.appendChild(card);
}

function appendLectureCard(lec) {
    const grid = document.getElementById('lecture-grid');
    const card = document.createElement('div');
    card.className = 'module-card';
    card.id = lec.id;
    card.innerHTML = `
        <button class="delete-btn" onclick="removeLecture('${lec.id}')"><i data-lucide="x" class="icon-sm"></i></button>
        <div class="module-icon"><i data-lucide="mic"></i></div>
        <h3>${lec.title}</h3>
        <p class="module-description">${lec.date || 'No date set'}</p>
        <a href="lecture-detail.html" class="btn-primary" style="margin-top: auto; width: 100%; text-align: center;">Go to Class</a>
    `;
    grid.appendChild(card);
}

// --- ADD TO DOMCONTENTLOADED ---
// renderPapers();
// renderModuleInfo();

// --- PAST PAPERS LOGIC ---
function addPastPaper() {
    const title = document.getElementById('paper-title').value;
    const date = document.getElementById('paper-date').value;

    if (!title) return alert("Title required");

    const papers = getData('sf_papers');
    papers.push({ id: 'paper-' + Date.now(), title, date });
    saveData('sf_papers', papers);

    renderPapers();
    closeModal('paper-modal');
    document.getElementById('paper-title').value = '';
}

function renderPapers() {
    const list = document.getElementById('papers-list');
    if (!list) return;

    const papers = getData('sf_papers');
    if (papers.length === 0) {
        list.innerHTML = `<p style="color: var(--notion-secondary); font-size: 13px; text-align: center; padding: 20px;">No papers uploaded yet.</p>`;
        return;
    }

    list.innerHTML = papers.map(paper => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: white; border: 1px solid var(--notion-border); border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <i data-lucide="file" class="icon-sm" style="color: var(--brand-blue);"></i>
                <span style="font-weight: 500; font-size: 14px;">${paper.title}</span>
                <span style="font-size: 12px; color: var(--notion-secondary);">${paper.date}</span>
            </div>
            <button onclick="removePaper('${paper.id}')" style="background:none; border:none; color: #ef4444; cursor:pointer;">
                <i data-lucide="trash-2" class="icon-sm"></i>
            </button>
        </div>
    `).join('');
    lucide.createIcons();
}

function removePaper(id) {
    const filtered = getData('sf_papers').filter(p => p.id !== id);
    saveData('sf_papers', filtered);
    renderPapers();
}

// --- MODULE INFO LOGIC ---
function saveModuleInfo() {
    const text = document.getElementById('info-textarea').value;
    localStorage.setItem('sf_mod_info', text);
    renderModuleInfo();
    closeModal('info-modal');
}

function renderModuleInfo() {
    const preview = document.getElementById('module-info-preview');
    const textarea = document.getElementById('info-textarea');
    if (!preview) return;

    const savedInfo = localStorage.getItem('sf_mod_info');
    if (savedInfo) {
        preview.textContent = savedInfo;
        textarea.value = savedInfo;
    }
}

// --- UPDATED LECTURE CARD TEMPLATE ---
function appendLectureCard(lec) {
    const grid = document.getElementById('lecture-grid');
    const card = document.createElement('div');
    card.className = 'module-card';
    card.innerHTML = `
        <button class="delete-btn" onclick="removeLecture('${lec.id}')"><i data-lucide="x" class="icon-sm"></i></button>
        <div class="module-icon"><i data-lucide="mic"></i></div>
        <h3>${lec.title}</h3>
        <p class="module-description">${lec.date || 'No date set'}</p>
        <a href="lecture-detail.html" class="btn-primary" style="margin-top: auto; width: 100%; text-align: center;">
            Go to lecture
        </a>
    `;
    grid.appendChild(card);
}