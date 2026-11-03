(() => {
  const api = window.Storia;
  const cartApi = window.StoriaCart;
  const products = window.StoriaData.products;
  const stages = ['Pending', 'Preparing', 'Ready', 'Completed'];
  const productById = id => products.find(product => product.id === id);

  function updateAutoStatuses() {
    let changed = false;
    const orders = api.getOrders().map(order => {
      if (!order.autoStatus || order.status === 'Cancelled') return order;
      const elapsed = Date.now() - new Date(order.date).getTime();
      const next = elapsed >= 90000 ? 'Completed' : elapsed >= 45000 ? 'Ready' : elapsed >= 20000 ? 'Preparing' : 'Pending';
      if (next !== order.status) { order.status = next; changed = true; }
      return order;
    });
    if (changed) api.setOrders(orders);
  }

  function renderOrders() {
    const container = document.getElementById('orders-list');
    if (!container) return;
    updateAutoStatuses();
    const status = document.getElementById('order-status-filter')?.value || 'All';
    const sort = document.getElementById('order-sort')?.value || 'newest';
    const orders = api.getOrders().filter(order => status === 'All' || order.status === status);
    orders.sort((a, b) => sort === 'oldest' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));
    if (!orders.length) {
      container.innerHTML = '<div class="content-card empty-state"><h2>No orders found</h2><p>Try another status filter or place your first order.</p><a class="button" href="menu.html">Explore menu</a></div>';
      return;
    }
    container.innerHTML = orders.map(order => `<a class="order-card" href="order-details.html?id=${encodeURIComponent(order.id)}" aria-label="View order ${api.escapeHtml(order.id)}, ${order.status}, ${api.money(total(order))}">
      <div class="order-card-top"><div><h3>Order #${api.escapeHtml(order.id)}</h3><p>${api.formatDate(order.date)}</p></div><span class="status ${order.status.toLowerCase()}">${api.escapeHtml(order.status)}</span></div>
      <div class="order-card-bottom"><span>${order.items.reduce((sum, item) => sum + item.quantity, 0)} item${order.items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? '' : 's'}</span><strong>${api.money(total(order))}</strong></div>
    </a>`).join('');
  }

  function total(order) { return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0); }

  function setupCheckout() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    const addressField = document.getElementById('address-field');
    const addressInput = document.getElementById('customer-address');
    form.querySelectorAll('input[name="service"]').forEach(input => input.addEventListener('change', () => {
      const delivery = form.querySelector('input[name="service"]:checked')?.value === 'Delivery';
      addressField.hidden = !delivery;
      addressInput.required = delivery;
    }));
    form.addEventListener('submit', event => {
      event.preventDefault();
      const error = document.getElementById('checkout-error');
      error.hidden = true;
      const cart = api.getCart();
      if (!cart.length) {
        error.hidden = false;
        error.textContent = 'Your cart is empty. Add a menu item before checking out.';
        return;
      }
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const items = cart.map(item => {
        const product = productById(item.productId);
        const price = product.price + (product.sizes[item.size] || 0) + item.addons.length * 20;
        return { productId: product.id, name: product.name, size: item.size, addons: item.addons, quantity: item.quantity, price };
      });
      const orders = api.getOrders();
      const nextId = String(Math.max(1000, ...orders.map(order => Number(order.id) || 0)) + 1);
      const order = {
        id: nextId, date: new Date().toISOString(), status: 'Pending', payment: data.get('payment'),
        service: data.get('service'), customer: data.get('name').trim(), phone: data.get('phone').trim(),
        address: data.get('address')?.trim() || '', items, autoStatus: true
      };
      if (!api.setOrders([order, ...orders])) return;
      if (!api.setCart([])) return;
      api.toast('Your order has been placed!');
      location.href = `order-confirmation.html?id=${encodeURIComponent(order.id)}`;
    });
  }

  function renderConfirmation() {
    const container = document.getElementById('order-confirmation');
    if (!container) return;
    const id = new URLSearchParams(location.search).get('id');
    const order = api.getOrders().find(item => item.id === id);
    if (!order) {
      container.innerHTML = '<div class="content-card empty-state"><h2>We couldn’t find that order.</h2><p>It may have been cleared from this browser.</p><a class="button" href="menu.html">Back to menu</a></div>';
      return;
    }
    container.innerHTML = `<section class="content-card"><span class="eyebrow">Order confirmed</span><h2>Thanks for choosing Storia!</h2><p>Your order <strong>#${api.escapeHtml(order.id)}</strong> was placed ${api.formatDate(order.date)}. We’ll move it along as it’s prepared.</p><div class="detail-line"><span>Order type</span><strong>${api.escapeHtml(order.service)}</strong></div><div class="detail-line"><span>Payment method</span><strong>${api.escapeHtml(order.payment)}</strong></div><div class="detail-line"><span>Total</span><strong>${api.money(total(order))}</strong></div><div class="hero-actions"><a class="button" href="order-details.html?id=${encodeURIComponent(order.id)}">Next: Order details →</a><a class="button secondary" href="orders.html">Back to My Orders</a></div></section>`;
  }

  function renderOrderDetail() {
    const container = document.getElementById('order-detail');
    if (!container) return;
    updateAutoStatuses();
    const id = new URLSearchParams(location.search).get('id');
    const order = api.getOrders().find(item => item.id === id);
    if (!order) {
      container.innerHTML = '<div class="content-card empty-state"><h2>We couldn’t find that order.</h2><p>It may have been cleared from this browser.</p><a class="button" href="orders.html">Back to orders</a></div>';
      return;
    }
    const currentStage = stages.indexOf(order.status);
    const cancelled = order.status === 'Cancelled';
    const itemList = order.items.map(item => `<div class="detail-line"><div><strong>${api.escapeHtml(item.name)}</strong><br><small>${api.escapeHtml(item.size)}${item.addons?.length ? ` · ${item.addons.map(api.escapeHtml).join(', ')}` : ''} × ${item.quantity}</small></div><strong>${api.money(item.price * item.quantity)}</strong></div>`).join('');
    const timeline = stages.map((stage, index) => `<li class="${!cancelled && index <= currentStage ? 'is-done' : ''}">${stage}${stage === order.status ? '<time>Current status</time>' : ''}</li>`).join('');
    container.innerHTML = `<div class="order-detail-grid"><section class="content-card"><span class="eyebrow">Order #${api.escapeHtml(order.id)}</span><h2 style="margin:8px 0">${api.formatDate(order.date)}</h2><p><span class="status ${order.status.toLowerCase()}">${api.escapeHtml(order.status)}</span></p><h3>Items</h3>${itemList}<div class="detail-line"><strong>Total</strong><strong>${api.money(total(order))}</strong></div>
        <h3 style="margin-top:24px">Order progress</h3>${cancelled ? '<p class="form-error">This order was cancelled.</p>' : ''}<ol class="timeline">${timeline}</ol>
        <div class="hero-actions"><button class="button" type="button" data-reorder>Reorder</button>${order.status === 'Pending' ? '<button class="button secondary" type="button" data-cancel>Cancel Order</button>' : ''}<a class="button secondary" href="orders.html">Back to Orders</a></div>
      </section><aside class="content-card"><h3>Payment &amp; pickup</h3><div class="detail-line"><span>Payment method</span><strong>${api.escapeHtml(order.payment)}</strong></div><div class="detail-line"><span>Order type</span><strong>${api.escapeHtml(order.service)}</strong></div><div class="detail-line"><span>Customer</span><strong>${api.escapeHtml(order.customer)}</strong></div>${order.phone ? `<div class="detail-line"><span>Phone</span><strong>${api.escapeHtml(order.phone)}</strong></div>` : ''}${order.address ? `<div class="detail-line"><span>Delivery address</span><strong>${api.escapeHtml(order.address)}</strong></div>` : ''}</aside></div>`;

    container.querySelector('[data-reorder]')?.addEventListener('click', () => {
      const cart = api.getCart();
      order.items.forEach(item => {
        const product = productById(item.productId);
        if (product) cartApi.addProduct(product, { size: item.size, addons: item.addons, quantity: item.quantity });
      });
      api.toast('Your order has been added to the cart.');
      location.href = 'cart.html';
    });
    container.querySelector('[data-cancel]')?.addEventListener('click', () => {
      const latestOrders = api.getOrders();
      const latest = latestOrders.find(item => item.id === order.id);
      if (!latest || latest.status !== 'Pending') {
        api.toast('This order can no longer be cancelled.');
        renderOrderDetail();
        return;
      }
      latest.status = 'Cancelled';
      latest.autoStatus = false;
      api.setOrders(latestOrders);
      api.toast('Order cancelled.');
      renderOrderDetail();
    });
  }

  function setupContactForm() {
    document.getElementById('contact-form')?.addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      form.reset();
      api.toast('Thanks for your message! We’ll be in touch soon.');
      document.getElementById('contact-success').hidden = false;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupCheckout();
    setupContactForm();
    renderOrders();
    renderConfirmation();
    renderOrderDetail();
    document.getElementById('order-status-filter')?.addEventListener('change', renderOrders);
    document.getElementById('order-sort')?.addEventListener('change', renderOrders);
    window.setInterval(() => { updateAutoStatuses(); renderOrders(); renderOrderDetail(); }, 5000);
  });
  window.addEventListener('storia:orders-updated', () => { renderOrders(); renderOrderDetail(); });
})();
