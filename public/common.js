let supabaseClient = null;
const supabaseUrl = window?.ENV_SUPABASE_URL || "https://aouduygmcspiqauhrabx.supabase.co";
const supabaseKey = window?.ENV_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdWR1eWdtY3NwaXFhdWhyYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTM5MzAsImV4cCI6MjA2MDgyOTkzMH0.s8WMvYdE9csSb1xb6jv84aiFBBU_LpDi1aserTQDg-k";

// ✅ Ensure applyTranslations always exists
if (typeof applyTranslations !== "function") {
  function applyTranslations() {
    console.log("🌐 applyTranslations() placeholder – implement if needed.");
  }
}
// Always resolve a single Supabase client
async function ensureSupabaseClient() {
  if (!window._supabaseClient) {
    console.log("Initializing Supabase Client...");
    window._supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  }
  return window._supabaseClient;
}

// ⬇️ Add here
/* ------------------------------------------------------------------
   🔧 Global Patch: Fix wrong column names in Supabase queries
   ------------------------------------------------------------------ */
console.log("⚡ Applying global Supabase query patch...");

// ✅ Helper: always get client
async function getClient() {
  return await ensureSupabaseClient();
}

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

function initLanguage() {
  console.log('Initializing language to Traditional Chinese...', new Date().toISOString());
  const body = document.getElementById('lang-body');
  if (body) {
    body.classList.add('lang-zh'); // Set Traditional Chinese as default
    applyTranslations();
  } else {
    console.error('lang-body element not found for language initialization', new Date().toISOString());
  }
}

// Call initLanguage when the page loads
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
});
function toggleLanguage() {
  console.log('Toggling language...', new Date().toISOString());
  const body = document.getElementById('lang-body');
  if (body) {
    body.classList.toggle('lang-zh');
    applyTranslations();
    if (document.querySelector('#products-table')) loadProducts();
    if (document.querySelector('#vendors-table')) loadVendors();
    if (document.querySelector('#loan-records-table')) loadLoanRecords();
    if (document.querySelector('#customer-sales')) loadCustomerSales();
    if (document.querySelector('#product-report-table')) loadAnalytics();
  }
}

function getGMT8Date() {
  const date = new Date();
  date.setHours(date.getHours() + 8); // Adjust to GMT+8
  const today = date.toISOString().slice(0, 10).split('-');
  return `${today[2]}${today[1]}${today[0].slice(-2)}`;
}

/* ===============================
   🌐 GLOBAL PATCH FOR common.js
   - Fixes Supabase client usage
   - Ensures applyTranslations runs safely
   =============================== */

// -----------------------------
// 1. Unified Supabase Client
// -----------------------------
//let supabaseClient = null;

//async function ensureSupabaseClient() {
 // if (!supabaseClient) {
 //   if (!window.supabase || !window.supabase.createClient) {
 //     throw new Error("❌ Supabase client library not loaded before common.js");
 //   }
 //   supabaseClient = window.supabase.createClient(
 //     window.supabaseUrl,
 //     window.supabaseKey
 //   );
//    console.log("✅ Supabase Client Initialized in common.js:", Object.keys(supabaseClient));
//  }
//  return supabaseClient;
//}

// Usage example anywhere in code:
// const client = await ensureSupabaseClient();
// const { data, error } = await client.from("products").select("*");

// -----------------------------
// 2. Safe Translation Loader
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  try {
    if (typeof applyTranslations === "function") {
      applyTranslations();
      console.log("🌐 Translations applied on DOM ready");
    } else {
      console.warn("⚠️ applyTranslations is not defined when DOM loaded");
    }
  } catch (err) {
    console.error("❌ Error applying translations:", err);
  }
});

function setLoading(isLoading) {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.style.display = isLoading ? 'block' : 'none';
  }
}

function clearMessage(type, timeout = 1000) {
  setTimeout(() => {
    const el = document.getElementById(type);
    if (el) el.textContent = '';
  }, timeout);
}

function handleAddCustomerSale(event) {
  event.preventDefault();
  console.log('Handling add customer sale...', new Date().toISOString());
  const productBarcode = String(document.getElementById('product-barcode')?.value || document.getElementById('product-select')?.value.split('|')[0] || '');
  const batchNo = String(document.getElementById('batch-no')?.value || '');
  const customerName = document.getElementById('customer-name')?.value || '';
  const quantity = parseInt(document.getElementById('quantity')?.value || '0');
  const price = parseFloat(document.getElementById('selling-price')?.value || '0');

  if (!productBarcode || !batchNo || !quantity || !price) {
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '請填寫所有必填字段' : 'Please fill in all required fields'}`;
      clearMessage('error');
    }
    return;
  }

  const sale = {
    product_barcode: productBarcode,
    batch_no: batchNo,
    customer_name: customerName,
    quantity,
    price
  };
  addCustomerSale(sale);
}

function handleDeleteSale(saleId, productBarcode, quantity) {
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  console.log('Sale ID:', saleId, 'Product Barcode:', productBarcode, 'Quantity:', quantity, new Date().toISOString());
  if (confirm(translations[isChinese ? 'zh' : 'en']['delete-confirm'])) {
    deleteCustomerSale(saleId, productBarcode, quantity);
  }
}


/* =========================================================
   Populate Product Dropdown (Record Customer Sales page)
   ========================================================= */
async function populateProductDropdown() {
  console.log("📦 Populating product dropdown...");
  const client = await ensureSupabaseClient();

  const { data, error } = await client
    .from("products")
    .select("id, name, barcode")
    .order("name", { ascending: true });

  if (error) {
    console.error("❌ Error populating product dropdown:", error);
    return;
  }

  console.log("✅ Products for dropdown:", data);

  const dropdown = document.getElementById("product-select");
  if (!dropdown) return;

  dropdown.innerHTML = `<option value="">-- Select Product --</option>`;

  data.forEach((p) => {
    const option = document.createElement("option");
    option.value = p.id;
    option.textContent = `${p.name} (${p.barcode})`;
    dropdown.appendChild(option);
  });
}

async function populateVendorDropdown() {
  console.log('Populating vendor dropdown...');
  try {
    const client = await ensureSupabaseClient();
    const { data: vendors, error: vendorError } = await client
      .from('vendors')
      .select('id, name')
      .order('name');
    if (vendorError) throw vendorError;

    console.log('Vendors for dropdown:', vendors);

    const vendorSelect = document.getElementById('vendor-name');
    if (!vendorSelect) {
      console.error('Vendor select element not found');
      return;
    }

    const proto = Object.getPrototypeOf(vendorSelect);
    if (proto.hasOwnProperty('change')) {
      vendorSelect.removeEventListener('change', proto.change);
    }

    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const lang = isChinese ? 'zh' : 'en';
    vendorSelect.innerHTML = '<option value="">-- Select Vendor --</option>';

    vendors.forEach(v => {
      const option = document.createElement('option');
      option.value = v.id;
      option.textContent = v.name;
      vendorSelect.appendChild(option);
    });

    setTimeout(() => {
      vendorSelect.dispatchEvent(new Event('change'));
    }, 100);
  } catch (error) {
    console.error('Error populating vendor dropdown:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入業界同行下拉選單：${error.message}` : `Failed to populate vendor dropdown: ${error.message}`}`;
      clearMessage('error');
    }
  }
}

async function populateCustomerDropdown() {
  console.log('Populating customer dropdown...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    const { data: customers, error: customerError } = await client
      .from('customer_sales')
      .select('customer_name')
      .order('customer_name');
    if (customerError) throw customerError;

    const uniqueCustomers = [...new Set(customers.map(c => c.customer_name).filter(name => name))];
    console.log('Customers for dropdown:', uniqueCustomers, new Date().toISOString());

    const customerSelect = document.getElementById('customer-name');
    if (!customerSelect) {
      console.error('Customer select element not found', new Date().toISOString());
      return;
    }

    const proto = Object.getPrototypeOf(customerSelect);
    if (proto.hasOwnProperty('change')) {
      customerSelect.removeEventListener('change', proto.change);
    }

    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const lang = isChinese ? 'zh' : 'en';
    customerSelect.innerHTML = `<option value="" data-lang-key="all-customers">${translations[lang]['all-customers']}</option>`;

    uniqueCustomers.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      customerSelect.appendChild(option);
    });

    setTimeout(() => {
      customerSelect.dispatchEvent(new Event('change'));
    }, 100);
  } catch (error) {
    console.error('Error populating customer dropdown:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入客戶下拉選單：${error.message}` : `Failed to populate customer dropdown: ${error.message}`}`;
      clearMessage('error');
    }
  }
}

/* =========================================================
   🔥 Migration Patch: Remove legacy orders/order_items queries
   ========================================================= */

// Remove/replace any old Supabase calls that look like this:
//   .from("orders").select(`id, customer_name, ..., order_items(...products(product_name))`)
//   .from("order_items").select("..., products(product_name)")
//   .from("products").select("product_name")

// ✅ From now on, always load customer sales like this:
async function loadCustomerSales() {
  console.log("📦 Loading customer sales...", new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();

    const { data, error } = await client
      .from("customer_sales")
      .select("id, customer_name, product_id, barcode, quantity, selling_price, sale_date")
      .order("sale_date", { ascending: false });

    if (error) throw error;

    console.log("✅ Customer sales loaded:", data?.length || 0);
    renderOrders(data);
  } catch (err) {
    console.error("❌ Error loading customer sales:", err);
    alert("Failed to load customer sales: " + err.message);
  }
}

/* =========================================================
   Render Customer Sales Table
   ========================================================= */

/**
 * Render sales into the "Record Customer Sales" page
 * Expects an array of objects from `customer_sales`
 * Schema: id, customer_name, quantity, sale_date, selling_price, product_id, barcode
 */
function renderOrders(orders) {
  const tbody = document.querySelector("#customer-sales-table tbody");
  tbody.innerHTML = "";

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500">No sales recorded</td></tr>`;
    return;
  }

  orders.forEach(order => {
    // If you eventually group multiple items per order, use order.items.length.
    // For now each row = 1 product, so Items = 1.
    const itemsCount = 1;

    const totalCost = (order.quantity * order.selling_price).toFixed(2);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="border p-2">${order.id}</td> <!-- Order # -->
      <td class="border p-2">${itemsCount}</td> <!-- Items (distinct products in order) -->
      <td class="border p-2">${totalCost}</td> <!-- Total Cost -->
      <td class="border p-2">${new Date(order.sale_date).toLocaleDateString()}</td> <!-- Sale Date -->
      <td class="border p-2">${order.customer_name}</td> <!-- Customer Name -->
      <td class="border p-2 flex gap-2">
        <button class="bg-red-500 text-white px-2 py-1 rounded"
          onclick="deleteSale(${order.id}, ${order.batch_id || 'null'}, ${order.quantity})">
          Delete
        </button>
        <button class="bg-blue-500 text-white px-2 py-1 rounded"
          onclick="printReceipt(${order.id})">
          Print Receipt
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/* =========================================================
   Delete Sale Helper
   ========================================================= */
async function deleteSale(id) {
  if (!confirm("Are you sure you want to delete this sale?")) return;
  try {
    const client = await ensureSupabaseClient();
    const { error } = await client.from("customer_sales").delete().eq("id", id);
    if (error) throw error;

    console.log(`🗑️ Deleted sale ID ${id}`);
    if (typeof loadCustomerSales === "function") {
      loadCustomerSales();
    }
  } catch (err) {
    console.error("❌ Failed to delete sale:", err);
    alert("Failed to delete sale: " + err.message);
  }
}

// --- FIX printReceipt ---
async function printReceipt(orderId) {
  const client = await ensureSupabaseClient();

  const { data: order, error } = await client
    .from("customer_sales")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    console.error("❌ Failed to fetch order:", error);
    alert("Failed to fetch order for printing.");
    return;
  }

  // Receipt layout
  const receiptWindow = window.open("", "_blank", "width=400,height=600");
  receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt #${order.id}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h2 { text-align: center; }
          .line { margin: 6px 0; }
          .total { font-weight: bold; margin-top: 12px; }
        </style>
      </head>
      <body>
        <h2>Receipt</h2>
        <div class="line">Order #: ${order.id}</div>
        <div class="line">Customer: ${order.customer_name}</div>
        <div class="line">Date: ${new Date(order.sale_date).toLocaleString()}</div>
        <hr/>
        <div class="line">Product: ${order.product_name || "(unknown)"}</div>
        <div class="line">Barcode: ${order.barcode}</div>
        <div class="line">Quantity: ${order.quantity}</div>
        <div class="line">Price: ${order.selling_price.toFixed(2)}</div>
        <div class="total">Total: ${(order.quantity * order.selling_price).toFixed(2)}</div>
        <hr/>
        <p style="text-align:center;">Thank you for your purchase!</p>
        <script>
          window.print();
        </script>
      </body>
    </html>
  `);
  receiptWindow.document.close();
}


async function addCustomerSale(sale) {
  console.log('Adding customer sale...', sale, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    console.log('Sale data to insert:', sale, new Date().toISOString());

    const batchNo = sale.batch_no === 'NO_BATCH' ? null : sale.batch_no;
    const { data: product, error: productError } = await client
      .from('products')
      .select('id, barcode, name, stock, price, batch_no')
      .eq('barcode', sale.product_barcode)
      .eq('batch_no', batchNo)
      .single();
    if (productError && productError.code !== 'PGRST116') throw productError;
    if (!product) {
      throw new Error('Product or batch not found');
    }

    if (product.stock < sale.quantity) {
      throw new Error('Insufficient stock available');
    }

    const { data: newSale, error: saleError } = await client
      .from('customer_sales')
      .insert({
        product_id: product.id,
        customer_name: sale.customer_name || null,
        quantity: sale.quantity,
        selling_price: sale.price || null,
        sale_date: new Date().toISOString().replace('Z', '+08:00')
      })
      .select();
    if (saleError) throw saleError;

    const { error: updateError } = await client
      .from('products')
      .update({ stock: product.stock - sale.quantity })
      .eq('id', product.id);
    if (updateError) throw updateError;

    console.log('Customer sale added:', newSale, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '客戶銷售添加成功' : 'Customer sale added successfully'}`;
    clearMessage('message');
    loadCustomerSales();
  } catch (error) {
    console.error('Error adding customer sale:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `添加客戶銷售失敗：${error.message}` : `Failed to add customer sale: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function deleteCustomerSale(saleId, productBarcode, quantity) {
  console.log('Deleting customer sale...', { saleId, productBarcode, quantity }, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    // ✅ fetch sale with batch_id
    const { data: sale, error: saleError } = await client
      .from('customer_sales')
      .select('product_id, batch_id')
      .eq('id', saleId)
      .single();
    if (saleError && saleError.code !== 'PGRST116') throw saleError;
    if (!sale) {
      throw new Error('Sale not found');
    }

    // ✅ restore stock to batch
    if (sale.batch_id) {
      const { data: batch, error: batchError } = await client
        .from('product_batches')
        .select('id, remaining_quantity')
        .eq('id', sale.batch_id)
        .single();
      if (batchError) throw batchError;
      if (!batch) throw new Error('Batch not found for this sale');

      const { error: updateBatchError } = await client
        .from('product_batches')
        .update({ remaining_quantity: batch.remaining_quantity + quantity })
        .eq('id', sale.batch_id);
      if (updateBatchError) throw updateBatchError;

      console.log(`📈 Restored stock for batch ${sale.batch_id} by ${quantity}`);
    }

    // ✅ delete sale record
    const { error: deleteError } = await client
      .from('customer_sales')
      .delete()
      .eq('id', saleId);
    if (deleteError) throw deleteError;

    console.log('Customer sale deleted:', saleId, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent =
      `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '客戶銷售刪除成功' : 'Customer sale deleted successfully'}`;
    clearMessage('message');
    loadCustomerSales();
  } catch (error) {
    console.error('Error deleting customer sale:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent =
        `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `刪除客戶銷售失敗：${error.message}` : `Failed to delete customer sale: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function loadLoanRecords() {
  console.log('Loading loan records...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: loans, error } = await client
      .from('vendor_loans')
      .select(`
        id,
        vendor_id,
        product_id,
        batch_no,
        quantity,
        selling_price,
        date,
        vendors (
          name
        ),
        products (
          name
        )
      `)
      .order('date', { ascending: false });
    if (error) throw error;

    console.log('Vendor Loans:', loans, new Date().toISOString());
    const loansBody = document.querySelector('#loan-records-table tbody');
    if (loansBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      loansBody.innerHTML = loans.length
        ? loans.map(l => `
            <tr>
              <td class="border p-2">${l.vendors?.name || (isChinese ? '未知業界同行' : 'Unknown Vendor')}</td>
              <td class="border p-2">${l.products?.name || (isChinese ? '未知產品' : 'Unknown Product')}</td>
              <td class="border p-2">${l.batch_no || (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">${l.quantity || (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">${(l.selling_price && l.selling_price.toFixed(2)) || (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">${l.date ? new Date(l.date).toLocaleString('en-GB', { timeZone: 'Asia/Singapore' }) : (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">
                <button data-loan-id="${l.id}" class="delete-loan bg-red-500 text-white p-1 rounded hover:bg-red-600">Delete</button>
              </td>
            </tr>
          `).join('')
        : `<tr><td colspan="7" data-lang-key="no-loan-records-found" class="border p-2">${isChinese ? '未找到貸貨記錄。' : 'No loan records found.'}</td></tr>`;
      applyTranslations();
      populateProductDropdown();
      populateVendorDropdown();
      document.querySelectorAll('.delete-loan').forEach(button => {
        button.addEventListener('click', (e) => {
          const loanId = e.target.getAttribute('data-loan-id');
          handleDeleteLoanRecord(loanId);
        });
      });
    }
  } catch (error) {
    console.error('Error loading loan records:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入貸貨記錄：${error.message}` : `Failed to load loan records: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function addLoanRecord(event) {
  event.preventDefault();
  console.log('Adding loan record...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    const productBarcodeRaw = document.getElementById('product-barcode')?.value;
    const productSelectRaw = document.getElementById('product-select')?.value;
    const batchNoRaw = document.getElementById('batch-no')?.value;
    const vendorIdRaw = document.getElementById('vendor-name')?.value;
    const quantityRaw = document.getElementById('quantity')?.value;
    const sellingPriceRaw = document.getElementById('selling-price')?.value;
    const loanDateRaw = document.getElementById('loan-date')?.value;

    const productBarcode = String(productBarcodeRaw || (productSelectRaw ? productSelectRaw.split('|')[0] : '') || '');
    const batchNo = String(batchNoRaw || '');
    const vendorId = parseInt(vendorIdRaw || '0');
    const quantity = parseInt(quantityRaw?.replace(/,/g, '') || '0');
    const sellingPrice = parseFloat(sellingPriceRaw?.replace(/,/g, '') || '0');
    const loanDate = loanDateRaw;

    // Detailed debug logging
    console.log('Raw form inputs:', {
      productBarcodeRaw,
      productSelectRaw,
      batchNoRaw,
      vendorIdRaw,
      quantityRaw,
      sellingPriceRaw,
      loanDateRaw
    }, new Date().toISOString());
    console.log('Processed form inputs:', {
      productBarcode,
      batchNo,
      vendorId,
      quantity,
      sellingPrice,
      loanDate
    }, new Date().toISOString());

    // Specific validation error messages
    const errors = [];
    if (!vendorId) errors.push('Vendor ID is missing or invalid');
    if (!productBarcode) errors.push('Product barcode or selection is missing');
    if (!batchNo) errors.push('Batch number is missing');
    if (!quantity) errors.push('Quantity is missing or invalid');
    if (!sellingPrice) errors.push('Selling price is missing or invalid');
    if (!loanDate) errors.push('Loan date is missing');

    if (errors.length > 0) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const errorEl = document.getElementById('error');
      if (errorEl) {
        errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '錯誤：' + errors.join('；') : 'Errors: ' + errors.join('; ')}`;
        clearMessage('error', 10000); // 10 seconds for visibility
      }
      console.warn('Validation failed:', errors, new Date().toISOString());
      return;
    }

    const { data: product, error: productError } = await client
      .from('products')
      .select('id, barcode, batch_no, stock')
      .eq('barcode', productBarcode)
      .eq('batch_no', batchNo === 'NO_BATCH' ? null : batchNo)
      .single();
    if (productError && productError.code !== 'PGRST116') throw productError;
    if (!product) {
      throw new Error('Product or batch not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock available');
    }

    const loan = {
      vendor_id: vendorId,
      product_id: product.id,
      batch_no: batchNo === 'NO_BATCH' ? null : batchNo,
      quantity,
      selling_price: sellingPrice,
      date: new Date().toISOString().replace('Z', '+08:00')
    };
    console.log('Loan data to insert:', loan, new Date().toISOString());

    const { data: newLoan, error } = await client
      .from('vendor_loans')
      .insert(loan)
      .select();
    if (error) {
      console.error('Supabase error details:', error, new Date().toISOString());
      throw error;
    }

    const { error: updateError } = await client
      .from('products')
      .update({ stock: product.stock - quantity })
      .eq('id', product.id);
    if (updateError) throw updateError;

    console.log('Loan record added:', newLoan, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '貸貨記錄添加成功' : 'Loan record added successfully'}`;
    clearMessage('message', 10000);
    loadLoanRecords();
  } catch (error) {
    console.error('Error adding loan record:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `添加貸貨記錄失敗：${error.message}` : `Failed to add loan record: ${error.message}`}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}



function handleDeleteLoanRecord(loanId) {
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  if (confirm(translations[isChinese ? 'zh' : 'en']['delete-confirm'])) {
    deleteLoanRecord(loanId);
  }
}

async function handleDeleteLoanRecord(loanId) {
  console.log('Deleting loan record...', loanId, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    const { error } = await client.from('vendor_loans').delete().eq('id', loanId);
    if (error) throw error;

    console.log('Loan record deleted:', loanId, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '貸貨記錄刪除成功' : 'Loan record deleted successfully'}`;
    clearMessage('message', 10000);
    loadLoanRecords();
  } catch (error) {
    console.error('Error deleting loan record:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `刪除貸貨記錄失敗：${error.message}` : `Failed to delete loan record: ${error.message}`}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}
async function deleteLoanRecord(loanId) {
  console.log('Deleting loan record...', loanId, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    const { data: loan, error: loanError } = await client
      .from('vendor_loans')
      .select('product_id, quantity')
      .eq('id', loanId)
      .single();
    if (loanError && loanError.code !== 'PGRST116') throw loanError;
    if (!loan) {
      throw new Error('Loan record not found');
    }

    const { data: product, error: productError } = await client
      .from('products')
      .select('id, stock')
      .eq('id', loan.product_id)
      .single();
    if (productError && productError.code !== 'PGRST116') throw productError;
    if (!product) {
      throw new Error('Product not found');
    }

    const { error: deleteError } = await client
      .from('vendor_loans')
      .delete()
      .eq('id', loanId);
    if (deleteError) throw deleteError;

    const { error: updateError } = await client
      .from('products')
      .update({ stock: product.stock + loan.quantity })
      .eq('id', product.id);
    if (updateError) throw updateError;

    console.log('Loan record deleted:', loanId, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '貸貨記錄刪除成功' : 'Loan record deleted successfully'}`;
    clearMessage('message');
    loadLoanRecords();
  } catch (error) {
    console.error('Error deleting loan record:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `刪除貸貨記錄失敗：${error.message}` : `Failed to delete loan record: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

/**
 * Fix loadAnalytics
 * - replace wrong column names across vendors, products, etc.
 */
async function loadAnalytics() {
  console.log("📊 Loading analytics...", new Date().toISOString());
  try {
    const client = await getClient();

    // Example: load products properly
    const { data: products, error: prodErr } = await client
      .from("products")
      .select("id, name, barcode, stock, price, batch_no");

    if (prodErr) throw prodErr;
    console.log("✅ Products analytics:", products);

    // Example: load vendors properly
    const { data: vendors, error: vendErr } = await client
      .from("vendors")
      .select("id, name, contact, phone_number");

    if (vendErr) throw vendErr;
    console.log("✅ Vendors analytics:", vendors);

    // (extend this with charts/tables rendering)
  } catch (err) {
    console.error("❌ Analytics error:", err);
  }
}
function parseBatchNoToDate(batchNo) {
  if (!batchNo || batchNo.length !== 6 || isNaN(batchNo)) {
    return null;
  }
  const day = parseInt(batchNo.slice(0, 2));
  const month = parseInt(batchNo.slice(2, 4)) - 1;
  const year = parseInt('20' + batchNo.slice(4, 6));
  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
}
async function generateProductReport(startDate, endDate) {
  console.log('Generating product report...', { startDate, endDate }, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include entire end date

    const { data: products, error: productsError } = await client
      .from('products')
      .select('id, name, price, batch_no, stock');
    if (productsError) throw productsError;
    console.log('All products fetched:', products, new Date().toISOString());

    const { data: sales, error: salesError } = await client
      .from('customer_sales')
      .select('product_id, quantity, sale_date, products(batch_no)')
      .gte('sale_date', startDate)
      .lte('sale_date', endDate);
    if (salesError) throw salesError;
    console.log('Sales data:', sales, new Date().toISOString());

    const { data: loans, error: loansError } = await client
      .from('vendor_loans')
      .select('product_id, quantity, date, products(batch_no)')
      .gte('date', startDate)
      .lte('date', endDate);
    if (loansError) throw loansError;
    console.log('Loans data:', loans, new Date().toISOString());

    const productReportBody = document.querySelector('#product-report-table tbody');
    if (productReportBody) {
      productReportBody.innerHTML = '';
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');

      const filteredProducts = products.filter(product => {
        const batchDate = parseBatchNoToDate(product.batch_no);
        if (!batchDate) {
          console.warn(`Invalid or null batch_no for product ${product.id}: ${product.batch_no}`, new Date().toISOString());
          // Include products with null/invalid batch_no if they have sales or loans
          const hasSales = sales.some(s => s.product_id === product.id);
          const hasLoans = loans.some(l => l.product_id === product.id);
          return hasSales || hasLoans;
        }
        return batchDate >= start && batchDate <= end;
      });
      console.log('Filtered products:', filteredProducts, new Date().toISOString());

      if (filteredProducts.length > 0) {
        filteredProducts.forEach(product => {
          const salesForProduct = sales.filter(s => s.product_id === product.id && s.products.batch_no === product.batch_no);
          const loansForProduct = loans.filter(l => l.product_id === product.id && l.products.batch_no === product.batch_no);

          const soldQuantity = salesForProduct.reduce((sum, s) => sum + s.quantity, 0);
          const loanedQuantity = loansForProduct.reduce((sum, l) => sum + l.quantity, 0);
          const originalStockIn = product.stock + soldQuantity + loanedQuantity;

          const row = `
            <tr>
              <td class="border p-2">${product.name || (isChinese ? '未知產品' : 'Unknown Product')}</td>
              <td class="border p-2">${product.batch_no || (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">${product.price ? product.price.toFixed(2) : (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">${originalStockIn}</td>
              <td class="border p-2">${product.stock}</td>
            </tr>
          `;
          productReportBody.innerHTML += row;
        });
      } else {
        productReportBody.innerHTML = `<tr><td colspan="5" data-lang-key="no-products-found" class="border p-2">${isChinese ? '未找到產品。' : 'No products found.'}</td></tr>`;
      }
      applyTranslations();
    }
  } catch (error) {
    console.error('Error generating product report:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `生成產品報告失敗：${error.message}` : `Failed to generate product report: ${error.message}`}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}



async function generateVendorLoanReport(startDate, endDate, vendorName) {
  console.log('Generating vendor loan report...', { startDate, endDate, vendorName }, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    let query = client
  .from('vendor_loans')
  .select(`
    id,
    vendor_id,
    product_id,
    quantity,
    date,
    vendors!inner (name),
    products (name, batch_no)
  `)
  .gte('date', startDate)
  .lte('date', endDate)
  .not('vendor_id', 'is', null);

if (vendorName) {
  query = query.eq('vendor_id', parseInt(vendorName)); // Filter by vendor_id
}

    const { data: loans, error: loansError } = await query;
    if (loansError) throw loansError;

    console.log('Vendor Loans Report Data:', loans, new Date().toISOString());

    const vendorLoanReportBody = document.querySelector('#vendor-loan-report-table tbody');
    if (vendorLoanReportBody) {
      vendorLoanReportBody.innerHTML = '';
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');

      if (loans.length > 0) {
        loans.forEach(loan => {
          const vendorNameDisplay = loan.vendors?.name || (isChinese ? translations.zh['unknown-vendor'] : translations.en['unknown-vendor']);
          if (!loan.vendors?.name) {
            console.warn('Vendor loan record with missing vendor name:', loan, new Date().toISOString());
          }
          const row = `
            <tr>
              <td class="border p-2">${vendorNameDisplay}</td>
              <td class="border p-2">${loan.products?.name || (isChinese ? '未知產品' : 'Unknown Product')}</td>
              <td class="border p-2">${loan.products?.batch_no || (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">${loan.quantity}</td>
              <td class="border p-2">${new Date(loan.date).toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })}</td>
            </tr>
          `;
          vendorLoanReportBody.innerHTML += row;
        });
      } else {
        vendorLoanReportBody.innerHTML = `<tr><td colspan="5" data-lang-key="no-loan-records-found" class="border p-2">${isChinese ? '未找到貸貨記錄。' : 'No loan records found.'}</td></tr>`;
      }
      applyTranslations();
    }
  } catch (error) {
    console.error('Error generating vendor loan report:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `生成業界同行貸貨報告失敗：${error.message}` : `Failed to generate vendor loan report: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}



async function generateCustomerSalesReport(startDate, endDate, customerName) {
  console.log('Generating customer sales report...', { startDate, endDate, customerName }, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    let query = client
      .from('customer_sales')
      .select(`
        id,
        product_id,
        customer_name,
        quantity,
        selling_price,
        sale_date,
        products (
          name,
          price,
          barcode,
          batch_no
        )
      `)
      .gte('sale_date', startDate)
      .lte('sale_date', endDate)
      .order('sale_date', { ascending: false });

    if (customerName) {
      query = query.eq('customer_name', customerName);
    }

    const { data: sales, error } = await query;
    if (error) throw error;

    console.log('Customer Sales Report:', sales, new Date().toISOString());
    const salesReportBody = document.querySelector('#customer-sales-report-table tbody');
    if (salesReportBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      salesReportBody.innerHTML = sales.length
        ? sales.map(s => {
            const sellingPrice = s.selling_price !== null ? s.selling_price : (isChinese ? '無' : 'N/A');
            const buyInPrice = s.products?.price || 0;
            const subTotal = s.selling_price !== null ? s.quantity * s.selling_price : (isChinese ? '無' : 'N/A');
            const profit = s.selling_price !== null ? (s.selling_price - buyInPrice) * s.quantity : 'N/A';
            return `
              <tr>
                <td class="border p-2">${s.products?.name || (isChinese ? '未知產品' : 'Unknown Product')}</td>
                <td class="border p-2">${s.products?.barcode || (isChinese ? '無' : 'N/A')}</td>
                <td class="border p-2">${s.products?.batch_no || (isChinese ? '無' : 'N/A')}</td>
                <td class="border p-2">${s.customer_name || (isChinese ? '無' : 'N/A')}</td>
                <td class="border p-2">${s.quantity}</td>
                <td class="border p-2">${typeof sellingPrice === 'number' ? sellingPrice.toFixed(2) : sellingPrice}</td>
                <td class="border p-2">${typeof subTotal === 'number' ? subTotal.toFixed(2) : subTotal}</td>
                <td class="border p-2">${typeof profit === 'number' ? profit.toFixed(2) : profit}</td>
                <td class="border p-2">${new Date(s.sale_date).toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })}</td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="9" data-lang-key="no-customer-sales-found" class="border p-2">${isChinese ? '未找到客戶銷售記錄。' : 'No customer sales found.'}</td></tr>`;
      applyTranslations();
    }
  } catch (error) {
    console.error('Error generating customer sales report:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `生成客戶銷售報告失敗：${error.message}` : `Failed to generate customer sales report: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

/* =========================================================
   Load Products (batch-centric)
   ========================================================= */
async function loadProducts() {
  console.log("📦 Loading products...");

  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    const { data, error } = await client
      .from("product_batches")
      .select(`
        id,
        batch_number,
        remaining_quantity,
        buy_in_price,
        product:products (
          id,
          barcode,
          name,
          units
        )
      `)
      .order("id", { ascending: true });

    if (error) throw error;

    console.log("✅ Products loaded:", data);

    const tableBody = document.querySelector("#products-table tbody");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (!data || data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center p-2">No products found</td></tr>`;
      return;
    }

    let rows = "";
    data.forEach((batch) => {
      rows += `
        <tr data-batch-id="${batch.id}">
          <td class="border p-2">${batch.product?.barcode || ""}</td>
          <td class="border p-2">${batch.product?.name || ""}</td>
          <td class="border p-2">${batch.remaining_quantity}</td>
          <td class="border p-2">${batch.product?.units || ""}</td>
          <td class="border p-2">${batch.batch_number}</td>
          <td class="border p-2">${batch.buy_in_price?.toFixed(2) || "0.00"}</td>
          <td class="border p-2">${(batch.remaining_quantity * batch.buy_in_price).toFixed(2)}</td>
          <td class="border p-2">
            <button 
              class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              onclick="deleteBatch(${batch.id}, '${batch.batch_number}')"
            >
              Remove
            </button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = rows;
  } catch (err) {
    console.error("❌ Unexpected error loading products:", err);
    const errorEl = document.getElementById("error");
    if (errorEl) {
      errorEl.textContent = `❌ Failed to load products: ${err.message}`;
      setTimeout(() => (errorEl.textContent = ""), 4000);
    }
  } finally {
    setLoading(false);
  }
}

/* =========================================================
   Delete Batch
   ========================================================= */
async function deleteBatch(batchId, batchNumber) {
  const confirmDelete = confirm(`Are you sure you want to delete batch ${batchNumber}?`);
  if (!confirmDelete) return;

  console.log("🗑️ Deleting batch:", batchId);

  try {
    const client = await ensureSupabaseClient();

    const { data, error } = await client
      .from("product_batches")
      .delete()
      .eq("id", batchId)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      console.warn("⚠️ No batch deleted. ID may not exist.");
      return;
    }

    console.log("🗑️ Batch deleted from Supabase:", data);

    // remove row from DOM
    const row = document.querySelector(`tr[data-batch-id="${batchId}"]`);
    if (row) row.remove();

    // inline success message
    const msgEl = document.getElementById("message");
    if (msgEl) {
      msgEl.textContent = "Deleted successfully ✅";
      msgEl.classList.remove("text-red-500");
      msgEl.classList.add("text-green-500");
      setTimeout(() => { msgEl.textContent = ""; }, 3000);
    }
  } catch (err) {
    console.error("❌ Failed to delete batch:", err);
    const errorEl = document.getElementById("error");
    if (errorEl) {
      errorEl.textContent = `❌ Failed to delete batch: ${err.message}`;
      setTimeout(() => (errorEl.textContent = ""), 4000);
    }
  }
}

/* =========================================================
   Add Product + Initial Batch
   ========================================================= */
async function addProduct(barcode, name, stock, units, buyInPrice, vendorId = 31) {
  const client = await ensureSupabaseClient();

  console.log("📦 Adding product...", { barcode, name, stock, units, price: buyInPrice, vendorId }, new Date().toISOString());

  // 1. Insert product
  const { data: product, error: productError } = await client
    .from("products")
    .insert([{
      barcode,
      name,
      price: buyInPrice,
      vendor_id: vendorId,
      units
    }])
    .select("id")
    .single();

  if (productError) {
    console.error("❌ Failed to insert product:", productError);
    alert("Failed to add product");
    return;
  }

  // 2. Compact batch number (YYMMDD-XYZ)
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(100 + Math.random() * 900);
  const batchNo = `${yy}${mm}${dd}-${rand}`;

  // 3. Insert initial batch (⚠️ no more `quantity`)
  const { error: batchError } = await client
    .from("product_batches")
    .insert([{
      product_id: product.id,
      vendor_id: vendorId,
      batch_number: batchNo,
      remaining_quantity: stock,
      buy_in_price: buyInPrice,
      created_at: new Date().toISOString()
    }]);

  if (batchError) {
    console.error("❌ Failed to insert batch:", batchError);
    alert("Product added, but batch creation failed.");
    return;
  }

  alert("✅ Product and initial batch added successfully");
  loadProducts(); // refresh table
}

/* =========================================================
   Handle Add Product Form Submit
   ========================================================= */
function setupAddProductForm() {
  const form = document.getElementById("add-product-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const barcode = document.getElementById("product-barcode").value.trim();
    const name = document.getElementById("product-name").value.trim();
    const stock = parseInt(document.getElementById("stock").value, 10);
    const units = document.getElementById("units").value;
    const buyInPrice = parseFloat(document.getElementById("buy-in-price").value);
    const vendorId = 31; // hardcoded or replace with real

    if (!barcode || !name || isNaN(stock) || !units || isNaN(buyInPrice)) {
      alert("⚠️ Please fill in all product fields");
      return;
    }

    console.log("📦 Handling add product...", { barcode, name, stock, units, buyInPrice });

    await addProduct(barcode, name, stock, units, buyInPrice, vendorId);

    e.target.reset();
  });
}



function handleUpdateProduct(productId, currentStock, currentPrice, currentBatchNo, currentUnits) {
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const newStock = prompt(isChinese ? '輸入新的庫存數量：' : 'Enter new stock quantity:', currentStock);
  const newUnits = prompt(isChinese ? '輸入新的單位（box 或 Taijin）：' : 'Enter new units (box or Taijin):', currentUnits);
  const newPrice = prompt(isChinese ? '輸入新的進貨價：' : 'Enter new buy-in price:', currentPrice);

  if (newStock !== null && newUnits !== null && newPrice !== null) {
    const stock = parseInt(newStock);
    const units = newUnits.trim();
    const price = parseFloat(newPrice);
    if (!isNaN(stock) && stock >= 0 && ['box', 'Taijin'].includes(units) && !isNaN(price) && price >= 0) {
      const batchNo = getGMT8Date();
      updateProduct(productId, stock, price, batchNo, units);
    } else {
      alert(isChinese ? '請輸入有效的庫存、單位（box 或 Taijin）和價格！' : 'Please enter valid stock, units (box or Taijin), and price!');
    }
  }
}

async function updateProduct(productId, stock, price, batchNo, units) {
  console.log('Updating product...', { productId, stock, price, batchNo, units }, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data, error } = await client
      .from('products')
      .update({ stock, price, batch_no: batchNo, units })
      .eq('id', productId)
      .select();
    if (error) throw error;
    console.log('Product updated:', data, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '產品更新成功' : 'Product updated successfully'}`;
    clearMessage('message', 10000);
    loadProducts();
  } catch (error) {
    console.error('Error updating product:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `更新產品失敗：${error.message}` : `Failed to update product: ${error.message}`}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}

function handleDeleteProduct(productId) {
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  if (confirm(translations[isChinese ? 'zh' : 'en']['delete-confirm'])) {
    deleteProduct(productId);
  }
}



function handleAddVendor(event) {
  event.preventDefault();
  console.log('Handling add vendor...', new Date().toISOString());
  const name = document.getElementById('vendor-name')?.value;
  const contact = document.getElementById('vendor-contact')?.value;

  console.log('Form data:', { name, contact }, new Date().toISOString());

  if (!name || !contact) {
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '請填寫所有必填字段' : 'Please fill in all required fields'}`;
      clearMessage('error');
    }
    return;
  }

  const vendor = { name, contact_email: contact, address: null, phone_number: null };
  addVendor(vendor);
}

/* ------------------------------------------------------------------
   ✅ Fix loadVendors
   ------------------------------------------------------------------ */
async function loadVendors() {
  console.log("🏭 Loading vendors...");
  try {
    const client = await ensureSupabaseClient();
    const { data, error } = await client
      .from("vendors")
      .select("id, name, address, contact_email, phone_number, contact");
    if (error) throw error;
    console.log("✅ Vendors:", data);
    return data;
  } catch (err) {
    console.error("❌ Error loading vendors:", err.message);
    return [];
  }
}

async function addVendor(vendor) {
  console.log('Adding vendor...', vendor, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    console.log('Inserting vendor data into Supabase:', vendor, new Date().toISOString());
    const { data, error } = await client
      .from('vendors')
      .insert(vendor)
      .select();
    if (error) {
      console.error('Supabase error:', error, new Date().toISOString());
      throw error;
    }
    console.log('Vendor added:', data, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '業界同行添加成功' : 'Vendor added successfully'}`;
    clearMessage('message');
    loadVendors();
    populateVendorDropdown();
  } catch (error) {
    console.error('Error adding vendor:', error.message, error.details, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `添加業界同行失敗：${error.message}` : `Failed to add vendor: ${error.message}`}${error.details ? ` - ${error.details}` : ''}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

function handleDeleteVendor(vendorId) {
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  if (confirm(translations[isChinese ? 'zh' : 'en']['delete-confirm'])) {
    deleteVendor(vendorId);
  }
}

async function deleteVendor(vendorId) {
  console.log('Deleting vendor...', vendorId, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    const { error: deleteError } = await client
      .from('vendors')
      .delete()
      .eq('id', vendorId);
    if (deleteError) throw deleteError;

    console.log('Vendor deleted:', vendorId, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '業界同行刪除成功' : 'Vendor deleted successfully'}`;
    clearMessage('message');
    loadVendors();
  } catch (error) {
    console.error('Error deleting vendor:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `刪除業界同行失敗：${error.message}` : `Failed to delete vendor: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

/* =========================================================
   Handle Product Selection + Barcode Input (Final Fixed)
   ========================================================= */

/* =========================================================
   Load Batches for a Product
   ========================================================= */
async function loadBatches(productId) {
  const client = await ensureSupabaseClient();
  const { data: batches, error } = await client
    .from("product_batches")
    .select("id, batch_number, remaining_quantity")
    .eq("product_id", productId)
    .gt("remaining_quantity", 0); // only show batches with stock

  const batchSelect = document.getElementById("batch-no");
  batchSelect.innerHTML = "";

  if (error) {
    console.error("❌ Failed to fetch batches:", error);
    batchSelect.innerHTML = `<option value="">Error loading batches</option>`;
    return;
  }

  if (!batches || batches.length === 0) {
    batchSelect.innerHTML = `<option value="">No batches available</option>`;
    return;
  }

  // Populate dropdown with id as value
  batches.forEach(batch => {
    const opt = document.createElement("option");
    opt.value = batch.id; // ✅ store batchId
    opt.textContent = `${batch.batch_number} (Remaining: ${batch.remaining_quantity})`;
    batchSelect.appendChild(opt);
  });

  console.log("✅ Batches loaded:", batches);
}


/* =========================================================
   Handle Product Selection + Barcode Input
   ========================================================= */

/**
 * Triggered when a product is selected from dropdown
 */
async function handleProductSelection(eventOrProductId) {
  try {
    let productId;

    // Detect if it's an event or a direct productId call
    if (typeof eventOrProductId === "object" && eventOrProductId.target) {
      productId = parseInt(eventOrProductId.target.value, 10);
    } else {
      productId = parseInt(eventOrProductId, 10);
    }

    console.log("🔍 Handling product selection, productId:", productId);

    if (!productId || isNaN(productId)) {
      console.warn("⚠️ No valid product selected");
      return;
    }

    const client = await ensureSupabaseClient();
    // ✅ fetch product details so we can update barcode + stock
    const { data: product, error } = await client
      .from("products")
      .select("id, barcode, stock")
      .eq("id", productId)
      .single();

    if (error) throw error;

    // ✅ update barcode input so it refreshes properly
    const barcodeInput = document.getElementById("product-barcode");
    if (barcodeInput) {
      barcodeInput.value = product.barcode || "";
    }

    // ✅ update stock display
    const stockDisplay = document.getElementById("stock-display");
    if (stockDisplay) {
      stockDisplay.textContent = `Available stock: ${product.stock ?? 0}`;
    }

    // ✅ load available batches
    await loadBatches(productId);
  } catch (err) {
    console.error("❌ Failed in handleProductSelection:", err);
  }
}
/**
 * Triggered when user enters a barcode manually
 */
async function handleBarcodeInput(event) {
  const barcode = event.target.value.trim();
  console.log("📦 Barcode input:", barcode);

  if (!barcode) return;

  try {
    const client = await ensureSupabaseClient();
    const { data: products, error } = await client
      .from("products")
      .select("id, barcode, name, stock")
      .eq("barcode", barcode)
      .limit(1);

    if (error) throw error;

    if (products && products.length > 0) {
      const product = products[0];
      console.log("✅ Found product by barcode:", product);

      // Set dropdown to match
      const productSelect = document.getElementById("product-select");
      if (productSelect) {
        productSelect.value = product.id;
      }

      // Show stock info
      const stockDisplay = document.getElementById("stock-display");
      if (stockDisplay) {
        stockDisplay.textContent = `Stock: ${product.stock}`;
      }

      // Load batches directly by product_id
      await loadBatches(product.id);
    } else {
      console.warn("⚠️ No product found for barcode:", barcode);
    }
  } catch (err) {
    console.error("❌ Error handling barcode input:", err);
  }
}

/* =========================================================
   COMMON.JS - with Cart + Checkout Enhancements for Customer Sales
   ========================================================= */

// Keep all your existing code ...
// (translations, ensureSupabaseClient, analytics, vendor management, etc.)
// -------------------------------------------------------------

/* =========================================================
   Add Item to Cart
   ========================================================= */
let cart = [];

async function addItemToCart() {
  const customerName = document.getElementById("customer-name").value.trim();
  const saleDate = document.getElementById("sale-date").value;
  const productSelect = document.getElementById("product-select");
  const productId = parseInt(productSelect.value, 10);
  const barcode = document.getElementById("product-barcode").value.trim();

  const batchSelect = document.getElementById("batch-no");
  const batchId = parseInt(batchSelect.value, 10);
  const batchNumber = batchSelect.options[batchSelect.selectedIndex]?.text.split(" ")[0] || null;

  const quantity = parseInt(document.getElementById("quantity").value, 10);
  const sellingPrice = parseFloat(document.getElementById("selling-price").value);

  // Validate required fields
  if (!customerName || !saleDate || isNaN(productId) || isNaN(batchId) || !batchNumber || isNaN(quantity) || isNaN(sellingPrice)) {
    alert("⚠️ Please fill in all fields before adding item.");
    return;
  }

  // Fetch product info
  const client = await ensureSupabaseClient();
  const { data: product, error } = await client
    .from("products")
    .select("id, name, barcode")
    .eq("id", productId)
    .single();

  if (error || !product) {
    console.error("❌ Failed to fetch product:", error);
    alert("Failed to fetch product details.");
    return;
  }

  // Calculate subtotal
  const subTotal = quantity * sellingPrice;

  // Add item to cart
  const item = {
    productId: product.id,
    productName: product.name,
    barcode: product.barcode,
    batchId,        // ✅ keep batchId for decrement
    batchNumber,    // ✅ keep batchNumber for display
    quantity,
    sellingPrice,
    subTotal,
    customerName,
    saleDate
  };

  cart.push(item);
  console.log("🛒 Added to cart:", item);

  renderCart();
}

/* =========================================================
   Render Cart
   ========================================================= */
function renderCart() {
  const tbody = document.querySelector("#cart-table tbody");
  tbody.innerHTML = "";

  let total = 0;

  if (cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-gray-500">Cart is empty</td></tr>`;
  } else {
    cart.forEach((item, index) => {
      total += item.subTotal;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="border p-2">${item.productName}</td>
        <td class="border p-2">${item.barcode}</td>
        <td class="border p-2">${item.batchNumber}</td>
        <td class="border p-2">${item.quantity}</td>
        <td class="border p-2">${item.sellingPrice.toFixed(2)}</td>
        <td class="border p-2">${item.subTotal.toFixed(2)}</td>
        <td class="border p-2 space-x-2">
          <button class="bg-yellow-500 text-white px-2 py-1 rounded" onclick="adjustCartItem(${index})">Adjust</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="removeFromCart(${index})">Remove</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  document.getElementById("total-cost").textContent = total.toFixed(2);
}

/* =========================================================
   Delete Sale
   ========================================================= */
async function deleteSale(saleId, batchId, qty) {
  const client = await ensureSupabaseClient();

  // Delete sale
  const { error: delError } = await client
    .from("customer_sales")
    .delete()
    .eq("id", saleId);

  if (delError) {
    console.error("❌ Failed to delete sale:", delError);
    alert("Failed to delete sale.");
    return;
  }

  console.log("🗑️ Deleted sale ID", saleId);

  // Restore stock
  if (batchId && qty) {
    const { error: incError } = await client
      .rpc("increment_batch_stock", { batch_id: batchId, qty });

    if (incError) {
      console.error("❌ Failed to restore stock:", incError);
    } else {
      console.log(`📈 Stock restored for batch ${batchId} by ${qty}`);
    }
  }

  // Refresh table
  loadCustomerSales();
}


/* =========================================================
   Remove Item from Cart
   ========================================================= */
function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

/* =========================================================
   Adjust Item in Cart
   ========================================================= */
function adjustCartItem(index) {
  if (!cart[index]) return;

  const newQty = parseInt(prompt("Enter new quantity:", cart[index].quantity), 10);
  const newPrice = parseFloat(prompt("Enter new selling price:", cart[index].sellingPrice));

  if (!isNaN(newQty) && newQty > 0) {
    cart[index].quantity = newQty;
  }
  if (!isNaN(newPrice) && newPrice >= 0) {
    cart[index].sellingPrice = newPrice;
  }

  cart[index].subTotal = cart[index].quantity * cart[index].sellingPrice;

  renderCart();
}

/* =========================================================
   POS Checkout + Order Management
   ========================================================= */

/**
 * Fix checkoutOrder
 * - use order_id, not id
 * - order_items.batch_number instead of batch_number
 * ------------------------------------------------------------------
 */
/* =========================================================
   Checkout Order
   ========================================================= */
async function checkoutOrder() {
  if (cart.length === 0) {
    alert("⚠️ Cart is empty.");
    return;
  }

  const client = await ensureSupabaseClient();

  try {
    console.log("💳 Checking out order...", new Date().toISOString());

    // Generate a single order number (timestamp-based for simplicity)
    const orderNumber = Date.now();

    // Build insert payload
    const payload = cart.map(item => ({
      customer_name: item.customerName,
      sale_date: item.saleDate,
      product_id: item.productId,
      product_name: item.productName,   // ✅ store product name
      barcode: item.barcode,
      quantity: item.quantity,
      selling_price: item.sellingPrice,
      batch_id: item.batchId,
      order_number: orderNumber         // ✅ group items under same order
    }));

    // Insert into customer_sales
    const { data, error } = await client
      .from("customer_sales")
      .insert(payload)
      .select();

    if (error) throw error;
    console.log("✅ Customer sales inserted:", data);

    // Decrement stock
    for (const item of cart) {
      const { error: decError } = await client.rpc("decrement_batch_stock", {
        batch_id: item.batchId,
        qty: item.quantity
      });
      if (decError) {
        console.error("❌ Failed to decrement stock:", decError);
      } else {
        console.log(`📉 Stock decremented for batch ${item.batchId} by ${item.quantity}`);
      }
    }

    alert("✅ Checkout successful!");
    cart = [];
    renderCart();
    loadCustomerSales();

  } catch (err) {
    console.error("❌ Checkout failed:", err);
    alert("Checkout failed.");
  }
}


async function viewOrderDetails(orderId) {
  const supabase = await ensureSupabaseClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      order_number,
      customer_name,
      sale_date,
      total_cost,
      order_items (
        quantity,
        selling_price,
        products (name, barcode)
      )
    `)
    .eq('order_id', orderId)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    alert("Failed to load order details.");
    return;
  }

  let details = `Order #: ${order.order_number}\nCustomer: ${order.customer_name}\nDate: ${new Date(order.sale_date).toLocaleString()}\n\nItems:\n`;

  order.order_items.forEach(item => {
    const productName = item.products?.name || "Unknown";
    const productBarcode = item.products?.barcode || "-";
    const subTotal = item.quantity * item.selling_price;
    details += `- ${productName} (${productBarcode}) x${item.quantity} @ ${item.selling_price} = ${subTotal.toFixed(2)}\n`;
  });

  details += `\nTotal: ${order.total_cost.toFixed(2)}`;
  alert(details); // or show in modal
}

async function deleteOrder(orderId) {
  if (!confirm("Are you sure you want to delete this order?")) return;
  const supabase = await ensureSupabaseClient();
  const { error } = await supabase.from('orders').delete().eq('order_id', orderId);
  if (error) {
    console.error("Delete error:", error);
    alert("Failed to delete order.");
  } else {
    alert("Order deleted.");
    loadCustomerSales();
  }
}
// -------------------------------------------------------------
// Keep all your existing functions below (translations, loadCustomerSales,
// populateProductDropdown, loadLoanRecords, etc.) untouched.
// -------------------------------------------------------------

// === Handle Barcode Input ===
function handleBarcodeInput() {
  const barcodeInput = document.getElementById('product-barcode');
  const productSelect = document.getElementById('product-select');
  const stockDisplay = document.getElementById('stock-display');

  const enteredBarcode = barcodeInput.value.trim();
  if (!enteredBarcode) return;

  console.log('Updating selection with barcode:', enteredBarcode, new Date().toISOString());

  // Find product option by barcode
  const matchingOption = Array.from(productSelect.options).find(opt =>
    opt.getAttribute('data-barcode') === enteredBarcode
  );

  if (matchingOption) {
    productSelect.value = matchingOption.value;
    stockDisplay.textContent = `Stock: ${matchingOption.getAttribute('data-stock') || 0}`;

    // Trigger batch loading
    handleProductSelection();
  } else {
    stockDisplay.textContent = 'Product not found';
    document.getElementById('batch-no').innerHTML = '';
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
  }
  if (document.getElementById('add-customer-sale-form')) {
    document.getElementById('add-customer-sale-form').addEventListener('submit', handleAddCustomerSale);
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
