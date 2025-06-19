let supabaseClient = null;

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
    'original-stock-in': 'Original Stock-In'
  },
  zh: {
    'nav-home': '首頁',
    'nav-analytics': '分析',
    'nav-manage-products': '管理產品',
    'nav-manage-vendors': '管理供應商',
    'nav-record-customer-sales': '記錄客戶銷售',
    'nav-vendor-loan-record': '供應商貸貨記錄',
    'toggle-language': '切換語言',
    'home-welcome': '歡迎來到首頁！',
    'manage-products-welcome': '歡迎來到管理產品！',
    'manage-vendors-welcome': '歡迎來到管理供應商！',
    'vendor-loan-record-welcome': '歡迎來到供應商貸貨記錄！',
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
    'original-stock-in': '原始入庫數量'
  }
};

function applyTranslations() {
  console.log('Applying translations...');
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const lang = isChinese ? 'zh' : 'en';
  document.querySelectorAll('[data-lang-key]').forEach(element => {
    const key = element.getAttribute('data-lang-key');
    element.textContent = translations[lang][key] || element.textContent;
  });
  console.log('Applied translations for:', lang);
}

function toggleLanguage() {
  console.log('Toggling language...');
  const body = document.getElementById('lang-body');
  if (body) {
    body.classList.toggle('lang-zh');
    applyTranslations();
    if (document.querySelector('#products-table')) loadProducts();
    if (document.querySelector('#vendors-table')) loadVendors();
    if (document.querySelector('#loan-records-table')) loadLoanRecords();
    if (document.querySelector('#customer-sales')) loadCustomerSales();
    if (document.querySelector('#analytics-overview-text') || document.querySelector('#product-report-table')) loadAnalytics();
  }
}

function getGMT8Date() {
  const date = new Date();
  date.setHours(date.getHours() + 8);
  const today = date.toISOString().slice(0, 10).split('-');
  return `${today[2]}${today[1]}${today[0].slice(-2)}`;
}

async function ensureSupabaseClient() {
  try {
    console.log('Ensuring Supabase client...');
    if (!('supabase' in window)) {
      throw new Error('Supabase library not loaded');
    }
    if (!supabaseClient) {
      supabaseClient = supabase.createClient(
        'https://aouduygmcspiqauhrabx.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdWR1eWdtY3NwaXFhdWhyYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTM5MzAsImV4cCI6MjA2MDgyOTkzMH0.s8WMvYdE9csSb1xb6jv84aiFBBU_LpDi1aserTQDg-k'
      );
      console.log('Supabase Client Initialized in common.js:', Object.keys(supabaseClient));
    }
    return supabaseClient;
  } catch (error) {
    console.error('Error initializing Supabase client:', error.message);
    throw error;
  }
}

function setLoading(isLoading) {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.style.display = isLoading ? 'block' : 'none';
  }
}

function clearMessage(type) {
  setTimeout(() => {
    const el = document.getElementById(type);
    if (el) el.textContent = '';
  }, 1000);
}

// Existing functions (handleAddCustomerSale, handleDeleteSale, etc.) remain unchanged
// Only adding new functions for analytics

async function loadAnalytics() {
  console.log('Loading analytics...');
  try {
    const form = document.getElementById('report-form');
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        setLoading(true);
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

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
        await generateVendorLoanReport(startDate, endDate);
        setLoading(false);
      });
    }
  } catch (error) {
    console.error('Error setting up analytics:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入分析：${error.message}` : `Failed to load analytics: ${error.message}`}`;
      clearMessage('error');
    }
    setLoading(false);
  }
}

async function generateProductReport(startDate, endDate) {
  console.log('Generating product report...', { startDate, endDate });
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    // Fetch current products
    const { data: products, error: productsError } = await client
      .from('products')
      .select('id, name, price as buy_in_price, batch_no, stock');
    if (productsError) throw productsError;

    // Fetch sales within date range
    const { data: sales, error: salesError } = await client
      .from('customer_sales')
      .select('product_id, quantity, sale_date, products (batch_no)')
      .gte('sale_date', startDate)
      .lte('sale_date', endDate);
    if (salesError) throw salesError;

    // Fetch loans within date range
    const { data: loans, error: loansError } = await client
      .from('vendor_loans')
      .select('product_id, quantity, date, products (batch_no)')
      .gte('date', startDate)
      .lte('date', endDate);
    if (loansError) throw loansError;

    const productReportBody = document.querySelector('#product-report-table tbody');
    if (productReportBody) {
      productReportBody.innerHTML = '';
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');

      products.forEach(product => {
        const salesForProduct = sales.filter(s => s.product_id === product.id && s.products.batch_no === product.batch_no);
        const loansForProduct = loans.filter(l => l.product_id === product.id && l.products.batch_no === product.batch_no);

        const soldQuantity = salesForProduct.reduce((sum, s) => sum + s.quantity, 0);
        const loanedQuantity = loansForProduct.reduce((sum, l) => sum + l.quantity, 0);
        const originalStockIn = product.stock + soldQuantity + loanedQuantity;

        const row = `
          <tr>
            <td class="border p-2">${product.name || (isChinese ? '未知產品' : 'Unknown Product')}</td>
            <td class="border p-2">${product.batch_no || (isChinese ? '無' : 'N/A')}</td>
            <td class="border p-2">${product.buy_in_price ? product.buy_in_price.toFixed(2) : (isChinese ? '無' : 'N/A')}</td>
            <td class="border p-2">${originalStockIn}</td>
            <td class="border p-2">${product.stock}</td>
          </tr>
        `;
        productReportBody.innerHTML += row;
      });

      if (products.length === 0) {
        productReportBody.innerHTML = `<tr><td colspan="5" data-lang-key="no-products-found" class="border p-2">${isChinese ? '未找到產品。' : 'No products found.'}</td></tr>`;
      }
      applyTranslations();
    }
  } catch (error) {
    console.error('Error generating product report:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `生成產品報告失敗：${error.message}` : `Failed to generate product report: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function generateVendorLoanReport(startDate, endDate) {
  console.log('Generating vendor loan report...', { startDate, endDate });
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    const { data: loans, error: loansError } = await client
      .from('vendor_loans')
      .select(`
        id,
        vendor_id,
        product_id,
        quantity,
        date,
        vendors (name),
        products (name, batch_no)
      `)
      .gte('date', startDate)
      .lte('date', endDate);
    if (loansError) throw loansError;

    const vendorLoanReportBody = document.querySelector('#vendor-loan-report-table tbody');
    if (vendorLoanReportBody) {
      vendorLoanReportBody.innerHTML = '';
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');

      if (loans.length > 0) {
        loans.forEach(loan => {
          const row = `
            <tr>
              <td class="border p-2">${loan.vendors.name || (isChinese ? '未知供應商' : 'Unknown Vendor')}</td>
              <td class="border p-2">${loan.products.name || (isChinese ? '未知產品' : 'Unknown Product')}</td>
              <td class="border p-2">${loan.products.batch_no || (isChinese ? '無' : 'N/A')}</td>
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
    console.error('Error generating vendor loan report:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `生成供應商貸貨報告失敗：${error.message}` : `Failed to generate vendor loan report: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

// Existing functions (handleAddVendor, loadVendors, etc.) remain unchanged
// Add event listener for analytics page
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-vendor-form');
  if (form) {
    form.addEventListener('submit', handleAddVendor);
  }
  loadVendors(); // Load vendors on page load for vendors.html
  const toggleButton = document.getElementById('toggle-language');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleLanguage);
  }
  if (document.getElementById('report-form')) {
    loadAnalytics(); // Initialize analytics functionality
  }
});
