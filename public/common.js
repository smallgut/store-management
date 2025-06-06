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
    'record-customer-sales': 'Record Customer Sales',
    'add-customer-sale': 'Add Customer Sale',
    'select-product': 'Select Product (or input barcode)',
    'product-barcode': 'Product Barcode',
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
    'batch-no': 'Batch No.',
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
    'no-vendors-found': 'No vendors found.',
    'no-loan-records-found': 'No loan records found.',
    'unknown-product': 'Unknown Product',
    'no-customer-sales-found': 'No customer sales found.',
    'delete-confirm': 'Delete this record?',
    'update': 'Update',
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
    'record-customer-sales': '記錄客戶銷售',
    'add-customer-sale': '添加客戶銷售',
    'select-product': '選擇產品（或輸入條碼）',
    'product-barcode': '產品條碼',
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
    'batch-no': '批號',
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
    'no-vendors-found': '未找到供應商。',
    'no-loan-records-found': '未找到貸款記錄。',
    'unknown-product': '未知產品',
    'no-customer-sales-found': '未找到客戶銷售記錄。',
    'delete-confirm': '刪除此記錄？',
    'update': '更新',
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

// Function to get date in GMT+8
function getGMT8Date() {
  const date = new Date();
  date.setHours(date.getHours() + 8); // Adjust to GMT+8
  const today = date.toISOString().slice(0, 10).split('-');
  return `${today[2]}${today[1]}${today[0].slice(-2)}`; // DDMMYY
}

async function ensureSupabaseClient() {
  if (!supabaseClient) {
    try {
      if (typeof supabase === 'undefined') {
        throw new Error('Supabase library not loaded');
      }
      supabaseClient = supabase.createClient(
        'https://aouduygmcspiqauhrabx.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdWR1eWdtY3NwaXFhdWhyYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTM5MzAsImV4cCI6MjA2MDgyOTkzMH0.s8WMvYdE9csSb1xb6jv84aiFBBU_LpDi1aserTQDg-k'
      );
      console.log('Supabase Client Initialized in common.js:', Object.keys(supabaseClient));
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error.message);
      throw error;
    }
  }
  return supabaseClient;
}

// Loading and message handling
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
  }, 5000);
}

// Handle Add Customer Sale Form Submission
function handleAddCustomerSale() {
  const sale = {
    product_barcode: document.getElementById('product-barcode').value || document.getElementById('product-select').value,
    customer_name: document.getElementById('customer-name').value,
    quantity: parseInt(document.getElementById('quantity').value),
    price: parseFloat(document.getElementById('selling-price').value)
  };
  addCustomerSale(sale);
}

// Helper function to handle delete button click
function handleDeleteSale(saleId, productBarcode, quantity) {
  const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
  console.log('Delete clicked:', saleId, productBarcode, quantity);
  if (confirm(translations[isChinese ? 'zh' : 'en']['delete-confirm'])) {
    deleteCustomerSale(saleId, productBarcode, quantity);
  }
}

// Populate Product Dropdown
async function populateProductDropdown() {
  try {
    const client = await ensureSupabaseClient();
    const { data: products, error } = await client
      .from('products')
      .select('barcode, name, stock')
      .order('name');
    if (error) throw error;
    console.log('Products for dropdown:', products);
    const productSelect = document.getElementById('product-select');
    if (productSelect) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      productSelect.innerHTML = `<option value="">${isChinese ? '-- 選擇產品 --' : '-- Select a Product --'}</option>`;
      products.forEach(p => {
        const option = document.createElement('option');
        option.value = p.barcode;
        option.textContent = `${p.name} (Stock: ${p.stock})`;
        productSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error populating product dropdown:', error.message);
  }
}

// Load Customer Sales
async function loadCustomerSales() {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: sales, error } = await client
      .from('customer_sales')
      .select(`
        id,
        product_barcode,
        customer_name,
        quantity,
        selling_price,
        sale_date,
        products (
          name,
          price:price
        )
      `)
      .order('sale_date', { ascending: false });
    if (error) throw error;
    console.log('Customer Sales:', sales);
    console.log('Sample sale data:', sales[0]);
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
                <td class="border p-2">${s.customer_name || (isChinese ? '無' : 'N/A')}</td>
                <td class="border p-2">${s.quantity}</td>
                <td class="border p-2">${typeof sellingPrice === 'number' ? sellingPrice.toFixed(2) : sellingPrice}</td>
                <td class="border p-2">${typeof subTotal === 'number' ? subTotal.toFixed(2) : subTotal}</td>
                <td class="border p-2">${typeof profit === 'number' ? profit.toFixed(2) : profit}</td>
                <td class="border p-2">${new Date(s.sale_date).toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })}</td>
                <td class="border p-2">
                  <button onclick="handleDeleteSale('${s.id}', '${s.product_barcode}', ${s.quantity})" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
                </td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="8" data-lang-key="no-customer-sales-found" class="border p-2">${isChinese ? '未找到客戶銷售記錄。' : 'No customer sales found.'}</td></tr>`;
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

// Add Customer Sale
async function addCustomerSale(sale) {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    console.log('Sale data to insert:', sale);

    // Step 1: Verify the product exists
    const { data: product, error: productError } = await client
      .from('products')
      .select('id, barcode, name, stock, price')
      .eq('barcode', sale.product_barcode)
      .single();
    if (productError) throw productError;
    if (!product) {
      throw new Error('Product not found');
    }

    // Step 2: Check if there's enough stock
    if (product.stock < sale.quantity) {
      throw new Error('Insufficient stock available');
    }

    // Step 3: Record the sale
    const { data: newSale, error: saleError } = await client
      .from('customer_sales')
      .insert({
        product_barcode: sale.product_barcode,
        customer_name: sale.customer_name || null,
        quantity: sale.quantity,
        selling_price: sale.price || null,
        sale_date: new Date().toISOString().replace('Z', '+08:00')
      })
      .select();
    if (saleError) throw saleError;

    // Step 4: Update the product's stock
    const { data: updatedProduct, error: updateError } = await client
      .from('products')
      .update({ stock: product.stock - sale.quantity })
      .eq('barcode', sale.product_barcode)
      .select();
    if (updateError) throw updateError;
    console.log('Updated product stock:', updatedProduct);

    console.log('Customer sale added:', newSale);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '客戶銷售添加成功' : 'Customer sale added successfully'}`;
    clearMessage('message');
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

// Delete Customer Sale
async function deleteCustomerSale(saleId, productBarcode, quantity) {
  try {
    console.log('Deleting sale:', { saleId, productBarcode, quantity });
    const client = await ensureSupabaseClient();
    setLoading(true);

    // Step 1: Delete the sale
    const { error: deleteError } = await client
      .from('customer_sales')
      .delete()
      .eq('id', saleId);
    if (deleteError) throw deleteError;

    // Step 2: Restore the product's stock
    const { data: product, error: productError } = await client
      .from('products')
      .select('stock')
      .eq('barcode', productBarcode)
      .single();
    if (productError) throw productError;

    const { error: updateError } = await client
      .from('products')
      .update({ stock: product.stock + quantity })
      .eq('barcode', productBarcode);
    if (updateError) throw updateError;

    console.log('Customer sale deleted:', saleId);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '客戶銷售刪除成功' : 'Customer sale deleted successfully'}`;
    clearMessage('message');
    loadCustomerSales();
  } catch (error) {
    console.error('Error deleting customer sale:', error.message);
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

// Load Analytics
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
    const overviewEl = document.getElementById('analytics-overview-text');
    if (overviewEl) {
      const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
      const totalSalesValue = sales.reduce((sum, s) => sum + (s.quantity * (s.selling_price || 0)), 0);
      overviewEl.textContent = isChinese
        ? `總庫存：${totalStock}，總銷售額：${totalSalesValue.toFixed(2)}`
        : `Total Stock: ${totalStock}, Total Sales Value: ${totalSalesValue.toFixed(2)}`;
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

// Handle Add Product
function handleAddProduct() {
  const batchNo = getGMT8Date();
  const product = {
    barcode: document.getElementById('product-barcode').value,
    name: document.getElementById('product-name').value,
    stock: parseInt(document.getElementById('stock').value),
    batch_no: batchNo,
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
        ? products.map(p => {
            const inventoryValue = p.stock * p.price;
            return `
          <tr>
            <td class="border p-2">${p.barcode}</td>
            <td class="border p-2">${p.name}</td>
            <td class="border p-2">${p.stock}</td>
            <td class="border p-2">${p.batch_no}</td>
            <td class="border p-2">${p.price.toFixed(2)}</td>
            <td class="border p-2">${inventoryValue.toFixed(2)}</td>
            <td class="border p-2">
              <button onclick="handleUpdateProduct('${p.id}', ${p.stock}, ${p.price}, '${p.batch_no}')" class="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 mr-2">${isChinese ? '更新' : 'Update'}</button>
              <button onclick="handleDeleteProduct('${p.id}')" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
            </td>
          </tr>
        `;
          }).join('')
        : `<tr><td colspan="7" data-lang-key="no-products-found" class="border p-2">${isChinese ? '未找到產品。' : 'No products found.'}</td></tr>`;
      applyTranslations();
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
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '產品添加成功' : 'Product added successfully'}`;
    clearMessage('message');
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

// Handle Update Product
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

// Update Product
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
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '產品更新成功' : 'Product updated successfully'}`;
    clearMessage('message');
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
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '產品刪除成功' : 'Product deleted successfully'}`;
    clearMessage('message');
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
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入供應商：${error.message}` : `Failed to load vendors: ${error.message}`}`;
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
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '供應商添加成功' : 'Vendor added successfully'}`;
    clearMessage('message');
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
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '供應商刪除成功' : 'Vendor deleted successfully'}`;
    clearMessage('message');
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
            <td class="border p-2">${new Date(l.date).toLocaleDateString('en-GB', { timeZone: 'Asia/Singapore' })}</td>
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
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `無法載入貸款記錄：${error.message}` : `Failed to load loan records: ${error.message}`}`;
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
      .insert({ ...loan, date: new Date(loan.date).toISOString().replace('Z', '+08:00') })
      .select();
    if (error) throw error;
    console.log('Loan record added:', data);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '貸款記錄添加成功' : 'Loan record added successfully'}`;
    clearMessage('message');
    loadLoanRecords();
  } catch (error) {
    console.error('Error adding loan record:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `添加貸款記錄失敗：${error.message}` : `Failed to add loan record: ${error.message}`}`;
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
    document.getElementById('message').textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? '貸款記錄刪除成功' : 'Loan record deleted successfully'}`;
    clearMessage('message');
    loadLoanRecords();
  } catch (error) {
    console.error('Error deleting loan record:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString().replace('Z', '+08:00')}] ${isChinese ? `刪除貸款記錄失敗：${error.message}` : `Failed to delete loan record: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}
