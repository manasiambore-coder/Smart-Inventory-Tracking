// ─── DATA LAYER ──────────────────────────────────────────────────
let products = JSON.parse(localStorage.getItem('inv_products') || '[]');
let editIndex = -1;

// Save to LocalStorage
function save() {
  localStorage.setItem('inv_products', JSON.stringify(products));
}

// ─── ADD PRODUCT ─────────────────────────────────────────────────
function addProduct() {
  const name  = document.getElementById('inp-name').value.trim();
  const qty   = parseInt(document.getElementById('inp-qty').value);
  const price = parseFloat(document.getElementById('inp-price').value);

  if (!name)              return toast('⚠️ Please enter a product name.', 'warn');
  if (isNaN(qty)  || qty  < 0) return toast('⚠️ Enter a valid quantity.', 'warn');
  if (isNaN(price) || price < 0) return toast('⚠️ Enter a valid price.', 'warn');

  products.push({ name, qty, price });
  save();
  renderAll();

  document.getElementById('inp-name').value  = '';
  document.getElementById('inp-qty').value   = '';
  document.getElementById('inp-price').value = '';
  toast('✓ Product added successfully!', 'ok');
}

// ─── DELETE PRODUCT ───────────────────────────────────────────────
function deleteProduct(i) {
  products.splice(i, 1);
  save();
  renderAll();
  toast('🗑 Product removed.', 'ok');
}

// ─── OPEN EDIT MODAL ─────────────────────────────────────────────
function openEdit(i) {
  editIndex = i;
  const p = products[i];
  document.getElementById('edit-name').value  = p.name;
  document.getElementById('edit-qty').value   = p.qty;
  document.getElementById('edit-price').value = p.price;
  document.getElementById('edit-modal').classList.add('show');
}

function closeModal() {
  document.getElementById('edit-modal').classList.remove('show');
  editIndex = -1;
}

// ─── SAVE EDIT ────────────────────────────────────────────────────
function saveEdit() {
  if (editIndex < 0) return;
  const name  = document.getElementById('edit-name').value.trim();
  const qty   = parseInt(document.getElementById('edit-qty').value);
  const price = parseFloat(document.getElementById('edit-price').value);
  if (!name || isNaN(qty) || isNaN(price)) return toast('⚠️ Check all fields.', 'warn');

  products[editIndex] = { name, qty, price };
  save();
  closeModal();
  renderAll();
  toast('✓ Product updated!', 'ok');
}

// ─── RENDER TABLE ─────────────────────────────────────────────────
function renderTable() {
  const q = document.getElementById('search-inp').value.trim().toLowerCase();
  const f = document.getElementById('filter-sel').value;

  let filtered = products.map((p, i) => ({ ...p, i }));
  if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
  if (f === 'low') filtered = filtered.filter(p => p.qty < 5);
  if (f === 'ok')  filtered = filtered.filter(p => p.qty >= 5);

  const tbody = document.getElementById('product-tbody');
  const empty = document.getElementById('empty-msg');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = filtered.map(p => {
    const isLow  = p.qty < 5;
    const rowCls = isLow ? ' class="low-stock"' : '';
    const qtyCls = isLow ? 'qty-warn' : 'qty-ok';
    const restk  = isLow ? `<span class="restock-badge">Restock Needed</span>` : '';
    const total  = (p.qty * p.price).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    return `
      <tr${rowCls}>
        <td style="color:var(--text3);font-size:0.75rem">${p.i + 1}</td>
        <td><strong>${escHtml(p.name)}</strong>${restk}</td>
        <td><span class="qty-badge ${qtyCls}">${p.qty}</span></td>
        <td>₹${p.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
        <td style="color:var(--accent3);font-weight:500">₹${total}</td>
        <td>
          <div class="action-btns">
            <button class="btn-edit" onclick="openEdit(${p.i})">Edit</button>
            <button class="btn-del"  onclick="deleteProduct(${p.i})">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ─── RENDER DASHBOARD ─────────────────────────────────────────────
function renderDash() {
  const total = products.length;
  const low   = products.filter(p => p.qty < 5).length;
  const value = products.reduce((s, p) => s + p.qty * p.price, 0);
  const avg   = total > 0 ? products.reduce((s, p) => s + p.price, 0) / total : 0;

  const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');

  document.getElementById('d-total').textContent = total;
  document.getElementById('d-low').textContent   = low;
  document.getElementById('d-value').textContent = fmt(value);
  document.getElementById('d-avg').textContent   = fmt(avg);

  // Also update hero stats
  document.getElementById('hero-total').textContent = total;
  document.getElementById('hero-low').textContent   = low;
  document.getElementById('hero-val').textContent   = fmt(value);
}

function renderAll() {
  renderDash();
  renderTable();
}

// ─── AI ANALYSIS ENGINE ───────────────────────────────────────────
function runAnalysis() {
  if (products.length === 0) return toast('⚠️ Add some products first!', 'warn');

  const btn  = document.getElementById('ai-btn');
  const spin = document.getElementById('ai-spinner');
  const txt  = document.getElementById('ai-btn-text');
  const res  = document.getElementById('ai-results');

  btn.disabled = true;
  spin.style.display = 'block';
  txt.textContent = 'Analyzing…';
  res.classList.remove('show');

  // Simulated 1.8s delay for demo effect
  setTimeout(() => {
    const sorted     = [...products].sort((a, b) => b.qty * b.price - a.qty * a.price);
    const fastMovers = sorted.slice(0, Math.min(3, products.length));
    const lowItems   = products.filter(p => p.qty < 5);
    const deadStock  = products.filter(p => p.qty > 50);
    const highValue  = [...products].sort((a, b) => b.price - a.price).slice(0, 2);

    const suggestions = [];
    if (lowItems.length)  suggestions.push(`Reorder ${lowItems.map(p => p.name).join(', ')} immediately.`);
    if (deadStock.length) suggestions.push(`Consider discounting ${deadStock.map(p => p.name).join(', ')} to free up capital.`);
    if (highValue.length) suggestions.push(`Your highest-margin items are ${highValue.map(p => p.name).join(' & ')} — prioritize their availability.`);
    if (!suggestions.length) suggestions.push('Inventory looks balanced! Consider adding more product variety.');

    res.innerHTML = `
      <div class="ai-card">
        <div class="ai-card-icon">🚀</div>
        <div class="ai-card-title">Fast-Moving Items</div>
        <div class="ai-card-body">
          ${fastMovers.map(p => `<span class="ai-tag green">${escHtml(p.name)}</span>`).join('')}
          <p style="margin-top:8px">Highest stock-value presence in inventory.</p>
        </div>
      </div>
      <div class="ai-card">
        <div class="ai-card-icon">🔔</div>
        <div class="ai-card-title">Low Stock Alerts</div>
        <div class="ai-card-body">
          ${lowItems.length
            ? lowItems.map(p => `<span class="ai-tag red">${escHtml(p.name)} (${p.qty})</span>`).join('')
            : '<span style="color:var(--accent3)">✓ All items well-stocked</span>'}
          ${lowItems.length ? `<p style="margin-top:8px">${lowItems.length} item(s) need restocking.</p>` : ''}
        </div>
      </div>
      <div class="ai-card">
        <div class="ai-card-icon">📦</div>
        <div class="ai-card-title">Dead Stock</div>
        <div class="ai-card-body">
          ${deadStock.length
            ? deadStock.map(p => `<span class="ai-tag amber">${escHtml(p.name)} (${p.qty})</span>`).join('')
            : '<span style="color:var(--accent3)">✓ No overstock detected</span>'}
        </div>
      </div>
      <div class="ai-card">
        <div class="ai-card-icon">💡</div>
        <div class="ai-card-title">Suggestions</div>
        <div class="ai-card-body">
          ${suggestions.map(s => `<p style="margin-bottom:6px">→ ${s}</p>`).join('')}
        </div>
      </div>`;

    res.classList.add('show');
    btn.disabled = false;
    spin.style.display = 'none';
    txt.textContent = '✦ Re-analyze';
    toast('✦ Analysis complete!', 'ok');
  }, 1800);
}

// ─── TOAST NOTIFICATION ───────────────────────────────────────────
let toastTimer;
function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.borderColor = type === 'warn' ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.3)';
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ─── UTILITY ──────────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Close modal on outside click
document.getElementById('edit-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && document.activeElement.closest('#inventory .panel:first-child')) addProduct();
});

// ─── INIT ─────────────────────────────────────────────────────────
renderAll();

// Seed demo data on first load
if (products.length === 0) {
  products = [
    { name: 'USB-C Cable 2m',  qty: 34, price: 249  },
    { name: 'Wireless Earbuds', qty: 3,  price: 1299 },
    { name: 'Phone Stand',      qty: 18, price: 399  },
    { name: 'Power Bank 10k',   qty: 2,  price: 1799 },
    { name: 'Screen Protector', qty: 67, price: 149  },
  ];
  save();
  renderAll();
}