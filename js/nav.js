// nav.js — injects persistent bottom nav + shared styles
function injectNav(activePage) {
  const nav = document.createElement('nav');
  nav.id = 'bottom-nav';
  nav.innerHTML = `
    <a href="/dashboard.html" class="nav-item ${activePage==='dashboard'?'active':''}" aria-label="Dashboard">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      <span>Home</span>
    </a>
    <a href="/log.html" class="nav-item ${activePage==='log'?'active':''}" aria-label="Log">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
      <span>Log</span>
    </a>
    <a href="/progress.html" class="nav-item ${activePage==='progress'?'active':''}" aria-label="Progress">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      <span>Progress</span>
    </a>
    <a href="/levels.html" class="nav-item ${activePage==='levels'?'active':''}" aria-label="Levels">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      <span>Levels</span>
    </a>
    <a href="/profile.html" class="nav-item ${activePage==='profile'?'active':''}" aria-label="Profile">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>Profile</span>
    </a>
  `;
  document.body.appendChild(nav);

  const style = document.createElement('style');
  style.textContent = `
    #bottom-nav {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
      display: flex; align-items: center; justify-content: space-around;
      background: rgba(10,10,10,0.97);
      border-top: 0.5px solid rgba(255,255,255,0.08);
      padding: 8px 0 max(8px, env(safe-area-inset-bottom));
      backdrop-filter: blur(12px);
    }
    #bottom-nav .nav-item {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      color: rgba(255,255,255,0.35); text-decoration: none;
      font-size: 10px; letter-spacing: 0.04em;
      transition: color 0.2s; padding: 4px 12px;
    }
    #bottom-nav .nav-item.active { color: #c8ff00; }
    #bottom-nav .nav-item:hover { color: rgba(255,255,255,0.7); }
    body { padding-bottom: 80px; }
  `;
  document.head.appendChild(style);
}
