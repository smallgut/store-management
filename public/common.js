// ================================
// ✅ common.js – All-in-One Patched Version
// ================================

console.log("⚡ common.js loaded");

// 🔑 Initialize Supabase
let _supabase;
async function ensureSupabaseClient() {
  if (_supabase) return _supabase;
  console.log("🔑 Initializing Supabase Client...");
  _supabase = window.supabase.createClient(
    "https://aouduygmcspiqauhrabx.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdWR1eWdtY3NwaXFhdWhyYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTM5MzAsImV4cCI6MjA2MDgyOTkzMH0.s8WMvYdE9csSb1xb6jv84aiFBBU_LpDi1aserTQDg-k"
  );
  return _supabase;
}

/* =========================================================
   🌐 Language (stub only, to prevent errors)
   ========================================================= */
function applyTranslations() {
  console.log("🌐 Translations applied on DOM ready");
}
function toggleLanguage() {
  console.log("🌐 toggleLanguage clicked");
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


/* =========================================================
   🛒 Cart (global state)
   ========================================================= */
let cart = [];

function renderCart() {
  const tbody = document.querySelector("#cart-table tbody");
  const totalEl = document.getElementById("total-cost");
  if (!tbody || !totalEl) return;

  tbody.innerHTML = "";
  let total = 0;
  cart.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${item.productName}</td>
      <td class="border p-2">${item.barcode || ""}</td>
      <td class="border p-2">${item.batchNumber}</td>
      <td class="border p-2">${item.quantity}</td>
      <td class="border p-2">${item.sellingPrice.toFixed(2)}</td>
      <td class="border p-2">${item.subTotal.toFixed(2)}</td>
      <td class="border p-2">
        <button onclick="removeFromCart(${i})" class="text-red-600">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
    total += item.subTotal;
  });
  totalEl.textContent = total.toFixed(2);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

async function addItemToCart() {
  const productSel = document.getElementById("product-select");
  const batchSel = document.getElementById("batch-no");
  const qtyEl = document.getElementById("quantity");
  const priceEl = document.getElementById("selling-price");

  const productId = parseInt(productSel.value);
  if (!productId) return alert("Please select a product.");

  const batchId = parseInt(batchSel.value);
  const batchNumber = batchSel.options[batchSel.selectedIndex]?.text || "";
  const qty = parseInt(qtyEl.value) || 1;
  const sellingPrice = parseFloat(priceEl.value) || 0;

  const productName = productSel.options[productSel.selectedIndex]?.text || "";
  const barcode = productSel.options[productSel.selectedIndex]?.getAttribute("data-barcode") || "";

  const item = {
    productId,
    productName,
    barcode,
    batchId,
    batchNumber,
    quantity: qty,
    sellingPrice,
    subTotal: qty * sellingPrice
  };

  cart.push(item);
  console.log("🛒 Added to cart:", item);
  renderCart();
}

// ---------------------------------------------------------
// 💳 Checkout
// ---------------------------------------------------------
async function checkoutOrder() {
  if (cart.length === 0) return alert("Cart empty.");

  const supabase = await ensureSupabaseClient();
  const customerName = document.getElementById("customer-name").value || "Anonymous";
  const saleDate = document.getElementById("sale-date").value || new Date().toISOString();
  const total = cart.reduce((sum, x) => sum + x.subTotal, 0);

  try {
    console.log("💳 Checking out order...", new Date().toISOString());

    // 1️⃣ Insert into customer_sales
    const { data: sale, error: saleErr } = await supabase
      .from("customer_sales")
      .insert([{ customer_name: customerName, sale_date: saleDate, total }])
      .select()
      .single();
    if (saleErr) throw saleErr;
    console.log("🆕 Order created:", sale);

    // 2️⃣ Insert items
    const items = cart.map(i => ({
      order_id: sale.id,
      product_id: i.productId,
      batch_id: i.batchId,
      quantity: i.quantity,
      selling_price: i.sellingPrice
    }));
    const { error: itemsErr } = await supabase.from("customer_sales_items").insert(items);
    if (itemsErr) throw itemsErr;

    alert("Order saved successfully ✅");
    cart = [];
    renderCart();
    loadCustomerSales();
  } catch (err) {
    console.error("❌ checkoutOrder failed:", err);
    alert("Checkout failed: " + err.message);
  }
}
// --------------------
// 📊 Loaders per page
// --------------------

// Customer Sales
async function loadCustomerSales() {
  const supabase = await ensureSupabaseClient();
  console.log("📦 Loading customer sales...");
  const { data, error } = await supabase
    .from("customer_sales")
    .select("id, customer_name, sale_date, total")
    .order("id", { ascending: false });

  if (error) {
    console.error("❌ loadCustomerSales failed:", error);
    return;
  }
  console.log("✅ Customer sales loaded:", data);
  const tbody = document.querySelector("#customer-sales-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  data.forEach(sale => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="border p-2"><a href="#" onclick="showReceipt(${sale.id})">#${sale.id}</a></td>
      <td class="border p-2">${sale.customer_name}</td>
      <td class="border p-2">${new Date(sale.sale_date).toLocaleDateString()}</td>
      <td class="border p-2">${sale.total?.toFixed(2) ?? "0.00"}</td>
    `;
    tbody.appendChild(row);
  });
}


/* =========================================================
   📦 Products / Vendors / Loans stubs
   ========================================================= */
async function loadProducts() {
  const supabase = await ensureSupabaseClient();
  console.log("📦 Loading products...");
  const { data, error } = await supabase.from("products").select("*");
  if (error) console.error(error);
  console.log("✅ Products loaded:", data);
}
function setupAddProductForm() {
  console.log("setupAddProductForm stub");
}

async function loadVendors() {
  const supabase = await ensureSupabaseClient();
  console.log("📦 Loading vendors...");
  const { data, error } = await supabase.from("vendors").select("*");
  if (error) console.error(error);
  console.log("✅ Vendors loaded:", data);
}
function handleAddVendor() {
  console.log("handleAddVendor stub");
}

// ---------------------------------------------------------
// 🧾 Receipt
// ---------------------------------------------------------
// --------------------
// 🧾 Show Receipt
// --------------------
async function showReceipt(orderId) {
  console.log("🧾 Loading receipt for order:", orderId);
  const supabase = await ensureSupabaseClient();

  const { data: order, error: orderErr } = await supabase
    .from("customer_sales")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderErr) {
    console.error("❌ Failed to fetch order:", orderErr);
    return;
  }

  const { data: items, error: itemsErr } = await supabase
    .from("customer_sales_items")
    .select("*, products(name)")
    .eq("order_id", orderId);

  if (itemsErr) {
    console.error("❌ Failed to fetch items:", itemsErr);
    return;
  }

  console.log("🧾 Receipt:", { order, items });
  alert(`Receipt for Order #${order.id}\nCustomer: ${order.customer_name}\nItems: ${items.length}`);
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
/* =========================================================
   📊 Analytics helpers
   ========================================================= */
async function loadAnalytics() {
  const supabase = await ensureSupabaseClient();
  console.log("📊 Loading analytics...");

  // Sales by day
  const { data: byDay } = await supabase
    .from("customer_sales")
    .select("sale_date,total");
  // Sales by product
  const { data: byProduct } = await supabase
    .from("customer_sales_items")
    .select("quantity,selling_price, product_id, products(name)")
    .eq("products.id", "product_id");

  return { byDay, byProduct };
}


// Vendors
async function loadVendors() {
  const supabase = await ensureSupabaseClient();
  console.log("📦 Loading vendors...");
  const { data, error } = await supabase.from("vendors").select("*");
  if (error) {
    console.error("❌ loadVendors failed:", error);
    return;
  }
  console.log("✅ Vendors loaded:", data);
}


async function loadLoanRecords() {
  const supabase = await ensureSupabaseClient();
  console.log("📦 Loading loan records...");
  const { data, error } = await supabase.from("vendor_loans").select("*");
  if (error) console.error(error);
  console.log("✅ Loan records loaded:", data);
}
function populateVendorDropdown() {
  console.log("populateVendorDropdown stub");
}


// --------------------
// DOM Ready Hook
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM ready:", new Date().toISOString());
  applyTranslations();
});
