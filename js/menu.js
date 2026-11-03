(() => {
  const { products } = window.StoriaData;
  const api = window.Storia;
  const categories = ['All', 'Coffee', 'Non-Coffee', 'Pastries', 'Meals'];
  let selectedCategory = 'All';
  let search = '';
  let selectedProduct = null;

  function productCard(product) {
    return `<article class="product-card" data-product-card="${product.id}">
      <button class="product-image-button" type="button" data-open-product="${product.id}" aria-label="View ${api.escapeHtml(product.name)} details"><img src="${product.image}" alt="${api.escapeHtml(product.name)}"></button>
      <div class="product-body"><span class="product-category">${api.escapeHtml(product.category)}</span><h3><button class="product-image-button" type="button" data-open-product="${product.id}">${api.escapeHtml(product.name)}</button></h3>
        <p>${api.escapeHtml(product.description)}</p><div class="product-bottom"><span class="price">From ${api.money(product.price)}</span><button class="button small" type="button" data-quick-add="${product.id}" aria-label="Add ${api.escapeHtml(product.name)} to cart">Add</button></div>
      </div>
    </article>`;
  }

  function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    const visible = products.filter(product => (selectedCategory === 'All' || product.category === selectedCategory) && `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(search));
    grid.innerHTML = visible.length ? visible.map(productCard).join('') : '<div class="empty-state"><h2>No matches just yet.</h2><p>Try a different search or category.</p></div>';
    const tabContainer = document.getElementById('filter-tabs');
    if (tabContainer) tabContainer.innerHTML = categories.map(category => `<button class="filter-tab" type="button" data-category="${category}" aria-pressed="${selectedCategory === category}">${category}</button>`).join('');
  }

  function openModal(product) {
    const backdrop = document.getElementById('product-modal');
    if (!backdrop) return;
    selectedProduct = product;
    lastFocusedElement = document.activeElement;
    const sizes = Object.entries(product.sizes).map(([size, addition], index) => `<label class="choice"><input type="radio" name="product-size" value="${api.escapeHtml(size)}" ${index === 0 ? 'checked' : ''}> ${api.escapeHtml(size)}${addition ? ` (+${api.money(addition)})` : ''}</label>`).join('');
    const addons = product.addons.map(addon => `<label class="choice"><input type="checkbox" name="product-addon" value="${api.escapeHtml(addon)}"> ${api.escapeHtml(addon)} (+${api.money(20)})</label>`).join('');
    backdrop.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" type="button" data-close-modal aria-label="Close dialog">×</button><img src="${product.image}" alt="${api.escapeHtml(product.name)}"><span class="product-category">${api.escapeHtml(product.category)}</span><h2 id="modal-title">${api.escapeHtml(product.name)}</h2><p>${api.escapeHtml(product.description)}</p><div class="modal-options"><div><span class="group-label">Choose a size</span><div class="choice-grid">${sizes}</div></div><div><span class="group-label">Add-ons</span><div class="choice-grid">${addons}</div></div></div><div class="modal-footer"><div class="quantity"><button type="button" data-modal-quantity="-1" aria-label="Decrease quantity">−</button><span id="modal-quantity">1</span><button type="button" data-modal-quantity="1" aria-label="Increase quantity">+</button></div><button class="button" type="button" data-modal-add>Add to cart · ${api.money(product.price)}</button></div></div>`;
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    backdrop.querySelector('.modal-close').focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const backdrop = document.getElementById('product-modal');
    if (!backdrop) return;
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    selectedProduct = null;
    lastFocusedElement?.focus();
  }

  let lastFocusedElement = null;

  document.addEventListener('input', event => {
    if (event.target.id === 'menu-search') {
      search = event.target.value.trim().toLowerCase();
      renderProducts();
    }
  });
  document.addEventListener('click', event => {
    const category = event.target.closest('[data-category]');
    const opener = event.target.closest('[data-open-product]');
    const quickAdd = event.target.closest('[data-quick-add]');
    const card = event.target.closest('[data-product-card]');
    if (category) {
      selectedCategory = category.dataset.category;
      renderProducts();
    } else if (opener) {
      const product = products.find(item => item.id === opener.dataset.openProduct);
      if (product) openModal(product);
    } else if (quickAdd) {
      const product = products.find(item => item.id === quickAdd.dataset.quickAdd);
      if (product) window.StoriaCart.addProduct(product);
    } else if (card && !event.target.closest('button, a, input')) {
      const product = products.find(item => item.id === card.dataset.productCard);
      if (product) openModal(product);
    } else if (event.target.closest('[data-close-modal]') || (event.target.id === 'product-modal')) closeModal();
    else if (event.target.closest('[data-modal-quantity]')) {
      const counter = document.getElementById('modal-quantity');
      counter.textContent = String(Math.max(1, Number(counter.textContent) + Number(event.target.closest('[data-modal-quantity]').dataset.modalQuantity)));
    } else if (event.target.closest('[data-modal-add]') && selectedProduct) {
      const size = document.querySelector('input[name="product-size"]:checked')?.value;
      const addons = [...document.querySelectorAll('input[name="product-addon"]:checked')].map(input => input.value);
      const quantity = Number(document.getElementById('modal-quantity').textContent);
      if (window.StoriaCart.addProduct(selectedProduct, { size, addons, quantity })) closeModal();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
    const modal = document.querySelector('#product-modal.is-open .modal');
    if (event.key === 'Tab' && modal) {
      const focusable = [...modal.querySelectorAll('button, input')].filter(element => !element.disabled);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('DOMContentLoaded', renderProducts);
})();
