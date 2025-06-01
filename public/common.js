function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Custom fetch to fix potential 406 errors by setting Accept header
const customFetch = (url, options = {}) => {
  const headers = {
    ...options.headers,
    Accept: 'application/json',
  };
  return fetch(url, { ...options, headers });
};

// Initialize Supabase client with your project credentials
if (!window.supabaseClient) {
  if (typeof supabase === 'undefined') {
    console.error('Supabase SDK not loaded');
    throw new Error('Supabase SDK not loaded');
  }
  const { createClient } = supabase;
  window.supabaseClient = createClient(
    'https://aouduygmcspiqauhrabx.supabase.co', // Replace with your Supabase Project URL, e.g., https://your-project-id.supabase.co
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdWR1eWdtY3NwaXFhdWhyYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTM5MzAsImV4cCI6MjA2MDgyOTkzMH0.s8WMvYdE9csSb1xb6jv84aiFBBU_LpDi1aserTQDg-k', // Replace with your anon key
    { global: { fetch: customFetch } }
  );
  console.log('Supabase Client Initialized in common.js:', Object.keys(window.supabaseClient));
}

// Ensure Supabase client is ready before proceeding
async function ensureSupabaseClient() {
  if (!window.supabaseClient) {
    throw new Error('Supabase client not initialized');
  }
  return window.supabaseClient;
}

async function loadProducts() {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: products, error: productError } = await window.supabaseClient
      .from('products')
      .select('*, vendors(name)')
      .order('name');
    if (productError) throw productError;
    const { data: vendors, error: vendorError } = await window.supabaseClient
      .from('vendors')
      .select('id, name');
    if (vendorError) throw vendorError;
    console.log('Products:', products);
    const productsBody = document.querySelector('#products tbody');
    if (productsBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      productsBody.innerHTML = products.length
        ? products.map(p => `
            <tr>
              <td class="border p-2">${p.name}</td>
              <td class="border p-2">${p.barcode}</td>
              <td class="border p-2">$${p.price.toFixed(2)}</td>
              <td class="border p-2">${p.stock}</td>
              <td class="border p-2">
                <span class="inline-block mb-1">${p.vendors?.name || (isChinese ? '無' : 'N/A')}</span>
                <form onsubmit="event.preventDefault(); updateProductVendor('${p.barcode}', document.getElementById('vendor-${p.barcode}').value ? parseInt(document.getElementById('vendor-${p.barcode}').value) : null)">
                  <select id="vendor-${p.barcode}" class="border p-1 rounded w-32">
                    <option value="">${isChinese ? '無' : 'None'}</option>
                    ${vendors.map(v => `<option value="${v.id}" ${p.vendor_id === v.id ? 'selected' : ''}>${v.name}</option>`).join('')}
                  </select>
                  <button type="submit" class="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 ml-2">${isChinese ? '更新供應商' : 'Update Vendor'}</button>
                </form>
              </td>
              <td class="border p-2">
                <form onsubmit="event.preventDefault(); updateProductStock('${p.barcode}', parseInt(document.getElementById('stock-${p.barcode}').value), parseFloat(document.getElementById('buyin-price-${p.barcode}').value), document.getElementById('vendor-${p.barcode}').value ? parseInt(document.getElementById('vendor-${p.barcode}').value) : null)">
                  <input id="stock-${p.barcode}" type="number" min="1" placeholder="${isChinese ? '數量' : 'Qty'}" class="border p-1 rounded w-16">
                  <input id="buyin-price-${p.barcode}" type="number" step="0.01" min="0" placeholder="${isChinese ? '進貨價' : 'Buy-in Price'}" class="border p-1 rounded w-16 mt-1">
                  <button type="submit" class="bg-green-500 text-white p-1 rounded hover:bg-green-600 mt-1">${isChinese ? '添加庫存' : 'Add Stock'}</button>
                </form>
                <form onsubmit="event.preventDefault(); updateProductPrice('${p.barcode}', parseFloat(document.getElementById('price-${p.barcode}').value) || ${p.price})" class="mt-2">
                  <input id="price-${p.barcode}" type="number" step="0.01" min="0" placeholder="${isChinese ? '價格' : 'Price'}" class="border p-1 rounded w-16">
                  <button type="submit" class="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600">${isChinese ? '更新價格' : 'Update Price'}</button>
                </form>
                <button onclick="if (confirm('${isChinese ? `刪除 ${p.name} (${p.barcode})?` : `Delete ${p.name} (${p.barcode})?`})) deleteProduct('${p.barcode}')" class="bg-red-500 text-white p-1 rounded hover:bg-red-600 mt-2">${isChinese ? '刪除' : 'Delete'}</button>
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

async function updateProductVendor(barcode, newVendorId) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: product, error: fetchError } = await window.supabaseClient
      .from('products')
      .select('name')
      .eq('barcode', barcode)
      .single();
    if (fetchError) throw fetchError;
    let vendor = null;
    if (newVendorId) {
      const vendorResult = await window.supabaseClient
        .from('vendors')
        .select('name')
        .eq('id', newVendorId)
        .single();
      if (vendorResult.error) throw vendorResult.error;
      if (!vendorResult.data) throw new Error('Vendor not found');
      vendor = vendorResult.data;
    }
    const { error } = await window.supabaseClient
      .from('products')
      .update({ vendor_id: newVendorId })
      .eq('barcode', barcode);
    if (error) throw error;
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `產品 ${product.name} (${barcode}) 的供應商已更新為 ${vendor?.name || '無'}` : `Vendor for product ${product.name} (${barcode}) updated to ${vendor?.name || 'None'}`}`;
      clearMessage('message');
    }
    await loadProducts();
  } catch (error) {
    console.error('Error updating product vendor:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法更新產品供應商：${error.message}` : `Failed to update product vendor: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

const loadVendors = debounce(async function() {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data, error } = await window.supabaseClient.from('vendors').select('*');
    if (error) throw error;
    console.log('Vendors:', data);
    const vendorsBody = document.querySelector('#vendors tbody');
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    if (vendorsBody) {
      vendorsBody.innerHTML = data.length
        ? data.map(v => `
            <tr>
              <td class="border p-2">${v.name}</td>
              <td class="border p-2">
                <span class="inline-block mb-1">${v.contact_email || '-'}</span>
                <form onsubmit="event.preventDefault(); updateVendorEmail(${v.id}, document.getElementById('email-${v.id}').value.trim() || null)">
                  <input id="email-${v.id}" type="email" placeholder="${isChinese ? '電子郵件' : 'Email'}" value="${v.contact_email || ''}" class="border p-1 rounded w-32">
                  <button type="submit" class="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 ml-2">${isChinese ? '更新電子郵件' : 'Update Email'}</button>
                </form>
              </td>
              <td class="border p-2">
                <span class="inline-block mb-1">${v.contact_number || '-'}</span>
                <form onsubmit="event.preventDefault(); updateVendorContactNumber(${v.id}, document.getElementById('contact-${v.id}').value.trim() || null)">
                  <input id="contact-${v.id}" type="text" placeholder="${isChinese ? '聯繫電話' : 'Contact No.'}" value="${v.contact_number || ''}" class="border p-1 rounded w-32">
                  <button type="submit" class="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 ml-2">${isChinese ? '更新電話' : 'Update Contact'}</button>
                </form>
              </td>
              <td class="border p-2">
                <span class="inline-block mb-1">${v.address || '-'}</span>
                <form onsubmit="event.preventDefault(); updateVendorAddress(${v.id}, document.getElementById('address-${v.id}').value.trim() || null)">
                  <input id="address-${v.id}" type="text" placeholder="${isChinese ? '地址' : 'Address'}" value="${v.address || ''}" class="border p-1 rounded w-32">
                  <button type="submit" class="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 ml-2">${isChinese ? '更新地址' : 'Update Address'}</button>
                </form>
              </td>
              <td class="border p-2">
                <button onclick="if (confirm('${isChinese ? `刪除 ${v.name}?` : `Delete ${v.name}?`})) deleteVendor(${v.id})" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
              </td>
            </tr>
          `).join('')
        : `<tr><td colspan="5" class="border p-2">${isChinese ? '未找到供應商。' : 'No vendors found.'}</td></tr>`;
    }
    const vendorSelect = document.getElementById('sale-vendor');
    if (vendorSelect) {
      vendorSelect.innerHTML = `<option value="">${isChinese ? '選擇供應商' : 'Select Vendor'}</option>` + data.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    }
    const addVendorSelect = document.getElementById('vendor-id');
    if (addVendorSelect) {
      addVendorSelect.innerHTML = `<option value="">${isChinese ? '選擇供應商（可選）' : 'Select Vendor (Optional)'}</option>` + data.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
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
}, 300);

// Expose loadVendors globally
window.loadVendors = loadVendors;

const loadCustomerSales = debounce(async function() {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: sales, error } = await window.supabaseClient
      .from('customer_sales')
      .select('id, product_barcode, customer_name, quantity, sale_date, selling_price, products(name)')
      .order('sale_date', { ascending: false });
    if (error) throw error;
    const salesWithNames = sales.map(s => ({
      ...s,
      product_name: s.products?.name || 'Unknown'
    }));
    console.log('Customer Sales:', salesWithNames);
    const salesBody = document.querySelector('#customer-sales tbody');
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    if (salesBody) {
      salesBody.innerHTML = salesWithNames.length
        ? salesWithNames.map(s => `
            <tr>
              <td class="border p-2">${s.product_name}</td>
              <td class="border p-2">${s.customer_name || '-'}</td>
              <td class="border p-2">${s.quantity}</td>
              <td class="border p-2">${s.selling_price != null ? `$${s.selling_price.toFixed(2)}` : '-'}</td>
              <td class="border p-2">${new Date(s.sale_date).toLocaleString()}</td>
              <td class="border p-2">
                <button onclick="if (confirm('${isChinese ? `刪除 ${s.product_name} 的銷售記錄?` : `Delete sale for ${s.product_name}?`})) deleteCustomerSale(${s.id})" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
              </td>
            </tr>
          `).join('')
        : `<tr><td colspan="6" class="border p-2">${isChinese ? '未找到銷售記錄。' : 'No sales found.'}</td></tr>`;
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
}, 300);

// Expose loadCustomerSales globally
window.loadCustomerSales = loadCustomerSales;

const loadVendorSales = debounce(async function() {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: sales, error } = await window.supabaseClient
      .from('vendor_sales')
      .select('id, product_barcode, vendor_id, quantity, price, buy_in_price, sale_date, products(name), vendors(name)')
      .order('sale_date', { ascending: false });
    if (error) throw error;
    const salesWithNames = sales.map(s => ({
      ...s,
      product_name: s.products?.name || 'Unknown',
      vendor_name: s.vendors?.name || 'Unknown'
    }));
    console.log('Vendor Sales:', salesWithNames);
    const salesBody = document.querySelector('#vendor-sales tbody');
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    if (salesBody) {
      salesBody.innerHTML = salesWithNames.length
        ? salesWithNames.map(s => `
            <tr>
              <td class="border p-2">${s.product_name}</td>
              <td class="border p-2">${s.vendor_name}</td>
              <td class="border p-2">${s.quantity}</td>
              <td class="border p-2">$${s.price != null ? s.price.toFixed(2) : '-'}</td>
              <td class="border p-2">${s.buy_in_price != null ? `$${s.buy_in_price.toFixed(2)}` : '-'}</td>
              <td class="border p-2">${new Date(s.sale_date).toLocaleString()}</td>
              <td class="border p-2">
                <button onclick="if (confirm('${isChinese ? `刪除 ${s.product_name} 的貸貨記錄?` : `Delete sale for ${s.product_name}?`})) deleteVendorSale(${s.id})" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
              </td>
            </tr>
          `).join('')
        : `<tr><td colspan="7" class="border p-2">${isChinese ? '未找到貸貨記錄。' : 'No sales found.'}</td></tr>`;
    }
  } catch (error) {
    console.error('Error loading vendor sales:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法載入供應商貸貨：${error.message}` : `Failed to load vendor sales: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}, 300);

// Expose loadVendorSales globally
window.loadVendorSales = loadVendorSales;

async function sortProducts(by) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: products, error: productError } = await window.supabaseClient
      .from('products')
      .select('*, vendors(name)')
      .order(by);
    if (productError) throw productError;
    const { data: vendors, error: vendorError } = await window.supabaseClient
      .from('vendors')
      .select('id, name');
    if (vendorError) throw vendorError;
    console.log('Sorted products:', products);
    const productsBody = document.querySelector('#products tbody');
    if (productsBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      productsBody.innerHTML = products.length
        ? products.map(p => `
            <tr>
              <td class="border p-2">${p.name}</td>
              <td class="border p-2">${p.barcode}</td>
              <td class="border p-2">$${p.price.toFixed(2)}</td>
              <td class="border p-2">${p.stock}</td>
              <td class="border p-2">
                <span class="inline-block mb-1">${p.vendors?.name || (isChinese ? '無' : 'N/A')}</span>
                <form onsubmit="event.preventDefault(); updateProductVendor('${p.barcode}', document.getElementById('vendor-${p.barcode}').value ? parseInt(document.getElementById('vendor-${p.barcode}').value) : null)">
                  <select id="vendor-${p.barcode}" class="border p-1 rounded w-32">
                    <option value="">${isChinese ? '無' : 'None'}</option>
                    ${vendors.map(v => `<option value="${v.id}" ${p.vendor_id === v.id ? 'selected' : ''}>${v.name}</option>`).join('')}
                  </select>
                  <button type="submit" class="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 ml-2">${isChinese ? '更新供應商' : 'Update Vendor'}</button>
                </form>
              </td>
              <td class="border p-2">
                <form onsubmit="event.preventDefault(); updateProductStock('${p.barcode}', parseInt(document.getElementById('stock-${p.barcode}').value), parseFloat(document.getElementById('buyin-price-${p.barcode}').value), document.getElementById('vendor-${p.barcode}').value ? parseInt(document.getElementById('vendor-${p.barcode}').value) : null)">
                  <input id="stock-${p.barcode}" type="number" min="1" placeholder="${isChinese ? '數量' : 'Qty'}" class="border p-1 rounded w-16">
                  <input id="buyin-price-${p.barcode}" type="number" step="0.01" min="0" placeholder="${isChinese ? '進貨價' : 'Buy-in Price'}" class="border p-1 rounded w-16 mt-1">
                  <button type="submit" class="bg-green-500 text-white p-1 rounded hover:bg-green-600 mt-1">${isChinese ? '添加庫存' : 'Add Stock'}</button>
                </form>
                <form onsubmit="event.preventDefault(); updateProductPrice('${p.barcode}', parseFloat(document.getElementById('price-${p.barcode}').value) || ${p.price})" class="mt-2">
                  <input id="price-${p.barcode}" type="number" step="0.01" min="0" placeholder="${isChinese ? '價格' : 'Price'}" class="border p-1 rounded w-16">
                  <button type="submit" class="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600">${isChinese ? '更新價格' : 'Update Price'}</button>
                </form>
                <button onclick="if (confirm('${isChinese ? `刪除 ${p.name} (${p.barcode})?` : `Delete ${p.name} (${p.barcode})?`})) deleteProduct('${p.barcode}')" class="bg-red-500 text-white p-1 rounded hover:bg-red-600 mt-2">${isChinese ? '刪除' : 'Delete'}</button>
              </td>
            </tr>
          `).join('')
        : `<tr><td colspan="6" class="border p-2">${isChinese ? '未找到產品。' : 'No products found.'}</td></tr>`;
    }
  } catch (error) {
    console.error('Error sorting products:', error.message);
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

async function addProduct(product) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: existing, error: fetchError } = await window.supabaseClient
      .from('products')
      .select('barcode')
      .eq('barcode', product.barcode);
    if (fetchError) throw fetchError;
    if (existing.length > 0) {
      throw new Error('Barcode already exists');
    }

    const initialStock = parseInt(product.stock_in_qty) || 0;
    const buyInPrice = parseFloat(product.stock_in_price) || 0;
    if (initialStock < 0) {
      throw new Error('Initial stock cannot be negative');
    }
    if (buyInPrice < 0) {
      throw new Error('Buy-in price cannot be negative');
    }

    const { error: productError } = await window.supabaseClient
      .from('products')
      .insert([{ ...product, stock: initialStock, price: buyInPrice }]);
    if (productError) throw productError;

    if (initialStock > 0) {
      const today = new Date();
      const batchNumber = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${today.getFullYear()}`;
      const batch = {
        product_barcode: product.barcode,
        vendor_id: product.vendor_id || null,
        quantity: initialStock,
        buy_in_price: buyInPrice,
        remaining_quantity: initialStock,
        batch_number: batchNumber
      };
      const { error: batchError } = await window.supabaseClient
        .from('product_batches')
        .insert([batch]);
      if (batchError) throw batchError;
    }

    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `產品 ${product.name} (${product.barcode}) 已添加` : `Product ${product.name} (${product.barcode}) added`}`;
      clearMessage('message');
    }
    await loadProducts();
  } catch (error) {
    console.error('Error adding product:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法添加產品：${error.message}` : `Failed to add product: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function updateProductStock(barcode, additionalStock, buyInPrice, vendorId) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: product, error: fetchError } = await window.supabaseClient
      .from('products')
      .select('stock, name')
      .eq('barcode', barcode)
      .single();
    if (fetchError) throw fetchError;
    if (isNaN(additionalStock) || additionalStock < 1) {
      throw new Error('Invalid stock value');
    }
    const effectiveBuyInPrice = buyInPrice != null && !isNaN(buyInPrice) && buyInPrice >= 0 ? buyInPrice : 0;

    const today = new Date();
    const batchNumber = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${today.getFullYear()}`;

    const { data: existingBatch, error: batchFetchError } = await window.supabaseClient
      .from('product_batches')
      .select('*')
      .eq('product_barcode', barcode)
      .eq('batch_number', batchNumber)
      .single();
    if (batchFetchError && batchFetchError.code !== 'PGRST116') throw batchFetchError;

    if (existingBatch) {
      const newQuantity = existingBatch.quantity + additionalStock;
      const newRemainingQuantity = existingBatch.remaining_quantity + additionalStock;
      const newBuyInPrice = effectiveBuyInPrice > 0
        ? ((existingBatch.buy_in_price * existingBatch.quantity) + (effectiveBuyInPrice * additionalStock)) / newQuantity
        : existingBatch.buy_in_price;
      const { error: batchUpdateError } = await window.supabaseClient
        .from('product_batches')
        .update({
          quantity: newQuantity,
          remaining_quantity: newRemainingQuantity,
          buy_in_price: newBuyInPrice,
          vendor_id: vendorId || existingBatch.vendor_id
        })
        .eq('id', existingBatch.id);
      if (batchUpdateError) throw batchUpdateError;
    } else {
      const batch = {
        product_barcode: barcode,
        vendor_id: vendorId || null,
        quantity: additionalStock,
        buy_in_price: effectiveBuyInPrice,
        remaining_quantity: additionalStock,
        batch_number: batchNumber
      };
      const { error: batchError } = await window.supabaseClient
        .from('product_batches')
        .insert([batch]);
      if (batchError) throw batchError;
    }

    const newStock = product.stock + additionalStock;
    const { error: updateError } = await window.supabaseClient
      .from('products')
      .update({ stock: newStock })
      .eq('barcode', barcode);
    if (updateError) throw updateError;

    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `產品 ${product.name} (${barcode}) 的庫存已更新為 ${newStock}，進貨價 $${effectiveBuyInPrice.toFixed(2)}` : `Stock for product ${product.name} (${barcode}) updated to ${newStock} at buy-in price $${effectiveBuyInPrice.toFixed(2)}`}`;
      clearMessage('message');
    }
    await loadProducts();
  } catch (error) {
    console.error('Error updating product stock:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法更新產品庫存：${error.message}` : `Failed to update product stock: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function updateProductPrice(barcode, newPrice) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: product, error: fetchError } = await window.supabaseClient
      .from('products')
      .select('name')
      .eq('barcode', barcode)
      .single();
    if (fetchError) throw fetchError;
    if (isNaN(newPrice) || newPrice < 0) {
      throw new Error('Invalid price value');
    }
    const { error } = await window.supabaseClient
      .from('products')
      .update({ price: newPrice })
      .eq('barcode', barcode);
    if (error) throw error;
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `產品 ${product.name} (${barcode}) 的價格已更新為 $${newPrice}` : `Price for product ${product.name} (${barcode}) updated to $${newPrice}`}`;
      clearMessage('message');
    }
    await loadProducts();
  } catch (error) {
    console.error('Error updating product price:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法更新產品價格：${error.message}` : `Failed to update product price: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function deleteProduct(barcode) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: product, error: fetchError } = await window.supabaseClient
      .from('products')
      .select('name')
      .eq('barcode', barcode)
      .single();
    if (fetchError) throw fetchError;
    const { error } = await window.supabaseClient
      .from('products')
      .delete()
      .eq('barcode', barcode);
    if (error) throw error;
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('error');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `產品 ${product.name} (${barcode}) 已刪除` : `Product ${product.name} (${barcode}) deleted`}`;
      clearMessage('error');
    }
    await loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法刪除產品：${error.message}` : `Failed to delete product: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function addVendor(vendor) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: existing, error: fetchError } = await window.supabaseClient
      .from('vendors')
      .select('name')
      .eq('name', vendor.name);
    if (fetchError) throw fetchError;
    if (existing.length > 0) {
      throw new Error('Vendor name already exists');
    }
    const { error } = await window.supabaseClient
      .from('vendors')
      .insert([vendor]);
    if (error) throw error;
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `供應商 ${vendor.name} 已添加` : `Vendor ${vendor.name} added`}`;
      clearMessage('message');
    }
    await loadVendors();
  } catch (error) {
    console.error('Error adding vendor:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法添加供應商：${error.message}` : `Failed to add vendor: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function updateVendorEmail(id, newEmail) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: vendor, error: fetchError } = await window.supabaseClient
      .from('vendors')
      .select('name')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    const { error } = await window.supabaseClient
      .from('vendors')
      .update({ contact_email: newEmail })
      .eq('id', id);
    if (error) throw error;
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `供應商 ${vendor.name} 的電子郵件已更新為 ${newEmail || '-'}` : `Email for vendor ${vendor.name} updated to ${newEmail || '-'}`}`;
      clearMessage('message');
    }
    await loadVendors();
  } catch (error) {
    console.error('Error updating vendor email:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法更新供應商電子郵件：${error.message}` : `Failed to update vendor email: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function updateVendorContactNumber(id, newContactNumber) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: vendor, error: fetchError } = await window.supabaseClient
      .from('vendors')
      .select('name')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    const { error } = await window.supabaseClient
      .from('vendors')
      .update({ contact_number: newContactNumber })
      .eq('id', id);
    if (error) throw error;
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `供應商 ${vendor.name} 的聯繫電話已更新為 ${newContactNumber || '-'}` : `Contact number for vendor ${vendor.name} updated to ${newContactNumber || '-'}`}`;
      clearMessage('message');
    }
    await loadVendors();
  } catch (error) {
    console.error('Error updating vendor contact number:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法更新供應商聯繫電話：${error.message}` : `Failed to update vendor contact number: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function updateVendorAddress(id, newAddress) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: vendor, error: fetchError } = await window.supabaseClient
      .from('vendors')
      .select('name')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    const { error } = await window.supabaseClient
      .from('vendors')
      .update({ address: newAddress })
      .eq('id', id);
    if (error) throw error;
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `供應商 ${vendor.name} 的地址已更新為 ${newAddress || '-'}` : `Address for vendor ${vendor.name} updated to ${newAddress || '-'}`}`;
      clearMessage('message');
    }
    await loadVendors();
  } catch (error) {
    console.error('Error updating vendor address:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法更新供應商地址：${error.message}` : `Failed to update vendor address: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function deleteVendor(id) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: vendor, error: fetchError } = await window.supabaseClient
      .from('vendors')
      .select('name')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    const { error } = await window.supabaseClient
      .from('vendors')
      .delete()
      .eq('id', id);
    if (error) throw error;
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `供應商 ${vendor.name} 已刪除` : `Vendor ${vendor.name} deleted`}`;
      clearMessage('message');
    }
    await loadVendors();
  } catch (error) {
    console.error('Error deleting vendor:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法刪除供應商：${error.message}` : `Failed to delete vendor: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function addCustomerSale(sale) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: product, error: fetchError } = await window.supabaseClient
      .from('products')
      .select('stock, name, price')
      .eq('barcode', sale.product_barcode)
      .single();
    if (fetchError) throw fetchError;
    if (!product) {
      throw new Error('Product not found');
    }
    if (product.stock < sale.quantity) {
      throw new Error('Insufficient stock');
    }
    const { data: batches, error: batchError } = await window.supabaseClient
      .from('product_batches')
      .select('*')
      .eq('product_barcode', sale.product_barcode)
      .gt('remaining_quantity', 0)
      .order('created_at', { ascending: true });
    if (batchError) throw batchError;
    if (!batches || batches.length === 0) {
      throw new Error('No available batches found');
    }
    let remainingToDeduct = sale.quantity;
    const updatedBatches = [];
    let totalCost = 0;
    for (const batch of batches) {
      if (remainingToDeduct <= 0) break;
      const deductFromBatch = Math.min(remainingToDeduct, batch.remaining_quantity);
      remainingToDeduct -= deductFromBatch;
      const newRemaining = batch.remaining_quantity - deductFromBatch;
      updatedBatches.push({ id: batch.id, remaining_quantity: newRemaining });
      totalCost += deductFromBatch * batch.buy_in_price;
    }
    if (remainingToDeduct > 0) {
      throw new Error('Not enough stock in batches to fulfill sale');
    }
    for (const batch of updatedBatches) {
      const { error: updateError } = await window.supabaseClient
        .from('product_batches')
        .update({ remaining_quantity: batch.remaining_quantity })
        .eq('id', batch.id);
      if (updateError) throw updateError;
    }
    const newStock = product.stock - sale.quantity;
    const { error: stockError } = await window.supabaseClient
      .from('products')
      .update({ stock: newStock })
      .eq('barcode', sale.product_barcode);
    if (stockError) throw stockError;
    const sellingPrice = sale.price != null ? sale.price : product.price;
    const { error } = await window.supabaseClient
      .from('customer_sales')
      .insert([{ ...sale, sale_date: new Date().toISOString(), selling_price: sellingPrice }]);
    if (error) throw error;
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `客戶銷售記錄 ${sale.quantity} 個 ${product.name} 已添加，售價 $${sellingPrice.toFixed(2)}` : `Customer sale of ${sale.quantity} ${product.name} recorded at $${sellingPrice.toFixed(2)}`}`;
      clearMessage('message');
    }
    await loadCustomerSales();
  } catch (error) {
    console.error('Error adding customer sale:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法添加客戶銷售：${error.message}` : `Failed to add customer sale: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function deleteCustomerSale(id) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: sale, error: fetchError } = await window.supabaseClient
      .from('customer_sales')
      .select('product_barcode, quantity, products(name)')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    const { data: product, error: productError } = await window.supabaseClient
      .from('products')
      .select('stock')
      .eq('barcode', sale.product_barcode)
      .single();
    if (productError) throw productError;
    const { data: batches, error: batchError } = await window.supabaseClient
      .from('product_batches')
      .select('*')
      .eq('product_barcode', sale.product_barcode)
      .order('created_at', { ascending: false });
    if (batchError) throw batchError;
    if (!batches || batches.length === 0) {
      throw new Error('No batches found to return stock');
    }
    let remainingToAdd = sale.quantity;
    const updatedBatches = [];
    for (const batch of batches) {
      if (remainingToAdd <= 0) break;
      const addToBatch = remainingToAdd;
      remainingToAdd -= addToBatch;
      const newRemaining = batch.remaining_quantity + addToBatch;
      updatedBatches.push({ id: batch.id, remaining_quantity: newRemaining });
    }
    for (const batch of updatedBatches) {
      const { error: updateError } = await window.supabaseClient
        .from('product_batches')
        .update({ remaining_quantity: batch.remaining_quantity })
        .eq('id', batch.id);
      if (updateError) throw updateError;
    }
    const newStock = product.stock + sale.quantity;
    const { error: stockError } = await window.supabaseClient
      .from('products')
      .update({ stock: newStock })
      .eq('barcode', sale.product_barcode);
    if (stockError) throw stockError;
    const { error } = await window.supabaseClient
      .from('customer_sales')
      .delete()
      .eq('id', id);
    if (error) throw error;
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `客戶銷售記錄 ${sale.quantity} 個 ${sale.products.name} 已刪除` : `Customer sale of ${sale.quantity} ${sale.products.name} deleted`}`;
      clearMessage('message');
    }
    await loadCustomerSales();
  } catch (error) {
    console.error('Error deleting customer sale:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法刪除客戶銷售：${error.message}` : `Failed to delete customer sale: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function addVendorSale(sale) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    console.log('Adding vendor sale with data:', sale);

    if (!sale.product_barcode) {
      throw new Error('Product barcode is required');
    }
    if (isNaN(sale.vendor_id)) {
      throw new Error('Invalid vendor ID');
    }
    if (isNaN(sale.quantity) || sale.quantity < 1) {
      throw new Error('Quantity must be a positive number');
    }

    const { data: vendor, error: vendorError } = await window.supabaseClient
      .from('vendors')
      .select('name')
      .eq('id', sale.vendor_id)
      .single();
    if (vendorError || !vendor) {
      throw new Error('Vendor not found');
    }
    console.log('Vendor found:', vendor);

    const { data: product, error: fetchError } = await window.supabaseClient
      .from('products')
      .select('stock, name, price')
      .eq('barcode', sale.product_barcode)
      .single();
    if (fetchError || !product) {
      throw new Error('Product not found');
    }
    console.log('Product found:', product);

    if (product.stock < sale.quantity) {
      throw new Error('Insufficient stock to loan');
    }

    let { data: batches, error: batchError } = await window.supabaseClient
      .from('product_batches')
      .select('*')
      .eq('product_barcode', sale.product_barcode)
      .gt('remaining_quantity', 0)
      .order('created_at', { ascending: true });
    if (batchError) throw batchError;

    if (!batches || batches.length === 0) {
      if (product.stock > 0) {
        const today = new Date();
        const batchNumber = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${today.getFullYear()}`;
        const batch = {
          product_barcode: sale.product_barcode,
          vendor_id: sale.vendor_id,
          quantity: product.stock,
          buy_in_price: product.price,
          remaining_quantity: product.stock,
          batch_number: batchNumber
        };
        const { error: batchInsertError } = await window.supabaseClient
          .from('product_batches')
          .insert([batch]);
        if (batchInsertError) throw batchInsertError;
        const { data: newBatches, error: newBatchError } = await window.supabaseClient
          .from('product_batches')
          .select('*')
          .eq('product_barcode', sale.product_barcode)
          .gt('remaining_quantity', 0)
          .order('created_at', { ascending: true });
        if (newBatchError) throw newBatchError;
        batches = newBatches;
      } else {
        throw new Error('No stock available and no batches found');
      }
    }

    let remainingToDeduct = sale.quantity;
    const updatedBatches = [];
    let totalCost = 0;
    for (const batch of batches) {
      if (remainingToDeduct <= 0) break;
      const deductFromBatch = Math.min(remainingToDeduct, batch.remaining_quantity);
      remainingToDeduct -= deductFromBatch;
      const newRemaining = batch.remaining_quantity - deductFromBatch;
      updatedBatches.push({ id: batch.id, remaining_quantity: newRemaining });
      totalCost += deductFromBatch * batch.buy_in_price;
    }
    if (remainingToDeduct > 0) {
      throw new Error('Not enough stock in batches to fulfill loan');
    }
    for (const batch of updatedBatches) {
      const { error: updateError } = await window.supabaseClient
        .from('product_batches')
        .update({ remaining_quantity: batch.remaining_quantity })
        .eq('id', batch.id);
      if (updateError) throw updateError;
    }

    const newStock = product.stock - sale.quantity;
    const { error: stockError } = await window.supabaseClient
      .from('products')
      .update({ stock: newStock })
      .eq('barcode', sale.product_barcode);
    if (stockError) throw stockError;

    const finalPrice = sale.price != null ? sale.price : product.price;
    if (finalPrice < 0) {
      throw new Error('Price cannot be negative');
    }
    console.log('Final price set to:', finalPrice);

    const averageBuyInPrice = totalCost / sale.quantity;

    const saleData = {
      product_barcode: sale.product_barcode,
      vendor_id: sale.vendor_id,
      quantity: sale.quantity,
      price: finalPrice,
      buy_in_price: averageBuyInPrice,
      sale_date: new Date().toISOString()
    };
    console.log('Inserting vendor sale:', saleData);
    const { error } = await window.supabaseClient
      .from('vendor_sales')
      .insert([saleData]);
    if (error) {
      throw new Error(`Failed to insert vendor sale: ${error.message}`);
    }
    console.log('Vendor sale inserted successfully');

    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `供應商貸貨記錄 ${sale.quantity} 個 ${product.name} 已添加，單價 $${finalPrice.toFixed(2)}` : `Vendor loan of ${sale.quantity} ${product.name} recorded at $${finalPrice.toFixed(2)} per unit`}`;
      clearMessage('message');
    }
    await loadVendorSales();
  } catch (error) {
    console.error('Error adding vendor sale:', error.message, error);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法添加供應商貸貨：${error.message}` : `Failed to add vendor loan: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}

async function deleteVendorSale(id) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: sale, error: fetchError } = await window.supabaseClient
      .from('vendor_sales')
      .select('product_barcode, quantity, products(name)')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    const { data: product, error: productError } = await window.supabaseClient
      .from('products')
      .select('stock')
      .eq('barcode', sale.product_barcode)
      .single();
    if (productError) throw productError;
    const { data: batches, error: batchError } = await window.supabaseClient
      .from('product_batches')
      .select('*')
      .eq('product_barcode', sale.product_barcode)
      .order('created_at', { ascending: false });
    if (batchError) throw batchError;
    if (!batches || batches.length === 0) {
      throw new Error('No batches found to return stock');
    }
    let remainingToAdd = sale.quantity;
    const updatedBatches = [];
    for (const batch of batches) {
      if (remainingToAdd <= 0) break;
      const addToBatch = remainingToAdd;
      remainingToAdd -= addToBatch;
      const newRemaining = batch.remaining_quantity + addToBatch;
      updatedBatches.push({ id: batch.id, remaining_quantity: newRemaining });
    }
    for (const batch of updatedBatches) {
      const { error: updateError } = await window.supabaseClient
        .from('product_batches')
        .update({ remaining_quantity: batch.remaining_quantity })
        .eq('id', batch.id);
      if (updateError) throw updateError;
    }
    const newStock = product.stock + sale.quantity;
    const { error: stockError } = await window.supabaseClient
      .from('products')
      .update({ stock: newStock })
      .eq('barcode', sale.product_barcode);
    if (stockError) throw stockError;
    const { error } = await window.supabaseClient
      .from('vendor_sales')
      .delete()
      .eq('id', id);
    if (error) throw error;
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `供應商貸貨記錄 ${sale.quantity} 個 ${sale.products.name} 已刪除` : `Vendor loan of ${sale.quantity} ${sale.products.name} deleted`}`;
      clearMessage('message');
    }
    await loadVendorSales();
  } catch (error) {
    console.error('Error deleting vendor sale:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = `[${new Date().toISOString()}] ${isChinese ? `無法刪除供應商貸貨：${error.message}` : `Failed to delete vendor loan: ${error.message}`}`;
      clearMessage('error');
    }
  } finally {
    setLoading(false);
  }
}
