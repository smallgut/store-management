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
    'select-vendor': 'Select Vendor',
    'select-loaner': 'Select Loaner',
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
    'loan-product': 'Loan Product',
    'loan-quantity': 'Loan Quantity',
    'loan-date': 'Loan Date',
    'vendor-loan-records': 'Vendor Loan Records',
    'no-products-found': 'No products found.',
    'no-vendors-found': 'No vendors found.',
    'no-loan-records-found': 'No loan records found.',
    'unknown-product': 'Unknown Product',
    'no-customer-sales-found': 'No customer sales found.',
    'delete-confirm': 'Delete this record?',
    'update': 'Update',
    'sub-total': 'Sub-Total',
    'on-hand-stock': 'On-Hand Stock'
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
    'select-vendor': '選擇供應商',
    'select-loaner': '選擇貸貨人',
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
    'loan-product': '貸貨產品',
    'loan-quantity': '貸貨數量',
    'loan-date': '貸貨日期',
    'vendor-loan-records': '供應商貸貨記錄',
    'no-products-found': '未找到產品。',
    'no-vendors-found': '未找到供應商。',
    'no-loan-records-found': '未找到貸貨記錄。',
    'unknown-product': '未知產品',
    'no-customer-sales-found': '未找到客戶銷售記錄。',
    'delete-confirm': '刪除此記錄？',
    'update': '更新',
    'sub-total': '小計',
    'on-hand-stock': '現有庫存'
  }
};

function applyTranslations() {
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
    if (document.querySelector('#analytics-overview-text')) loadAnalytics();
  }
}

function getGMT8Date() {
  const date = new Date();
  date.setHours(date.getHours() + 8);
  const today = date.toISOString().slice(0, 10).split('-');
  return `${today[2]}-${today[1]}-${today[0].slice(-2)}`;
}

async function ensureSupabaseClient() {
  try {
    if (!('supabase' in window)) {
      throw new Error('Supabase library not loaded');
    }
    if (!supabaseClient) {
      supabaseClient = supabase.createClient(
        'https://aouduygmcspiqauhrabx.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdWR1eWdtY3NwaXFhdWhyYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTM5MzAsImV4cCI6MjA2MDgyOTkzMH0.s8WMvYdE9csSb1xb6jv84aiFBBU_LpDi1aserTQDg-k'
      );
      console.log('Supabase Client Initialized:', Object.keys(supabaseClient));
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

function handleAddCustomerSale() {
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
  console.log('Sale ID:', saleId, 'Product Barcode:', productBarcode, 'Quantity:', quantity);
  if (confirm(translations[isChinese ? 'zh' : 'en']['delete-confirm'])) {
    deleteCustomerSale(saleId, productBarcode, quantity);
  }
}

async function populateProductDropdown(barcodeInput = null) {
  try {
    const client = await ensureSupabaseClient();
    const { data: products, error: productError } = await client
      .from('products')
      .select('id, barcode, name, stock, batch_no, price')
      .order('name');
    if (productError) throw productError;

    console.log('Products for dropdown:', products);

    const productSelect = document.getElementById('product-select');
    const batchNoSelect = document.getElementById('batch-no');
    const productBarcodeInput = document.getElementById('product-barcode');

    if (productSelect && batchNoSelect && productBarcodeInput) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const lang = isChinese ? 'zh' : 'en';
      productSelect.innerHTML = `<option value="">${translations[lang]['select-product']}</option>`;

      products.forEach(p => {
        const option = document.createElement('option');
        option.value = `${p.barcode}|${p.batch_no || 'NO_BATCH'}`;
        option.textContent = `${p.name} (Barcode: ${p.barcode}, Batch: ${p.batch_no || 'None'}, Stock: ${p.stock}, Buy-In Price: ${p.price ? p.price.toFixed(2) : 'N/A'})`;
        productSelect.appendChild(option);
      });

      const updateSelection = (inputBarcode = null) => {
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

        batchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>`;

        if (selectedProduct) {
          productBarcodeInput.value = selectedBarcode;
          const option = document.createElement('option');
          option.value = selectedProduct.batch_no || 'NO_BATCH';
          option.textContent = `${selectedProduct.batch_no || 'None'} (Stock: ${selectedProduct.stock}, Buy-In Price: ${selectedProduct.price ? selectedProduct.price.toFixed(2) : 'N/A'})`;
          batchNoSelect.appendChild(option);
          batchNoSelect.value = selectedProduct.batch_no || 'NO_BATCH';
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
          } else {
            productBarcodeInput.value = inputBarcode || productBarcodeInput.value;
          }
        } else {
          productBarcodeInput.value = inputBarcode || productBarcodeInput.value;
        }
      };

      productSelect.addEventListener('change', () => updateSelection());
      productBarcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          updateSelection(productBarcodeInput.value);
        }
      });
      updateSelection(barcodeInput);
    }
  } catch (error) {
    console.error('Error populating product dropdown:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入產品下拉選單：${error.message}` : `Failed to populate product dropdown: ${error.message}`}`;
      clearMessage('error');
    }
  }
}

async function populateLoanProductDropdown(barcodeInput = null) {
  try {
    const client = await ensureSupabaseClient();
    const { data: products, error: productError } = await client
      .from('products')
      .select('id, barcode, name, stock, batch_no, price')
      .order('name');
    if (productError) throw productError;

    console.log('Loan Products for dropdown:', products);

    const loanProductSelect = document.getElementById('loan-product-select');
    const loanProductBatchNoSelect = document.getElementById('loan-product-batch-no');
    const loanProductBarcodeInput = document.getElementById('loan-product-barcode');

    if (loanProductSelect && loanProductBatchNoSelect && loanProductBarcodeInput) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const lang = isChinese ? 'zh' : 'en';
      loanProductSelect.innerHTML = `<option value="">${translations[lang]['select-product']}</option>`;

      products.forEach(p => {
        const option = document.createElement('option');
        option.value = `${p.id}|${p.barcode}|${p.batch_no || 'NO_BATCH'}`;
        option.textContent = `${p.name} (Barcode: ${p.barcode}, Batch: ${p.batch_no || 'None'}, Stock: ${p.stock}, Buy-In Price: ${p.price ? p.price.toFixed(2) : 'N/A'})`;
        loanProductSelect.appendChild(option);
      });

      const updateLoanProductSelection = (inputBarcode = null) => {
        const inputValue = inputBarcode || loanProductSelect.value || loanProductBarcodeInput.value;
        let selectedId = '';
        let selectedBarcode = '';
        let selectedBatchNo = '';

        if (inputValue.includes('|')) {
          [selectedId, selectedBarcode, selectedBatchNo] = inputValue.split('|');
          if (selectedBatchNo === 'NO_BATCH') selectedBatchNo = null;
        } else {
          selectedBarcode = inputValue;
        }

        const selectedProduct = products.find(p => 
          (selectedId && p.id === parseInt(selectedId)) || 
          (p.barcode === selectedBarcode && (p.batch_no === selectedBatchNo || (!p.batch_no && selectedBatchNo === null)))
        );

        loanProductBatchNoSelect.innerHTML = `<option value="">${translations[lang]['batch-no']}</option>`;

        if (selectedProduct) {
          loanProductBarcodeInput.value = selectedProduct.barcode;
          const option = document.createElement('option');
          option.value = selectedProduct.batch_no || 'NO_BATCH';
          option.textContent = `${selectedProduct.batch_no || 'None'} (Stock: ${selectedProduct.stock}, Buy-In Price: ${selectedProduct.price ? selectedProduct.price.toFixed(2) : 'N/A'})`;
          loanProductBatchNoSelect.appendChild(option);
          loanProductBatchNoSelect.value = selectedProduct.batch_no || 'NO_BATCH';
        } else if (selectedBarcode) {
          const matchingProducts = products.filter(p => p.barcode === selectedBarcode);
          if (matchingProducts.length > 0) {
            loanProductBarcodeInput.value = selectedBarcode;
            matchingProducts.forEach(p => {
              const option = document.createElement('option');
              option.value = p.batch_no || 'NO_BATCH';
              option.textContent = `${p.batch_no || 'None'} (Stock: ${p.stock}, Buy-In Price: ${p.price ? p.price.toFixed(2) : 'N/A'})`;
              loanProductBatchNoSelect.appendChild(option);
            });
          } else {
            loanProductBarcodeInput.value = inputBarcode || loanProductBarcodeInput.value;
          }
        } else {
          loanProductBarcodeInput.value = inputBarcode || loanProductBarcodeInput.value;
        }
      };

      loanProductSelect.addEventListener('change', () => updateLoanProductSelection());
      loanProductBarcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          updateLoanProductSelection(loanProductBarcodeInput.value);
        }
      });
      updateLoanProductSelection(barcodeInput);
    }
  } catch (error) {
    console.error('Error populating loan product dropdown:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入貸貨產品下拉選單：${error.message}` : `Failed to populate loan product dropdown: ${error.message}`}`;
      clearMessage('error');
    }
  }
}

async function populateVendorDropdown() {
  try {
    const client = await ensureSupabaseClient();
    const { data: vendors, error: vendorError } = await client
      .from('vendors')
      .select('id, name')
      .order('name');
    if (vendorError) throw vendorError;

    console.log('Vendors for dropdown:', vendors);

    const vendorSelect = document.getElementById('vendor-name');
    if (vendorSelect) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const lang = isChinese ? 'zh' : 'en';
      vendorSelect.innerHTML = `<option value="">${translations[lang]['select-vendor']}</option>`;

      vendors.forEach(v => {
        const option = document.createElement('option');
        option.value = v.name;
        option.textContent = v.name;
        vendorSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error populating vendor dropdown:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入供應商下拉選單：${error.message}` : `Failed to populate vendor dropdown: ${error.message}`}`;
      clearMessage('error');
    }
  }
}

async function loadCustomerSales() {
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

    console.log('Customer Sales:', sales);

    const salesBody = document.querySelector('#customer-sales tbody');
    if (salesBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      salesBody.innerHTML = sales.length
        ? sales.map(s => {
            const sellingPrice = s.selling_price !== null ? s.selling_price : 0;
            const buyInPrice = s.products?.price || 0;
            const subTotal = s.quantity * sellingPrice;
            const profit = s.quantity * (sellingPrice - buyInPrice);
            return `
              <tr>
                <td class="border p-2">${s.products?.name || (isChinese ? '未知產品' : 'Unknown Product')}</td>
                <td class="border p-2">${s.products?.barcode || ''}</td>
                <td class="border p-2">${s.products?.batch_no || ''}</td>
                <td class="border p-2">${s.customer_name || ''}</td>
                <td class="border p-2">${s.quantity}</td>
                <td class="border p-2">${sellingPrice.toFixed(2)}</td>
                <td class="border p-2">${subTotal.toFixed(2)}</td>
                <td class="border p-2">${profit.toFixed(2)}</td>
                <td class="border p-2">${new Date(s.sale_date).toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })}</td>
                <td class="border p-2">
                  <button onclick="handleDeleteSale(${s.id}, '${s.products?.barcode || ''}', ${s.quantity})" class="bg-red-500 hover:bg-red-600 text-white p-1 rounded">${isChinese ? '刪除' : 'Delete'}</button>
                </td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="10" data-lang-key="no-customer-sales-found" class="border p-2">${isChinese ? '未找到客戶銷售記錄' : 'No customer sales found.'}</td></tr>`;
      applyTranslations();
    }
    await populateProductDropdown();
  } catch (error) {
    console.error('Error loading customer sales:', error.message);
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
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    console.log('Sale data to insert:', sale);

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
        sale_date: new Date().toISOString()
      })
      .select();
    if (saleError) throw saleError;

    const { error: updateError } = await client
      .from('products')
      .update({ stock: product.stock - sale.quantity })
      .eq('id', product.id);
    if (updateError) throw updateError;

    console.log('Customer sale added:', newSale);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '客戶銷售添加成功' : 'Customer sale added successfully'}`;
      clearMessage('message');
    }
    loadCustomerSales();
  } catch (error) {
    console.error('Error adding customer sale:', error.message);
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
  try {
    console.log('Deleting sale:', { saleId, productBarcode, quantity });
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
    if (productError) throw productError;
    if (productBarcode && product.barcode !== productBarcode) {
      throw new Error('Sale does not match product barcode');
    }

    const { error: deleteError } = await client
      .from('customer_sales')
      .delete()
      .from('customer_sales')
      .eq('id', saleId);
    if (deleteError) throw deleteError;

    const { error: updateError } = await client
      .from('products')
      .update({ stock: product.stock + quantity })
      .eq('id', product.id);
    if (updateError) throw updateError;

    console.log('Customer sale deleted:', saleId);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '客戶銷售刪除成功' : 'Customer sale deleted successfully'}`;
      clearMessage('message');
    }
    loadCustomerSales();
  } catch (error) {
    console.error('Error deleting customer sale:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `刪客戶銷售失敗：${error.message}` : `Failed to delete customer sale: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function loadAnalytics() {
  try {
      const client = await ensureSupabaseClient();
      setLoading(true);
      const { data: products, error: productsError } = await client
        .from('products')
        .select('name, stock, price');
      if (productsError) throw productsError;

      const { data: sales, error: salesError } = await client
        .from('customer_sales')
        .select('quantity, selling_price');
      if (salesError) throw salesError;

      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const overviewEl = document.getElementById('analytics-overview');
      if (overviewEl) {
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        const totalSales = sales.reduce((sum, s) => sum + (s.quantity * (s.selling_price || 0)), 0);
        overviewEl.textContent = isChinese ? `總庫存量: ${totalStock}, 總銷售值: ${totalSales.toFixed(2)}` : `Total Stock: ${totalStock}, Total Sales: ${totalSales.toFixed(2)}`;
      }
    } catch (error) {
      console.error('Error loading analytics:', error.message);
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      const errorEl = document.getElementById('error');
      if (errorEl) {
        errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入分析數據：${error.message}` : `Failed to load analytics: ${error.message}`}`;
        clearMessage('error');
      }
    } finally {
      setLoading(false);
    }
  }
}

function handleAddProduct() {
  const barcode = document.getElementById('barcode')?.value;
  const name = document.getElementById('name')?.value;
  const stock = parseInt(document.getElementById('stock')?.value || '0');
  const price = parseFloat(document.getElementById('price')?.value || '0');

  if (!barcode || !name || !stock || !price) {
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '請填寫所有必填字段' : 'Please fill in all required fields'}`;
      clearMessage('error');
    }
    return;
  }
  }

  const product = {
    barcode,
    name,
    stock,
    batch_no
    getGMT8Date(),
    price,
  };
  addProduct(product);
}

async function loadProducts() {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: products, error } = await client
      .from('products')
      .select('id, barcode, name, stock, batch_no, price')
      .data
      .order('name');
    if (error) throw error;

    const productsBody = document.querySelector('#products-table tbody');
    if (productsBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      productsBody.innerHTML = products.length
        ? products.map(p => `
            <tr>
              <td class="border p-2">${p.barcode}</td>
              <td class="border p-2">${p.name}</td>
              <td class="border p-2">${p.stock}</td>
              <td class="border p-2">${p.batch_no || '-'}</td>
              <td class="border p-2">${p.price ? p.price.toFixed(2) : '0.00'}</td>
              <td class="p-2 border p-2">${(p.stock * (p.price || 0)).toFixed(2)}</td>
              <td class="border p-2">
                <button onclick="handleUpdateProduct(${p.id}, ${p.stock}, ${p.price || 0}, '${p.batch_no || ''}')" class="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded mr-2">${isChinese ? '更新' : 'Update'}</button>
                <button onclick="handleDeleteProduct(${p.id})" class="bg-blue-red-500 hover:bg-red-600 text-white p-1 rounded">${isChinese ? '刪除' : 'Delete'}</button>
              </td>
            </tr>
          `).join('')
        : `<tr><td colspan="6" data-lang-key="no-products-found" class="border p-2">${isChinese ? '未找到產品' : 'No products found.'}</td></tr>`;
      applyTranslations();
      console.log('Products loaded:', products);
    }
  }
  } catch (error) {
    console.error('Error loading products:', error.message);
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
}

async function addProduct(product) {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data, error } = await client
      .from('products')
      .insert([product])
      .select();
    if (error) throw error;
    console.log('Product added:', data);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh'));
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '產品添加成功' : 'Product added successfully'}`;
      clearMessage('message');
    }
    loadProducts();
  } catch (error) {
    console.error('Error adding product:', error.message);
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
  const newPrice = prompt(isChinese ? '輸入新的進貨價：' : 'Enter new price:', currentPrice);

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
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data, error } = await client
      .from('products')
      .update({ stock, price, batch_no: batchNo })
      .eq('id', productId)
      .select();
    if (error) throw error;
    console.log('Product updated:', data);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '產品更新成功' : 'Product updated successfully'}`;
      clearMessage('message');
    }
    loadProducts();
  } catch (error) {
    console.error('Error updating product:', error.message);
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
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '產品刪除成功' : 'Product deleted successfully'}`;
      clearMessage('message');
    }
    loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error.message);
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

function handleAddVendor() {
  const name = document.getElementById('vendor-name')?.value;

  if (!name) {
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '請輸入供應商名稱' : 'Please fill in the vendor name'}`;
      clearMessage('error');
    }
    return;
  }

  const vendor = { name };
  addVendor(vendor);
}

async function loadVendors() {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: vendors, error } = await client
      .from('vendors')
      .select('id, name')
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
              <td class="border p-2">
                <button onclick="handleDeleteVendor(${v.id})" class="bg-red-500 hover:bg-red-600 text-white p-1 rounded">${isChinese ? '刪除' : 'Delete'}</button>
              </td>
            </tr>
          `).join('')
        : `<tr><td colspan="2" data-lang-key="no-vendors-found" class="border p-2">${isChinese ? '未找到供應商' : 'No vendors found.'}</td></tr>`;
      applyTranslations();
    }
  } catch (error) {
    console.error('Error loading vendors:', error.message);
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
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data, error } = await client
      .from('vendors')
      .insert([vendor])
      .select();
    if (error) throw error;
    console.log('Vendor added:', data);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '供應商添加成功' : 'Vendor added successfully'}`;
      clearMessage('message');
    }
    loadVendors();
  } catch (error) {
    console.error('Error adding vendor:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `添加供應商失敗：${error.message}` : `Failed to add vendor: ${error.message}`}`;
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
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '供應商刪除成功' : 'Vendor deleted successfully'}`;
      clearMessage('message');
    }
    loadVendors();
  } catch (error) {
    console.error('Error deleting vendor:', error.message);
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

function handleAddLoanRecord() {
  const vendorName = document.getElementById('vendor-name')?.value;
  const productSelectValue = document.getElementById('loan-product-select')?.value;
  const productBarcode = document.getElementById('loan-product-barcode')?.value;
  const batchNo = document.getElementById('loan-product-batch-no')?.value;
  const quantity = parseInt(document.getElementById('loan-quantity')?.value || '0');
  const date = document.getElementById('loan-date')?.value;

  if (!vendorName || !productSelectValue || !productBarcode || !batchNo || !quantity || !date) {
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '請填寫所有必填字段' : 'Please fill in all required fields'}`;
      clearMessage('error');
    }
    return;
  }

  const [, barcode, batch_no] = productSelectValue.split('|');
  const loan = {
    vendor_name: vendorName,
    product_barcode: barcode,
    batch_no: batch_no === 'NO_BATCH' ? null : batch_no,
    amount: quantity,
    date
  };
  addLoanRecord(loan);
}

async function loadLoanRecords() {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: loans, error } = await client
      .from('vendor_loans')
      .select(`
        id,
        vendor_name,
        product_barcode,
        batch_no,
        amount,
        date
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    // Fetch product details separately
    const productBarcodes = [...new Set(loans.map(l => l.product_barcode))];
    const { data: products, error: productError } = await client
      .from('products')
      .select('barcode, name, price')
      .in('barcode', productBarcodes);
    if (productError) throw productError;

    const productMap = products.reduce((map, p) => {
      map[p.barcode] = p;
      return map;
    }, {});

    console.log('Vendor loans:', loans);
    console.log('Products:', products);

    const loansBody = document.querySelector('#loan-records-table tbody');
    if (loansBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      loansBody.innerHTML = loans.length
        ? loans.map(l => {
            const product = productMap[l.product_barcode] || {};
            return `
              <tr>
                <td class="border p-2">${l.vendor_name}</td>
                <td class="border p-2">${product.name || (isChinese ? '未知產品' : 'Unknown Product')}</td>
                <td class="border p-2">${l.batch_no || ''}</td>
                <td class="border p-2">${product.price ? product.price.toFixed(2) : '0.00'}</td>
                <td class="border p-2">${l.amount.toFixed(2)}</td>
                <td class="border p-2">${new Date(l.date).toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })}</td>
                <td class="border p-2">
                  <button onclick="handleDeleteLoanRecord(${l.id})" class="bg-red-500 hover:bg-red-600 text-white p-1 rounded">${isChinese ? '刪除' : 'Delete'}</button>
                </td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="7" data-lang-key="no-loan-records-found" class="border p-2">${isChinese ? '未找到貸貨記錄' : 'No loan records found.'}</td></tr>`;
      applyTranslations();
    }
    await populateLoanProductDropdown();
    await populateVendorDropdown();
  } catch (error) {
    console.error('Error loading loan records:', error.message);
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

async function addLoanRecord(loan) {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data, error } = await client
      .from('vendor_loans')
      .insert([loan])
      .select();
    if (error) throw error;
    console.log('Loan record added:', data);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '貸貨記錄添加成功' : 'Loan record added successfully'}`;
      clearMessage('message');
    }
    loadLoanRecords();
  } catch (error) {
    console.error('Error adding loan record:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `添加貸貨記錄失敗：${error.message}` : `Failed to add loan record: ${error.message}`}`;
      clearMessage('error');
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
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '貸貨記錄刪除成功' : 'Loan record deleted successfully'}`;
      clearMessage('message');
    }
    loadLoanRecords();
  } catch (error) {
    console.error('Error deleting loan record:', error.message);
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
}
