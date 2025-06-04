// Initialize Supabase client
let supabaseClient = null;

// Translation dictionary
const translations = {
  en: {
    'record-customer-sales': 'Record Customer Sales',
    'toggle-language': 'Toggle Language',
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
    'nav-customer-sales': 'Record Customer Sales',
    'nav-products': 'Products',
    'nav-vendors': 'Vendors',
    'no-products-found': 'No products found.',
    'unknown-product': 'Unknown Product',
    'no-customer-sales-found': 'No customer sales found.',
  },
  zh: {
    'record-customer-sales': '記錄客戶銷售',
    'toggle-language': '切換語言',
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
    'nav-customer-sales': '記錄客戶銷售',
    'nav-products': '產品',
    'nav-vendors': '供應商',
    'no-products-found': '未找到產品。',
    'unknown-product': '未知產品',
    'no-customer-sales-found': '未找到客戶銷售記錄。',
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
}

// Toggle Language Function
function toggleLanguage() {
  const body = document.getElementById('lang-body');
  body.classList.toggle('lang-zh');
  applyTranslations();
  loadCustomerSales(); // Re-render the page
}

async function ensureSupabaseClient() {
  if (!supabaseClient) {
    try {
      if (typeof supabase === 'undefined') {
        throw new Error('Supabase library not loaded');
      }
      supabaseClient = supabase.createClient(
        'https://aouduygmcspiqauhrabx.supabase.co',
        'your-supabase-anon-key'
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
            const profit = s.selling_price !== null ? (s.selling_price - buyInPrice) * s.quantity : 'N/A';
            return `
              <tr>
                <td class="border p-2">${s.products?.name || (isChinese ? '未知產品' : 'Unknown Product')}</td>
                <td class="border p-2">${s.customer_name || (isChinese ? '無' : 'N/A')}</td>
                <td class="border p-2">${s.quantity}</td>
                <td class="border p-2">${typeof sellingPrice === 'number' ? sellingPrice.toFixed(2) : sellingPrice}</td>
                <td class="border p-2">${typeof profit === 'number' ? profit.toFixed(2) : profit}</td>
                <td class="border p-2">${new Date(s.sale_date).toLocaleString()}</td>
                <td class="border p-2">
                  <button onclick="console.log('Delete clicked:', '${s.id}', '${s.product_barcode}', ${s.quantity}); if (confirm('${isChinese ? `刪除此銷售記錄？` : `Delete this sale?`})) deleteCustomerSale('${s.id}', '${s.product_barcode}', ${s.quantity});" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
                </td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="7" data-lang-key="no-customer-sales-found" class="border p-2">${isChinese ? '未找到客戶銷售記錄。' : 'No customer sales found.'}</td></tr>`;
      applyTranslations();
    }
    await populateProductDropdown();
  } catch (error) {
    console.error('Error loading customer sales:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法載入客戶銷售：${error.message}` : `Failed to load customer sales: ${error.message}`}`;
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
        sale_date: new Date().toISOString()
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
    document.getElementById('message').textContent = `[${new Date().toISOString()}] ${isChinese ? '客戶銷售添加成功' : 'Customer sale added successfully'}`;
    clearMessage('message');
    loadCustomerSales();
  } catch (error) {
    console.error('Error adding customer sale:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `添加客戶銷售失敗：${error.message}` : `Failed to add customer sale: ${error.message}`}`;
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
    document.getElementById('message').textContent = `[${new Date().toISOString()}] ${isChinese ? '客戶銷售刪除成功' : 'Customer sale deleted successfully'}`;
    clearMessage('message');
    loadCustomerSales();
  } catch (error) {
    console.error('Error deleting customer sale:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `刪除客戶銷售失敗：${error.message}` : `Failed to delete customer sale: ${error.message}`}`;
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
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法載入分析數據：${error.message}` : `Failed to load analytics: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}
