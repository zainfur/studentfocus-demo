// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    const isAuth = window.location.pathname.includes('/authenticated/');
    const prefix = isAuth ? '../' : '';

    // Load static components
    loadComponent("nav-placeholder", prefix + "nav.html");
    loadComponent("footer-placeholder", prefix + "footer.html");
    loadComponent("sidebar-placeholder", prefix + "authenticated/sidebar.html", () => {
        renderSidebar(); 
    });

    renderGrid(); 
    renderPapers();
    renderModuleInfo();

    // Character Counter Listener
    const infoTextarea = document.getElementById('info-textarea');
    if (infoTextarea) {
        infoTextarea.addEventListener('input', updateCharCount);
    }
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

// --- DATA HELPERS ---
function getData(key) { return JSON.parse(localStorage.getItem(key)) || []; }
function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

// --- MODALS ---
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

// --- SEMESTERS ---
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

function removeSemester(id) {
    if (!confirm("Delete semester?")) return;
    saveData('sf_semesters', getData('sf_semesters').filter(s => s.id !== id));
    renderGrid();
    renderSidebar();
}

// --- MODULES ---
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

function removeModule(id) {
    if (!confirm("Delete module?")) return;
    saveData('sf_modules', getData('sf_modules').filter(m => m.id !== id));
    renderGrid();
}

// --- LECTURES ---
function addLecture() {
    const titleEl = document.getElementById('lecture-title');
    const dateEl = document.getElementById('lecture-date');

    if (!titleEl.value) return alert("Title required");

    const lectures = getData('sf_lectures');
    lectures.push({ id: 'lec-' + Date.now(), title: titleEl.value, date: dateEl.value });
    saveData('sf_lectures', lectures);

    titleEl.value = ''; dateEl.value = '';
    renderGrid(); 
    closeModal('lecture-modal');
}

function removeLecture(id) {
    if (!confirm("Delete lecture?")) return;
    saveData('sf_lectures', getData('sf_lectures').filter(l => l.id !== id));
    renderGrid();
}

// --- PAST PAPERS ---
function addPastPaper() {
    const titleEl = document.getElementById('paper-title');
    const dateEl = document.getElementById('paper-date');
    if (!titleEl.value) return alert("Title required");

    const papers = getData('sf_papers');
    papers.push({ id: 'paper-' + Date.now(), title: titleEl.value, date: dateEl.value });
    saveData('sf_papers', papers);

    titleEl.value = ''; dateEl.value = '';
    renderPapers(); 
    closeModal('paper-modal');
}

function renderPapers() {
    const list = document.getElementById('papers-list');
    if (!list) return;
    const papers = getData('sf_papers');
    list.innerHTML = papers.length ? papers.map(p => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border: 1px solid var(--notion-border); border-radius: 8px;">
            <div style="display: flex; gap: 12px; align-items: center;">
                <i data-lucide="file" class="icon-sm" style="color: var(--brand-blue);"></i>
                <span style="font-weight: 500; font-size: 14px;">${p.title}</span> 
                <span style="font-size: 12px; color: var(--notion-secondary);">${p.date}</span>
            </div>
            <button onclick="removePaper('${p.id}')" style="background:none; border:none; color: #ef4444; cursor:pointer;"><i data-lucide="trash-2" class="icon-sm"></i></button>
        </div>`).join('') : '<p style="text-align:center; color: #a3a3a3; font-size: 13px;">No papers uploaded.</p>';
    if (window.lucide) lucide.createIcons();
}

function removePaper(id) {
    saveData('sf_papers', getData('sf_papers').filter(p => p.id !== id));
    renderPapers();
}

// --- MODULE INFO & COUNTER ---
function updateCharCount() {
    const textarea = document.getElementById('info-textarea');
    const countDisplay = document.getElementById('current-chars');
    if (textarea && countDisplay) {
        const len = textarea.value.length;
        countDisplay.textContent = len;
        countDisplay.style.color = len > 2500 ? "#ef4444" : "inherit";
    }
}

function saveModuleInfo() {
    const text = document.getElementById('info-textarea').value;
    localStorage.setItem('sf_mod_info', text);
    renderModuleInfo();
    closeModal('info-modal');
}

function renderModuleInfo() {
    const preview = document.getElementById('module-info-preview');
    const textarea = document.getElementById('info-textarea');
    const info = localStorage.getItem('sf_mod_info') || '';
    if (preview) preview.textContent = info || 'No syllabus information added yet.';
    if (textarea) textarea.value = info;
    updateCharCount();
}

// --- CORE RENDERING ---
function renderGrid() {
    const semGrid = document.getElementById('semester-grid');
    const modGrid = document.getElementById('module-grid');
    const lecGrid = document.getElementById('lecture-grid');

    if (semGrid) {
        const data = getData('sf_semesters');
        semGrid.innerHTML = '';
        if (data.length === 0) {
            semGrid.innerHTML = '<div id="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 0;"><i data-lucide="calendar" style="width: 48px; height: 48px; color: #EBEBE9; margin-bottom: 16px;"></i><h2 style="color: var(--notion-secondary);">No semesters yet</h2></div>';
        } else {
            data.forEach(item => appendSemesterCard(item));
        }
    }
    if (modGrid) {
        const data = getData('sf_modules');
        modGrid.innerHTML = '';
        if (data.length === 0) {
            modGrid.innerHTML = '<div id="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 0;"><i data-lucide="book" style="width: 48px; height: 48px; color: #EBEBE9; margin-bottom: 16px;"></i><h2 style="color: var(--notion-secondary);">No modules yet</h2></div>';
        } else {
            data.forEach(item => appendModuleCard(item));
        }
    }
    if (lecGrid) {
        const data = getData('sf_lectures');
        lecGrid.innerHTML = '';
        if (data.length === 0) {
            lecGrid.innerHTML = '<div id="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 0;"><i data-lucide="mic" style="width: 48px; height: 48px; color: #EBEBE9; margin-bottom: 16px;"></i><h2 style="color: var(--notion-secondary);">No lectures yet</h2></div>';
        } else {
            data.forEach(item => appendLectureCard(item));
        }
    }
    if (window.lucide) lucide.createIcons();
}

function appendSemesterCard(sem) {
    const grid = document.getElementById('semester-grid');
    if (!grid) return;

    const charLimit = 60;
    const description = sem.desc || 'No description provided.';
    const truncatedDesc = description.length > charLimit 
        ? description.substring(0, charLimit) + '...' 
        : description;

    const card = document.createElement('div');
    card.className = 'module-card';
    card.id = sem.id;
    card.innerHTML = `
        <button class="delete-btn" onclick="removeSemester('${sem.id}')">
            <i data-lucide="x" class="icon-sm"></i>
        </button>
        <div class="module-icon"><i data-lucide="calendar"></i></div>
        <h3>${sem.name}</h3>
        <p class="module-description">${truncatedDesc}</p>
        <div class="module-stats">${sem.start || 'TBD'} — ${sem.end || 'TBD'}</div>
        <a href="semester.html" class="btn-primary" style="margin-top: auto; width: 100%; text-align: center;">View Modules</a>
    `;
    grid.appendChild(card);
}

function appendLectureCard(lec) {
    const grid = document.getElementById('lecture-grid');
    if (!grid) return;

    const charLimit = 60;
    // For lectures, we often use the date as the sub-text/description
    const dateText = lec.date || 'No date set';
    const truncatedDate = dateText.length > charLimit 
        ? dateText.substring(0, charLimit) + '...' 
        : dateText;

    const card = document.createElement('div');
    card.className = 'module-card';
    card.id = lec.id;
    card.innerHTML = `
        <button class="delete-btn" onclick="removeLecture('${lec.id}')">
            <i data-lucide="x" class="icon-sm"></i>
        </button>
        <div class="module-icon"><i data-lucide="mic"></i></div>
        <h3>${lec.title}</h3>
        <p class="module-description">${truncatedDate}</p>
        <a href="lecture-detail.html" class="btn-primary" style="margin-top: auto; width: 100%; text-align: center;">Go to lecture</a>
    `;
    grid.appendChild(card);
}

function appendModuleCard(mod) {
    const grid = document.getElementById('module-grid');
    const card = document.createElement('div');
    card.className = 'module-card';
    card.id = mod.id;
    card.innerHTML = `<button class="delete-btn" onclick="removeModule('${mod.id}')"><i data-lucide="x" class="icon-sm"></i></button><div class="module-icon"><i data-lucide="book"></i></div><h3>${mod.name}</h3><p class="module-description">${mod.desc || ''}</p><a href="lectures.html" class="btn-primary" style="margin-top: auto; width: 100%; text-align: center;">View Lectures</a>`;
    grid.appendChild(card);
}

function renderSidebar() {
    const sideList = document.getElementById('sidebar-semesters-list');
    if (!sideList) return;
    const semesters = getData('sf_semesters');
    sideList.innerHTML = semesters.map(s => `<a href="semester.html" class="nav-item" data-id="${s.id}"><i data-lucide="calendar" class="icon-sm"></i><span>${s.name}</span></a>`).join('');
    if (window.lucide) lucide.createIcons();
}

function resetDemo() {
    if (confirm("Reset all session data?")) {
        localStorage.clear();
        window.location.href = 'dashboard.html';
    }
}

// --- LECTURE RESOURCE MANAGEMENT ---

function addDocument(event) {
    const files = event.target.files;
    if (!files.length) return;

    const docs = getData('sf_lecture_docs');
    const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    for (let file of files) {
        docs.push({
            id: 'doc-' + Date.now() + Math.random(),
            name: file.name,
            date: now
        });
    }

    saveData('sf_lecture_docs', docs);
    renderResources();
}

function addYoutubeVideo() {
    const urlEl = document.getElementById('yt-url');
    if (!urlEl.value) return alert("Please paste a YouTube link");

    const videos = getData('sf_lecture_yt');
    
    // Simple mock title logic
    const mockTitles = ["Core Lecture: Introduction", "Advanced Concepts Deep Dive", "Weekly Session Summary"];
    const randomTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];

    videos.push({
        id: 'yt-' + Date.now(),
        title: randomTitle + " (" + (urlEl.value.split('v=')[1]?.substring(0, 5) || "Linked Video") + ")"
    });

    saveData('sf_lecture_yt', videos);
    urlEl.value = '';
    renderResources();
}

function renderResources() {
    const docList = document.getElementById('doc-list');
    const ytList = document.getElementById('yt-list');

    if (docList) {
        const docs = getData('sf_lecture_docs');
        docList.innerHTML = docs.map(doc => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #FFFFFF; border-radius: 8px; border: 1px solid var(--notion-border);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i data-lucide="file-text" class="icon-sm" style="color: var(--brand-blue);"></i>
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 14px; font-weight: 600;">${doc.name}</span>
                        <span style="font-size: 11px; color: var(--notion-secondary);">Uploaded on ${doc.date}</span>
                    </div>
                </div>
                <button onclick="removeResource('sf_lecture_docs', '${doc.id}')" style="background:none; border:none; color: #ef4444; cursor:pointer; padding: 4px;">
                    <i data-lucide="trash-2" class="icon-sm"></i>
                </button>
            </div>
        `).join('');
    }

    if (ytList) {
        const videos = getData('sf_lecture_yt');
        ytList.innerHTML = videos.map(vid => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #FFFFFF; border-radius: 8px; border: 1px solid var(--notion-border);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i data-lucide="video" class="icon-sm" style="color: #FF0000;"></i>
                    <span style="font-size: 14px; font-weight: 600;">${vid.title}</span>
                </div>
                <button onclick="removeResource('sf_lecture_yt', '${vid.id}')" style="background:none; border:none; color: #ef4444; cursor:pointer; padding: 4px;">
                    <i data-lucide="trash-2" class="icon-sm"></i>
                </button>
            </div>
        `).join('');
    }

    if (window.lucide) lucide.createIcons();
}

function removeResource(key, id) {
    if (confirm("Remove this resource?")) {
        const items = getData(key).filter(item => item.id !== id);
        saveData(key, items);
        renderResources();
    }
}

// --- GENERATION SEQUENCE LOGIC ---

function startGeneration() {
    const prompt = document.getElementById('generate-prompt');
    const loading = document.getElementById('generate-loading');
    const progressFill = document.getElementById('progress-fill');
    const statusText = document.getElementById('loading-status');
    const artefacts = document.getElementById('artefacts-container');

    // 1. Switch UI states
    prompt.style.display = 'none';
    loading.style.display = 'block';

    const statuses = [
        { p: 20, t: "Analyzing transcripts..." },
        { p: 45, t: "Extracting key terminology..." },
        { p: 70, t: "Synthesizing podcast script..." },
        { p: 90, t: "Formatting flashcards..." },
        { p: 100, t: "Finalizing Suite!" }
    ];

    let step = 0;
    const interval = setInterval(() => {
        if (step < statuses.length) {
            progressFill.style.width = statuses[step].p + "%";
            statusText.textContent = statuses[step].t;
            step++;
        } else {
            clearInterval(interval);
            // 2. Reveal the Artefacts
            loading.style.display = 'none';
            artefacts.style.display = 'block';
            setTimeout(() => {
                artefacts.style.opacity = '1';
                // Scroll down to the results
                artefacts.scrollIntoView({ behavior: 'smooth' });
            }, 50);
        }
    }, 1200); // Adjust timing for the demo feel
}