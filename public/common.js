let supabaseClient = null;
const supabaseUrl = window?.ENV_SUPABASE_URL || "https://aouduygmcspiqauhrabx.supabase.co";
const supabaseKey = window?.ENV_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdWR1eWdtY3NwaXFhdWhyYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTM5MzAsImV4cCI6MjA2MDgyOTkzMH0.s8WMvYdE9csSb1xb6jv84aiFBBU_LpDi1aserTQDg-k";
// Always resolve a single Supabase client
async function ensureSupabaseClient() {
  if (!supabaseClient) {
    console.log("Initializing Supabase Client...");
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
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


// --- FIX populateProductDropdown ---
async function populateProductDropdown() {
  console.log("Populating product dropdown...");
  const client = await ensureSupabaseClient();

  const { data: products, error } = await client
    .from("products")
    .select("id, name, barcode, batch_no, stock, price");

  if (error) {
    console.error("❌ Error loading products:", error);
    return;
  }

  const dropdown = document.getElementById("product-select");
  if (!dropdown) {
    console.warn("⚠️ No #product-select element found.");
    return;
  }

  dropdown.innerHTML = "";
  products.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.barcode;
    opt.dataset.id = p.id;
    opt.dataset.barcode = p.barcode;
    opt.dataset.batch = p.batch_no;
    opt.dataset.stock = p.stock;
    opt.dataset.price = p.price;

    opt.textContent = `${p.name} (Barcode: ${p.barcode}, Batch: ${p.batch_no}, Stock: ${p.stock}, Buy-In Price: ${p.price.toFixed(2)})`;
    dropdown.appendChild(opt);
  });

  console.log("✅ Products for dropdown:", products);
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

// ✅ Fixed loadCustomerSales()
// ==============================
async function loadCustomerSales() {
  try {
    console.log("📦 Loading orders...", new Date().toISOString());
    const client = await ensureSupabaseClient();

    const { data, error } = await client
      .from('orders')
      .select(`
        order_id,
        customer_name,
        sale_date,
        total_cost,
        order_number,
        order_items (
          id,
          quantity,
          selling_price,
          batch_number,   -- ✅ fixed column name
          products (
            id,
            name,          -- ✅ fixed column name
            barcode
          )
        )
      `)
      .order('sale_date', { ascending: false });

    if (error) throw error;
    console.log("✅ Orders loaded:", data);

    renderCustomerSales(data);
  } catch (err) {
    console.error("❌ Error loading orders:", err, new Date().toISOString());
  }
}

// --- FIX printReceipt ---
async function printReceipt(orderId) {
  console.log("Printing receipt...");
  const client = await ensureSupabaseClient();

  const { data: order, error } = await client
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
    console.error("Error fetching order for print:", error);
    alert("Failed to print receipt.");
    return;
  }

  let receiptText = `
Receipt 
Order #: ${order.order_number}
Customer: ${order.customer_name}
Date: ${new Date(order.sale_date).toLocaleString()}

Items:
`;

  order.order_items.forEach(item => {
    const productName = item.products?.name || "Unknown";
    const productBarcode = item.products?.barcode || "-";
    const subTotal = item.quantity * item.selling_price;

    receiptText += `- ${productName} (${productBarcode}) x${item.quantity} @ ${item.selling_price} = ${subTotal.toFixed(2)}\n`;
  });

  receiptText += `\nTotal: ${order.total_cost.toFixed(2)}`;

  const printWindow = window.open('', '', 'width=600,height=400');
  printWindow.document.write(`<pre>${receiptText}</pre>`);
  printWindow.document.close();
  printWindow.print();
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

    const { data: sale, error: saleError } = await client
      .from('customer_sales')
      .select('product_id')
      .eq('id', saleId)
      .single();
    if (saleError && saleError.code !== 'PGRST116') throw saleError;
    if (!sale) {
      throw new Error('Sale not found');
    }

    const { data: product, error: productError } = await client
      .from('products')
      .select('id, stock, barcode')
      .eq('id', sale.product_id)
      .single();
    if (productError && productError.code !== 'PGRST116') throw productError;
    if (!product) {
      throw new Error('Product not found');
    }

    if (productBarcode && product.barcode !== productBarcode) {
      throw new Error('Barcode mismatch');
    }

    const { error: deleteError } = await client
      .from('customer_sales')
      .delete()
      .eq('id', saleId);
    if (deleteError) throw deleteError;

    const { error: updateError } = await client
      .from('products')
      .update({ stock: product.stock + quantity })
      .eq('id', product.id);
    if (updateError) throw updateError;

    console.log('Customer sale deleted:', saleId, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '客戶銷售刪除成功' : 'Customer sale deleted successfully'}`;
    clearMessage('message');
    loadCustomerSales();
  } catch (error) {
    console.error('Error deleting customer sale:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `刪除客戶銷售失敗：${error.message}` : `Failed to delete customer sale: ${error.message}`}`;
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
async function handleAddProduct(event) {
  event.preventDefault();
  console.log('Adding product...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    const name = document.getElementById('product-name')?.value?.trim();
    const barcode = document.getElementById('product-barcode')?.value?.trim();
    const batchNo = document.getElementById('batch-no')?.value?.trim() || null;
    const stock = parseInt(document.getElementById('stock')?.value?.replace(/,/g, '') || '0');
    const price = parseFloat(document.getElementById('price')?.value?.replace(/,/g, '') || '0');

    if (!name || !barcode || !stock || !price) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const errorEl = document.getElementById('error');
      if (errorEl) {
        errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '請填寫所有必填字段' : 'Please fill in all required fields'}`;
        clearMessage('error', 10000);
      }
      return;
    }

    const product = {
      name,
      barcode,
      batch_no: batchNo === 'NO_BATCH' ? null : batchNo,
      stock,
      price
    };
    console.log('Product data to insert:', product, new Date().toISOString());

    const { data: newProduct, error } = await client
      .from('products')
      .insert(product)
      .select();
    if (error) {
      console.error('Supabase error details:', error, new Date().toISOString());
      throw error;
    }

    console.log('Product added:', newProduct, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '產品添加成功' : 'Product added successfully'}`;
    clearMessage('message', 10000);
    if (typeof loadProducts === 'function') loadProducts();
  } catch (error) {
    console.error('Error adding product:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `添加產品失敗：${error.message}` : `Failed to add product: ${error.message}`}`;
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

async function loadAnalytics() {
  console.log('Loading analytics...', new Date().toISOString());
  try {
    await populateCustomerDropdown();
    await populateVendorDropdown();
    const form = document.getElementById('report-form');
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        setLoading(true);
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const customerName = document.getElementById('customer-name').value;
        const vendorName = document.getElementById('vendor-name').value;

        if (!startDate || !endDate) {
          const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
          const errorEl = document.getElementById('error');
          if (errorEl) {
            errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '請選擇開始和結束日期' : 'Please select start and end dates'}`;
            clearMessage('error');
          }
          setLoading(false);
          return;
        }

        await generateProductReport(startDate, endDate);
        await generateVendorLoanReport(startDate, endDate, vendorName);
        await generateCustomerSalesReport(startDate, endDate, customerName);
        setLoading(false);
      });
    }
  } catch (error) {
    console.error('Error setting up analytics:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入分析：${error.message}` : `Failed to load analytics: ${error.message}`}`;
      clearMessage('error');
    }
    setLoading(false);
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

async function loadProducts() {
  console.log('Loading products...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: products, error } = await client
      .from('products')
      .select('id, barcode, name, stock, units, batch_no, price')
      .order('name');
    if (error) throw error;
    console.log('Products:', products, new Date().toISOString());
    const productsBody = document.querySelector('#products-table tbody');
    if (productsBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const lang = isChinese ? 'zh' : 'en';
      productsBody.innerHTML = products.length
        ? products.map(p => {
            const inventoryValue = p.stock * (p.price || 0);
            const unitDisplay = p.units ? translations[lang][`unit-${p.units.toLowerCase()}`] || (isChinese ? '無' : 'N/A') : (isChinese ? '無' : 'N/A');
            return `
              <tr>
                <td class="border p-2">${p.barcode}</td>
                <td class="border p-2">${p.name}</td>
                <td class="border p-2">${p.stock}</td>
                <td class="border p-2">${unitDisplay}</td>
                <td class="border p-2">${p.batch_no || 'N/A'}</td>
                <td class="border p-2">${p.price ? p.price.toFixed(2) : 'N/A'}</td>
                <td class="border p-2">${inventoryValue.toFixed(2)}</td>
                <td class="border p-2">
                  <button data-product-id="${p.id}" data-stock="${p.stock}" data-price="${p.price || 0}" data-batch-no="${p.batch_no || ''}" data-units="${p.units || ''}" class="update-product bg-blue-500 text-white p-1 rounded hover:bg-blue-600 mr-2">Update</button>
                  <button data-product-id="${p.id}" class="delete-product bg-red-500 text-white p-1 rounded hover:bg-red-600">Delete</button>
                </td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="8" data-lang-key="no-products-found" class="border p-2">${isChinese ? '未找到產品。' : 'No products found.'}</td></tr>`;
      applyTranslations();
      document.querySelectorAll('.update-product').forEach(button => {
        button.addEventListener('click', (e) => {
          const productId = e.target.getAttribute('data-product-id');
          const currentStock = parseInt(e.target.getAttribute('data-stock'));
          const currentPrice = parseFloat(e.target.getAttribute('data-price'));
          const currentBatchNo = e.target.getAttribute('data-batch-no');
          const currentUnits = e.target.getAttribute('data-units');
          handleUpdateProduct(productId, currentStock, currentPrice, currentBatchNo, currentUnits);
        });
      });
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
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入產品：${error.message}` : `Failed to load products: ${error.message}`}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
}
function handleAddProduct(event) {
  event.preventDefault();
  console.log('Handling add product...', new Date().toISOString());
  const barcode = document.getElementById('product-barcode')?.value?.trim();
  const name = document.getElementById('product-name')?.value?.trim();
  const stock = parseInt(document.getElementById('stock')?.value?.replace(/,/g, '') || '0');
  const units = document.getElementById('units')?.value?.trim();
  const price = parseFloat(document.getElementById('buy-in-price')?.value?.replace(/,/g, '') || '0');

  if (!barcode || !name || !stock || !units || !price) {
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '請填寫所有必填字段' : 'Please fill in all required fields'}`;
      clearMessage('error', 10000);
    }
    return;
  }

  const product = { barcode, name, stock, units, price, batch_no: getGMT8Date() };
  addProduct(product);
}

async function addProduct(product) {
  console.log('Adding product...', product, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data, error } = await client
      .from('products')
      .insert(product)
      .select();
    if (error) throw error;
    console.log('Product added:', data, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '產品添加成功' : 'Product added successfully'}`;
    clearMessage('message', 10000);
    loadProducts();
  } catch (error) {
    console.error('Error adding product:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `添加產品失敗：${error.message}` : `Failed to add product: ${error.message}`}`;
      clearMessage('error', 10000);
    }
  } finally {
    setLoading(false);
  }
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

async function deleteProduct(productId) {
  console.log('Deleting product...', productId, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) throw error;
    console.log('Product deleted:', productId, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '產品刪除成功' : 'Product deleted successfully'}`;
    clearMessage('message');
    loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `刪除產品失敗：${error.message}` : `Failed to delete product: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
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

async function loadVendors() {
  console.log('Loading vendors...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: vendors, error } = await client
      .from('vendors')
      .select('*')
      .order('name');
    if (error) throw error;
    console.log('Vendors:', vendors, new Date().toISOString());
    const vendorsBody = document.querySelector('#vendors-table tbody');
    if (vendorsBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      vendorsBody.innerHTML = vendors.length
        ? vendors.map(v => `
            <tr>
              <td class="border p-2">${v.name || (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">${v.contact_email || (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">
                <button data-vendor-id="${v.id}" class="delete-vendor bg-red-500 text-white p-1 rounded hover:bg-red-600">Delete</button>
              </td>
            </tr>
          `).join('')
        : `<tr><td colspan="3" data-lang-key="no-vendors-found" class="border p-2">${isChinese ? '未找到業界同行。' : 'No vendors found.'}</td></tr>`;
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
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入業界同行：${error.message}` : `Failed to load vendors: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
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


// === Handle Product Selection ===
async function handleProductSelection() {
  const productSelect = document.getElementById('product-select');
  const batchSelect = document.getElementById('batch-no');
  if (!productSelect.value || !batchSelect) return;

  try {
    const client = await ensureSupabaseClient();
    const productId = parseInt(productSelect.value);
if (isNaN(productId)) {
  console.warn("No valid product selected");
  return;
}

    console.log('Fetching batches for product:', productId, new Date().toISOString());

    const { data: batches, error } = await client
      .from('product_batches')
      .select('batch_number, remaining_quantity, buy_in_price, created_at')
      .eq('product_id', productId)
      .gt('remaining_quantity', 0);

    if (error) throw error;

    batchSelect.innerHTML = `<option value="">Select batch</option>` +
      batches.map(b => 
        `<option value="${b.batch_number}">Batch ${b.batch_number} (Remaining: ${b.remaining_quantity}, Buy-in: ${b.buy_in_price})</option>`
      ).join('');

  } catch (err) {
    console.error('Error fetching product batches:', err.message);
  }
}


/* =========================================================
   COMMON.JS - with Cart + Checkout Enhancements for Customer Sales
   ========================================================= */

// Keep all your existing code ...
// (translations, ensureSupabaseClient, analytics, vendor management, etc.)
// -------------------------------------------------------------

// === Global cart for customer sales ===
let cart = [];

// Render the cart table
function renderCart() {
  const tbody = document.querySelector("#cart-table tbody");
  tbody.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    const row = document.createElement("tr");

    const subTotal = item.quantity * item.selling_price;
    total += subTotal;

    row.innerHTML = `
      <td class="border p-2">${item.productName || "Unknown"}</td>
      <td class="border p-2">${item.barcode || "-"}</td>
      <td class="border p-2">${item.batchNumber || "-"}</td>
      <td class="border p-2">${item.quantity}</td>
      <td class="border p-2">${item.selling_price.toFixed(2)}</td>
      <td class="border p-2">${subTotal.toFixed(2)}</td>
      <td class="border p-2">
        <button onclick="removeFromCart(${index})"
          class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
          Remove
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("total-cost").textContent = total.toFixed(2);
}

// Add item to cart
function addItemToCart() {
  const productSelect = document.getElementById('product-select');
  const batchSelect = document.getElementById('batch-no');
  const quantityInput = document.getElementById('quantity');
  const priceInput = document.getElementById('selling-price');
  const customerNameInput = document.getElementById('customer-name');

  if (!productSelect.value || !batchSelect.value) {
    alert('Please select a product and batch number.');
    return;
  }

  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const batchOption = batchSelect.options[batchSelect.selectedIndex];

  let productId = selectedOption.getAttribute("data-id");
  let barcode = selectedOption.getAttribute("data-barcode") || productSelect.value;

  if (!productId) {
    console.warn("⚠️ Product missing numeric id, fallback to barcode only:", barcode);

    // ✅ FIX: keep barcode clean (remove "|batch")
    if (barcode.includes("|")) {
      barcode = barcode.split("|")[0];
    }

    productId = null;
  } else {
    productId = parseInt(productId, 10);
  }

  // ✅ Clean product name
  const rawName = selectedOption.textContent.trim();
  const productName = rawName.includes("(")
    ? rawName.split("(")[0].trim()
    : rawName;

  const batchNumber = batchOption.value;
  const quantity = parseInt(quantityInput.value);
  const selling_price = parseFloat(priceInput.value);
  const customerName = customerNameInput.value;

  if (!quantity || quantity <= 0 || !selling_price || selling_price < 0) {
    alert('Please enter valid quantity and selling price.');
    return;
  }

  cart.push({
    productId,
    productName,
    barcode,        // ✅ now clean (just "k223" / "As 22" / "D1267")
    batchNumber,
    quantity,
    selling_price,
    customerName
  });

  console.log("🛒 Added to cart:", cart[cart.length - 1]);
  renderCart();
}

// Edit item in cart
function editCartItem(index, field, value) {
  if (!cart[index]) return;
  if (field === 'quantity') {
    cart[index].quantity = parseInt(value) || 1;
  } else if (field === 'selling_price') {
    cart[index].selling_price = parseFloat(value) || 0;
  }
  renderCart();
}

// Remove item from cart
function removeItemFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

/* =========================================================
   POS Checkout + Order Management
   ========================================================= */

// ===============================================
// ✅ PATCH: checkoutOrder
// ===============================================
async function checkoutOrder() {
  console.log("🛒 Checking out order...", new Date().toISOString());

  if (!cart.length) {
    alert("Cart is empty. Please add items before checkout.");
    return;
  }

  try {
    const client = await ensureSupabaseClient(); // ✅ unified client

    // Create new order
    const { data: newOrder, error: orderError } = await client
      .from("orders")
      .insert({
        customer_name: cart[0].customerName || null,
        sale_date: new Date().toISOString().replace("Z", "+08:00"),
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    for (const item of cart) {
      if (!item.productId) {
        throw new Error(`Missing valid product ID for ${item.productName}`);
      }

      const { error: itemError } = await client.from("order_items").insert({
        order_id: newOrder.id,
        product_id: item.productId,
        quantity: item.quantity,
        selling_price: item.selling_price,
        batch_no: item.batchNumber || null,
      });

      if (itemError) throw itemError;

      // Decrement batch quantity
      const { data: batchRow, error: fetchBatchErr } = await client
        .from("product_batches")
        .select("id, quantity")
        .eq("product_id", item.productId)
        .eq("batch_no", item.batchNumber || null)
        .maybeSingle();

      if (fetchBatchErr) throw fetchBatchErr;
      if (batchRow) {
        const { error: batchError } = await client
          .from("product_batches")
          .update({ quantity: batchRow.quantity - item.quantity })
          .eq("id", batchRow.id);
        if (batchError) throw batchError;
      }

      // Decrement product stock
      const { data: productRow, error: fetchProductErr } = await client
        .from("products")
        .select("id, stock")
        .eq("id", item.productId)
        .maybeSingle();

      if (fetchProductErr) throw fetchProductErr;
      if (productRow) {
        const { error: prodError } = await client
          .from("products")
          .update({ stock: productRow.stock - item.quantity })
          .eq("id", productRow.id);
        if (prodError) throw prodError;
      }
    }

    console.log("✅ Checkout complete, clearing cart");
    cart = [];
    renderCart();
    if (typeof loadCustomerSales === "function") loadCustomerSales();
    alert("Order placed successfully!");
  } catch (error) {
    console.error("❌ Error during checkout:", error.message, new Date().toISOString());
    alert(`Checkout failed: ${error.message}`);
  }
}

// ===============================================
// ✅ PATCH: loadCustomerSales
// ===============================================
async function loadCustomerSales() {
  console.log("📦 Loading orders...", new Date().toISOString());
  try {
    const client = await ensureSupabaseClient(); // ✅ unified client
    const { data, error } = await client
      .from("orders")
      .select(
        `
        id,
        customer_name,
        sale_date,
        order_items (
          id,
          quantity,
          selling_price,
          batch_no,
          products ( id, product_name, barcode )
        )
      `
      )
      .order("sale_date", { ascending: false });

    if (error) throw error;

    console.log("📊 Orders:", data);
    renderCustomerSales(data || []);
  } catch (error) {
    console.error("❌ Error loading orders:", error, new Date().toISOString());
    const errorEl = document.getElementById("error");
    if (errorEl) {
      errorEl.textContent = `Failed to load customer sales: ${error.message}`;
      clearMessage("error", 10000);
    }
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
