(() => {
  const products = [
    { id: 'espresso', name: 'House Espresso', category: 'Coffee', price: 95, description: 'A rich double shot with notes of dark chocolate and toasted almond.', image: 'images/coffee-latte.jpg', sizes: { Regular: 0, Large: 35 }, addons: ['Extra shot', 'Oat milk'] },
    { id: 'latte', name: 'Honey Oat Latte', category: 'Coffee', price: 145, description: 'Our smooth espresso, oat milk, and a touch of local honey.', image: 'images/coffee-latte.jpg', sizes: { Regular: 0, Large: 35 }, addons: ['Extra shot', 'Vanilla syrup'] },
    { id: 'cappuccino', name: 'Cappuccino', category: 'Coffee', price: 135, description: 'A balanced espresso with velvety steamed milk and soft foam.', image: 'images/drinks-menu.jpg', sizes: { Regular: 0, Large: 30 }, addons: ['Extra shot', 'Oat milk'] },
    { id: 'spanish-latte', name: 'Spanish Latte', category: 'Coffee', price: 150, description: 'Double espresso mellowed with creamy, lightly sweet milk.', image: 'images/drinks-menu.jpg', sizes: { Regular: 0, Large: 35 }, addons: ['Extra shot', 'Vanilla syrup'] },
    { id: 'matcha', name: 'Iced Matcha Cloud', category: 'Non-Coffee', price: 155, description: 'Bright ceremonial matcha over milk with a cool, creamy finish.', image: 'images/drinks-menu.jpg', sizes: { Regular: 0, Large: 35 }, addons: ['Oat milk', 'Vanilla syrup'] },
    { id: 'chocolate', name: 'Tablea Chocolate', category: 'Non-Coffee', price: 140, description: 'A comforting cup of locally made cacao, rich and gently bittersweet.', image: 'images/coffee-latte.jpg', sizes: { Regular: 0, Large: 30 }, addons: ['Oat milk', 'Whipped cream'] },
    { id: 'lemonade', name: 'Calamansi Cooler', category: 'Non-Coffee', price: 110, description: 'Fresh calamansi, a little honey, and plenty of ice.', image: 'images/drinks-menu.jpg', sizes: { Regular: 0, Large: 25 }, addons: ['Extra citrus', 'Sparkling water'] },
    { id: 'cheesecake', name: 'Basque Cheesecake', category: 'Pastries', price: 165, description: 'Creamy, softly caramelized cheesecake with a tender center.', image: 'images/storia-meal.jpg', sizes: { Slice: 0 }, addons: ['Add berries', 'Add cream'] },
    { id: 'croissant', name: 'Butter Croissant', category: 'Pastries', price: 95, description: 'Flaky, golden layers baked fresh each morning.', image: 'images/rice-menu.jpg', sizes: { Piece: 0 }, addons: ['Add jam', 'Add butter'] },
    { id: 'banana-bread', name: 'Banana Bread', category: 'Pastries', price: 105, description: 'A tender loaf with ripe banana, brown sugar, and toasted walnuts.', image: 'images/storia-meal.jpg', sizes: { Slice: 0 }, addons: ['Add cream', 'Add ice cream'] },
    { id: 'chicken-rice', name: 'Cafe Chicken Bowl', category: 'Meals', price: 225, description: 'Golden chicken, garlic rice, and a bright house-made dressing.', image: 'images/rice-menu.jpg', sizes: { Regular: 0, Large: 65 }, addons: ['Add egg', 'Extra rice'] },
    { id: 'pasta', name: 'Creamy Mushroom Pasta', category: 'Meals', price: 245, description: 'Slow-cooked mushrooms and herbs folded into a creamy pasta.', image: 'images/storia-meal.jpg', sizes: { Regular: 0, Large: 70 }, addons: ['Add chicken', 'Add parmesan'] },
    { id: 'toast', name: 'Avocado Garden Toast', category: 'Meals', price: 195, description: 'Sourdough toast, smashed avocado, greens, and a lemony finish.', image: 'images/rice-menu.jpg', sizes: { Regular: 0 }, addons: ['Add egg', 'Add feta'] }
  ];

  const seedOrders = [
    { id: '1001', date: '2026-10-25T09:30:00+08:00', status: 'Completed', payment: 'Cash', service: 'Dine-in', customer: 'Alex Santos', items: [{ productId: 'latte', name: 'Honey Oat Latte', size: 'Regular', addons: [], quantity: 2, price: 145 }, { productId: 'croissant', name: 'Butter Croissant', size: 'Piece', addons: [], quantity: 1, price: 95 }] },
    { id: '1002', date: '2026-10-26T14:12:00+08:00', status: 'Completed', payment: 'GCash', service: 'Takeout', customer: 'Alex Santos', items: [{ productId: 'matcha', name: 'Iced Matcha Cloud', size: 'Regular', addons: [], quantity: 1, price: 155 }, { productId: 'cheesecake', name: 'Basque Cheesecake', size: 'Slice', addons: [], quantity: 2, price: 165 }] },
    { id: '1003', date: '2026-10-27T10:05:00+08:00', status: 'Ready', payment: 'Cash', service: 'Dine-in', customer: 'Alex Santos', items: [{ productId: 'espresso', name: 'House Espresso', size: 'Regular', addons: [], quantity: 1, price: 95 }] },
    { id: '1004', date: '2026-10-28T11:40:00+08:00', status: 'Preparing', payment: 'Card', service: 'Takeout', customer: 'Alex Santos', items: [{ productId: 'chicken-rice', name: 'Cafe Chicken Bowl', size: 'Regular', addons: ['Add egg'], quantity: 1, price: 255 }] },
    { id: '1005', date: '2026-10-28T12:15:00+08:00', status: 'Pending', payment: 'GCash', service: 'Delivery', customer: 'Alex Santos', items: [{ productId: 'spanish-latte', name: 'Spanish Latte', size: 'Large', addons: [], quantity: 1, price: 185 }] }
  ];

  window.StoriaData = { products, seedOrders };
})();
