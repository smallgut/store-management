// =========================================================
// ✅ common.js (Debug-Friendly Patched Version)
// - Matches normalized schema (customer_sales + customer_sales_items)
// - Structured logs for debugging 🛒 💳 📦 🧾 ❌
// =========================================================

console.log("⚡ common.js loaded");

// ---------------------------------------------------------
// 🔑 Supabase Client
// ---------------------------------------------------------
let _supabase;
async function ensureSupabaseClient() {
  if (_supabase) return _supabase;
  console.log("🔑 Initializing Supabase Client...");
  _supabase = window.supabase.createClient(
    "https://aouduygmcspiqauhrabx.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdWR1eWdtY3NwaXFhdWhyYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTM5MzAsImV4cCI6MjA2MDgyOTkzMH0.s8WMvYdE9csSb1xb6jv84aiFBBU_LpDi1aserTQDg-k" // ⚠️ replace with your real anon key
  );
  return _supabase;
}

// ---------------------------------------------------------
// 🌐 i18n Helpers (stubbed)
// ---------------------------------------------------------
function applyTranslations() {
  console.log("🌐 Translations applied on DOM ready");
}
function toggleLanguage() {
  console.log("🌐 Language toggled");
}

// ---------------------------------------------------------
// 📅 Date Formatter
// ---------------------------------------------------------
// ----------------------
// Helpers
// ----------------------
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function showMessage(msg) {
  const el = document.getElementById("message");
  if (el) {
    el.innerText = msg;
    setTimeout(() => (el.innerText = ""), 3000);
  }
}

function showError(err) {
  const el = document.getElementById("error");
  if (el) {
    el.innerText = err;
    setTimeout(() => (el.innerText = ""), 5000);
  }
}
// ---------------------------------------------------------
// 📦 Products + Batches
// ---------------------------------------------------------
// ----------------------
// 🔹 Customer Sales
// ----------------------
let cart = [];

async function populateProductDropdown() {
  const supabase = await ensureSupabaseClient();
  const { data, error } = await supabase.from("products").select("id, name, barcode");
  if (error) return console.error("❌ Failed to load products:", error);

  console.log("📦 Products for dropdown:", data);
  const select = document.getElementById("product-select");
  if (!select) return;
  select.innerHTML = `<option value="">-- Select --</option>`;
  data.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} (${p.barcode})`;
    select.appendChild(opt);
  });
}

// ---------------------------------------------------------
// 🔍 Barcode Lookup
// ---------------------------------------------------------
async function handleBarcodeInput(e) {
  if (e.key === "Enter") {
    const barcode = e.target.value.trim();
    if (!barcode) return;
    console.log("🔍 Barcode entered:", barcode);
    const supabase = await ensureSupabaseClient();
    const { data, error } = await supabase.from("products").select("*").eq("barcode", barcode).single();
    if (error || !data) {
      console.warn("❌ Product not found for barcode:", barcode);
      document.getElementById("stock-display").textContent = "Product not found";
      return;
    }
    console.log("📦 Product found via barcode:", data);
    await loadProductAndBatches(data.id, true);
  }
}

async function handleProductSelection(e) {
  const productId = e.target.value;
  if (!productId) return;
  console.log("📌 handleProductSelection triggered for ID:", productId);
  await loadProductAndBatches(productId, false);
}

async function loadProductAndBatches(productId, byBarcode = false) {
  console.log("🔍 loadProductAndBatches called with:", productId, "byBarcode:", byBarcode);
  const supabase = await ensureSupabaseClient();
  let product;

  if (byBarcode) {
    const { data, error } = await supabase.from("products").select("*").eq("barcode", productId).single();
    if (error || !data) {
      document.getElementById("stock-display").innerText = "Product not found";
      return;
    }
    product = data;
  } else {
    const { data, error } = await supabase.from("products").select("*").eq("id", productId).single();
    if (error || !data) {
      showError("Product not found.");
      return;
    }
    product = data;
  }

  console.log("✅ Product loaded:", product);

  const { data: batches, error: bErr } = await supabase.from("product_batches")
    .select("*")
    .eq("product_id", product.id);
  if (bErr) return showError("Failed to load batches");

  console.log("📦 Found", batches.length, "batch(es) for product", product.id, batches);

  const batchSelect = document.getElementById("batch-no");
  batchSelect.innerHTML = "";
  batches.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = `${b.batch_number} (Stock: ${b.remaining_quantity})`;
    batchSelect.appendChild(opt);
  });

  if (batches.length === 1) {
    batchSelect.value = batches[0].id;
    console.log("✅ Auto-selected batch:", batches[0]);
  }

  document.getElementById("stock-display").innerText =
    batches.length > 0 ? `Stock: ${batches[0].remaining_quantity}` : "No stock available";

  return product;
}

function addItemToCart() {
  const productSelect = document.getElementById("product-select");
  const batchSelect = document.getElementById("batch-no");
  const qty = parseInt(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("selling-price").value);

  if (!productSelect.value || !batchSelect.value || !qty || !price) {
    showError("Missing item details");
    return;
  }

  const productName = productSelect.options[productSelect.selectedIndex].text;
  const batchName = batchSelect.options[batchSelect.selectedIndex].text;

  const item = {
    productId: parseInt(productSelect.value),
    productName,
    batchId: parseInt(batchSelect.value),
    batchNumber: batchName,
    quantity: qty,
    sellingPrice: price,
    subTotal: qty * price
  };

  cart.push(item);
  console.log("🛒 Added to cart:", item);
  renderCart();
}

function renderCart() {
  const tbody = document.querySelector("#cart-table tbody");
  tbody.innerHTML = "";
  let total = 0;

  cart.forEach((item, idx) => {
    total += item.subTotal;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${item.productName}</td>
      <td class="border p-2">${item.batchNumber}</td>
      <td class="border p-2">${item.quantity}</td>
      <td class="border p-2">${item.sellingPrice}</td>
      <td class="border p-2">${item.subTotal}</td>
      <td class="border p-2"><button onclick="removeCartItem(${idx})" class="text-red-600">Remove</button></td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("total-cost").innerText = total.toFixed(2);
}

function removeCartItem(index) {
  cart.splice(index, 1);
  renderCart();
}

// ---------------------------------------------------------
// 🛒 Cart Management
// ---------------------------------------------------------
let cart = [];

function addItemToCart() {
  const productSelect = document.getElementById("product-select");
  const productId = parseInt(productSelect.value);
  const batchId = parseInt(document.getElementById("batch-no").value);
  const quantity = parseInt(document.getElementById("quantity").value);
  const sellingPrice = parseFloat(document.getElementById("selling-price").value);

  if (!productId || !batchId || !quantity || !sellingPrice) {
    alert("Please complete product, batch, quantity, and price.");
    return;
  }

  const productName = productSelect.options[productSelect.selectedIndex].text;
  const barcode = document.getElementById("product-barcode").value;

  const batchOpt = document.getElementById("batch-no").selectedOptions[0];
  const batchNumber = batchOpt ? batchOpt.textContent : "";

  const item = { productId, productName, barcode, batchId, batchNumber, quantity, sellingPrice, subTotal: quantity * sellingPrice };
  cart.push(item);
  console.log("🛒 Added to cart:", item);
  renderCart();
}

function renderCart() {
  const tbody = document.querySelector("#cart-table tbody");
  tbody.innerHTML = "";
  let total = 0;
  cart.forEach((item, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${item.productName}</td>
      <td class="border p-2">${item.barcode}</td>
      <td class="border p-2">${item.batchNumber}</td>
      <td class="border p-2">${item.quantity}</td>
      <td class="border p-2">${item.sellingPrice.toFixed(2)}</td>
      <td class="border p-2">${item.subTotal.toFixed(2)}</td>
      <td class="border p-2"><button onclick="removeCartItem(${idx})">Remove</button></td>
    `;
    tbody.appendChild(tr);
    total += item.subTotal;
  });
  document.getElementById("total-cost").textContent = total.toFixed(2);
}

function removeCartItem(idx) {
  cart.splice(idx, 1);
  console.log("🛒 Removed item at index:", idx);
  renderCart();
}

// ---------------------------------------------------------
// 💳 Checkout
// ---------------------------------------------------------
/* =========================================================
   Checkout Order → Save to customer_sales + customer_sales_items
   ========================================================= */
async function checkoutOrder() {
  if (cart.length === 0) {
    showError("Cart is empty");
    return;
  }

  const customerName = document.getElementById("customer-name").value;
  const saleDate = document.getElementById("sale-date").value;
  const total = cart.reduce((s, i) => s + i.subTotal, 0);

  console.log("💳 Checking out order...", new Date().toISOString());

  const supabase = await ensureSupabaseClient();
  try {
    // 1️⃣ Insert into customer_sales
    const { data: sale, error: saleErr } = await supabase
      .from("customer_sales")
      .insert([{ customer_name: customerName, sale_date: saleDate, total }])
      .select()
      .single();

    if (saleErr) throw saleErr;
    console.log("🆕 Order created:", sale);

    // 2️⃣ Insert items
    const itemsPayload = cart.map(i => ({
      order_id: sale.id,
      product_id: i.productId,
      batch_id: i.batchId,
      quantity: i.quantity,
      selling_price: i.sellingPrice
    }));

    const { error: itemsErr } = await supabase.from("customer_sales_items").insert(itemsPayload);
    if (itemsErr) throw itemsErr;

    console.log("✅ Items inserted:", itemsPayload);

    cart = [];
    renderCart();
    loadCustomerSales();
    showMessage("Order completed!");
  } catch (err) {
    console.error("❌ checkoutOrder failed:", err);
    showError("Checkout failed: " + err.message);
  }
}

// ---------------------------------------------------------
// 📊 Load Customer Sales
// ---------------------------------------------------------
async function loadCustomerSales() {
  console.log("📦 Loading customer sales...");
  const supabase = await ensureSupabaseClient();

  const { data, error } = await supabase
    .from("customer_sales")
    .select("id, customer_name, sale_date, total")
    .order("id", { ascending: false });

  if (error) return console.error("❌ loadCustomerSales failed:", error);
  console.log("✅ Customer sales loaded:", data);

  const tbody = document.getElementById("customer-sales-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  for (const order of data) {
    const { count } = await supabase
      .from("customer_sales_items")
      .select("id", { count: "exact", head: true })
      .eq("order_id", order.id);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${order.id}</td>
      <td class="border p-2">${count ?? 0}</td>
      <td class="border p-2">${order.total}</td>
      <td class="border p-2">${formatDate(order.sale_date)}</td>
      <td class="border p-2">${order.customer_name}</td>
      <td class="border p-2"><button onclick="printReceipt(${order.id})" class="text-blue-600">Print</button></td>
    `;
    tbody.appendChild(tr);
  }
}

// ---------------------------------------------------------
// 🧾 Receipt
// ---------------------------------------------------------
async function showReceipt(orderId) {
  const supabase = await ensureSupabaseClient();
  console.log("🧾 Loading receipt for order:", orderId);
  const { data: order, error } = await supabase.from("customer_sales").select("*").eq("id", orderId).single();
  if (error || !order) {
    console.error("❌ Failed to fetch order:", error);
    return;
  }
  const { data: items, error: itemsError } = await supabase.from("customer_sales_items")
    .select("*, products(name, barcode), product_batches(batch_number)")
    .eq("order_id", orderId);
  if (itemsError) {
    console.error("❌ Failed to fetch items:", itemsError);
    return;
  }
  console.log("🧾 Receipt items:", items);

  let html = `
    <h3>Receipt #${order.id}</h3>
    <p>Date: ${formatDate(order.sale_date)}</p>
    <p>Customer: ${order.customer_name}</p>
    <table class="w-full border-collapse border mt-2 text-sm">
      <thead><tr><th>Product</th><th>Barcode</th><th>Batch</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
      <tbody>
  `;
  items.forEach(i => {
    html += `<tr>
      <td>${i.products?.name || ""}</td>
      <td>${i.products?.barcode || ""}</td>
      <td>${i.product_batches?.batch_number || ""}</td>
      <td>${i.quantity}</td>
      <td>${parseFloat(i.selling_price).toFixed(2)}</td>
      <td>${parseFloat(i.sub_total).toFixed(2)}</td>
    </tr>`;
  });
  html += `</tbody></table>
    <p class="mt-2 font-bold">Total: ${order.total ? parseFloat(order.total).toFixed(2) : "0.00"}</p>
  `;
  document.getElementById("receipt-content").innerHTML = html;
  document.getElementById("receipt-modal").classList.remove("hidden");
}

function closeReceiptModal() {
  document.getElementById("receipt-modal").classList.add("hidden");
}

async function printReceipt(orderId) {
  const supabase = await ensureSupabaseClient();
  console.log("🧾 Printing receipt for order:", orderId);
  const { data: order, error } = await supabase.from("customer_sales").select("*").eq("id", orderId).single();
  if (error || !order) {
    console.error("❌ Failed to fetch order for print:", error);
    return;
  }
  const { data: items } = await supabase.from("customer_sales_items")
    .select("*, products(name, barcode), product_batches(batch_number)")
    .eq("order_id", orderId);
  let printWin = window.open("", "_blank");
  printWin.document.write(`<h1>Receipt #${order.id}</h1>`);
  printWin.document.write(`<p>Date: ${formatDate(order.sale_date)}</p>`);
  printWin.document.write(`<p>Customer: ${order.customer_name}</p>`);
  printWin.document.write("<table border='1'><tr><th>Product</th><th>Barcode</th><th>Batch</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>");
  items.forEach(i => {
    printWin.document.write(`<tr>
      <td>${i.products?.name || ""}</td>
      <td>${i.products?.barcode || ""}</td>
      <td>${i.product_batches?.batch_number || ""}</td>
      <td>${i.quantity}</td>
      <td>${parseFloat(i.selling_price).toFixed(2)}</td>
      <td>${parseFloat(i.sub_total).toFixed(2)}</td>
    </tr>`);
  });
  printWin.document.write("</table>");
  printWin.document.write(`<p><strong>Total:</strong> ${order.total ? parseFloat(order.total).toFixed(2) : "0.00"}</p>`);
  printWin.print();
}

/* =========================================================
   Analytics Functions
   ========================================================= */
async function loadAnalytics() {
  const client = await ensureSupabaseClient();

  console.log("📊 Loading analytics data...");

  try {
    // 1️⃣ Sales by day
    const { data: salesByDay, error: dayError } = await client
      .from("customer_sales")
      .select("sale_date, total");

    if (dayError) throw dayError;

    // Aggregate by day
    const dayMap = {};
    salesByDay.forEach(sale => {
      const day = new Date(sale.sale_date).toLocaleDateString("zh-TW");
      dayMap[day] = (dayMap[day] || 0) + Number(sale.total || 0);
    });

    const dailyResults = Object.entries(dayMap).map(([day, total]) => ({ day, total }));

    console.log("📊 Sales by day:", dailyResults);

    // Render sales by day
    const tbodyDay = document.getElementById("sales-by-day-body");
    if (tbodyDay) {
      tbodyDay.innerHTML = dailyResults
        .map(row => `<tr><td class="border p-2">${row.day}</td><td class="border p-2">${row.total.toFixed(2)}</td></tr>`)
        .join("");
    }

    // 2️⃣ Sales by product
    const { data: items, error: itemsError } = await client
      .from("customer_sales_items")
      .select("sub_total, product_id, products(name)");

    if (itemsError) throw itemsError;

    const productMap = {};
    items.forEach(item => {
      const name = item.products?.name || "Unknown";
      productMap[name] = (productMap[name] || 0) + Number(item.sub_total || 0);
    });

    const productResults = Object.entries(productMap).map(([name, total]) => ({ name, total }));

    console.log("📊 Sales by product:", productResults);

    // Render sales by product
    const tbodyProduct = document.getElementById("sales-by-product-body");
    if (tbodyProduct) {
      tbodyProduct.innerHTML = productResults
        .map(row => `<tr><td class="border p-2">${row.name}</td><td class="border p-2">${row.total.toFixed(2)}</td></tr>`)
        .join("");
    }
  } catch (err) {
    console.error("❌ Failed to load analytics:", err);
    const errorDiv = document.getElementById("analytics-error");
    if (errorDiv) errorDiv.textContent = "Failed to load analytics. See console.";
  }
}
