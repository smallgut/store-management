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

// Initialize Supabase client
if (typeof supabase === 'undefined') {
  console.error('Supabase SDK not loaded');
  throw new Error('Supabase SDK not loaded');
}
const { createClient } = supabase;
window.supabaseClient = createClient(
  'https://aouduygmcspiqauhrabx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdWR1eWdtY3NwaXFhdWhyYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTM5MzAsImV4cCI6MjA2MDgyOTkzMH0.s8WMvYdE9csSb1xb6jv84aiFBBU_LpDi1aserTQDg-k'
);
console.log('Supabase Client Initialized in common.js:', Object.keys(window.supabaseClient));

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
    const { data, error } = await window.supabaseClient
      .from('products')
      .select('*, vendors(name)')
      .order('name');
    if (error) throw error;
    console.log('Products:', data);
    const productsBody = document.querySelector('#products tbody');
    if (productsBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      productsBody.innerHTML = data.length
        ? data.map(p => `
            <tr>
              <td class="border p-2">${p.name}</td>
              <td class="border p-2">${p.barcode}</td>
              <td class="border p-2">$${p.price.toFixed(2)}</td>
              <td class="border p-2">${p.stock}</td>
              <td class="border p-2">${p.vendors?.name || (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">
                <form onsubmit="event.preventDefault(); updateProduct('${p.barcode}', { stock: parseInt(document.getElementById('stock-${p.barcode}').value) + ${p.stock} })">
                  <input id="stock-${p.barcode}" type="number" min="0" placeholder="${isChinese ? '數量' : 'Qty'}" class="border p-1 rounded w-16">
                  <button type="submit" class="bg-green-500 text-white p-1 rounded hover:bg-green-600">${isChinese ? '更新庫存' : 'Update Stock'}</button>
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
    document.getElementById('error').textContent = `[${new Date().toISOString()}] ${isChinese ? `無法載入產品：${error.message}` : `Failed to load products: ${error.message}`}`;
    clearMessage('error');
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
              <td class="border p-2">${v.contact_email || '-'}</td>
              <td class="border p-2">
                <button onclick="if (confirm('${isChinese ? `刪除 ${v.name}?` : `Delete ${v.name}?`})) deleteVendor(${v.id})" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
              </td>
            </tr>
          `).join('')
        : `<tr><td colspan="3" class="border p-2">${isChinese ? '未找到供應商。' : 'No vendors found.'}</td></tr>`;
    }
    const vendorSelect = document.getElementById('sale-vendor');
    if (vendorSelect) {
      vendorSelect.innerHTML = `<option value="">${isChinese ? '選擇供應商' : 'Select Vendor'}</option>` + data.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    }
  } catch (error) {
    console.error('Error loading vendors:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('error').textContent = `[${new Date().toISOString()}] ${isChinese ? `無法載入供應商：${error.message}` : `Failed to load vendors: ${error.message}`}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}, 300);

const loadCustomerSales = debounce(async function() {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: sales, error } = await window.supabaseClient
      .from('customer_sales')
      .select('id, product_barcode, customer_name, quantity, sale_date, products(name)')
      .order('sale_date', { ascending: false });
    if (error) throw error;
    const salesWithNames = sales.map(s => ({
      ...s,
      product_name: s.products?.name || 'Unknown'
    }));
    console.log('Customer Sales:', salesWithNames);
    const salesBody = document.querySelector('#customer-sales tbody');
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    salesBody.innerHTML = salesWithNames.length
      ? salesWithNames.map(s => `
          <tr>
            <td class="border p-2">${s.product_name}</td>
            <td class="border p-2">${s.customer_name || '-'}</td>
            <td class="border p-2">${s.quantity}</td>
            <td class="border p-2">${new Date(s.sale_date).toLocaleString()}</td>
            <td class="border p-2">
              <button onclick="if (confirm('${isChinese ? `刪除 ${s.product_name} 的銷售記錄?` : `Delete sale for ${s.product_name}?`})) deleteCustomerSale(${s.id})" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
            </td>
          </tr>
        `).join('')
      : `<tr><td colspan="5" class="border p-2">${isChinese ? '未找到銷售記錄。' : 'No sales found.'}</td></tr>`;
  } catch (error) {
    console.error('Error loading customer sales:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('error').textContent = `[${new Date().toISOString()}] ${isChinese ? `無法載入客戶銷售：${error.message}` : `Failed to load customer sales: ${error.message}`}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}, 300);

const loadVendorSales = debounce(async function() {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data: sales, error } = await window.supabaseClient
      .from('vendor_sales')
      .select('id, product_barcode, vendor_id, quantity, price, sale_date, products(name), vendors(name)')
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
    salesBody.innerHTML = salesWithNames.length
      ? salesWithNames.map(s => `
          <tr>
            <td class="border p-2">${s.product_name}</td>
            <td class="border p-2">${s.vendor_name}</td>
            <td class="border p-2">${s.quantity}</td>
            <td class="border p-2">$${s.price.toFixed(2)}</td>
            <td class="border p-2">${new Date(s.sale_date).toLocaleString()}</td>
            <td class="border p-2">
              <button onclick="if (confirm('${isChinese ? `刪除 ${s.product_name} 的貸貨記錄?` : `Delete sale for ${s.product_name}?`})) deleteVendorSale(${s.id})" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">${isChinese ? '刪除' : 'Delete'}</button>
            </td>
          </tr>
        `).join('')
      : `<tr><td colspan="6" class="border p-2">${isChinese ? '未找到貸貨記錄。' : 'No sales found.'}</td></tr>`;
  } catch (error) {
    console.error('Error loading vendor sales:', error.message);
    const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
    document.getElementById('error').textContent = `[${new Date().toISOString()}] ${isChinese ? `無法載入供應商貸貨：${error.message}` : `Failed to load vendor sales: ${error.message}`}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}, 300);

async function sortProducts(by) {
  try {
    await ensureSupabaseClient();
    setLoading(true);
    const { data, error } = await window.supabaseClient
      .from('products')
      .select('*, vendors(name)')
      .order(by);
    if (error) throw error;
    console.log('Sorted products:', data);
    const productsBody = document.querySelector('#products tbody');
    if (productsBody) {
      const isChinese = document.getElementById('lang-body')?.classList.contains('lang-zh');
      productsBody.innerHTML = data.length
        ? data.map(p => `
            <tr>
              <td class="border p-2">${p.name}</td>
              <td class="border p-2">${p.barcode}</td>
              <td class="border p-2">$${p.price.toFixed(2)}</td>
              <td class="border p-2">${p.stock}</td>
              <td class="border p-2">${p.vendors?.name || (isChinese ? '無' : 'N/A')}</td>
              <td class="border p-2">
                <form onsubmit="event.preventDefault(); updateProduct('${p.barcode}', { stock: parseInt(document.getElementById('stock-${p.barcode}').value) + ${p.stock} })">
                  <input id="stock-${p.barcode}" type="number" min="0" placeholder="${isChinese ? '數量' : 'Qty'}" class="border p-1 rounded w-16">
                  <button type="submit" class="bg-green-500 text-white p-1 rounded hover:bg-green-600">${isChinese ? '更新庫存' : 'Update Stock'}</button>
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
    document
