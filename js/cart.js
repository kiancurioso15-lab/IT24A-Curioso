(() => {
  const data = window.StoriaData;
  const api = window.Storia;
  const productById = id => data.products.find(product => product.id === id);

  function addProduct(product, selection = {}) {
    const size = selection.size || Object.keys(product.sizes)[0];
    const addons = [...(selection.addons || [])].sort();
    const key = `${product.id}:${size}:${addons.join(',')}`;
    const cart = api.getCart();
    const existing = cart.find(item => item.key === key);
    if (existing) existing.quantity += Number(selection.quantity || 1);
    else cart.push({ key, productId: product.id, size, addons, quantity: Number(selection.quantity || 1) });
    if (!api.setCart(cart)) return false;
    api.toast(`${product.name} added to your cart.`);
    return true;
  }

  function itemPrice(item) {
    const product = productById(item.productId);
    const addonPrice = item.addons.length * 20;
    return product.price + (product.sizes[item.size] || 0) + addonPrice;
  }

  function renderCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    const cart = api.getCart();
    const subtotal = cart.reduce((total, item) => total + itemPrice(item) * item.quantity, 0);
    const summary = document.getElementById('cart-summary');
    if (!cart.length) {
      container.innerHTML = '<div class="empty-state"><h2>Your cart is taking a little break.</h2><p>Find something lovely on the menu to get started.</p><a class="button" href="menu.html">Browse the menu</a></div>';
      if (summary) summary.hidden = true;
      return;
    }
    if (summary) summary.hidden = false;
    container.innerHTML = cart.map((item, index) => {
      const product = productById(item.productId);
      if (!product) return '';
      return `<article class="cart-row">
        <img src="${product.image}" alt="${api.escapeHtml(product.name)}">
        <div><h3>${api.escapeHtml(product.name)}</h3><small>${api.escapeHtml(item.size)}${item.addons.length ? ` · ${item.addons.map(api.escapeHtml).join(', ')}` : ''}</small>
          <div class="quantity" aria-label="Quantity for ${api.escapeHtml(product.name)}"><button type="button" data-quantity="-1" data-index="${index}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-quantity="1" data-index="${index}" aria-label="Increase quantity">+</button></div>
        </div><div><strong class="price">${api.money(itemPrice(item) * item.quantity)}</strong><button class="remove-button" type="button" data-remove="${index}" aria-label="Remove ${api.escapeHtml(product.name)}">Remove</button></div>
      </article>`;
    }).join('');
    document.getElementById('subtotal').textContent = api.money(subtotal);
    document.getElementById('total').textContent = api.money(subtotal);
  }

  function renderCheckoutSummary() {
    const container = document.getElementById('checkout-items');
    if (!container) return;
    const cart = api.getCart();
    const total = cart.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0);
    container.innerHTML = cart.length ? cart.map(item => {
      const product = productById(item.productId);
      return `<div class="summary-row"><span>${api.escapeHtml(product.name)} × ${item.quantity}</span><strong>${api.money(itemPrice(item) * item.quantity)}</strong></div>`;
    }).join('') : '<p>Your cart is empty. <a href="menu.html">Browse the menu</a>.</p>';
    const totalElement = document.getElementById('checkout-total');
    if (totalElement) totalElement.textContent = api.money(total);
  }

  document.addEventListener('click', event => {
    const quantity = event.target.closest('[data-quantity]');
    const remove = event.target.closest('[data-remove]');
    if (!quantity && !remove) return;
    const cart = api.getCart();
    if (quantity) {
      const item = cart[Number(quantity.dataset.index)];
      if (item) item.quantity = Math.max(1, item.quantity + Number(quantity.dataset.quantity));
    } else cart.splice(Number(remove.dataset.remove), 1);
    api.setCart(cart);
    renderCart();
  });
  document.addEventListener('DOMContentLoaded', () => { renderCart(); renderCheckoutSummary(); });
  window.addEventListener('storia:cart-updated', () => { renderCart(); renderCheckoutSummary(); });
  window.StoriaCart = { addProduct, itemPrice };
})();
