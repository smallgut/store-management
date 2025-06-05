// Initialize Supabase client
let supabaseClient = null;

// Translation dictionary
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
    'add-product': 'Add Product',
    'product-barcode': 'Product Barcode',
    'product-name': 'Product Name',
    'stock': 'Stock',
    'buy-in-price': 'Buy-In Price',
    'add-vendor': 'Add Vendor',
    'vendor-name': 'Vendor Name',
    'vendor-contact': 'Vendor Contact',
    'manage-products': 'Manage Products',
    'manage-vendors': 'Manage Vendors',
    'add-loan-record': 'Add Loan Record',
    'loan-amount': 'Loan Amount',
    'loan-date': 'Loan Date',
    'vendor-loan-records': 'Vendor Loan Records',
    'no-products-found': 'No products found.',
    'unknown-product': 'Unknown Product',
    'no-customer-sales-found': 'No customer sales found.',
    'delete-confirm': 'Delete this sale?',
    'sub-total': 'Sub-Total'
  },
  zh: {
    'nav-home': '首頁',
    'nav-analytics': '分析',
    'nav-manage-products': '管理產品',
    'nav-manage-vendors': '管理供應商',
    'nav-record-customer-sales': '記錄客戶銷售',
    'nav-vendor-loan-record': '供應商貸款記錄',
    'toggle-language': '切換語言',
    'home-welcome': '歡迎來到首頁！',
    'manage-products-welcome': '歡迎來到管理產品！',
    'manage-vendors-welcome': '歡迎來到管理供應商！',
    'vendor-loan-record-welcome': '歡迎來到供應商貸款記錄！',
    'add-product': '添加產品',
    'product-barcode': '產品條碼',
    'product-name': '產品名稱',
    'stock': '庫存',
    'buy-in-price': '進貨價',
    'add-vendor': '添加供應商',
    'vendor-name': '供應商名稱',
    'vendor-contact': '供應商聯繫方式',
    'manage-products': '管理產品',
    'manage-vendors': '管理供應商',
    'add-loan-record': '添加貸款記錄',
    'loan-amount': '貸款金額',
    'loan-date': '貸款日期',
    'vendor-loan-records': '供應商貸款記錄',
    'no-products-found': '未找到產品。',
    'unknown-product': '未知產品',
    'no-customer-sales-found': '未找到客戶銷售記錄。',
    'delete-confirm': '刪除此銷售記錄？',
    'sub-total': '小計'
  }
};

// Function to apply translations
function applyTranslations() {
  const isChinese = document.getElementById('lang-body').classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';
  document.querySelectorAll('[data-lang-key]').forEach(element => {
    const key = element.getAttribute('data-lang-key');
    element.textContent = translations[lang][key] || element.textContent;
  });
  console.log('Applied translations for:', lang);
}

// Toggle Language Function
function toggleLanguage() {
  console.log('Toggling language...');
  const body = document.getElementById('lang-body');
  body.classList.toggle('lang-zh');
  applyTranslations();
  // Reload relevant data based on the page
  if (document.querySelector('#products-table')) loadProducts();
  if (document.querySelector('#vendors-table')) loadVendors();
  if (document.querySelector('#loan-records-table')) loadLoanRecords();
  if (document.querySelector('#customer-sales')) loadCustomerSales();
  if (document.querySelector('#analytics-overview-text')) loadAnalytics();
}

// ... (keep existing functions like ensureSupabaseClient, setLoading, clearMessage)

// Handle Add Product
function handleAddProduct() {
  const product = {
    barcode: document.getElementById('product-barcode').value,
    name: document.getElementById('product-name').value,
    stock: parseInt(document.getElementById('stock').value),
    price: parseFloat(document.getElementById('buy-in-price').value)
  };
  addProduct(product);
}

// Load Products
async function loadProducts() {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: products, error } = await client
      .from('products')
      .select('*')
      .order('name');
    if (error) throw error;
    console.log('Products:', products);
    const productsBody = document.querySelector('#products-table tbody');
    if (productsBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      productsBody.innerHTML = products.length
        ? products.map(p => `
          <tr>
            <td class="border p-2">${p.barcode}</td>
            <td class="border p-2">${p.name}</td>
            <td class="border p-2">${p.stock}</td>
            <td class="border p-2">${p.price.toFixed(2)}</td>
            <td class="border p-2">
              <button onclick="handleDeleteProduct('${p.id}')" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
            </td>
          </tr>
        `).join('')
        : `<tr><td colspan="5" data-lang-key="no-products-found" class="border p-2">${isChinese ? '未找到產品。' : 'No products found.'}</td></tr>`;
      applyTranslations();
    }
  } catch (error) {
    console.error('Error loading products:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法載入產品：${error.message}` : `Failed to load products: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

// Add Product
async function addProduct(product) {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data, error } = await client
      .from('products')
      .insert(product)
      .select();
    if (error) throw error;
    console.log('Product added:', data);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString()}] ${isChinese ? '產品添加成功' : 'Product added successfully'}`;
    clearMessage('message');
    loadProducts();
  } catch (error) {
    console.error('Error adding product:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `添加產品失敗：${error.message}` : `Failed to add product: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

// Handle Delete Product
function handleDeleteProduct(productId) {
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  if (confirm(translations[isChinese ? 'zh' : 'en']['delete-confirm'])) {
    deleteProduct(productId);
  }
}

// Delete Product
async function deleteProduct(productId) {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) throw error;
    console.log('Product deleted:', productId);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString()}] ${isChinese ? '產品刪除成功' : 'Product deleted successfully'}`;
    clearMessage('message');
    loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `刪除產品失敗：${error.message}` : `Failed to delete product: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

// Handle Add Vendor
function handleAddVendor() {
  const vendor = {
    name: document.getElementById('vendor-name').value,
    contact: document.getElementById('vendor-contact').value
  };
  addVendor(vendor);
}

// Load Vendors
async function loadVendors() {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: vendors, error } = await client
      .from('vendors')
      .select('*')
      .order('name');
    if (error) throw error;
    console.log('Vendors:', vendors);
    const vendorsBody = document.querySelector('#vendors-table tbody');
    if (vendorsBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      vendorsBody.innerHTML = vendors.length
        ? vendors.map(v => `
          <tr>
            <td class="border p-2">${v.name}</td>
            <td class="border p-2">${v.contact}</td>
            <td class="border p-2">
              <button onclick="handleDeleteVendor('${v.id}')" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
            </td>
          </tr>
        `).join('')
        : `<tr><td colspan="3" data-lang-key="no-vendors-found" class="border p-2">${isChinese ? '未找到供應商。' : 'No vendors found.'}</td></tr>`;
      applyTranslations();
    }
  } catch (error) {
    console.error('Error loading vendors:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法載入供應商：${error.message}` : `Failed to load vendors: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

// Add Vendor
async function addVendor(vendor) {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data, error } = await client
      .from('vendors')
      .insert(vendor)
      .select();
    if (error) throw error;
    console.log('Vendor added:', data);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString()}] ${isChinese ? '供應商添加成功' : 'Vendor added successfully'}`;
    clearMessage('message');
    loadVendors();
  } catch (error) {
    console.error('Error adding vendor:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `添加供應商失敗：${error.message}` : `Failed to add vendor: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

// Handle Delete Vendor
function handleDeleteVendor(vendorId) {
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  if (confirm(translations[isChinese ? 'zh' : 'en']['delete-confirm'])) {
    deleteVendor(vendorId);
  }
}

// Delete Vendor
async function deleteVendor(vendorId) {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { error } = await client
      .from('vendors')
      .delete()
      .eq('id', vendorId);
    if (error) throw error;
    console.log('Vendor deleted:', vendorId);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString()}] ${isChinese ? '供應商刪除成功' : 'Vendor deleted successfully'}`;
    clearMessage('message');
    loadVendors();
  } catch (error) {
    console.error('Error deleting vendor:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `刪除供應商失敗：${error.message}` : `Failed to delete vendor: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

// Handle Add Loan Record
function handleAddLoanRecord() {
  const loan = {
    vendor_name: document.getElementById('vendor-name').value,
    amount: parseFloat(document.getElementById('loan-amount').value),
    date: document.getElementById('loan-date').value
  };
  addLoanRecord(loan);
}

// Load Loan Records
async function loadLoanRecords() {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: loans, error } = await client
      .from('vendor_loans')
      .select('*')
      .order('date');
    if (error) throw error;
    console.log('Loan Records:', loans);
    const loansBody = document.querySelector('#loan-records-table tbody');
    if (loansBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      loansBody.innerHTML = loans.length
        ? loans.map(l => `
          <tr>
            <td class="border p-2">${l.vendor_name}</td>
            <td class="border p-2">${l.amount.toFixed(2)}</td>
            <td class="border p-2">${new Date(l.date).toLocaleDateString()}</td>
            <td class="border p-2">
              <button onclick="handleDeleteLoanRecord('${l.id}')" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
            </td>
          </tr>
        `).join('')
        : `<tr><td colspan="4" data-lang-key="no-loan-records-found" class="border p-2">${isChinese ? '未找到貸款記錄。' : 'No loan records found.'}</td></tr>`;
      applyTranslations();
    }
  } catch (error) {
    console.error('Error loading loan records:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法載入貸款記錄：${error.message}` : `Failed to load loan records: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

// Add Loan Record
async function addLoanRecord(loan) {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data, error } = await client
      .from('vendor_loans')
      .insert({ ...loan, date: new Date(loan.date).toISOString() })
      .select();
    if (error) throw error;
    console.log('Loan record added:', data);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString()}] ${isChinese ? '貸款記錄添加成功' : 'Loan record added successfully'}`;
    clearMessage('message');
    loadLoanRecords();
  } catch (error) {
    console.error('Error adding loan record:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `添加貸款記錄失敗：${error.message}` : `Failed to add loan record: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

// Handle Delete Loan Record
function handleDeleteLoanRecord(loanId) {
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  if (confirm(translations[isChinese ? 'zh' : 'en']['delete-confirm'])) {
    deleteLoanRecord(loanId);
  }
}

// Delete Loan Record
async function deleteLoanRecord(loanId) {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { error } = await client
      .from('vendor_loans')
      .delete()
      .eq('id', loanId);
    if (error) throw error;
    console.log('Loan record deleted:', loanId);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString()}] ${isChinese ? '貸款記錄刪除成功' : 'Loan record deleted successfully'}`;
    clearMessage('message');
    loadLoanRecords();
  } catch (error) {
    console.error('Error deleting loan record:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `刪除貸款記錄失敗：${error.message}` : `Failed to delete loan record: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

// Include existing functions (ensureSupabaseClient, setLoading, clearMessage, loadCustomerSales, addCustomerSale, deleteCustomerSale, loadAnalytics)
