let supabaseClient = null;
let cart = [];

const translations = {
  en: {
    'nav-home': 'Home',
    'nav-analytics': 'Analytics',
    'nav-manage-products': 'Manage Products',
    'nav-manage-vendors': 'Manage Vendors',
    'nav-record-customer-sales': 'Record Customer Sales',
    'nav-vendor-loan-record': 'Vendor Loan Record',
    'toggle-language': 'Toggle Language',
    'record-customer-sales': 'Record Customer Sales',
    'add-customer-sale': 'Add Customer Sale',
    'select-product': 'Select Product (or input barcode)',
    'product-barcode': 'Product Barcode',
    'batch-no': 'Batch No.',
    'customer-name': 'Customer Name',
    'quantity': 'Quantity',
    'selling-price': 'Selling Price',
    'add-item': 'Add Item',
    'cart': 'Cart',
    'total-cost': 'Total Cost',
    'checkout': 'Checkout',
    'customer-sales': 'Customer Sales',
    'product-name': 'Product Name',
    'profit': 'Profit',
    'sale-date': 'Sale Date',
    'actions': 'Actions',
    'add-product': 'Add Product',
    'stock': 'Stock',
    'units': 'Units',
    'unit-box': 'box',
    'unit-taijin': 'Taijin',
    'select-unit': '-- Select Unit --',
    'buy-in-price': 'Buy-In Price',
    'inventory-value': 'Inventory Value',
    'add-vendor': 'Add Vendor',
    'vendor-name': 'Vendor Name',
    'vendor-contact': 'Vendor Contact',
    'manage-products': 'Manage Products',
    'manage-vendors': 'Manage Vendors',
    'add-loan-record': 'Add Loan Record',
    'loan-amount': 'Loan Amount',
    'loan-date': 'Loan Date',
    'vendor-loan': 'Vendor Loan',
    'no-products-found': 'No products found.',
    'no-vendors-found': 'No vendors found.',
    'no-loan-records-found': 'No loan records found.',
    'unknown-product': 'Unknown Product',
    'no-customer-sales-found': 'No customer sales found.',
    'delete-confirm': 'Delete this record?',
    'update': 'Update',
    'sub-total': 'Sub-Total',
    'add-loan': 'Add Loan',
    'on-hand-stock': 'On-Hand Stock',
    'generate-report': 'Generate Report',
    'start-date': 'Start Date',
    'end-date': 'End Date',
    'product-report': 'Product Report',
    'vendor-loan-report': 'Vendor Loan Report',
    'customer-sales-report': 'Customer Sales Report',
    'all-customers': '-- All Customers --',
    'all-vendors': '-- All Vendors --',
    'unknown-vendor': 'Unknown Vendor',
    'delete': 'Delete'
  },
  zh: {
    'nav-home': '首頁',
    'nav-analytics': '分析',
    'nav-manage-products': '管理產品',
    'nav-manage-vendors': '管理供應商',
    'nav-record-customer-sales': '記錄客戶銷售',
    'nav-vendor-loan-record': '供應商貸貨記錄',
    'toggle-language': '切換語言',
    'record-customer-sales': '記錄客戶銷售',
    'add-customer-sale': '添加客戶銷售',
    'select-product': '選擇產品（或輸入條碼）',
    'product-barcode': '產品條碼',
    'batch-no': '批號',
    'customer-name': '客戶名稱',
    'quantity': '數量',
    'selling-price': '售價',
    'add-item': '添加項目',
    'cart': '購物車',
    'total-cost': '總成本',
    'checkout': '結賬',
    'customer-sales': '客戶銷售',
    'product-name': '產品名稱',
    'profit': '利潤',
    'sale-date': '銷售日期',
    'actions': '操作',
    'add-product': '添加產品',
    'stock': '庫存',
    'units': '單位',
    'unit-box': '箱',
    'unit-taijin': '台斤',
    'select-unit': '-- 選擇單位 --',
    'buy-in-price': '進貨價',
    'inventory-value': '庫存價值',
    'add-vendor': '添加供應商',
    'vendor-name': '供應商名稱',
    'vendor-contact': '供應商聯繫方式',
    'manage-products': '管理產品',
    'manage-vendors': '管理供應商',
    'add-loan-record': '添加貸貨記錄',
    'loan-amount': '貸貨金額',
    'loan-date': '貸貨日期',
    'vendor-loan': '供應商貸貨',
    'no-products-found': '未找到產品。',
    'no-vendors-found': '未找到供應商。',
    'no-loan-records-found': '未找到貸貨記錄。',
    'unknown-product': '未知產品',
    'no-customer-sales-found': '未找到客戶銷售記錄。',
    'delete-confirm': '刪除此記錄？',
    'update': '更新',
    'sub-total': '小計',
    'add-loan': '添加貸貨',
    'on-hand-stock': '現有庫存',
    'generate-report': '生成報告',
    'start-date': '開始日期',
    'end-date': '結束日期',
    'product-report': '產品報告',
    'vendor-loan-report': '供應商貸貨報告',
    'customer-sales-report': '客戶銷售報告',
    'all-customers': '-- 所有客戶 --',
    'all-vendors': '-- 所有供應商 --',
    'unknown-vendor': '未知供應商',
    'delete': '刪除'
  }
};

// --- Language / Translations ---
function applyTranslations() {
console.log('Applying translations...', new Date().toISOString());
const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
const lang = isChinese ? 'zh' : 'en';
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
console.log('Applied translations for:', lang, new Date().toISOString());
}


function toggleLanguage() {
const body = document.getElementById('lang-body');
if (body.classList.contains('lang-zh')) {
body.classList.remove('lang-zh');
} else {
body.classList.add('lang-zh');
}
applyTranslations();
}

// --- Supabase Client ---
let supabaseClient;
async function ensureSupabaseClient() {
if (!supabaseClient) {
console.log('Ensuring Supabase client...');
supabaseClient = window.supabase.createClient(
window.supabaseUrl,
window.supabaseKey
);
console.log('Supabase Client Initialized in common.js:', Object.keys(supabaseClient));
}
return supabaseClient;
}

function setLoading(isLoading) {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = isLoading ? 'block' : 'none';
}

function clearMessage(elementId, timeout = 5000) {
  setTimeout(() => {
    const el = document.getElementById(elementId);
    if (el) el.textContent = '';
  }, timeout);
}

function getGMT8DateTime() {
  const date = new Date();
  const offset = 8 * 60;
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const gmt8 = new Date(utc + (3600000 * offset));
  return gmt8.toISOString().slice(0, 16);
}

// --- Product Dropdown ---
async function populateProductDropdown() {
console.log('Populating product dropdown...', new Date().toISOString());
try {
const client = await ensureSupabaseClient();
const { data: products, error } = await client
.from('products')
.select('id, barcode, name, stock, units, batch_no'); // ✅ use batch_no here
if (error) throw error;
console.log('Products for dropdown:', products, new Date().toISOString());


const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
const lang = isChinese ? 'zh' : 'en';


const productSelect = document.getElementById('product-select');
if (productSelect) {
productSelect.innerHTML = `<option value="">${translations[lang]['select-product']}</option>` +
products.map(p => `<option value="${p.id}" data-barcode="${p.barcode}" data-stock="${p.stock}" data-units="${p.units}">${p.name} (${p.barcode}, ${translations[lang][`unit-${p.units?.toLowerCase()}`] || p.units}, Stock: ${p.stock})</option>`).join('');
}


const batchNoSelect = document.getElementById('batch-no');
if (batchNoSelect) {
batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>`;
}
} catch (error) {
console.error('Error populating product dropdown:', error.message, new Date().toISOString());
const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
const lang = isChinese ? 'zh' : 'en';
const errorEl = document.getElementById('error');
if (errorEl) {
errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-products-found']}: ${error.message}`;
clearMessage('error', 10000);
}
}
}

// --- Batch Dropdown ---
async function handleProductSelection(e) {
const productId = e.target.value;
if (!productId) return;
const client = await ensureSupabaseClient();
const { data: batches, error } = await client
.from('product_batches')
.select('batch_number, remaining_quantity') // ✅ use batch_number here
.eq('product_id', productId);
if (error) {
console.error('Error fetching batches:', error);
return;
}
const batchNoSelect = document.getElementById('batch-no');
if (batchNoSelect) {
batchNoSelect.innerHTML = `<option value="">Select Batch</option>` +
batches.map(b => `<option value="${b.batch_number}" data-remaining="${b.remaining_quantity}">${b.batch_number} (Stock: ${b.remaining_quantity})</option>`).join('');
}
}

// --- Barcode Input ---
async function handleBarcodeInput(e) {
const barcode = e.target.value;
if (!barcode) return;
const client = await ensureSupabaseClient();
const { data: product, error } = await client
.from('products')
.select('id')
.eq('barcode', barcode)
.single();
if (error) {
console.error('Error finding product by barcode:', error);
return;
}
const { data: batches, error: batchError } = await client
.from('product_batches')
.select('batch_number, remaining_quantity') // ✅ use batch_number here
.eq('product_id', product.id);
if (batchError) {
console.error('Error fetching batches for barcode:', batchError);
return;
}
const batchNoSelect = document.getElementById('batch-no');
if (batchNoSelect) {
batchNoSelect.innerHTML = `<option value="">Select Batch</option>` +
batches.map(b => `<option value="${b.batch_number}" data-remaining="${b.remaining_quantity}">${b.batch_number} (Stock: ${b.remaining_quantity})</option>`).join('');
}
}

    // ✅ Define language once, at the top
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const lang = isChinese ? 'zh' : 'en';

    const productSelect = document.getElementById('product-select');
    if (productSelect) {
      productSelect.innerHTML = `<option value="">${translations[lang]['select-product']}</option>` +
        products.map(p => `<option value="${p.id}" data-barcode="${p.barcode}" data-stock="${p.stock}" data-units="${p.units}">${p.name} (${p.barcode}, ${translations[lang][`unit-${p.units.toLowerCase()}`] || p.units}, Stock: ${p.stock})</option>`).join('');
    }

    const batchNoSelect = document.getElementById('batch-no');
    if (batchNoSelect) {
      batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>`;
    }
  } catch (error) {
    console.error('Error populating product dropdown:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const lang = isChinese ? 'zh' : 'en';
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-products-found']}: ${error.message}`;
      clearMessage('error', 10000);
    }
  }
}

async function handleProductSelection(event) {
  const productId = event.target.value;
  const productSelect = document.getElementById('product-select');
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const barcode = selectedOption.getAttribute('data-barcode');
  const stock = parseInt(selectedOption.getAttribute('data-stock'));
  const productBarcodeInput = document.getElementById('product-barcode');
  const batchNoSelect = document.getElementById('batch-no');
  const stockDisplay = document.getElementById('stock-display');
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';

  productBarcodeInput.value = barcode || '';
  stockDisplay.textContent = stock >= 0 ? translations[lang]['on-hand-stock'] + `: ${stock}` : '';

  if (productId) {
    try {
      const client = await ensureSupabaseClient();
      const { data: batches, error } = await client
        .from('product_batches')
        .select('batch_number, remaining_quantity')
        .eq('product_id', productId);
      if (error) throw error;
      batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>` +
        batches.map(b => `<option value="${b.batch_number}" data-remaining="${b.remaining_quantity}">${b.batch_number} (Stock: ${b.remaining_quantity})</option>`).join('');
    } catch (error) {
      console.error('Error fetching batch numbers:', error.message, new Date().toISOString());
      const errorEl = document.getElementById('error');
      if (errorEl) {
        errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-products-found']}: ${error.message}`;
        clearMessage('error', 10000);
      }
    }
  } else {
    batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>`;
  }
}

async function handleBarcodeInput(event) {
  const barcode = event.target.value.trim();
  const productSelect = document.getElementById('product-select');
  const batchNoSelect = document.getElementById('batch-no');
  const stockDisplay = document.getElementById('stock-display');
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';

  if (barcode) {
    try {
      const client = await ensureSupabaseClient();
      const { data: products, error } = await client
        .from('products')
        .select('id, name, stock, units')
        .eq('barcode', barcode);
      if (error) throw error;
      if (products.length > 0) {
        const product = products[0];
        productSelect.value = product.id;
        stockDisplay.textContent = product.stock >= 0 ? translations[lang]['on-hand-stock'] + `: ${product.stock}` : '';
        const { data: batches, error: batchError } = await client
          .from('product_batches')
          .select('batch_number, remaining_quantity')
          .eq('product_id', product.id);
        if (batchError) throw batchError;
        batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>` +
          batches.map(b => `<option value="${b.batch_number}" data-remaining="${b.remaining_quantity}">${b.batch_number} (Stock: ${b.remaining_quantity})</option>`).join('');
      } else {
        productSelect.value = '';
        batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>`;
        stockDisplay.textContent = translations[lang]['no-products-found'];
      }
    } catch (error) {
      console.error('Error fetching product by barcode:', error.message, new Date().toISOString());
      const errorEl = document.getElementById('error');
      if (errorEl) {
        errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-products-found']}: ${error.message}`;
        clearMessage('error', 10000);
      }
    }
  } else {
    productSelect.value = '';
    batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>`;
    stockDisplay.textContent = '';
  }
}

// --- Cart Management ---
let cart = [];


function addItemToCart() {
const productSelect = document.getElementById('product-select');
const productId = productSelect.value;
const productName = productSelect.options[productSelect.selectedIndex]?.text;
const productBarcode = productSelect.options[productSelect.selectedIndex]?.dataset.barcode;


const batchNoSelect = document.getElementById('batch-no');
const batchNumber = batchNoSelect.value; // ✅ capture selected batch_number


const quantity = parseInt(document.getElementById('quantity').value, 10);
const sellingPrice = parseFloat(document.getElementById('selling-price').value);


if (!productId || !batchNumber || !quantity || !sellingPrice) {
showMessage('error', 'Missing fields for cart item');
return;
}


const subTotal = quantity * sellingPrice;


cart.push({
productId,
productName,
productBarcode,
batchNumber, // ✅ store batch number in cart
quantity,
sellingPrice,
subTotal
});


renderCart();
}


function renderCart() {
const tbody = document.querySelector('#cart-table tbody');
tbody.innerHTML = cart.map((item, index) => `
<tr>
<td class="border p-2">${item.productName}</td>
<td class="border p-2">${item.productBarcode}</td>
<td class="border p-2">${item.batchNumber}</td>
<td class="border p-2">${item.quantity}</td>
<td class="border p-2">${item.sellingPrice.toFixed(2)}</td>
<td class="border p-2">${item.subTotal.toFixed(2)}</td>
<td class="border p-2"><button onclick="removeCartItem(${index})">Remove</button></td>
</tr>
`).join('');
const total = cart.reduce((sum, i) => sum + i.subTotal, 0);
document.getElementById('total-cost').textContent = total.toFixed(2);
}


function removeCartItem(index) {
cart.splice(index, 1);
renderCart();
}

function updateCartTable() {
  const cartTableBody = document.querySelector('#cart-table tbody');
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';
  cartTableBody.innerHTML = cart.map((item, index) => {
    const subTotal = (item.quantity * item.sellingPrice).toFixed(2);
    return `
      <tr>
        <td class="border p-2">${item.productName}</td>
        <td class="border p-2">${item.barcode}</td>
        <td class="border p-2">${item.batchNo}</td>
        <td class="border p-2">${item.quantity}</td>
        <td class="border p-2">${item.sellingPrice.toFixed(2)}</td>
        <td class="border p-2">${subTotal}</td>
        <td class="border p-2">
          <button data-index="${index}" class="remove-item bg-red-500 text-white p-1 rounded hover:bg-red-600">${translations[lang]['delete']}</button>
        </td>
      </tr>
    `;
  }).join('');

  const totalCost = cart.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0).toFixed(2);
  document.getElementById('total-cost').textContent = totalCost;

  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.getAttribute('data-index'));
      cart.splice(index, 1);
      console.log('Item removed from cart, index:', index, new Date().toISOString());
      updateCartTable();
    });
  });

  applyTranslations();
}

// --- Checkout Order (Customer Sales) ---
async function checkoutOrder() {
const client = await ensureSupabaseClient();
const customerName = document.getElementById('customer-name').value;
const saleDate = document.getElementById('sale-date').value;
if (!customerName || !saleDate || !cart.length) {
showMessage('error', 'Missing required fields');
return;
}


for (const item of cart) {
const sale = {
product_id: item.productId,
quantity: item.quantity,
selling_price: item.sellingPrice,
sale_date: saleDate,
customer_name: customerName,
batch_no: item.batchNumber // ✅ link batch_number when inserting sale
};
const { error } = await client.from('customer_sales').insert(sale);
if (error) {
console.error('Error inserting sale:', error);
showMessage('error', 'Error inserting sale');
}
}
showMessage('message', 'Checkout complete');
cart = [];
document.querySelector('#cart-table tbody').innerHTML = '';
document.getElementById('total-cost').textContent = '0.00';
loadCustomerSales();
}

    // Validate stock in product_batches
    for (const item of cart) {
      const { data: batch, error } = await client
        .from('product_batches')
        .select('remaining_quantity')
        .eq('product_id', item.productId)
        .eq('batch_number', item.batchNo)
        .single();
      if (error) throw error;
      if (item.quantity > batch.remaining_quantity) {
        throw new Error(`${translations[lang]['no-products-found']}: ${isChinese ? '庫存不足' : 'Insufficient stock'} for product ${item.productName} (Batch: ${item.batchNo})`);
      }
    }

    // Insert sales and update stock
    for (const item of cart) {
      const sale = {
        product_id: item.productId,
        quantity: item.quantity,
        selling_price: item.sellingPrice,
        sale_date: saleDate,
        customer_name: customerName
      };
      const { error: saleError } = await client
        .from('customer_sales')
        .insert(sale);
      if (saleError) throw saleError;

      const { error: batchError } = await client
        .from('product_batches')
        .update({ remaining_quantity: client.raw('remaining_quantity - ?', [item.quantity]) })
        .eq('product_id', item.productId)
        .eq('batch_number', item.batchNo);
      if (batchError) throw batchError;

      const { error: productError } = await client
        .from('products')
        .update({ stock: client.raw('stock - ?', [item.quantity]) })
        .eq('id', item.productId);
      if (productError) throw productError;
    }

    console.log('Order checked out successfully', new Date().toISOString());
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '訂單結賬成功' : 'Order checked out successfully'}`;
      clearMessage('message', 10000);
    }

    cart = [];
    updateCartTable();
    document.getElementById('add-customer-sale-form').reset();
    loadCustomerSales();
    populateProductDropdown();
  } catch (error) {
    console.error('Error checking out order:', error.message, new Date().toISOString());
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-customer-sales-found']}: ${error.message}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

// --- Load Customer Sales ---
async function loadCustomerSales() {
console.log('Loading customer sales...');
const client = await ensureSupabaseClient();
const { data: sales, error } = await client
.from('customer_sales')
.select('id, product_id, quantity, selling_price, sale_date, customer_name, batch_no, products(name, barcode, price)')
.order('sale_date', { ascending: false });
if (error) {
console.error('Error loading customer sales:', error);
return;
}
console.log('Customer sales:', sales, new Date().toISOString());
}

async function handleDeleteCustomerSale(saleId) {
  console.log('Deleting customer sale...', saleId, new Date().toISOString());
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';
  if (!confirm(translations[lang]['delete-confirm'])) return;
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { error } = await client
      .from('customer_sales')
      .delete()
      .eq('id', saleId);
    if (error) throw error;
    console.log('Customer sale deleted:', saleId, new Date().toISOString());
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '銷售記錄刪除成功' : 'Sale record deleted successfully'}`;
      clearMessage('message', 10000);
    }
    loadCustomerSales();
  } catch (error) {
    console.error('Error deleting customer sale:', error.message, new Date().toISOString());
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-customer-sales-found']}: ${error.message}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

async function populateVendorDropdown() {
  console.log('Populating vendor dropdown...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    const { data: vendors, error } = await client
      .from('vendors')
      .select('id, name');
    if (error) throw error;
    console.log('Vendors for dropdown:', vendors, new Date().toISOString());
    const vendorSelect = document.getElementById('vendor-select');
    if (vendorSelect) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const lang = isChinese ? 'zh' : 'en';
      vendorSelect.innerHTML = `<option value="">${translations[lang]['all-vendors']}</option>` +
        vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    }
  } catch (error) {
    console.error('Error populating vendor dropdown:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const lang = isChinese ? 'zh' : 'en';
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-vendors-found']}: ${error.message}`;
      clearMessage('error', 10000);
    }
  }
}

async function handleAddProduct(event) {
  event.preventDefault();
  console.log('Adding product...', new Date().toISOString());
  const barcode = document.getElementById('product-barcode').value.trim();
  const name = document.getElementById('product-name').value.trim();
  const stock = parseInt(document.getElementById('stock').value || '0');
  const price = parseFloat(document.getElementById('buy-in-price').value || '0');
  const vendorId = document.getElementById('vendor-select').value;
  const batchNo = document.getElementById('batch-no').value.trim();
  const units = document.getElementById('units').value;
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';

  if (!barcode || !name || !stock || stock < 0 || !price || price < 0 || !vendorId || !batchNo || !units) {
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-products-found']}: ${isChinese ? '請填寫所有必填字段並確保數據有效' : 'Please fill all required fields and ensure data is valid'}`;
      clearMessage('error', 10000);
    }
    return;
  }

  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: product, error: productError } = await client
      .from('products')
      .insert({ barcode, name, stock, price, vendor_id: vendorId, batch_no: batchNo, units })
      .select('id')
      .single();
    if (productError) throw productError;

    const { error: batchError } = await client
      .from('product_batches')
      .insert({
        product_id: product.id,
        vendor_id: vendorId,
        quantity: stock,
        buy_in_price: price,
        remaining_quantity: stock,
        batch_number: batchNo,
        created_at: new Date().toISOString()
      });
    if (batchError) throw batchError;

    console.log('Product added:', { barcode, name, stock, price, vendorId, batchNo, units }, new Date().toISOString());
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '產品添加成功' : 'Product added successfully'}`;
      clearMessage('message', 10000);
    }
    document.getElementById('add-product-form').reset();
    loadProducts();
    if (document.getElementById('product-select')) populateProductDropdown();
  } catch (error) {
    console.error('Error adding product:', error.message, new Date().toISOString());
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-products-found']}: ${error.message}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

async function loadProducts() {
  console.log('Loading products...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: products, error } = await client
      .from('products')
      .select('id, barcode, name, stock, price, batch_no, units, vendors(name)')
      .order('name', { ascending: true });
    if (error) throw error;
    console.log('Products:', products, new Date().toISOString());
    const productsTableBody = document.querySelector('#products-table tbody');
    if (productsTableBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const lang = isChinese ? 'zh' : 'en';
      productsTableBody.innerHTML = products.length
        ? products.map(p => {
            const inventoryValue = (p.stock * p.price).toFixed(2);
            return `
              <tr>
                <td class="border p-2">${p.name}</td>
                <td class="border p-2">${p.barcode}</td>
                <td class="border p-2">${p.batch_no}</td>
                <td class="border p-2">${p.vendors?.name || translations[lang]['unknown-vendor']}</td>
                <td class="border p-2">${p.stock}</td>
                <td class="border p-2">${p.price.toFixed(2)}</td>
                <td class="border p-2">${translations[lang][`unit-${p.units.toLowerCase()}`] || p.units}</td>
                <td class="border p-2">${inventoryValue}</td>
                <td class="border p-2">
                  <button data-product-id="${p.id}" class="delete-product bg-red-500 text-white p-1 rounded hover:bg-red-600">${translations[lang]['delete']}</button>
                </td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="9" data-lang-key="no-products-found" class="border p-2">${translations[lang]['no-products-found']}</td></tr>`;
      applyTranslations();
      document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', (e) => {
          const productId = e.target.getAttribute('data-product-id');
          handleDeleteProduct(productId);
        });
      });
    }
  } catch (error) {
    console.error('Error loading products:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const lang = isChinese ? 'zh' : 'en';
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-products-found']}: ${error.message}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

async function handleDeleteProduct(productId) {
  console.log('Deleting product...', productId, new Date().toISOString());
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';
  if (!confirm(translations[lang]['delete-confirm'])) return;
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { error: batchError } = await client
      .from('product_batches')
      .delete()
      .eq('product_id', productId);
    if (batchError) throw batchError;
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) throw error;
    console.log('Product deleted:', productId, new Date().toISOString());
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '產品刪除成功' : 'Product deleted successfully'}`;
      clearMessage('message', 10000);
    }
    loadProducts();
    if (document.getElementById('product-select')) populateProductDropdown();
  } catch (error) {
    console.error('Error deleting product:', error.message, new Date().toISOString());
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-products-found']}: ${error.message}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

async function handleAddVendor(event) {
  event.preventDefault();
  console.log('Adding vendor...', new Date().toISOString());
  const name = document.getElementById('vendor-name').value.trim();
  const contact = document.getElementById('vendor-contact').value.trim();
  const address = document.getElementById('vendor-address')?.value.trim() || '';
  const email = document.getElementById('vendor-email')?.value.trim() || '';
  const phone = document.getElementById('vendor-phone')?.value.trim() || '';
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';

  if (!name || !contact) {
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-vendors-found']}: ${isChinese ? '請填寫所有必填字段' : 'Please fill all required fields'}`;
      clearMessage('error', 10000);
    }
    return;
  }

  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { error } = await client
      .from('vendors')
      .insert({ name, contact, address, contact_email: email, phone_number: phone });
    if (error) throw error;
    console.log('Vendor added:', { name, contact, address, email, phone }, new Date().toISOString());
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '供應商添加成功' : 'Vendor added successfully'}`;
      clearMessage('message', 10000);
    }
    document.getElementById('add-vendor-form').reset();
    loadVendors();
    if (document.getElementById('vendor-select')) populateVendorDropdown();
  } catch (error) {
    console.error('Error adding vendor:', error.message, new Date().toISOString());
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-vendors-found']}: ${error.message}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

async function loadVendors() {
  console.log('Loading vendors...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: vendors, error } = await client
      .from('vendors')
      .select('id, name, contact, address, contact_email, phone_number')
      .order('name', { ascending: true });
    if (error) throw error;
    console.log('Vendors:', vendors, new Date().toISOString());
    const vendorsTableBody = document.querySelector('#vendors-table tbody');
    if (vendorsTableBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const lang = isChinese ? 'zh' : 'en';
      vendorsTableBody.innerHTML = vendors.length
        ? vendors.map(v => `
            <tr>
              <td class="border p-2">${v.name}</td>
              <td class="border p-2">${v.contact}</td>
              <td class="border p-2">${v.address || 'N/A'}</td>
              <td class="border p-2">${v.contact_email || 'N/A'}</td>
              <td class="border p-2">${v.phone_number || 'N/A'}</td>
              <td class="border p-2">
                <button data-vendor-id="${v.id}" class="delete-vendor bg-red-500 text-white p-1 rounded hover:bg-red-600">${translations[lang]['delete']}</button>
              </td>
            </tr>
          `).join('')
        : `<tr><td colspan="6" data-lang-key="no-vendors-found" class="border p-2">${translations[lang]['no-vendors-found']}</td></tr>`;
      applyTranslations();
      document.querySelectorAll('.delete-vendor').forEach(button => {
        button.addEventListener('click', (e) => {
          const vendorId = e.target.getAttribute('data-vendor-id');
          handleDeleteVendor(vendorId);
        });
      });
    }
  } catch (error) {
    console.error('Error loading vendors:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const lang = isChinese ? 'zh' : 'en';
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-vendors-found']}: ${error.message}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

async function handleDeleteVendor(vendorId) {
  console.log('Deleting vendor...', vendorId, new Date().toISOString());
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';
  if (!confirm(translations[lang]['delete-confirm'])) return;
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { error } = await client
      .from('vendors')
      .delete()
      .eq('id', vendorId);
    if (error) throw error;
    console.log('Vendor deleted:', vendorId, new Date().toISOString());
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '供應商刪除成功' : 'Vendor deleted successfully'}`;
      clearMessage('message', 10000);
    }
    loadVendors();
    if (document.getElementById('vendor-select')) populateVendorDropdown();
  } catch (error) {
    console.error('Error deleting vendor:', error.message, new Date().toISOString());
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-vendors-found']}: ${error.message}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

// --- Utility Functions ---
function showMessage(type, text, duration = 3000) {
const el = document.getElementById(type);
if (el) {
el.textContent = text;
el.classList.remove('hidden');
setTimeout(() => el.classList.add('hidden'), duration);
}
}


function clearMessage(type, duration = 3000) {
const el = document.getElementById(type);
if (el) {
setTimeout(() => (el.textContent = ''), duration);
}
}

async function addLoanRecord(event) {
  event.preventDefault();
  console.log('Adding loan record...', new Date().toISOString());
  const productId = document.getElementById('product-select').value;
  const vendorId = document.getElementById('vendor-select').value;
  const batchNo = document.getElementById('batch-no').value;
  const quantity = parseInt(document.getElementById('quantity').value || '0');
  const sellingPrice = parseFloat(document.getElementById('selling-price').value || '0');
  const date = document.getElementById('loan-date').value;
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';

  if (!productId || !vendorId || !batchNo || !quantity || quantity <= 0 || !sellingPrice || sellingPrice < 0 || !date) {
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-loan-records-found']}: ${isChinese ? '請填寫所有必填字段並確保數據有效' : 'Please fill all required fields and ensure data is valid'}`;
      clearMessage('error', 10000);
    }
    return;
  }

  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: batch, error: batchError } = await client
      .from('product_batches')
      .select('remaining_quantity')
      .eq('product_id', productId)
      .eq('batch_number', batchNo)
      .single();
    if (batchError) throw batchError;
    if (quantity > batch.remaining_quantity) {
      throw new Error(translations[lang]['no-products-found'] + `: ${isChinese ? '庫存不足' : 'Insufficient stock'}`);
    }

    const { error: loanError } = await client
      .from('vendor_loans')
      .insert({ product_id: productId, vendor_id: vendorId, batch_no: batchNo, quantity, selling_price: sellingPrice, date });
    if (loanError) throw loanError;

    const { error: batchUpdateError } = await client
      .from('product_batches')
      .update({ remaining_quantity: client.raw('remaining_quantity - ?', [quantity]) })
      .eq('product_id', productId)
      .eq('batch_number', batchNo);
    if (batchUpdateError) throw batchUpdateError;

    const { error: productError } = await client
      .from('products')
      .update({ stock: client.raw('stock - ?', [quantity]) })
      .eq('id', productId);
    if (productError) throw productError;

    console.log('Loan record added:', { productId, vendorId, batchNo, quantity, sellingPrice, date }, new Date().toISOString());
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '貸貨記錄添加成功' : 'Loan record added successfully'}`;
      clearMessage('message', 10000);
    }
    document.getElementById('add-loan-record-form').reset();
    loadLoanRecords();
    populateProductDropdown();
  } catch (error) {
    console.error('Error adding loan record:', error.message, new Date().toISOString());
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-loan-records-found']}: ${error.message}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

// --- Load Loan Records ---
async function loadLoanRecords() {
console.log('Loading loan records...');
const client = await ensureSupabaseClient();
const { data: loans, error } = await client
.from('vendor_loans')
.select('id, product_id, vendor_id, quantity, selling_price, date, batch_no, vendors(name), products(name, barcode)')
.order('date', { ascending: false });
if (error) {
console.error('Error loading loan records:', error);
return;
}
console.log('Loan records:', loans, new Date().toISOString());
}

// --- Load Vendor Sales (example for analytics) ---
async function loadVendorSales() {
const client = await ensureSupabaseClient();
const { data: sales, error } = await client
.from('vendor_sales')
.select('id, vendor_id, quantity, price, sale_date, buy_in_price, product_id')
.order('sale_date', { ascending: false });
if (error) {
console.error('Error loading vendor sales:', error);
return;
}
console.log('Vendor sales:', sales);
}


console.log('common.js loaded and patched with schema corrections + batch linking in cart');

async function handleDeleteLoanRecord(loanId) {
  console.log('Deleting loan record...', loanId, new Date().toISOString());
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';
  if (!confirm(translations[lang]['delete-confirm'])) return;
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { error } = await client
      .from('vendor_loans')
      .delete()
      .eq('id', loanId);
    if (error) throw error;
    console.log('Loan record deleted:', loanId, new Date().toISOString());
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '貸貨記錄刪除成功' : 'Loan record deleted successfully'}`;
      clearMessage('message', 10000);
    }
    loadLoanRecords();
  } catch (error) {
    console.error('Error deleting loan record:', error.message, new Date().toISOString());
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-loan-records-found']}: ${error.message}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

async function loadAnalytics() {
  console.log('Loading analytics...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const lang = isChinese ? 'zh' : 'en';

    const { data: sales, error: salesError } = await client
      .from('customer_sales')
      .select('quantity, selling_price, products(price)')
      .order('sale_date', { ascending: false });
    if (salesError) throw salesError;

    const totalSales = sales.reduce((sum, s) => sum + s.quantity * s.selling_price, 0).toFixed(2);
    const totalProfit = sales.reduce((sum, s) => sum + (s.selling_price - (s.products?.price || 0)) * s.quantity, 0).toFixed(2);

    const { data: products, error: productsError } = await client
      .from('products')
      .select('stock, price');
    if (productsError) throw productsError;

    const inventoryValue = products.reduce((sum, p) => sum + p.stock * p.price, 0).toFixed(2);

    const { data: loans, error: loansError } = await client
      .from('vendor_loans')
      .select('quantity, selling_price');
    if (loansError) throw loansError;

    const totalLoans = loans.reduce((sum, l) => sum + l.quantity * l.selling_price, 0).toFixed(2);

    const summaryEl = document.getElementById('analytics-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded shadow">
            <h3 class="text-lg font-semibold">${translations[lang]['customer-sales-report']}</h3>
            <p>${translations[lang]['total-cost']}: ${totalSales}</p>
            <p>${translations[lang]['profit']}: ${totalProfit}</p>
          </div>
          <div class="bg-white p-4 rounded shadow">
            <h3 class="text-lg font-semibold">${translations[lang]['inventory-value']}</h3>
            <p>${inventoryValue}</p>
          </div>
          <div class="bg-white p-4 rounded shadow">
            <h3 class="text-lg font-semibold">${translations[lang]['vendor-loan-report']}</h3>
            <p>${translations[lang]['total-cost']}: ${totalLoans}</p>
          </div>
        </div>
      `;
      applyTranslations();
    }
  } catch (error) {
    console.error('Error loading analytics:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const lang = isChinese ? 'zh' : 'en';
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${translations[lang]['no-customer-sales-found']}: ${error.message}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed', new Date().toISOString());
  applyTranslations();
  const toggleButton = document.getElementById('toggle-language');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleLanguage);
  }

  if (document.getElementById('add-vendor-form')) {
    document.getElementById('add-vendor-form').addEventListener('submit', handleAddVendor);
    loadVendors();
  }
  if (document.getElementById('add-product-form')) {
    document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
    loadProducts();
    populateVendorDropdown();
  }
  if (document.getElementById('add-customer-sale-form')) {
    document.getElementById('add-customer-sale-form').addEventListener('submit', (e) => e.preventDefault());
    loadCustomerSales();
    populateProductDropdown();
  }
  if (document.getElementById('add-loan-record-form')) {
    document.getElementById('add-loan-record-form').addEventListener('submit', addLoanRecord);
    loadLoanRecords();
    populateProductDropdown();
    populateVendorDropdown();
  }
  if (document.getElementById('report-form')) {
    loadAnalytics();
  }
});
