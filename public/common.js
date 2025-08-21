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

async function loadProducts() {
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
  setLoading(true);
  try {
    const { data, error } = await window.supabaseClient.from('products').select('*');
    if (error) throw error;
    console.log('Products:', data);
    const productsBody = document.querySelector('#products tbody');
    productsBody.innerHTML = data.length
      ? data.map(p => `
          <tr>
            <td class="border p-2">${p.name}</td>
            <td class="border p-2">${p.barcode}</td>
            <td class="border p-2">$${p.price.toFixed(2)}</td>
            <td class="border p-2">${p.stock}</td>
            <td class="border p-2">
              <form onsubmit="event.preventDefault(); updateProduct('${p.barcode}', { stock: parseInt(document.getElementById('stock-${p.barcode}').value) + ${p.stock} })">
                <input id="stock-${p.barcode}" type="number" min="0" placeholder="Qty" class="border p-1 rounded w-16">
                <button type="submit" class="bg-green-500 text-white p-1 rounded hover:bg-green-600">Update Stock</button>
              </form>
              <button onclick="if (confirm('Delete ${p.name} (${p.barcode})?')) deleteProduct('${p.barcode}')" class="bg-red-500 text-white p-1 rounded hover:bg-red-600 mt-2">Delete</button>
            </td>
          </tr>
        `).join('')
      : '<tr><td colspan="5" class="border p-2">No products found.</td></tr>';
  } catch (error) {
    console.error('Error loading products:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Failed to load products: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

const loadVendors = debounce(async function() {
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
  setLoading(true);
  try {
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
    vendorSelect.innerHTML = '<option value="">Select Vendor</option>' + data.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
  } catch (error) {
    console.error('Error loading vendors:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Failed to load vendors: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}, 300);

const loadSales = debounce(async function() {
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
  setLoading(true);
  try {
    const { data: sales, error } = await window.supabaseClient
      .from('sales')
      .select('id, product_barcode, vendor_id, customer_name, quantity, sale_date')
      .order('sale_date', { ascending: false });
    if (error) throw error;
    const productBarcodes = [...new Set(sales.map(s => s.product_barcode))];
    const vendorIds = [...new Set(sales.map(s => s.vendor_id))];
    const { data: products } = await window.supabaseClient
      .from('products')
      .select('barcode, name')
      .in('barcode', productBarcodes);
    const { data: vendors } = await window.supabaseClient
      .from('vendors')
      .select('id, name')
      .in('id', vendorIds);
    const salesWithNames = sales.map(s => ({
      ...s,
      product_name: products.find(p => p.barcode === s.product_barcode)?.name || 'Unknown',
      vendor_name: vendors.find(v => v.id === s.vendor_id)?.name || 'Unknown'
    }));
    console.log('Sales:', salesWithNames);
    const salesBody = document.querySelector('#sales tbody');
    salesBody.innerHTML = salesWithNames.length
      ? salesWithNames.map(s => `
          <tr>
            <td class="border p-2">${s.product_name}</td>
            <td class="border p-2">${s.vendor_name}</td>
            <td class="border p-2">${s.customer_name || '-'}</td>
            <td class="border p-2">${s.quantity}</td>
            <td class="border p-2">${new Date(s.sale_date).toLocaleString()}</td>
            <td class="border p-2">
              <button onclick="if (confirm('Delete sale for ${s.product_name}?')) deleteSale(${s.id})" class="bg-red-500 text-white p-1 rounded hover:bg-red-600">Delete</button>
            </td>
          </tr>
        `).join('')
      : '<tr><td colspan="6" class="border p-2">No sales found.</td></tr>';
  } catch (error) {
    console.error('Error loading sales:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Failed to load sales: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}, 300);

async function sortProducts(by) {
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
  setLoading(true);
  try {
    const { data, error } = await window.supabaseClient.from('products').select('*').order(by);
    if (error) throw error;
    console.log('Sorted products:', data);
    const productsBody = document.querySelector('#products tbody');
    productsBody.innerHTML = data.length
      ? data.map(p => `
          <tr>
            <td class="border p-2">${p.name}</td>
            <td class="border p-2">${p.barcode}</td>
            <td class="border p-2">$${p.price.toFixed(2)}</td>
            <td class="border p-2">${p.stock}</td>
            <td class="border p-2">
              <form onsubmit="event.preventDefault(); updateProduct('${p.barcode}', { stock: parseInt(document.getElementById('stock-${p.barcode}').value) + ${p.stock} })">
                <input id="stock-${p.barcode}" type="number" min="0" placeholder="Qty" class="border p-1 rounded w-16">
                <button type="submit" class="bg-green-500 text-white p-1 rounded hover:bg-green-600">Update Stock</button>
              </form>
              <button onclick="if (confirm('Delete ${p.name} (${p.barcode})?')) deleteProduct('${p.barcode}')" class="bg-red-500 text-white p-1 rounded hover:bg-red-600 mt-2">Delete</button>
            </td>
          </tr>
        `).join('')
      : '<tr><td colspan="5" class="border p-2">No products found.</td></tr>';
  } catch (error) {
    console.error('Error sorting products:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Error sorting products: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

async function addProduct(product) {
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
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
  try {
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
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
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
  try {
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
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
  console.log('Deleting product:', barcode);
  setLoading(true);
  try {
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
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
  if (!vendor.name) {
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Vendor name cannot be empty.`;
    clearMessage('error');
    return;
  }
  console.log('Adding vendor:', vendor);
  setLoading(true);
  try {
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
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
  if (!id || !updates.name) {
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Vendor ID and name cannot be empty.`;
    clearMessage('error');
    return;
  }
  console.log('Updating vendor:', id, updates);
  setLoading(true);
  try {
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
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
  console.log('Deleting vendor:', id);
  setLoading(true);
  try {
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

async function addSale(sale) {
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
  if (!sale.product_barcode || !sale.vendor_id || sale.quantity <= 0) {
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Product barcode, vendor, and quantity (>0) are required.`;
    clearMessage('error');
    return;
  }
  console.log('Adding sale:', sale);
  setLoading(true);
  try {
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
      .from('sales')
      .insert([sale])
      .select();
    if (error) throw error;
    await window.supabaseClient
      .from('products')
      .update({ stock: product.stock - sale.quantity })
      .eq('barcode', sale.product_barcode);
    console.log('Sale added:', JSON.stringify(saleData, null, 2));
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Sale recorded for ${sale.product_barcode}`;
    clearMessage('message');
    await loadSales();
    await loadProducts();
  } catch (error) {
    console.error('Error adding sale:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Failed to add sale: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

async function deleteSale(id) {
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return;
  }
  console.log('Deleting sale:', id);
  setLoading(true);
  try {
    const { data: sale, error: saleError } = await window.supabaseClient
      .from('sales')
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
      .from('sales')
      .delete()
      .eq('id', id);
    if (error) throw error;
    console.log('Sale deleted:', id);
    document.getElementById('message').textContent = `[${new Date().toISOString()}] Sale deleted: ${id}`;
    clearMessage('message');
    await loadSales();
    await loadProducts();
  } catch (error) {
    console.error('Error deleting sale:', error.message);
    document.getElementById('error').textContent = `[${new Date().toISOString()}] Error deleting sale: ${error.message}`;
    clearMessage('error');
  } finally {
    setLoading(false);
  }
}

function setupRealtime() {
  const channels = [
    { name: 'products', table: 'products', callback: loadProducts },
    { name: 'vendors', table: 'vendors', callback: loadVendors },
    { name: 'sales', table: 'sales', callback: loadSales }
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
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#products')) loadProducts();
  if (document.querySelector('#vendors')) loadVendors();
  if (document.querySelector('#sales')) loadSales();
  setupRealtime();
});
</script>