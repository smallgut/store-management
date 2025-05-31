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

// Custom fetch to fix 406 error by setting Accept header
const customFetch = (url, options = {}) => {
  const headers = {
    ...options.headers,
    Accept: 'application/json',
    Authorization: options.headers?.Authorization || `Bearer YOUR_ANON_KEY`, // Replace YOUR_ANON_KEY here as well
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
    'YOUR_SUPABASE_URL', // Replace with your Supabase Project URL
    'YOUR_ANON_KEY', // Replace with your anon key
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

const loadCustomerSales = debounce(async function() {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: sales, error } = await window.supabaseClient
