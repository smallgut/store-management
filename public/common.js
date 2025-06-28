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
    'customer-sales-report': '客戶銷售報告',
    'original-stock-in': '原始入庫數量',
    'all-customers': '-- 所有客戶 --',
    'all-vendors': '-- 所有供應商 --',
    'unknown-vendor': '未知供應商'
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

async function ensureSupabaseClient() {
  try {
    console.log('Ensuring Supabase client...', new Date().toISOString());
    if (!('supabase' in window)) {
      throw new Error('Supabase library not loaded');
    }
    if (!supabaseClient) {
      supabaseClient = supabase.createClient(
        'https://aouduygmcspiqauhrabx.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdWR1eWdtY3NwaXFhdWhyYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTM5MzAsImV4cCI6MjA2MDgyOTkzMH0.s8WMvYdE9csSb1xb6jv84aiFBBU_LpDi1aserTQDg-k'
      );
      console.log('Supabase Client Initialized in common.js:', Object.keys(supabaseClient), new Date().toISOString());
    }
    return supabaseClient;
  } catch (error) {
    console.error('Error initializing Supabase client:', error.message, new Date().toISOString());
    throw error;
  }
}

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

async function populateProductDropdown(barcodeInput = null) {
  console.log('Populating product dropdown...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    const { data: products, error: productError } = await client
      .from('products')
      .select('id, barcode, name, stock, batch_no, price')
      .gt('stock', 0) // Only include products with stock > 0
      .order('name');
    if (productError) throw productError;

    console.log('Products for dropdown:', products, new Date().toISOString());

    const productSelect = document.getElementById('product-select');
    const batchNoSelect = document.getElementById('batch-no');
    const productBarcodeInput = document.getElementById('product-barcode');
    const stockDisplay = document.getElementById('stock-display');

    if (!productSelect || !batchNoSelect || !productBarcodeInput || !stockDisplay) {
      console.error('One or more dropdown elements not found:', { productSelect, batchNoSelect, productBarcodeInput, stockDisplay }, new Date().toISOString());
      return;
    }

    const proto = Object.getPrototypeOf(productSelect);
    if (proto.hasOwnProperty('change')) {
      productSelect.removeEventListener('change', proto.change);
    }
    if (proto.hasOwnProperty('input')) {
      productBarcodeInput.removeEventListener('input', proto.input);
    }

    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const lang = isChinese ? 'zh' : 'en';
    productSelect.innerHTML = '<option value="">-- Select a Product --</option>';

    products.forEach(p => {
      const option = document.createElement('option');
      option.value = `${p.barcode}|${p.batch_no || 'NO_BATCH'}`;
      option.textContent = `${p.name} (Barcode: ${p.barcode}, Batch: ${p.batch_no || 'None'}, Stock: ${p.stock}, Buy-In Price: ${p.price ? p.price.toFixed(2) : 'N/A'})`;
      productSelect.appendChild(option);
    });

    const updateSelection = (inputBarcode = null) => {
      console.log('Updating selection with barcode:', inputBarcode, new Date().toISOString());
      if (!productSelect || !batchNoSelect || !productBarcodeInput || !stockDisplay) {
        console.error('DOM elements missing during update:', { productSelect, batchNoSelect, productBarcodeInput, stockDisplay }, new Date().toISOString());
        return;
      }
      const inputValue = inputBarcode || productSelect.value || productBarcodeInput.value;
      let selectedBarcode = '';
      let selectedBatchNo = '';

      if (inputValue.includes('|')) {
        [selectedBarcode, selectedBatchNo] = inputValue.split('|');
        if (selectedBatchNo === 'NO_BATCH') selectedBatchNo = null;
      } else {
        selectedBarcode = inputValue;
      }

      const selectedProduct = products.find(p => p.barcode === selectedBarcode && (p.batch_no === selectedBatchNo || (!p.batch_no && selectedBatchNo === null)));

      batchNoSelect.innerHTML = '<option value="">-- Select Batch No. --</option>';
      stockDisplay.textContent = '';

      if (selectedProduct) {
        productBarcodeInput.value = selectedBarcode;
        const option = document.createElement('option');
        option.value = selectedProduct.batch_no || 'NO_BATCH';
        option.textContent = `${selectedProduct.batch_no || 'None'} (Stock: ${selectedProduct.stock}, Buy-In Price: ${selectedProduct.price ? selectedProduct.price.toFixed(2) : 'N/A'})`;
        batchNoSelect.appendChild(option);
        batchNoSelect.value = selectedProduct.batch_no || 'NO_BATCH';
        stockDisplay.textContent = `${translations[lang]['on-hand-stock']}: ${selectedProduct.stock}`;
      } else if (selectedBarcode) {
        const matchingProducts = products.filter(p => p.barcode === selectedBarcode);
        if (matchingProducts.length > 0) {
          productBarcodeInput.value = selectedBarcode;
          matchingProducts.forEach(p => {
            const option = document.createElement('option');
            option.value = p.batch_no || 'NO_BATCH';
            option.textContent = `${p.batch_no || 'None'} (Stock: ${p.stock}, Buy-In Price: ${p.price ? p.price.toFixed(2) : 'N/A'})`;
            batchNoSelect.appendChild(option);
          });
          stockDisplay.textContent = `${translations[lang]['on-hand-stock']}: ${matchingProducts[0].stock}`;
        } else {
          productBarcodeInput.value = inputBarcode || productBarcodeInput.value;
          stockDisplay.textContent = isChinese ? '無匹配產品' : 'No matching product';
          stockDisplay.classList.add('text-red-500');
          setTimeout(() => stockDisplay.classList.remove('text-red-500'), 1000);
        }
      } else {
        productBarcodeInput.value = inputBarcode || productBarcodeInput.value;
        stockDisplay.textContent = '';
      }
    };

    productSelect.addEventListener('change', () => updateSelection());
    productBarcodeInput.addEventListener('input', () => updateSelection(productBarcodeInput.value));
    setTimeout(() => updateSelection(barcodeInput), 100);
  } catch (error) {
    console.error('Error populating product dropdown:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入產品下拉選單：${error.message}` : `Failed to populate product dropdown: ${error.message}`}`;
      clearMessage('error');
    }
  }
}

async function populateVendorDropdown() {
  console.log('Populating vendor dropdown...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    const vendorSelect = document.getElementById('vendor-name');
    if (!vendorSelect) return;

    vendorSelect.innerHTML = '<option value="" disabled selected>Select a vendor</option>';
    const { data: vendors, error } = await client.from('vendors').select('id, name');
    if (error) throw error;

    console.log('Vendors for dropdown:', vendors, new Date().toISOString());
    vendors.forEach(vendor => {
      const option = document.createElement('option');
      option.value = vendor.id; // Use numeric ID
      option.textContent = vendor.name;
      vendorSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating vendor dropdown:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入供應商下拉選單：${error.message}` : `Failed to populate vendor dropdown: ${error.message}`}`;
      clearMessage('error', 10000);
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

async function loadCustomerSales() {
  console.log('Loading customer sales...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: sales, error } = await client
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
      .order('sale_date', { ascending: false });
    if (error) throw error;

    console.log('Customer Sales:', sales, new Date().toISOString());
    const salesBody = document.querySelector('#customer-sales tbody');
    if (salesBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      salesBody.innerHTML = sales.length
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
                <td class="border p-2">
                  <button data-sale-id="${s.id}" data-product-barcode="${s.products?.barcode || ''}" data-quantity="${s.quantity}" class="delete-sale bg-red-500 text-white p-1 rounded hover:bg-red-600">Delete</button>
                </td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="10" data-lang-key="no-customer-sales-found" class="border p-2">${isChinese ? '未找到客戶銷售記錄。' : 'No customer sales found.'}</td></tr>`;
      applyTranslations();
      populateProductDropdown();
      document.querySelectorAll('.delete-sale').forEach(button => {
        button.addEventListener('click', (e) => {
          const saleId = e.target.getAttribute('data-sale-id');
          const productBarcode = e.target.getAttribute('data-product-barcode');
          const quantity = parseInt(e.target.getAttribute('data-quantity'));
          handleDeleteSale(saleId, productBarcode, quantity);
        });
      });
    }
  } catch (error) {
    console.error('Error loading customer sales:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入客戶銷售：${error.message}` : `Failed to load customer sales: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
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
              <td class="border p-2">${l.vendors?.name || (isChinese ? '未知供應商' : 'Unknown Vendor')}</td>
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
      date: new Date(loanDate).toISOString().replace('Z', '+08:00')
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

async function handleAddCustomerSale(event) {
  event.preventDefault();
  console.log('Adding customer sale...', new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    const productBarcode = String(document.getElementById('product-barcode')?.value || document.getElementById('product-select')?.value.split('|')[0] || '');
    const batchNo = String(document.getElementById('batch-no')?.value || '');
    const quantity = parseInt(document.getElementById('quantity')?.value?.replace(/,/g, '') || '0');
    const sellingPrice = parseFloat(document.getElementById('selling-price')?.value?.replace(/,/g, '') || '0');
    const saleDate = document.getElementById('sale-date')?.value;

    if (!productBarcode || !batchNo || !quantity || !sellingPrice || !saleDate) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const errorEl = document.getElementById('error');
      if (errorEl) {
        errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '請填寫所有必填字段' : 'Please fill in all required fields'}`;
        clearMessage('error', 10000);
      }
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

    const sale = {
      product_id: product.id,
      batch_no: batchNo === 'NO_BATCH' ? null : batchNo,
      quantity,
      selling_price: sellingPrice,
      date: new Date(saleDate).toISOString().replace('Z', '+08:00')
    };
    console.log('Sale data to insert:', sale, new Date().toISOString());

    const { data: newSale, error } = await client
      .from('customer_sales')
      .insert(sale)
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

    console.log('Customer sale added:', newSale, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '客戶銷售記錄添加成功' : 'Customer sale added successfully'}`;
    clearMessage('message', 10000);
    if (typeof loadCustomerSales === 'function') loadCustomerSales();
  } catch (error) {
    console.error('Error adding customer sale:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `添加客戶銷售記錄失敗：${error.message}` : `Failed to add customer sale: ${error.message}`}`;
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

async function generateProductReport(startDate, endDate) {
  console.log('Generating product report...', { startDate, endDate }, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);

    // Convert dates to DDMMYY format for batch_no filtering
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startBatch = `${start.getDate().toString().padStart(2, '0')}${String(start.getMonth() + 1).padStart(2, '0')}${start.getFullYear().toString().slice(-2)}`;
    const endBatch = `${end.getDate().toString().padStart(2, '0')}${String(end.getMonth() + 1).padStart(2, '0')}${end.getFullYear().toString().slice(-2)}`;

    const { data: products, error: productsError } = await client
      .from('products')
      .select('id, name, price, batch_no, stock')
      .gte('batch_no', startBatch)
      .lte('batch_no', endBatch);
    if (productsError) throw productsError;

    const { data: sales, error: salesError } = await client
      .from('customer_sales')
      .select('product_id, quantity, sale_date, products(batch_no)')
      .gte('sale_date', startDate)
      .lte('sale_date', endDate);
    if (salesError) throw salesError;

    const { data: loans, error: loansError } = await client
      .from('vendor_loans')
      .select('product_id, quantity, date, products(batch_no)')
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
            <td class="border p-2">${product.price ? product.price.toFixed(2) : (isChinese ? '無' : 'N/A')}</td>
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
    console.error('Error generating product report:', error.message, new Date().toISOString());
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
      .not('vendor_id', 'is', null); // Exclude records with null vendor_id

    if (vendorName) {
      query = query.eq('vendors.name', vendorName);
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
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `生成供應商貸貨報告失敗：${error.message}` : `Failed to generate vendor loan report: ${error.message}`}`;
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
      .select('id, barcode, name, stock, batch_no, price')
      .order('name');
    if (error) throw error;
    console.log('Products:', products, new Date().toISOString());
    const productsBody = document.querySelector('#products-table tbody');
    if (productsBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      productsBody.innerHTML = products.length
        ? products.map(p => {
            const inventoryValue = p.stock * (p.price || 0);
            return `
              <tr>
                <td class="border p-2">${p.barcode}</td>
                <td class="border p-2">${p.name}</td>
                <td class="border p-2">${p.stock}</td>
                <td class="border p-2">${p.batch_no || 'N/A'}</td>
                <td class="border p-2">${p.price ? p.price.toFixed(2) : 'N/A'}</td>
                <td class="border p-2">${inventoryValue.toFixed(2)}</td>
                <td class="border p-2">
                  <button data-product-id="${p.id}" data-stock="${p.stock}" data-price="${p.price || 0}" data-batch-no="${p.batch_no || ''}" class="update-product bg-blue-500 text-white p-1 rounded hover:bg-blue-600 mr-2">Update</button>
                  <button data-product-id="${p.id}" class="delete-product bg-red-500 text-white p-1 rounded hover:bg-red-600">Delete</button>
                </td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="7" data-lang-key="no-products-found" class="border p-2">${isChinese ? '未找到產品。' : 'No products found.'}</td></tr>`;
      applyTranslations();
      document.querySelectorAll('.update-product').forEach(button => {
        button.addEventListener('click', (e) => {
          const productId = e.target.getAttribute('data-product-id');
          const currentStock = parseInt(e.target.getAttribute('data-stock'));
          const currentPrice = parseFloat(e.target.getAttribute('data-price'));
          const currentBatchNo = e.target.getAttribute('data-batch-no');
          handleUpdateProduct(productId, currentStock, currentPrice, currentBatchNo);
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
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

function handleAddProduct(event) {
  event.preventDefault();
  console.log('Handling add product...', new Date().toISOString());
  const barcode = document.getElementById('product-barcode')?.value;
  const name = document.getElementById('product-name')?.value;
  const stock = parseInt(document.getElementById('stock')?.value || '0');
  const price = parseFloat(document.getElementById('buy-in-price')?.value || '0');

  if (!barcode || !name || !stock || !price) {
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '請填寫所有必填字段' : 'Please fill in all required fields'}`;
      clearMessage('error');
    }
    return;
  }

  const product = { barcode, name, stock, price, batch_no: getGMT8Date() };
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
    clearMessage('message');
    loadProducts();
  } catch (error) {
    console.error('Error adding product:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `添加產品失敗：${error.message}` : `Failed to add product: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

function handleUpdateProduct(productId, currentStock, currentPrice, currentBatchNo) {
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  const newStock = prompt(isChinese ? '輸入新的庫存數量：' : 'Enter new stock quantity:', currentStock);
  const newPrice = prompt(isChinese ? '輸入新的進貨價：' : 'Enter new buy-in price:', currentPrice);

  if (newStock !== null && newPrice !== null) {
    const stock = parseInt(newStock);
    const price = parseFloat(newPrice);
    if (!isNaN(stock) && stock >= 0 && !isNaN(price) && price >= 0) {
      const batchNo = getGMT8Date();
      updateProduct(productId, stock, price, batchNo);
    } else {
      alert(isChinese ? '請輸入有效的庫存和價格！' : 'Please enter valid stock and price!');
    }
  }
}

async function updateProduct(productId, stock, price, batchNo) {
  console.log('Updating product...', { productId, stock, price, batchNo }, new Date().toISOString());
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data, error } = await client
      .from('products')
      .update({ stock, price, batch_no: batchNo })
      .eq('id', productId)
      .select();
    if (error) throw error;
    console.log('Product updated:', data, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '產品更新成功' : 'Product updated successfully'}`;
    clearMessage('message');
    loadProducts();
  } catch (error) {
    console.error('Error updating product:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `更新產品失敗：${error.message}` : `Failed to update product: ${error.message}`}`;
      clearMessage('error');
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
        : `<tr><td colspan="3" data-lang-key="no-vendors-found" class="border p-2">${isChinese ? '未找到供應商。' : 'No vendors found.'}</td></tr>`;
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
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入供應商：${error.message}` : `Failed to load vendors: ${error.message}`}`;
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
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '供應商添加成功' : 'Vendor added successfully'}`;
    clearMessage('message');
    loadVendors();
    populateVendorDropdown();
  } catch (error) {
    console.error('Error adding vendor:', error.message, error.details, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `添加供應商失敗：${error.message}` : `Failed to add vendor: ${error.message}`}${error.details ? ` - ${error.details}` : ''}`;
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
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '供應商刪除成功' : 'Vendor deleted successfully'}`;
    clearMessage('message');
    loadVendors();
  } catch (error) {
    console.error('Error deleting vendor:', error.message, new Date().toISOString());
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `刪除供應商失敗：${error.message}` : `Failed to delete vendor: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed', new Date().toISOString());
  const toggleButton = document.getElementById('toggle-language');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleLanguage);
  }

  if (document.getElementById('add-vendor-form')) {
    const form = document.getElementById('add-vendor-form');
    if (form) form.addEventListener('submit', handleAddVendor);
    loadVendors();
  }
  if (document.getElementById('add-product-form')) {
    const form = document.getElementById('add-product-form');
    if (form) form.addEventListener('submit', handleAddProduct);
    loadProducts();
  }
  if (document.getElementById('add-customer-sale-form')) {
    const form = document.getElementById('add-customer-sale-form');
    if (form) form.addEventListener('submit', handleAddCustomerSale);
    loadCustomerSales();
    populateProductDropdown();
  }
  if (document.getElementById('add-loan-record-form')) {
    const form = document.getElementById('add-loan-record-form');
    if (form) form.addEventListener('submit', addLoanRecord);
    loadLoanRecords();
    populateProductDropdown();
    populateVendorDropdown();
  }
  if (document.getElementById('report-form')) {
    loadAnalytics();
  }
});
