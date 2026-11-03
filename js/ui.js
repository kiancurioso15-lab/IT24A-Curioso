(() => {
  const CART_KEY = 'storiaCart';
  const ORDERS_KEY = 'storiaOrders';

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error(`Unable to read ${key} from local storage.`, error);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Unable to save ${key} to local storage.`, error);
      toast('We could not save your changes. Please check your browser storage settings.');
      return false;
    }
    return true;
  }

  function getCart() { return read(CART_KEY, []); }
  function setCart(cart) {
    if (!write(CART_KEY, cart)) return false;
    window.dispatchEvent(new CustomEvent('storia:cart-updated'));
    return true;
  }
  function getOrders() {
    const orders = read(ORDERS_KEY, null);
    if (Array.isArray(orders)) return orders;
    const seeded = window.StoriaData.seedOrders.map(order => ({ ...order, autoStatus: false }));
    write(ORDERS_KEY, seeded);
    return seeded;
  }
  function setOrders(orders) {
    const success = write(ORDERS_KEY, orders);
    if (success) window.dispatchEvent(new CustomEvent('storia:orders-updated'));
    return success;
  }
  function money(amount) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
  }
  function formatDate(date) {
    return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }
  function toast(message) {
    let region = document.querySelector('.toast-region');
    if (!region) {
      region = document.createElement('div');
      region.className = 'toast-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      document.body.append(region);
    }
    const item = document.createElement('div');
    item.className = 'toast';
    item.textContent = message;
    region.append(item);
    window.setTimeout(() => item.remove(), 3200);
  }

  function renderShell() {
    const current = location.pathname.split('/').pop() || 'index.html';
    const links = [
      ['index.html', 'Home'],
      ['menu.html', 'Menu'],
      ['orders.html', 'My Orders'],
      ['about.html', 'Our Story'],
      ['contact.html', 'Contact']
    ];
    const header = document.querySelector('[data-site-header]');
    if (header) {
      header.innerHTML = `<div class="announcement">A little pause in your day, made with love &amp; good coffee</div>
        <header class="site-header"><nav class="nav shell" aria-label="Main navigation">
          <a class="brand" href="index.html" aria-label="Storia Cafe home"><span class="brand-mark" aria-hidden="true">s</span><span class="brand-name">storia<small>coffee · kitchen · stories</small></span></a>
          <button class="menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="primary-links">☰</button>
          <div class="nav-links" id="primary-links">${links.map(([href, label]) => `<a href="${href}" ${current === href ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</div>
          <div class="nav-actions"><button class="icon-button theme-toggle" type="button" aria-label="Switch to dark mode" title="Toggle color theme">☾</button><a class="cart-link" href="cart.html" aria-label="Shopping cart, 0 items">♧<span class="cart-badge" aria-hidden="true">0</span></a></div>
        </nav></header>`;
    }
    const footer = document.querySelector('[data-site-footer]');
    if (footer) {
      footer.innerHTML = `<footer class="site-footer"><div class="shell footer-grid">
        <div><a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">s</span><span class="brand-name">storia<small>coffee · kitchen · stories</small></span></a><p>A little corner for slow mornings, good coffee, and stories worth sharing.</p></div>
        <div><strong>Visit us</strong><p>National Highway, Balingasag<br>Misamis Oriental, Philippines<br>Daily, 8:00 AM – 8:00 PM</p></div>
        <div><strong>Explore</strong><div class="footer-links"><a href="menu.html">Menu</a><a href="orders.html">My Orders</a><a href="about.html">Our story</a><a href="contact.html">Contact</a><a href="https://instagram.com" aria-label="Storia Cafe on Instagram">Instagram ↗</a><a href="https://facebook.com" aria-label="Storia Cafe on Facebook">Facebook ↗</a></div></div>
      </div></footer>`;
    }

    document.querySelector('.menu-toggle')?.addEventListener('click', event => {
      const button = event.currentTarget;
      const linksElement = document.getElementById('primary-links');
      const open = linksElement.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });

    const themeButton = document.querySelector('.theme-toggle');
    const savedTheme = localStorage.getItem('storiaTheme');
    if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';
    updateThemeButton(themeButton);
    themeButton?.addEventListener('click', () => {
      const dark = document.documentElement.dataset.theme !== 'dark';
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      localStorage.setItem('storiaTheme', dark ? 'dark' : 'light');
      updateThemeButton(themeButton);
    });
  }

  function updateThemeButton(button) {
    if (!button) return;
    const dark = document.documentElement.dataset.theme === 'dark';
    button.textContent = dark ? '☀' : '☾';
    button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  }

  function updateBadge() {
    const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-badge');
    const link = document.querySelector('.cart-link');
    if (badge) badge.textContent = String(count);
    if (link) link.setAttribute('aria-label', `Shopping cart, ${count} item${count === 1 ? '' : 's'}`);
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderShell();
    getOrders();
    updateBadge();
    document.body.classList.add('fade-in');
  });
  window.addEventListener('storia:cart-updated', updateBadge);
  window.addEventListener('storage', updateBadge);

  window.Storia = { getCart, setCart, getOrders, setOrders, money, formatDate, escapeHtml, toast };
})();
