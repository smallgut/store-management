// === common.js (rewritten with Cart + Checkout, inline editing/removing) ===
/* EXPECTED SCHEMA (as provided)
products(id, barcode, name, stock, price, vendor_id, batch_no, units)
customer_sales(id, customer_name, quantity, sale_date, selling_price, product_id)
product_batches(id, vendor_id, quantity, buy_in_price, remaining_quantity, created_at, batch_number, product_id)
vendor_loans(id, date, batch_no, product_id, vendor_id, quantity, selling_price)
vendor_sales(id, vendor_id, quantity, price, sale_date, buy_in_price, product_id)
vendors(id, name, address, contact_email, phone_number, contact)
*/

let supabaseClient = null;
let cart = [];

// Basic translations used by the page
const translations = {
  en: {
    'select-product': 'Select Product (or input barcode)',
    'batch-no': 'Batch No.',
    'no-products-found': 'No products found.',
    'cart': 'Cart',
    'total-cost': 'Total Cost',
    'checkout': 'Checkout',
    'sub-total': 'Sub-Total',
    'product-name': 'Product Name',
    'product-barcode': 'Product Barcode',
    'quantity': 'Quantity',
    'selling-price': 'Selling Price',
  },
  zh: {
    'select-product': '選擇產品（或輸入條碼）',
    'batch-no': '批號',
    'no-products-found': '未找到產品。',
    'cart': '購物車',
    'total-cost': '總成本',
    'checkout': '結賬',
    'sub-total': '小計',
    'product-name': '產品名稱',
    'product-barcode': '產品條碼',
    'quantity': '數量',
    'selling-price': '售價',
  }
};

function currentLang() {
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  return isChinese ? 'zh' : 'en';
}

function applyTranslations() {
  const lang = currentLang();
  document.querySelectorAll('[data-lang-key]').forEach(el => {
    const key = el.getAttribute('data-lang-key');
    if (translations[lang] && translations[lang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translations[lang][key];
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });
}

function toggleLanguage() {
  const body = document.getElementById('lang-body');
  if (body) body.classList.toggle('lang-zh');
  applyTranslations();
}

async function ensureSupabaseClient() {
  if (!supabaseClient) {
    if (!window.supabase || !window.supabaseUrl || !window.supabaseKey) {
      console.error('Supabase config missing: ensure window.supabaseUrl & window.supabaseKey are set.');
      throw new Error('Supabase config missing');
    }
    supabaseClient = window.supabase.createClient(window.supabaseUrl, window.supabaseKey);
  }
  return supabaseClient;
}

function showMessage(id, text, duration = 4000) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden');
  if (duration) setTimeout(() => el.classList.add('hidden'), duration);
}

function clearMessage(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
}

// ---------- Products & Batches ----------
async function populateProductDropdown() {
  console.log('Populating product dropdown...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    const { data: products, error } = await client
      .from('products')
      .select('id, barcode, name, stock, units, batch_no')
      .order('name', { ascending: true });
    if (error) throw error;

    const lang = currentLang();
    const productSelect = document.getElementById('product-select');
    if (productSelect) {
      productSelect.innerHTML = `<option value="">${translations[lang]['select-product']}</option>` +
        products.map(p => `<option value="${p.id}" data-barcode="${p.barcode}" data-stock="${p.stock}" data-units="${p.units}">${p.name} (${p.barcode}, Stock: ${p.stock})</option>`).join('');
    }

    const batchNoSelect = document.getElementById('batch-no');
    if (batchNoSelect) {
      batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>`;
    }
  } catch (err) {
    console.error('Error populating product dropdown:', err);
    const lang = currentLang();
    const errorEl = document.getElementById('error');
    if (errorEl) errorEl.textContent = `${translations[lang]['no-products-found']}: ${err.message}`;
  }
}

async function handleProductSelection(e) {
  const productId = e.target.value;
  if (!productId) return;
  try {
    const client = await ensureSupabaseClient();
    const { data: batches, error } = await client
      .from('product_batches')
      .select('batch_number, remaining_quantity')
      .eq('product_id', productId)
      .order('created_at', { ascending: true });
    if (error) throw error;

    const batchSelect = document.getElementById('batch-no');
    if (batchSelect) {
      batchSelect.innerHTML =
        `<option value="">${translations[currentLang()]['batch-no']}</option>` +
        batches.map(b => `<option value="${b.batch_number}" data-remaining="${b.remaining_quantity}">${b.batch_number} (Stock: ${b.remaining_quantity})</option>`).join('');
    }

    // Update stock display for the product
    const selectedOption = e.target.options[e.target.selectedIndex];
    const stockDisplay = document.getElementById('stock-display');
    if (stockDisplay && selectedOption?.dataset.stock) {
      stockDisplay.textContent = `On-hand stock: ${selectedOption.dataset.stock}`;
    }
  } catch (err) {
    console.error('Error loading batches:', err);
  }
}

async function handleBarcodeInput(e) {
  const barcode = e.target.value?.trim();
  if (!barcode) return;
  try {
    const client = await ensureSupabaseClient();
    const { data: product, error } = await client
      .from('products')
      .select('id, name, stock')
      .eq('barcode', barcode)
      .maybeSingle();
    if (error) throw error;
    if (!product) return;

    // Select product in dropdown
    const select = document.getElementById('product-select');
    if (select) {
      select.value = String(product.id);
      const stockDisplay = document.getElementById('stock-display');
      if (stockDisplay) stockDisplay.textContent = `On-hand stock: ${product.stock ?? 0}`;
    }

    // Load batches for that product
    const { data: batches, error: bErr } = await client
      .from('product_batches')
      .select('batch_number, remaining_quantity')
      .eq('product_id', product.id);
    if (bErr) throw bErr;

    const batchSelect = document.getElementById('batch-no');
    if (batchSelect) {
      batchSelect.innerHTML =
        `<option value="">${translations[currentLang()]['batch-no']}</option>` +
        (batches || []).map(b => `<option value="${b.batch_number}" data-remaining="${b.remaining_quantity}">${b.batch_number} (Stock: ${b.remaining_quantity})</option>`).join('');
    }
  } catch (err) {
    console.error('Barcode lookup failed:', err);
  }
}

// ---------- Cart ----------
function addItemToCart() {
  const productSelect = document.getElementById('product-select');
  const batchSelect = document.getElementById('batch-no');
  const qtyEl = document.getElementById('quantity');
  const priceEl = document.getElementById('selling-price');

  const productId = productSelect?.value;
  const productName = productSelect?.options[productSelect.selectedIndex]?.text?.split(' (')[0] ?? '';
  const productBarcode = productSelect?.options[productSelect.selectedIndex]?.dataset?.barcode ?? '';
  const batchNumber = batchSelect?.value;
  const remainingStr = batchSelect?.options[batchSelect.selectedIndex]?.dataset?.remaining ?? '';
  const remaining = remainingStr === '' ? null : parseInt(remainingStr, 10);
  const quantity = parseInt(qtyEl?.value || '0', 10);
  const sellingPrice = parseFloat(priceEl?.value || '0');

  if (!productId || !batchNumber || !quantity || !sellingPrice) {
    showMessage('error', 'Missing fields for cart item');
    return;
  }
  if (remaining !== null && quantity > remaining) {
    showMessage('error', `Quantity exceeds batch stock (${remaining}).`);
    return;
  }

  const subTotal = quantity * sellingPrice;
  cart.push({
    productId: Number(productId),
    productName,
    productBarcode,
    batchNumber,
    quantity,
    sellingPrice,
    subTotal
  });
  renderCart();

  // Reset inputs for convenience
  qtyEl.value = '';
  priceEl.value = '';
  batchSelect.value = '';
}

function renderCart() {
  const tbody = document.querySelector('#cart-table tbody');
  const rows = cart.map((item, idx) => {
    return `<tr>
      <td class="border p-2">${item.productName}</td>
      <td class="border p-2">${item.productBarcode || ''}</td>
      <td class="border p-2">${item.batchNumber}</td>
      <td class="border p-2">
        <input type="number" min="1" class="w-24 border rounded p-1" data-edit="qty" data-index="${idx}" value="${item.quantity}" />
      </td>
      <td class="border p-2">
        <input type="number" step="0.01" min="0" class="w-28 border rounded p-1" data-edit="price" data-index="${idx}" value="${item.sellingPrice}" />
      </td>
      <td class="border p-2">${(item.quantity * item.sellingPrice).toFixed(2)}</td>
      <td class="border p-2">
        <button class="px-2 py-1 bg-red-600 text-white rounded" data-remove="${idx}">Remove</button>
      </td>
    </tr>`;
  }).join('');
  tbody.innerHTML = rows;

  // Bind events for editing & removing
  tbody.querySelectorAll('input[data-edit]').forEach(input => {
    input.addEventListener('input', (ev) => {
      const i = Number(ev.target.getAttribute('data-index'));
      const field = ev.target.getAttribute('data-edit');
      if (field === 'qty') {
        const v = Math.max(1, parseInt(ev.target.value || '1', 10));
        cart[i].quantity = v;
      } else if (field === 'price') {
        const v = Math.max(0, parseFloat(ev.target.value || '0'));
        cart[i].sellingPrice = v;
      }
      cart[i].subTotal = cart[i].quantity * cart[i].sellingPrice;
      renderCart();
    });
  });

  tbody.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const i = Number(ev.target.getAttribute('data-remove'));
      cart.splice(i, 1);
      renderCart();
    });
  });

  const total = cart.reduce((sum, i) => sum + (i.quantity * i.sellingPrice), 0);
  const totalEl = document.getElementById('total-cost');
  if (totalEl) totalEl.textContent = total.toFixed(2);
}

// ---------- Checkout ----------
async function checkoutOrder() {
  if (!cart.length) {
    showMessage('error', 'Cart is empty.');
    return;
  }
  const customerName = document.getElementById('customer-name')?.value?.trim();
  const saleDate = document.getElementById('sale-date')?.value;
  if (!customerName || !saleDate) {
    showMessage('error', 'Customer name and sale date are required.');
    return;
  }

  const client = await ensureSupabaseClient();

  // Validate quantities against batch remaining before any write
  for (const item of cart) {
    const { data: batchRow, error: bErr } = await client
      .from('product_batches')
      .select('remaining_quantity')
      .eq('product_id', item.productId)
      .eq('batch_number', item.batchNumber)
      .maybeSingle();
    if (bErr) {
      showMessage('error', `Batch check failed for ${item.productName}: ${bErr.message}`);
      return;
    }
    const remaining = batchRow?.remaining_quantity ?? 0;
    if (item.quantity > remaining) {
      showMessage('error', `Not enough stock in batch ${item.batchNumber} (have ${remaining}, need ${item.quantity}).`);
      return;
    }
  }

  // Process items one by one (simple and safe). In a real app, use RPC/edge function for atomicity.
  for (const item of cart) {
    // 1) Insert sale (customer_sales has no batch field in your schema)
    const saleRow = {
      product_id: item.productId,
      quantity: item.quantity,
      selling_price: item.sellingPrice,
      sale_date: saleDate,
      customer_name: customerName
    };
    const { error: insErr } = await client.from('customer_sales').insert(saleRow);
    if (insErr) {
      showMessage('error', `Insert sale failed for ${item.productName}: ${insErr.message}`);
      return;
    }

    // 2) Decrement product_batches.remaining_quantity for chosen batch
    const { data: batchRow, error: bSelErr } = await client
      .from('product_batches')
      .select('id, remaining_quantity')
      .eq('product_id', item.productId)
      .eq('batch_number', item.batchNumber)
      .maybeSingle();
    if (bSelErr || !batchRow) {
      showMessage('error', `Batch not found for ${item.productName}`);
      return;
    }
    const newRemaining = Math.max(0, (batchRow.remaining_quantity ?? 0) - item.quantity);
    const { error: bUpdErr } = await client
      .from('product_batches')
      .update({ remaining_quantity: newRemaining })
      .eq('id', batchRow.id);
    if (bUpdErr) {
      showMessage('error', `Failed to update batch ${item.batchNumber}: ${bUpdErr.message}`);
      return;
    }

    // 3) Decrement products.stock
    const { data: prodRow, error: pSelErr } = await client
      .from('products')
      .select('id, stock')
      .eq('id', item.productId)
      .maybeSingle();
    if (pSelErr || !prodRow) {
      showMessage('error', `Product not found for ${item.productName}`);
      return;
    }
    const newStock = Math.max(0, (prodRow.stock ?? 0) - item.quantity);
    const { error: pUpdErr } = await client
      .from('products')
      .update({ stock: newStock })
      .eq('id', item.productId);
    if (pUpdErr) {
      showMessage('error', `Failed to update product stock: ${pUpdErr.message}`);
      return;
    }
  }

  showMessage('message', 'Checkout complete.');
  cart = [];
  renderCart();
  await loadCustomerSales();
}

// ---------- Sales Table ----------
async function loadCustomerSales() {
  try {
    const client = await ensureSupabaseClient();
    const { data: sales, error } = await client
      .from('customer_sales')
      .select('id, product_id, quantity, selling_price, sale_date, customer_name, products(name, barcode)')
      .order('sale_date', { ascending: false });
    if (error) throw error;

    const tbody = document.querySelector('#customer-sales-table tbody');
    if (!tbody) return;
    tbody.innerHTML = (sales || []).map(s => {
      const name = s.products?.name ?? '-';
      const barcode = s.products?.barcode ?? '-';
      const sub = (s.quantity ?? 0) * (s.selling_price ?? 0);
      const dateStr = s.sale_date ? new Date(s.sale_date).toISOString().slice(0,10) : '';
      return `<tr>
        <td class="border p-2">${name}</td>
        <td class="border p-2">${barcode}</td>
        <td class="border p-2">${s.quantity}</td>
        <td class="border p-2">${Number(s.selling_price).toFixed(2)}</td>
        <td class="border p-2">${sub.toFixed(2)}</td>
        <td class="border p-2">${dateStr}</td>
        <td class="border p-2">${s.customer_name ?? ''}</td>
      </tr>`;
    }).join('');
  } catch (err) {
    console.error('Failed to load customer sales:', err);
  }
}

// Expose functions to window for HTML inline listeners
window.applyTranslations = applyTranslations;
window.toggleLanguage = toggleLanguage;
window.populateProductDropdown = populateProductDropdown;
window.handleProductSelection = handleProductSelection;
window.handleBarcodeInput = handleBarcodeInput;
window.addItemToCart = addItemToCart;
window.checkoutOrder = checkoutOrder;
window.loadCustomerSales = loadCustomerSales;

console.log('common.js loaded (', new Date().toISOString(), ')');
