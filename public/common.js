let supabaseClient = null;
let cart = []; // Temporary cart to store items before checkout

const translations = {
  en: {
    'nav-home': 'Home',
    'nav-analytics': 'Analytics',
    'nav-manage-products': 'Manage Products',
    'nav-manage-vendors': 'Manage Vendors',
    'nav-record-customer-sales': 'Record Customer Sales',
    'nav-vendor-loan-record': 'Vendor Loan Record',
    'toggle-language': 'Toggle Language',
    'home-welcome': 'Welcome to the Home page!',
    'manage-products-welcome': 'Welcome to Manage Products!',
    'manage-vendors-welcome': 'Welcome to Manage Vendors!',
    'vendor-loan-record-welcome': 'Welcome to Vendor Loan Record!',
    'record-customer-sales': 'Record Customer Sales',
    'add-customer-sale': 'Add Customer Sale',
    'select-product': 'Select Product (or input barcode)',
    'product-barcode': 'Product Barcode',
    'batch-no': 'Batch No.',
    'customer-name': 'Customer Name',
    'quantity': 'Quantity',
    'selling-price': 'Selling Price',
    'add-sale': 'Add Sale',
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
    'original-stock-in': 'Original Stock-In',
    'all-customers': '-- All Customers --',
    'all-vendors': '-- All Vendors --',
    'unknown-vendor': 'Unknown Vendor'
  },
  zh: {
    'nav-home': '首頁',
    'nav-analytics': '分析',
    'nav-manage-products': '管理產品',
    'nav-manage-vendors': '管理業界同行',
    'nav-record-customer-sales': '記錄客戶銷售',
    'nav-vendor-loan-record': '業界同行貸貨記錄',
    'toggle-language': '切換語言',
    'home-welcome': '歡迎來到首頁！',
    'manage-products-welcome': '歡迎來到管理產品！',
    'manage-vendors-welcome': '歡迎來到管理業界同行！',
    'vendor-loan-record-welcome': '歡迎來到業界同行貸貨記錄！',
    'record-customer-sales': '記錄客戶銷售',
    'add-customer-sale': '添加客戶銷售',
    'select-product': '選擇產品（或輸入條碼）',
    'product-barcode': '產品條碼',
    'batch-no': '批號',
    'customer-name': '客戶名稱',
    'quantity': '數量',
    'selling-price': '售價',
    'add-sale': '添加銷售',
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
    'add-vendor': '添加業界同行',
    'vendor-name': '業界同行名稱',
    'vendor-contact': '業界同行聯繫方式',
    'manage-products': '管理產品',
    'manage-vendors': '管理業界同行',
    'add-loan-record': '添加貸貨記錄',
    'loan-amount': '貸貨金額',
    'loan-date': '貸貨日期',
    'vendor-loan': '業界同行貸貨',
    'no-products-found': '未找到產品。',
    'no-vendors-found': '未找到業界同行。',
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
    'vendor-loan-report': '業界同行貸貨報告',
    'customer-sales-report': '客戶銷售報告',
    'original-stock-in': '原始入庫數量',
    'all-customers': '-- 所有客戶 --',
    'all-vendors': '-- 所有業界同行 --',
    'unknown-vendor': '未知業界同行'
  }
};

function applyTranslations() {
  console.log('Applying translations...', new Date().toISOString());
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';
  document.querySelectorAll('[data-lang-key]').forEach(element => {
    const key = element.getAttribute('data-lang-key');
    element.textContent = translations[lang][key] || element.textContent;
  });
  console.log('Applied translations for:', lang, new Date().toISOString());
}

function toggleLanguage() {
  console.log('Toggling language...', new Date().toISOString());
  const langBody = document.getElementById('lang-body');
  if (langBody) {
    langBody.classList.toggle('lang-zh');
    applyTranslations();
    if (document.getElementById('product-select')) {
      populateProductDropdown();
    }
    if (document.getElementById('customer-sales-table')) {
      loadCustomerSales();
    }
  }
}

async function ensureSupabaseClient() {
  console.log('Ensuring Supabase client...', new Date().toISOString());
  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient('https://aouduygmcspiqauhrabx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdWR1eWdtY3NwaXFhdWhyYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTM5MzAsImV4cCI6MjA2MDgyOTkzMH0.s8WMvYdE9csSb1xb6jv84aiFBBU_LpDi1aserTQDg-k');
    console.log('Supabase Client Initialized in common.js:', Object.keys(supabaseClient), new Date().toISOString());
  }
  return supabaseClient;
}

function setLoading(isLoading) {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.style.display = isLoading ? 'block' : 'none';
  }
}

function clearMessage(elementId, timeout = 5000) {
  setTimeout(() => {
    const el = document.getElementById(elementId);
    if (el) el.textContent = '';
  }, timeout);
}

function getGMT8Date() {
  const date = new Date();
  const offset = 8 * 60; // GMT+8
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const gmt8 = new Date(utc + (3600000 * offset));
  return `${gmt8.getDate().toString().padStart(2, '0')}${String(gmt8.getMonth() + 1).padStart(2, '0')}${gmt8.getFullYear().toString().slice(-2)}`;
}

async function populateProductDropdown() {
  console.log('Populating product dropdown...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    const { data: products, error } = await client
      .from('products')
      .select('id, barcode, name, stock, units, batch_no');
    if (error) throw error;
    console.log('Products for dropdown:', products, new Date().toISOString());
    const productSelect = document.getElementById('product-select');
    if (productSelect) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const lang = isChinese ? 'zh' : 'en';
      productSelect.innerHTML = `<option value="">${translations[lang]['select-product']}</option>` +
        products.map(p => `<option value="${p.id}" data-barcode="${p.barcode}" data-stock="${p.stock}" data-units="${p.units}" data-batch-no="${p.batch_no}">${p.name} (${p.barcode}, ${translations[lang][`unit-${p.units.toLowerCase()}`] || p.units}, Stock: ${p.stock})</option>`).join('');
    }
    const batchNoSelect = document.getElementById('batch-no');
    if (batchNoSelect) {
      batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>`;
    }
  } catch (error) {
    console.error('Error populating product dropdown:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入產品下拉列表：${error.message}` : `Failed to populate product dropdown: ${error.message}`}`;
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
  const batchNo = selectedOption.getAttribute('data-batch-no');
  const productBarcodeInput = document.getElementById('product-barcode');
  const batchNoSelect = document.getElementById('batch-no');
  const stockDisplay = document.getElementById('stock-display');
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';

  productBarcodeInput.value = barcode || '';
  stockDisplay.textContent = stock >= 0 ? (isChinese ? `現有庫存: ${stock}` : `On-hand stock: ${stock}`) : '';

  if (productId) {
    try {
      const client = await ensureSupabaseClient();
      const { data: products, error } = await client
        .from('products')
        .select('batch_no, stock')
        .eq('id', productId);
      if (error) throw error;
      batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>` +
        products.map(p => `<option value="${p.batch_no}">${p.batch_no} (Stock: ${p.stock})</option>`).join('');
      if (batchNo) {
        batchNoSelect.value = batchNo;
      }
    } catch (error) {
      console.error('Error fetching batch numbers:', error.message, new Date().toISOString());
      const errorEl = document.getElementById('error');
      if (errorEl) {
        errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入批號：${error.message}` : `Failed to fetch batch numbers: ${error.message}`}`;
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
        .select('id, name, stock, units, batch_no')
        .eq('barcode', barcode);
      if (error) throw error;
      if (products.length > 0) {
        const product = products[0];
        productSelect.value = product.id;
        stockDisplay.textContent = product.stock >= 0 ? (isChinese ? `現有庫存: ${product.stock}` : `On-hand stock: ${product.stock}`) : '';
        batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>` +
          products.map(p => `<option value="${p.batch_no}">${p.batch_no} (Stock: ${p.stock})</option>`).join('');
      } else {
        productSelect.value = '';
        batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>`;
        stockDisplay.textContent = isChinese ? '無庫存信息' : 'No stock information';
      }
    } catch (error) {
      console.error('Error fetching product by barcode:', error.message, new Date().toISOString());
      const errorEl = document.getElementById('error');
      if (errorEl) {
        errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法通過條碼查找產品：${error.message}` : `Failed to fetch product by barcode: ${error.message}`}`;
        clearMessage('error', 10000);
      }
    }
  } else {
    productSelect.value = '';
    batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>`;
    stockDisplay.textContent = '';
  }
}

function addItemToCart() {
  console.log('Adding item to cart...', new Date().toISOString());
  const productSelect = document.getElementById('product-select');
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const productId = productSelect.value;
  const barcode = document.getElementById('product-barcode').value.trim();
  const batchNo = document.getElementById('batch-no').value;
  const quantity = parseInt(document.getElementById('quantity').value || '0');
  const sellingPrice = parseFloat(document.getElementById('selling-price').value || '0');
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const stockDisplay = document.getElementById('stock-display');
  const stock = parseInt(selectedOption.getAttribute('data-stock'));

  if (!productId || !barcode || !batchNo || !quantity || quantity <= 0 || !sellingPrice || sellingPrice < 0) {
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '請填寫所有必填字段並確保數量和售價有效' : 'Please fill all required fields and ensure quantity and selling price are valid'}`;
      clearMessage('error', 10000);
    }
    return;
  }

  if (quantity > stock) {
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '庫存不足' : 'Insufficient stock'}`;
      clearMessage('error', 10000);
    }
    return;
  }

  const productName = selectedOption.text.split(' (')[0];
  const item = { productId, barcode, batchNo, quantity, sellingPrice, productName };
  cart.push(item);
  console.log('Item added to cart:', item, new Date().toISOString());
  updateCartTable();

  // Clear product-related fields
  document.getElementById('product-select').value = '';
  document.getElementById('product-barcode').value = '';
  document.getElementById('batch-no').innerHTML = `<option value="">${translations[isChinese ? 'zh' : 'en']['batch-no']}</option>`;
  document.getElementById('quantity').value = '';
  document.getElementById('selling-price').value = '';
  stockDisplay.textContent = '';
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
          <button data-index="${index}" class="remove-item bg-red-500 text-white p-1 rounded hover:bg-red-600">${translations[lang]['delete'] || 'Remove'}</button>
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

async function checkoutOrder() {
  console.log('Checking out order...', cart, new Date().toISOString());
  const customerName = document.getElementById('customer-name').value.trim();
  const saleDate = document.getElementById('sale-date').value;
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');

  if (!customerName || !saleDate) {
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '請輸入客戶名稱和銷售日期' : 'Please enter customer name and sale date'}`;
      clearMessage('error', 10000);
    }
    return;
  }

  if (cart.length === 0) {
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '購物車為空' : 'Cart is empty'}`;
      clearMessage('error', 10000);
    }
    return;
  }

  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    // Validate stock for all items
    for (const item of cart) {
      const { data: product, error } = await client
        .from('products')
        .select('stock')
        .eq('id', item.productId)
        .eq('batch_no', item.batchNo)
        .single();
      if (error) throw error;
      if (item.quantity > product.stock) {
        throw new Error(`${isChinese ? '庫存不足' : 'Insufficient stock'} for product ${item.productName} (Batch: ${item.batchNo})`);
      }
    }

    // Insert sales and update stock
    for (const item of cart) {
      const sale = {
        product_id: item.productId,
        quantity: item.quantity,
        selling_price: item.sellingPrice,
        sale_date: saleDate,
        customer_name: customerName,
        batch_no: item.batchNo
      };
      const { error: saleError } = await client
        .from('customer_sales')
        .insert(sale);
      if (saleError) throw saleError;

      const { error: stockError } = await client
        .from('products')
        .update({ stock: client.raw('stock - ?', [item.quantity]) })
        .eq('id', item.productId)
        .eq('batch_no', item.batchNo);
      if (stockError) throw stockError;
    }

    console.log('Order checked out successfully', new Date().toISOString());
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '訂單結賬成功' : 'Order checked out successfully'}`;
      clearMessage('message', 10000);
    }

    // Clear cart and form
    cart = [];
    updateCartTable();
    document.getElementById('add-customer-sale-form').reset();
    loadCustomerSales();
    populateProductDropdown();
  } catch (error) {
    console.error('Error checking out order:', error.message, new Date().toISOString());
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `結賬失敗：${error.message}` : `Checkout failed: ${error.message}`}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

async function loadCustomerSales() {
  console.log('Loading customer sales...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: sales, error } = await client
      .from('customer_sales')
      .select('id, product_id, quantity, selling_price, sale_date, customer_name, batch_no, products(name, price, barcode)')
      .order('sale_date', { ascending: false });
    if (error) throw error;
    console.log('Customer sales:', sales, new Date().toISOString());
    const salesTableBody = document.querySelector('#customer-sales-table tbody');
    if (salesTableBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const lang = isChinese ? 'zh' : 'en';
      salesTableBody.innerHTML = sales.length
        ? sales.map(s => {
            const subTotal = (s.quantity * s.selling_price).toFixed(2);
            const profit = ((s.selling_price - (s.products?.price || 0)) * s.quantity).toFixed(2);
            return `
              <tr>
                <td class="border p-2">${s.products?.name || translations[lang]['unknown-product']}</td>
                <td class="border p-2">${s.products?.barcode || 'N/A'}</td>
                <td class="border p-2">${s.batch_no || 'N/A'}</td>
                <td class="border p-2">${s.customer_name}</td>
                <td class="border p-2">${s.quantity}</td>
                <td class="border p-2">${s.selling_price.toFixed(2)}</td>
                <td class="border p-2">${subTotal}</td>
                <td class="border p-2">${profit}</td>
                <td class="border p-2">${s.sale_date}</td>
                <td class="border p-2">
                  <button data-sale-id="${s.id}" class="delete-sale bg-red-500 text-white p-1 rounded hover:bg-red-600">${translations[lang]['delete'] || 'Delete'}</button>
                </td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="10" data-lang-key="no-customer-sales-found" class="border p-2">${translations[lang]['no-customer-sales-found']}</td></tr>`;
      applyTranslations();
      document.querySelectorAll('.delete-sale').forEach(button => {
        button.addEventListener('click', (e) => {
          const saleId = e.target.getAttribute('data-sale-id');
          handleDeleteCustomerSale(saleId);
        });
      });
    }
  } catch (error) {
    console.error('Error loading customer sales:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入客戶銷售：${error.message}` : `Failed to load customer sales: ${error.message}`}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

async function handleDeleteCustomerSale(saleId) {
  console.log('Deleting customer sale...', saleId, new Date().toISOString());
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  if (!confirm(isChinese ? '刪除此銷售記錄？' : 'Delete this sale record?')) return;
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
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `刪除銷售記錄失敗：${error.message}` : `Failed to delete sale record: ${error.message}`}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

// ... (other functions like handleAddProduct, loadProducts, handleAddVendor, etc., remain unchanged)

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
  }
  if (document.getElementById('add-customer-sale-form')) {
    document.getElementById('add-customer-sale-form').addEventListener('submit', (e) => e.preventDefault()); // Prevent default form submission
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
