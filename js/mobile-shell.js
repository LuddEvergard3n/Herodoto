/** Mobile navigation shell. Desktop markup and behavior remain untouched. */
export function initMobileShell() {
  const root = document.documentElement;
  if (!root.classList.contains('feature-mobileShellV8')) return;

  const container = document.querySelector('.container');
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('.main-content');
  if (!container || !sidebar || !main) return;

  const welcome = document.createElement('section');
  welcome.className = 'mobile-welcome';
  welcome.setAttribute('aria-labelledby', 'mobile-welcome-title');
  welcome.innerHTML = `
    <p class="mobile-kicker">Comece por uma pergunta</p>
    <h2 id="mobile-welcome-title">Explore a história por narrativas, tempo e conexões.</h2>
    <p>Escolha um caminho. O grafo continua disponível quando você quiser investigar livremente.</p>
    <div class="mobile-start-grid">
      <button type="button" data-mobile-action="questions"><strong>Perguntas geradoras</strong><span>Investigue um problema histórico.</span></button>
      <button type="button" data-mobile-action="timeline"><strong>Linha do tempo</strong><span>Percorra períodos e acontecimentos.</span></button>
      <a href="vozes-historia-v8.html"><strong>Vozes da História</strong><span>Converse com evidências.</span></a>
      <button type="button" data-mobile-action="graph"><strong>Explorar o grafo</strong><span>Veja relações entre entidades.</span></button>
    </div>`;
  main.prepend(welcome);

  const closeFilters = document.createElement('button');
  closeFilters.type = 'button';
  closeFilters.className = 'mobile-drawer-close';
  closeFilters.textContent = 'Fechar filtros';
  sidebar.prepend(closeFilters);

  const more = document.createElement('dialog');
  more.className = 'mobile-more';
  more.innerHTML = `
    <div class="mobile-more-head"><strong>Mais opções</strong><button type="button" data-close>Fechar</button></div>
    <nav aria-label="Mais opções">
      <a href="fontes.html">Fontes</a><a href="guia-professor.html">Guia do Professor</a>
      <a href="plano-aula.html">Plano de Aula</a><a href="sobre.html">Sobre</a><a href="ajuda.html">Ajuda</a>
    </nav>`;
  document.body.appendChild(more);

  const nav = document.createElement('nav');
  nav.className = 'mobile-bottom-nav';
  nav.setAttribute('aria-label', 'Navegação móvel');
  nav.innerHTML = `
    <button type="button" data-mobile-nav="explore" aria-current="page">Explorar</button>
    <button type="button" data-mobile-nav="timeline">Timeline</button>
    <button type="button" data-mobile-nav="search">Buscar</button>
    <a href="vozes-historia-v8.html">Vozes</a>
    <button type="button" data-mobile-nav="more">Mais</button>`;
  document.body.appendChild(nav);

  let drawerReturnFocus = null;
  const setCurrent = name => nav.querySelectorAll('[data-mobile-nav]').forEach(button => {
    if (button.dataset.mobileNav === name) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  const showWelcome = visible => welcome.classList.toggle('mobile-welcome-hidden', !visible);
  const openFilters = trigger => {
    drawerReturnFocus = trigger;
    sidebar.classList.add('mobile-drawer-open');
    closeFilters.focus();
  };
  const closeDrawer = () => {
    sidebar.classList.remove('mobile-drawer-open');
    drawerReturnFocus?.focus();
  };
  const openTimeline = () => { showWelcome(false); document.getElementById('btn-timeline')?.click(); setCurrent('timeline'); };
  const openQuestions = () => { showWelcome(false); document.getElementById('btn-questions')?.click(); };

  welcome.addEventListener('click', event => {
    const action = event.target.closest('[data-mobile-action]')?.dataset.mobileAction;
    if (action === 'timeline') openTimeline();
    if (action === 'questions') openQuestions();
    if (action === 'graph') { showWelcome(false); setCurrent('explore'); }
  });
  nav.addEventListener('click', event => {
    const button = event.target.closest('[data-mobile-nav]');
    if (!button) return;
    if (button.dataset.mobileNav === 'explore') { showWelcome(true); setCurrent('explore'); }
    if (button.dataset.mobileNav === 'timeline') openTimeline();
    if (button.dataset.mobileNav === 'search') {
      openFilters(button);
      requestAnimationFrame(() => document.getElementById('search-input')?.focus());
    }
    if (button.dataset.mobileNav === 'more') more.showModal();
  });
  closeFilters.addEventListener('click', closeDrawer);
  more.querySelector('[data-close]').addEventListener('click', () => more.close());
  more.addEventListener('click', event => { if (event.target === more) more.close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && sidebar.classList.contains('mobile-drawer-open')) closeDrawer();
  });
}
