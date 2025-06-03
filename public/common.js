// Initialize Supabase client
let supabaseClient = null;

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

// Load Products
async function loadProducts() {
  try {
    const client = await ensureSupabaseClient();
    setLoading(true);
    const { data: products, error } = await client
      .from('products')
      .select('barcode, name, stock, price, vendor_id, vendors(name)')
      .order('name');
    if (error) throw error;
    console.log('Products:', products);
    const productsBody = document.querySelector('#products tbody');
    if (productsBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      productsBody.innerHTML = products.length
        ? products.map(p => `
            <tr>
              <td class="border p-2">${p.barcode}</td>
              <td class="border p-2">${p.name}</td>
              <td class="border p-2">${p.stock}</td>
              <td class="border p-2">${p.price?.toFixed(2) || (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">${p.vendors?.name || (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">
                <button onclick="if (confirm('${isChinese ? `刪除 ${p.name}?` : `Delete ${p.name}?`})) deleteProduct('${p.id}'))" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
              </td>
            </tr>
          `).join('')
        : `<tr><td colspan="6" class="border p-2">${isChinese ? '未找到產品。' : 'No products found.'}</td></tr>`;
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
      .insert({
        barcode: product.barcode,
        name: product.name,
        stock: product.stock_in_qty,
        price: product.stock_in_price,
        vendor_id: product.vendor_id
      })
      .select();
    if (error) throw error;
    console.log('Product added:', data);
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Product added successfully`;
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
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Product deleted successfully`;
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
    const vendorsBody = document.querySelector('#vendors tbody');
    if (vendorsBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      vendorsBody.innerHTML = vendors.length
        ? vendors.map(v => `
            <tr>
              <td class="border p-2">${v.name}</td>
              <td class="border p-2">${v.contact || (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">${v.phone || (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">
                <button onclick="if (confirm('${isChinese ? `刪除 ${v.name}?` : `Delete ${v.name}?`})) deleteVendor('${v.id}'))" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
              </td>
            </tr>
          `).join('')
        : `<tr><td colspan="4" class="border p-2">${isChinese ? '未找到供應商。' : 'No vendors found.'}</td></tr>`;
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
      .insert({
        name: vendor.name,
        contact: vendor.contact || null,
        phone: vendor.phone || null
      })
      .select();
    if (error) throw error;
    console.log('Vendor added:', data);
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Vendor added successfully`;
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
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Vendor deleted successfully`;
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
        sale_date,
        products (
          name,
          price:price
        )
      `) // Removed 'price' from customer_sales select
      .order('sale_date', { ascending: false });
    if (error) throw error;
    console.log('Customer Sales:', sales);
    const salesBody = document.querySelector('#customer-sales tbody');
    if (salesBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      salesBody.innerHTML = sales.length
        ? sales.map(s => {
            const sellingPrice = s.products?.price || (isChinese ? '無' : 'N/A'); // Use product price as fallback
            const buyInPrice = s.products?.price || 0; // Use product price as buy-in price
            const profit = s.products?.price ? (s.products.price - buyInPrice) * s.quantity : 'N/A'; // Adjust profit calculation
            return `
              <tr>
                <td class="border p-2">${s.products?.name || (isChinese ? '未知產品' : 'Unknown Product')}</td>
                <td class="border p-2">${s.customer_name || (isChinese ? '無' : 'N/A')}</td>
                <td class="border p-2">${s.quantity}</td>
                <td class="border p-2">${typeof sellingPrice === 'number' ? sellingPrice.toFixed(2) : sellingPrice}</td>
                <td class="border p-2">${typeof profit === 'number' ? profit.toFixed(2) : profit}</td>
                <td class="border p-2">${new Date(s.sale_date).toLocaleString()}</td>
                <td class="border p-2">
                  <button onclick="if (confirm('${isChinese ? `刪除此銷售記錄？` : `Delete this sale?`})) deleteCustomerSale('${s.id}', '${s.product_barcode}', ${s.quantity})" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
                </td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="7" class="border p-2">${isChinese ? '未找到客戶銷售記錄。' : 'No customer sales found.'}</td></tr>`;
    }
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
        sale_date: new Date().toISOString()
      })
      .select();
    if (saleError) throw saleError;

    // Step 4: Update the product's stock
    const { error: updateError } = await client
      .from('products')
      .update({ stock: product.stock - sale.quantity })
      .eq('barcode', sale.product_barcode);
    if (updateError) throw updateError;

    console.log('Customer sale added:', newSale);
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Customer sale added successfully`;
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
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Customer sale deleted successfully`;
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
      .select('quantity, sale_date, products(price:price)');
    if (salesError) throw salesError;

    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const overviewEl = document.getElementById('analytics-overview-text');
    if (overviewEl) {
      const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
      const totalSalesValue = sales.reduce((sum, s) => sum + (s.quantity * (s.products?.price || 0)), 0);
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
