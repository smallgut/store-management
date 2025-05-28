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
    if (productsBody) { // Only update UI if the element exists
      productsBody.innerHTML = data.length
        ? data.map(p => `
            <tr>
              <td class="border p-2">${p.name}</td>
              <td class="border p-2">${p.barcode}</td>
              <td class="border p-2">$${p.price.toFixed(2)}</td>
              <td class="border p-2">${p.stock}</td>
              <td class="border p-2">${p.vendors?.name || 'N/A'}</td>
              <td class="border p-2">
                <form onsubmit="event.preventDefault(); updateProduct('${p.barcode}', { stock: parseInt(document.getElementById('stock-${p.barcode}').value) + ${p.stock} })">
                  <input id="stock-${p.barcode}" type="number" min="0" placeholder="Qty" class="border p-1 rounded w-16">
                  <button type="submit" class="bg-green-500 text-white p-1 rounded hover:bg-green-600">Update Stock</button>
                </form>
                <button onclick="if (confirm('Delete ${p.name} (${p.barcode})?')) deleteProduct('${p.barcode}')" class="bg-red-500 text-white p-1 rounded hover:bg-red-600 mt-2">Delete</button>
              </td>
            </tr>
          `).join('')
        : '<tr><td colspan="6" class="border p-2">No products found.</td></tr>';
    }
  } catch (error) {
    console.error('Error loading products:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Failed to load products: ${error.message}`;
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
    vendorsBody.innerHTML = data.length
      ? data.map(v => `
          <tr>
            <td class="border p-2">${v.name}</td>
            <td class="border p-2">${v.contact_email || '-'}</td>
            <td class="border p-2">
              <button onclick="if (confirm('Delete ${v.name}?')) deleteVendor(${v.id})" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">Delete</button>
            </td>
          </tr>
        `).join('')
      : '<tr><td colspan="3" class="border p-2">No vendors found.</td></tr>';
    const vendorSelect = document.getElementById('sale-vendor');
    if (vendorSelect) {
      vendorSelect.innerHTML = '<option value="">Select Vendor</option>' + data.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    }
  } catch (error) {
    console.error('Error loading vendors:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Failed to load vendors: ${error.message}`;
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
    salesBody.innerHTML = salesWithNames.length
      ? salesWithNames.map(s => `
          <tr>
            <td class="border p-2">${s.product_name}</td>
            <td class="border p-2">${s.customer_name || '-'}</td>
            <td class="border p-2">${s.quantity}</td>
            <td class="border p-2">${new Date(s.sale_date).toLocaleString()}</td>
            <td class="border p-2">
              <button onclick="if (confirm('Delete sale for ${s.product_name}?')) deleteCustomerSale(${s.id})" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">Delete</button>
            </td>
          </tr>
        `).join('')
      : '<tr><td colspan="5" class="border p-2">No sales found.</td></tr>';
  } catch (error) {
    console.error('Error loading customer sales:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Failed to load customer sales: ${error.message}`;
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
    salesBody.innerHTML = salesWithNames.length
      ? salesWithNames.map(s => `
          <tr>
            <td class="border p-2">${s.product_name}</td>
            <td class="border p-2">${s.vendor_name}</td>
            <td class="border p-2">${s.quantity}</td>
            <td class="border p-2">$${s.price.toFixed(2)}</td>
            <td class="border p-2">${new Date(s.sale_date).toLocaleString()}</td>
            <td class="border p-2">
              <button onclick="if (confirm('Delete sale for ${s.product_name}?')) deleteVendorSale(${s.id})" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">Delete</button>
            </td>
          </tr>
        `).join('')
      : '<tr><td colspan="6" class="border p-2">No sales found.</td></tr>';
  } catch (error) {
    console.error('Error loading vendor sales:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Failed to load vendor sales: ${error.message}`;
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
      productsBody.innerHTML = data.length
        ? data.map(p => `
            <tr>
              <td class="border p-2">${p.name}</td>
              <td class="border p-2">${p.barcode}</td>
              <td class="border p-2">$${p.price.toFixed(2)}</td>
              <td class="border p-2">${p.stock}</td>
              <td class="border p-2">${p.vendors?.name || 'N/A'}</td>
              <td class="border p-2">
                <form onsubmit="event.preventDefault(); updateProduct('${p.barcode}', { stock: parseInt(document.getElementById('stock-${p.barcode}').value) + ${p.stock} })">
                  <input id="stock-${p.barcode}" type="number" min="0" placeholder="Qty" class="border p-1 rounded w-16">
                  <button type="submit" class="bg-green-500 text-white p-1 rounded hover:bg-green-600">Update Stock</button>
                </form>
                <button onclick="if (confirm('Delete ${p.name} (${p.barcode})?')) deleteProduct('${p.barcode}')" class="bg-red-500 text-white p-1 rounded hover:bg-red-600 mt-2">Delete</button>
              </td>
            </tr>
          `).join('')
        : '<tr><td colspan="6" class="border p-2">No products found.</td></tr>';
    }
  } catch (error) {
    console.error('Error sorting products:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Error sorting products: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

async function addProduct(product) {
  try {
    await ensureSupabaseClient();
    if (!product.barcode || !product.name) {
      document.getElementById('error').textContent = `[${new Date().toISOString()}] Barcode and name cannot be empty.`;
      clearMessage('error');
      return;
    }
    if (product.price < 0 || product.stock < 0) {
      document.getElementById('error').textContent = `[${new Date().toISOString()}] Price and stock must be non-negative.`;
      clearMessage('error');
      return;
    }
    console.log('Adding product:', product);
    setLoading(true);
    const { data: existing } = await window.supabaseClient
      .from('products')
      .select('barcode')
      .eq('barcode', product.barcode);
    if (existing.length > 0) throw new Error('Barcode already exists');
    const { data, error } = await window.supabaseClient
      .from('products')
      .insert([product])
      .select();
    if (error) throw error;
    console.log('Product added:', JSON.stringify(data, null, 2));
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Product added: ${product.name}`;
    clearMessage('message');
    await loadProducts();
  } catch (error) {
    console.error('Error adding product:', error.message);
    let errorMessage = `[${new Date().toISOString()}] Failed to add product: ${error.message}`;
    if (error.message.includes('duplicate key value') || error.message.includes('Barcode already exists')) {
      errorMessage = `[${new Date().toISOString()}] Failed to add product: Barcode already exists.`;
    }
    document.getElementById('error').textContent = errorMessage;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

async function updateProduct(barcode, updates) {
  try {
    await ensureSupabaseClient();
    if (!barcode || !updates.name) {
      document.getElementById('error').textContent = `[${new Date().toISOString()}] Barcode and name cannot be empty.`;
      clearMessage('error');
      return;
    }
    if (updates.price < 0 || updates.stock < 0) {
      document.getElementById('error').textContent = `[${new Date().toISOString()}] Price and stock must be non-negative.`;
      clearMessage('error');
      return;
    }
    console.log('Updating product:', barcode, updates);
    setLoading(true);
    const { data, error } = await window.supabaseClient
      .from('products')
      .update(updates)
      .eq('barcode', barcode)
      .select();
    if (error) throw error;
    if (!data.length) throw new Error('Product not found');
    console.log('Product updated:', JSON.stringify(data, null, 2));
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Product updated: ${barcode}`;
    clearMessage('message');
    await loadProducts();
  } catch (error) {
    console.error('Error updating product:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Error updating product: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

async function deleteProduct(barcode) {
  try {
    await ensureSupabaseClient();
    console.log('Deleting product:', barcode);
    setLoading(true);
    const { error } = await window.supabaseClient
      .from('products')
      .delete()
      .eq('barcode', barcode);
    if (error) throw error;
    console.log('Product deleted:', barcode);
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Product deleted: ${barcode}`;
    clearMessage('message');
    await loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Error deleting product: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

async function addVendor(vendor) {
  try {
    await ensureSupabaseClient();
    if (!vendor.name) {
      document.getElementById('error').textContent = `[${new Date().toISOString()}] Vendor name cannot be empty.`;
      clearMessage('error');
      return;
    }
    console.log('Adding vendor:', vendor);
    setLoading(true);
    const { data: existing } = await window.supabaseClient
      .from('vendors')
      .select('name')
      .eq('name', vendor.name);
    if (existing.length > 0) throw new Error('Vendor name already exists');
    const { data, error } = await window.supabaseClient
      .from('vendors')
      .insert([vendor])
      .select();
    if (error) throw error;
    console.log('Vendor added:', JSON.stringify(data, null, 2));
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Vendor added: ${vendor.name}`;
    clearMessage('message');
    await loadVendors();
  } catch (error) {
    console.error('Error adding vendor:', error.message);
    let errorMessage = `[${new Date().toISOString()}] Failed to add vendor: ${error.message}`;
    if (error.message.includes('duplicate key value') || error.message.includes('Vendor name already exists')) {
      errorMessage = `[${new Date().toISOString()}] Failed to add vendor: Vendor name already exists.`;
    }
    document.getElementById('error').textContent = errorMessage;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

async function updateVendor(id, updates) {
  try {
    await ensureSupabaseClient();
    if (!id || !updates.name) {
      document.getElementById('error').textContent = `[${new Date().toISOString()}] Vendor ID and name cannot be empty.`;
      clearMessage('error');
      return;
    }
    console.log('Updating vendor:', id, updates);
    setLoading(true);
    const { data: existing } = await window.supabaseClient
      .from('vendors')
      .select('id')
      .eq('name', updates.name)
      .neq('id', id);
    if (existing.length > 0) throw new Error('Vendor name already exists');
    const { data, error } = await window.supabaseClient
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!data.length) throw new Error('Vendor not found');
    console.log('Vendor updated:', JSON.stringify(data, null, 2));
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Vendor updated: ${updates.name}`;
    clearMessage('message');
    await loadVendors();
  } catch (error) {
    console.error('Error updating vendor:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Error updating vendor: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

async function deleteVendor(id) {
  try {
    await ensureSupabaseClient();
    console.log('Deleting vendor:', id);
    setLoading(true);
    const { error } = await window.supabaseClient
      .from('vendors')
      .delete()
      .eq('id', id);
    if (error) throw error;
    console.log('Vendor deleted:', id);
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Vendor deleted: ${id}`;
    clearMessage('message');
    await loadVendors();
  } catch (error) {
    console.error('Error deleting vendor:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Error deleting vendor: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

async function addCustomerSale(sale) {
  try {
    await ensureSupabaseClient();
    if (!sale.product_barcode || sale.quantity <= 0) {
      document.getElementById('error').textContent = `[${new Date().toISOString()}] Product barcode and quantity (>0) are required.`;
      clearMessage('error');
      return;
    }
    console.log('Adding customer sale:', sale);
    setLoading(true);
    const { data: product, error: productError } = await window.supabaseClient
      .from('products')
      .select('barcode, stock')
      .eq('barcode', sale.product_barcode)
      .single();
    if (productError || !product) {
      throw new Error('Product not found');
    }
    if (product.stock < sale.quantity) {
      throw new Error(`Insufficient stock: ${product.stock} available`);
    }
    const { data: saleData, error } = await window.supabaseClient
      .from('customer_sales')
      .insert([sale])
      .select();
    if (error) throw error;
    await window.supabaseClient
      .from('products')
      .update({ stock: product.stock - sale.quantity })
      .eq('barcode', sale.product_barcode);
    console.log('Customer sale added:', JSON.stringify(saleData, null, 2));
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Customer sale recorded for ${sale.product_barcode}`;
    clearMessage('message');
    await loadCustomerSales();
    await loadProducts();
  } catch (error) {
    console.error('Error adding customer sale:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Failed to add customer sale: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

async function deleteCustomerSale(id) {
  try {
    await ensureSupabaseClient();
    console.log('Deleting customer sale:', id);
    setLoading(true);
    const { data: sale, error: saleError } = await window.supabaseClient
      .from('customer_sales')
      .select('id, product_barcode, quantity')
      .eq('id', id)
      .single();
    if (saleError || !sale) throw new Error('Sale not found');
    const { data: product, error: productError } = await window.supabaseClient
      .from('products')
      .select('stock')
      .eq('barcode', sale.product_barcode)
      .single();
    if (productError || !product) throw new Error('Product not found');
    const newStock = product.stock + sale.quantity;
    const { error: updateError } = await window.supabaseClient
      .from('products')
      .update({ stock: newStock })
      .eq('barcode', sale.product_barcode);
    if (updateError) throw updateError;
    const { error } = await window.supabaseClient
      .from('customer_sales')
      .delete()
      .eq('id', id);
    if (error) throw error;
    console.log('Customer sale deleted:', id);
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Customer sale deleted: ${id}`;
    clearMessage('message');
    await loadCustomerSales();
    await loadProducts();
  } catch (error) {
    console.error('Error deleting customer sale:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Error deleting customer sale: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

async function addVendorSale(sale) {
  try {
    await ensureSupabaseClient();
    if (!sale.product_barcode || !sale.vendor_id || sale.quantity <= 0 || sale.price < 0) {
      document.getElementById('error').textContent = `[${new Date().toISOString()}] Product barcode, vendor, quantity (>0), and price (>=0) are required.`;
      clearMessage('error');
      return;
    }
    console.log('Adding vendor loan:', sale);
    setLoading(true);
    const { data: product, error: productError } = await window.supabaseClient
      .from('products')
      .select('barcode, stock')
      .eq('barcode', sale.product_barcode)
      .single();
    if (productError || !product) {
      throw new Error('Product not found');
    }
    const { data: saleData, error } = await window.supabaseClient
      .from('vendor_sales')
      .insert([sale])
      .select();
    if (error) throw error;
    await window.supabaseClient
      .from('products')
      .update({ stock: product.stock + sale.quantity })
      .eq('barcode', sale.product_barcode);
    console.log('Vendor loan added:', JSON.stringify(saleData, null, 2));
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Vendor loan recorded for ${sale.product_barcode}`;
    clearMessage('message');
    await loadVendorSales();
    await loadProducts();
  } catch (error) {
    console.error('Error adding vendor loan:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Failed to add vendor loan: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

async function deleteVendorSale(id) {
  try {
    await ensureSupabaseClient();
    console.log('Deleting vendor loan:', id);
    setLoading(true);
    const { data: sale, error: saleError } = await window.supabaseClient
      .from('vendor_sales')
      .select('id, product_barcode, quantity')
      .eq('id', id)
      .single();
    if (saleError || !sale) throw new Error('Loan not found');
    const { data: product, error: productError } = await window.supabaseClient
      .from('products')
      .select('stock')
      .eq('barcode', sale.product_barcode)
      .single();
    if (productError || !product) throw new Error('Product not found');
    const newStock = product.stock - sale.quantity;
    if (newStock < 0) throw new Error('Cannot reduce stock below 0');
    const { error: updateError } = await window.supabaseClient
      .from('products')
      .update({ stock: newStock })
      .eq('barcode', sale.product_barcode);
    if (updateError) throw updateError;
    const { error } = await window.supabaseClient
      .from('vendor_sales')
      .delete()
      .eq('id', id);
    if (error) throw error;
    console.log('Vendor loan deleted:', id);
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Vendor loan deleted: ${id}`;
    clearMessage('message');
    await loadVendorSales();
    await loadProducts();
  } catch (error) {
    console.error('Error deleting vendor loan:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Error deleting vendor loan: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

function setupRealtime() {
  try {
    const channels = [
      { name: 'products', table: 'products', callback: loadProducts },
      { name: 'vendors', table: 'vendors', callback: loadVendors },
      { name: 'customer_sales', table: 'customer_sales', callback: loadCustomerSales },
      { name: 'vendor_sales', table: 'vendor_sales', callback: loadVendorSales }
    ];

    channels.forEach(({ name, table, callback }) => {
      const channel = window.supabaseClient.channel(name);
      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            console.log(`Realtime update (${table}):`, payload);
            callback();
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status (${table}):`, status);
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to ${table} changes`);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.error(`Subscription to ${table} failed, status:`, status);
            setTimeout(() => {
              console.log(`Attempting to reconnect to ${table} channel...`);
              channel.subscribe();
            }, 5000);
          }
        });
    });
  } catch (error) {
    console.error('Error setting up realtime:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Error setting up
