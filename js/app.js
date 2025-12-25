(function () {
  const dd = document.querySelector("[data-lang-dropdown]");
  if (!dd) return;

  const btn = dd.querySelector("[data-lang-button]");
  const menu = dd.querySelector("[data-lang-menu]");
  const label = dd.querySelector("[data-lang-label]");

  const saved = localStorage.getItem("sf_lang") || "EN";
  label.textContent = saved;

  function close() { menu.classList.remove("open"); }
  function toggle() { menu.classList.toggle("open"); }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle();
  });

  menu.querySelectorAll("[data-lang]").forEach(item => {
    item.addEventListener("click", () => {
      const lang = item.getAttribute("data-lang");
      label.textContent = lang;
      localStorage.setItem("sf_lang", lang);
      close();
    });
  });

  document.addEventListener("click", close);
})();

function loadComponent(id, file) {
    const element = document.getElementById(id);
    if (!element) return; 

    fetch(file)
        .then(res => res.text())
        .then(data => {
            element.innerHTML = data;
            if (window.lucide) lucide.createIcons();
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const isAuth = window.location.pathname.includes('/authenticated/');
    const prefix = isAuth ? '../' : '';

    loadComponent("nav-placeholder", prefix + "nav.html");
    loadComponent("footer-placeholder", prefix + "footer.html");
    loadComponent("sidebar-placeholder", prefix + "authenticated/sidebar.html");
});


function openModal() {
    document.getElementById('module-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('module-modal').style.display = 'none';
}

function addModule() {
    const nameEl = document.getElementById('module-name');
    const descEl = document.getElementById('module-desc');
    
    if (!nameEl.value) return alert("Please enter a name");

    // Check if we are currently on the dashboard
    const isDashboard = window.location.pathname.includes('dashboard.html');

    if (!isDashboard) {
        // Option A: Just redirect to dashboard to create it there
        window.location.href = './dashboard.html';
        return;
    }

    // Existing Dashboard logic (only runs if on dashboard.html)
    const grid = document.querySelector('.module-grid');
    const emptyState = document.getElementById('empty-state');
    if (emptyState) emptyState.remove();

    const cardId = 'module-' + Date.now();
    const newCard = document.createElement('div');
    newCard.className = 'module-card';
    newCard.id = cardId;
    
    newCard.innerHTML = `
        <button class="delete-btn" onclick="removeModule('${cardId}')">
            <i data-lucide="x" class="icon-sm"></i>
        </button>
        <div class="module-icon"><i data-lucide="book"></i></div>
        <h3>${nameEl.value}</h3>
        <p class="module-description">${descEl.value || 'No description provided.'}</p>
        <div class="module-stats">
            <span>0 Classes</span> | <span>0 Summaries</span>
        </div>
        <button class="btn-primary" style="margin-top: auto; width: fit-content; padding: 6px 12px; font-size: 12px;">
            View Classes
        </button>
    `;

    grid.appendChild(newCard);
    closeModal();
    lucide.createIcons();
    nameEl.value = '';
    descEl.value = '';
}

function removeModule(id) {
    if (confirm("Delete this module?")) {
        document.getElementById(id).remove();
        const sideItem = document.querySelector(`[data-id="${id}"]`);
        if (sideItem) sideItem.remove();

        // Check if grid is now empty to show the message again
        const grid = document.querySelector('.module-grid');
        if (grid.children.length === 0) {
            grid.innerHTML = `
                <div id="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 0;">
                    <i data-lucide="layout" style="width: 48px; height: 48px; color: #EBEBE9; margin-bottom: 16px;"></i>
                    <h2 style="color: var(--notion-secondary);">No modules yet</h2>
                    <p style="color: var(--notion-secondary); margin-top: 8px;">Click "+ New Module" in the sidebar to get started.</p>
                </div>
            `;
            lucide.createIcons();
        }
    }
}