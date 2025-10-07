/* =========================================================
   common.js — Cleaned & patched (all-in-one)
   - Works with normalized schema:
     customer_sales (id, customer_name, sale_date, total)
     customer_sales_items (id, order_id, product_id, batch_id, quantity, selling_price, sub_total)
   - Auto-select single batch
   - Barcode Enter handling
   - Checkout writes sale + items
   - Receipt modal + print (58mm)
   - Defensive stubs for other pages
   ========================================================= */

console.log("⚡ common.js loaded");

// ---------- Supabase client ----------
let _supabase;
async function ensureSupabaseClient() {
  if (_supabase) return _supabase;
  console.log("🔑 Initializing Supabase Client...");
  // <-- REPLACE the anon key below with your Supabase anon/public key
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
// ---------- Utilities ----------
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }) +
         " " + d.toLocaleTimeString("zh-TW", { hour12: false });
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


// ---------- Products dropdown (only products that have remaining stock) ----------
async function populateProductDropdown() {
  try {
    const supabase = await ensureSupabaseClient();
    // find product_ids that have remaining_quantity > 0
    const { data: batches, error: batchErr } = await supabase
      .from("product_batches")
      .select("product_id")
      .gt("remaining_quantity", 0);

    if (batchErr) {
      console.error("Failed to fetch batches:", batchErr);
      return;
    }

    const prodIds = Array.from(new Set((batches || []).map(b => b.product_id))).filter(Boolean);
    let products = [];
    if (prodIds.length > 0) {
      const { data: prods, error: prodErr } = await supabase
        .from("products")
        .select("id, name, barcode, price")
        .in("id", prodIds);
      if (prodErr) {
        console.error("Failed to fetch products:", prodErr);
      } else {
        products = prods || [];
      }
    }

    const sel = document.getElementById("product-select");
    if (!sel) return;
    sel.innerHTML = `<option value="">-- Select --</option>`;
    products.forEach(p => {
      const txt = `${p.name} (${p.barcode || ""})`;
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.text = txt;
      opt.setAttribute("data-barcode", p.barcode || "");
      opt.setAttribute("data-price", p.price || 0);
      sel.appendChild(opt);
    });
    console.log("📦 Products for dropdown:", products);
  } catch (err) {
    console.error("populateProductDropdown failed:", err);
  }
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

// ---------- Product selection handler ----------
async function handleProductSelection(e) {
  const productId = e.target.value;
  if (!productId) {
    // clear batch list
    const batchSelect = document.getElementById("batch-no");
    if (batchSelect) batchSelect.innerHTML = "";
    return;
  }
  console.log("📌 handleProductSelection triggered for ID:", productId);
  await loadProductAndBatches(productId, false);
}

// ---------- Load product and batches ----------
async function loadProductAndBatches(productIdOrBarcode, byBarcode = false) {
  try {
    const supabase = await ensureSupabaseClient();
    // find product either by id or barcode
    let productQuery = supabase.from("products").select("id,name,barcode,price");
    if (byBarcode) productQuery = productQuery.eq("barcode", productIdOrBarcode);
    else productQuery = productQuery.eq("id", productIdOrBarcode);

    const { data: productData, error: productErr } = await productQuery.limit(1).maybeSingle();
    if (productErr) {
      console.error("Failed to load product:", productErr);
      return null;
    }
    if (!productData) {
      console.log("No product found for", productIdOrBarcode);
      return null;
    }
    const product = productData;
    console.log("✅ Product loaded:", product);

    const { data: batches, error: batchErr } = await supabase
      .from("product_batches")
      .select("id,batch_number,remaining_quantity")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false });

    if (batchErr) {
      console.error("Failed to load batches:", batchErr);
      return { product, batches: [] };
    }

    // populate batch select (if present)
    const batchSelect = document.getElementById("batch-no");
    if (batchSelect) {
      // show all batches but indicate stock; filter option not to show zero stock if you prefer
      batchSelect.innerHTML = batches.map(b => {
        const stockText = typeof b.remaining_quantity === "number" ? ` (Stock: ${b.remaining_quantity})` : "";
        return `<option value="${b.id}">${b.batch_number}${stockText}</option>`;
      }).join("");
    }

    // auto-select if only one batch available
    if (Array.isArray(batches) && batches.length === 1 && batchSelect) {
      batchSelect.value = String(batches[0].id);
      console.log("✅ Auto-selected batch:", batches[0]);
    }

    // also set suggested selling price
    const priceInput = document.getElementById("selling-price");
    if (priceInput && product.price != null) priceInput.value = product.price;

    // show stock in stock-display (sum of remaining quantities for product)
    const stockDisplay = document.getElementById("stock-display");
    if (stockDisplay) {
      const totalRemain = (batches || []).reduce((s, b) => s + (Number(b.remaining_quantity) || 0), 0);
      stockDisplay.textContent = `Stock: ${totalRemain}`;
    }

    return { product, batches };
  } catch (err) {
    console.error("loadProductAndBatches failed:", err);
    return null;
  }
}

// ---------- Barcode handling ----------
// Called on input (debug) and on Enter (final)
function handleBarcodeInputEvent(e) {
  const v = e.target.value.trim();
  console.log("🔍 Barcode entered:", v);
  // don't auto-search on each keystroke — only on Enter we'll treat as final.
}

async function handleBarcodeEnter(e) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const val = e.target.value.trim();
  if (!val) return;
  const supabase = await ensureSupabaseClient();
  try {
    const { data: product } = await supabase
      .from("products")
      .select("id,name,barcode,price")
      .eq("barcode", val)
      .limit(1)
      .maybeSingle();
    if (!product) {
      document.getElementById("stock-display").textContent = "Product not found";
      return;
    }
    // load batches and auto-fill selects
    const res = await loadProductAndBatches(product.id, false);
    // pick defaults and add to cart automatically
    const batchId = (res?.batches && res.batches.length) ? res.batches[0].id : null;
    const sellingPrice = product.price || 0;
    // prepare a quick add: set form fields so addItemToCart works
    const productSelect = document.getElementById("product-select");
    if (productSelect) productSelect.value = product.id;
    const batchSelect = document.getElementById("batch-no");
    if (batchSelect && batchId) batchSelect.value = batchId;
    const priceInput = document.getElementById("selling-price");
    if (priceInput) priceInput.value = sellingPrice;
    // add one item to cart
    addItemToCart();
    // clear barcode input
    e.target.value = "";
  } catch (err) {
    console.error("barcode lookup failed:", err);
    document.getElementById("stock-display").textContent = "Lookup error";
  }
}

// ---------- Global cart ----------
let cart = []; // each item: {productId, productName, barcode, batchId, batchNumber, quantity, sellingPrice, subTotal}

function renderCart() {
  const tbody = document.querySelector("#cart-table tbody");
  const totalEl = document.getElementById("total-cost");
  if (!tbody || !totalEl) {
    // not on POS page
    return;
  }
  tbody.innerHTML = "";
  let total = 0;
  cart.forEach((it, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${escapeHtml(it.productName)}</td>
      <td class="border p-2">${escapeHtml(it.barcode || "")}</td>
      <td class="border p-2">${escapeHtml(it.batchNumber || "")}</td>
      <td class="border p-2">${it.quantity}</td>
      <td class="border p-2">${Number(it.sellingPrice).toFixed(2)}</td>
      <td class="border p-2">${Number(it.subTotal).toFixed(2)}</td>
      <td class="border p-2">
        <button class="text-red-600" onclick="removeFromCart(${idx})">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
    total += Number(it.subTotal || 0);
  });
  totalEl.textContent = total.toFixed(2);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function escapeHtml(s) {
  if (!s && s !== 0) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}



// ---------- Add item to cart (from form) ----------
async function addItemToCart(e) {
  // If called from click event, cancel the event
  if (e && e.preventDefault) e.preventDefault();

  const productSelect = document.getElementById("product-select");
  const batchSelect = document.getElementById("batch-no");
  const qtyInput = document.getElementById("quantity");
  const priceInput = document.getElementById("selling-price");

  if (!productSelect) return alert("Product selector not found on page.");
  const productId = Number(productSelect.value);
  if (!productId) return alert("Please select a product.");

  const batchId = batchSelect ? Number(batchSelect.value) : null;
  const batchNumber = batchSelect ? batchSelect.options[batchSelect.selectedIndex]?.text : "";
  const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value || "1")) : 1;
  const sellingPrice = priceInput ? parseFloat(priceInput.value || "0") : 0;

  // productName and barcode from option attributes
  const productName = productSelect.options[productSelect.selectedIndex]?.text || "";
  const barcode = productSelect.options[productSelect.selectedIndex]?.getAttribute("data-barcode") || "";

  const item = {
    productId,
    productName,
    barcode,
    batchId,
    batchNumber,
    quantity: qty,
    sellingPrice,
    subTotal: Number((qty * sellingPrice).toFixed(2))
  };

  cart.push(item);
  console.log("🛒 Added to cart:", item);
  renderCart();

  // reset quantity to 1 for quick adds
  if (qtyInput) qtyInput.value = "1";
}


// ---------- Checkout: write sale + items and decrement stock ----------
async function checkoutOrder() {
  if (cart.length === 0) return alert("Cart is empty.");
  const supabase = await ensureSupabaseClient();
  const customerName = document.getElementById("customer-name")?.value || "";
  const saleDateRaw = document.getElementById("sale-date")?.value;
  const saleDate = saleDateRaw ? new Date(saleDateRaw).toISOString() : new Date().toISOString();
  const total = cart.reduce((s, i) => s + Number(i.subTotal), 0);

  try {
    console.log("💳 Checking out order...", new Date().toISOString());
    // 1) create sale
    const { data: sale, error: saleError } = await supabase
      .from("customer_sales")
      .insert([{ customer_name: customerName, sale_date: saleDate, total }])
      .select()
      .single();
    if (saleError) throw saleError;
    console.log("🆕 Order created:", sale);

    const orderId = sale.id;
    // 2) insert items
    const itemsToInsert = cart.map(i => ({
      order_id: orderId,
      product_id: i.productId,
      batch_id: i.batchId,
      quantity: i.quantity,
      selling_price: i.sellingPrice
    }));

    const { error: itemsError } = await supabase.from("customer_sales_items").insert(itemsToInsert);
    if (itemsError) {
      console.error("❌ Failed inserting items, rolling back order...", itemsError);
      await supabase.from("customer_sales").delete().eq("id", orderId);
      throw itemsError;
    }

    // 3) decrement stock for each batch
    for (const i of cart) {
      if (!i.batchId) continue;
      const { error: updErr } = await supabase.rpc("decrement_remaining_quantity", {
        p_batch_id: i.batchId,
        p_quantity: i.quantity
      });
      if (updErr) {
        console.error("❌ Failed to decrement stock for batch", i.batchId, updErr);
      } else {
        console.log(`✅ Decremented stock for batch ${i.batchId} by ${i.quantity}`);
      }
    }

    alert("Order saved!");
    cart = [];
    renderCart();
    loadCustomerSales();
  } catch (err) {
    console.error("❌ checkoutOrder failed:", err);
    alert("Checkout failed: " + (err.message || JSON.stringify(err)));
  }
}


// --------------------
// 📊 Loaders per page
// --------------------

// ---------- Load Customer Sales (fix mapping & columns) ----------
async function loadCustomerSales() {
  try {
    const supabase = await ensureSupabaseClient();
    console.log("📦 Loading customer sales...");
    const { data: sales, error } = await supabase
      .from("customer_sales")
      .select("id, customer_name, sale_date, total")
      .order("id", { ascending: false });

    if (error) throw error;
    const tbody = document.getElementById("customer-sales-body");
    if (!tbody) {
      console.warn("customer-sales-body not found on page.");
      return;
    }
    tbody.innerHTML = "";

    for (const sale of sales || []) {
      // fetch items for this sale
      const { data: items, error: itemsErr } = await supabase
        .from("customer_sales_items")
        .select("quantity, selling_price, sub_total")
        .eq("order_id", sale.id);

      if (itemsErr) {
        console.error("❌ Failed to load items for order", sale.id, itemsErr);
      }
      const itemCount = (items || []).reduce((s, it) => s + (it.quantity || 0), 0);
      const totalCost = sale.total != null ? sale.total : (items || []).reduce((s, it) => s + (Number(it.sub_total || (it.quantity * it.selling_price)) || 0), 0);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2 text-blue-600 cursor-pointer" onclick="showReceipt(${sale.id})">#${sale.id}</td>
        <td class="border p-2">${itemCount}</td>
        <td class="border p-2">${Number(totalCost || 0).toFixed(2)}</td>
        <td class="border p-2">${formatDate(sale.sale_date)}</td>
        <td class="border p-2">${escapeHtml(sale.customer_name || "")}</td>
        <td class="border p-2">
          <button onclick="showReceipt(${sale.id})" class="bg-gray-200 px-2 py-1 rounded">Receipt</button>
        </td>
      `;
      tbody.appendChild(tr);
    }
    console.log("✅ Customer sales loaded:", sales);
  } catch (err) {
    console.error("❌ loadCustomerSales failed:", err);
  }
}

/* =========================================================
   📦 Products / Vendors / Loans stubs
   ========================================================= */
// ---------- Simple safe stubs and loaders for other pages ----------

async function loadProducts() {
  try {
    const supabase = await ensureSupabaseClient();
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error(error);
    console.log("Products loaded:", data);
    // If page defines renderProducts, call it.
    if (typeof renderProducts === "function") renderProducts(data || []);
  } catch (err) {
    console.error("loadProducts error", err);
  }
}
function setupAddProductForm() { /* stub - implement per site */ }

async function loadVendors() {
  try {
    const supabase = await ensureSupabaseClient();
    const { data, error } = await supabase.from("vendors").select("*");
    if (error) console.error(error);
    console.log("Vendors loaded:", data);
    if (typeof renderVendors === "function") renderVendors(data || []);
  } catch (err) {
    console.error("loadVendors error", err);
  }
}
function handleAddVendor() { /* stub */ }
function populateVendorDropdown() {
  console.log("populateVendorDropdown stub");
}

// ---------------------------------------------------------
// 🧾 Receipt
// ---------------------------------------------------------
// --------------------
// 🧾 Show Receipt
// ---------- Receipt modal + print ----------
async function showReceipt(orderId) {
  try {
    console.log("🧾 Loading receipt for order:", orderId);
    const supabase = await ensureSupabaseClient();
    const { data: order, error: orderErr } = await supabase
      .from("customer_sales")
      .select("id, customer_name, sale_date, total")
      .eq("id", orderId)
      .single();
    if (orderErr) throw orderErr;

    const { data: items, error: itemsErr } = await supabase
      .from("customer_sales_items")
      .select("quantity, selling_price, sub_total, product_id, batch_id, products(name, barcode), product_batches(batch_number)")
      .eq("order_id", orderId);
    if (itemsErr) throw itemsErr;

    const modal = document.getElementById("receipt-modal");
    const contentEl = document.getElementById("receipt-content");
    if (!modal || !contentEl) {
      alert("Receipt modal markup missing from page.");
      return;
    }

    let html = `
      <h2 class="text-lg font-bold mb-2">Receipt</h2>
      <p><strong>Order #:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${escapeHtml(order.customer_name || "(無)")}</p>
      <p><strong>Date:</strong> ${formatDate(order.sale_date)}</p>
      <p><strong>Total:</strong> ${Number(order.total || 0).toFixed(2)}</p>
      <div class="line my-2" style="border-top:1px dashed #ddd;margin:8px 0;"></div>
      <table class="w-full text-sm">
        <thead><tr><th class="text-left">Product</th><th>Qty</th><th>Price</th><th>Sub</th></tr></thead>
        <tbody>
    `;

    (items || []).forEach(it => {
      const name = it.products?.name || `#${it.product_id}`;
      const qty = it.quantity || 0;
      const price = Number(it.selling_price || 0).toFixed(2);
      const sub = Number(it.sub_total || (qty * (it.selling_price || 0))).toFixed(2);
      html += `<tr><td>${escapeHtml(name)}</td><td>${qty}</td><td>${price}</td><td>${sub}</td></tr>`;
    });

    html += `</tbody></table><div class="mt-4 text-right"><button id="print-receipt" class="bg-blue-600 text-white px-3 py-1 rounded">🖨 Print</button> <button id="close-receipt" class="ml-2 px-3 py-1 border rounded">Close</button></div>`;

    contentEl.innerHTML = html;
    modal.classList.remove("hidden");

    document.getElementById("close-receipt").addEventListener("click", closeReceiptModal);
    document.getElementById("print-receipt").addEventListener("click", () => printReceipt(order, items || []));
  } catch (err) {
    console.error("❌ Failed to load receipt:", err);
    alert("Failed to load receipt");
  }
}
function closeReceiptModal() {
  const modal = document.getElementById("receipt-modal");
  if (modal) modal.classList.add("hidden");
}

// 58mm printing
function printReceipt(order, items) {
  const printWindow = window.open("", "PRINT", "height=600,width=400");
  let content = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:monospace;width:58mm;padding:4px}
    .center{text-align:center}.bold{font-weight:bold}
    .line{border-top:1px dashed #000;margin:6px 0}
    .item-line{display:flex;justify-content:space-between}
    .left{flex:1}.mid{width:40px;text-align:center}.right{width:60px;text-align:right}
  </style></head><body>`;
  content += `<div class="center bold">POS Receipt</div>`;
  content += `<div>日期: ${order.sale_date ? String(order.sale_date).split("T")[0] : ""}</div>`;
  content += `<div>客戶: ${escapeHtml(order.customer_name || "(無)")}</div>`;
  content += `<div class="line"></div>`;
  content += `<div class="item-line bold"><div class="left">商品</div><div class="mid">數量</div><div class="right">小計</div></div>`;
  content += `<div class="line"></div>`;
  let total = 0;
  (items || []).forEach(it => {
    const name = it.products?.name || `#${it.product_id}`;
    const qty = it.quantity || 0;
    const price = Number(it.selling_price || 0);
    const subtotal = Number(it.sub_total || qty * price);
    total += subtotal;
    content += `<div class="item-line"><div class="left">${escapeHtml(name)}</div><div class="mid">${qty}</div><div class="right">${subtotal.toFixed(2)}</div></div>`;
  });
  content += `<div class="line"></div>`;
  content += `<div class="item-line bold"><div class="left">合計</div><div class="mid"></div><div class="right">${total.toFixed(2)}</div></div>`;
  content += `<div class="line"></div><div class="center">感謝您的惠顧</div>`;
  content += `</body></html>`;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
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
  try {
    const supabase = await ensureSupabaseClient();
    const { data, error } = await supabase.from("vendor_loans").select("*");
    if (error) console.error(error);
    console.log("Loan records loaded:", data);
    if (typeof renderLoanRecords === "function") renderLoanRecords(data || []);
  } catch (err) {
    console.error("loadLoanRecords error", err);
  }
}
function addLoanRecord(e) { e?.preventDefault?.(); alert("addLoanRecord stub"); }


// ---------- Analytics helper: returns raw rows for page script ----------
async function fetchAnalyticsRaw() {
  const supabase = await ensureSupabaseClient();
  // sales by day (sale_date, total)
  const { data: sales, error: salesErr } = await supabase
    .from("customer_sales")
    .select("sale_date, total");
  if (salesErr) console.error("fetchAnalyticsRaw salesErr:", salesErr);

  // sales items with product info
  const { data: items, error: itemsErr } = await supabase
    .from("customer_sales_items")
    .select("quantity, selling_price, product_id, products(name)")
  if (itemsErr) console.error("fetchAnalyticsRaw itemsErr:", itemsErr);

  return { sales: sales || [], items: items || [] };
}

// ---------- DOM ready wiring for pages that include this file ----------
document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ DOM ready:", new Date().toISOString());
  // Ensure supabase client created early (non-blocking)
  ensureSupabaseClient().catch(() => { /* ignore init errors here */ });

  // Wire common page controls where present
  if (document.getElementById("product-select")) {
    populateProductDropdown();
    document.getElementById("product-select").addEventListener("change", handleProductSelection);
  }
  if (document.getElementById("product-barcode")) {
    const bc = document.getElementById("product-barcode");
    bc.addEventListener("input", handleBarcodeInputEvent);
    bc.addEventListener("keydown", handleBarcodeEnter);
  }
  if (document.getElementById("add-item")) {
    document.getElementById("add-item").addEventListener("click", addItemToCart);
  }
  if (document.getElementById("checkout")) {
    document.getElementById("checkout").addEventListener("click", checkoutOrder);
  }
  if (document.getElementById("reset-form")) {
    document.getElementById("reset-form").addEventListener("click", () => {
      document.getElementById("product-select").value = "";
      if (document.getElementById("product-barcode")) document.getElementById("product-barcode").value = "";
      if (document.getElementById("batch-no")) document.getElementById("batch-no").innerHTML = "";
      if (document.getElementById("quantity")) document.getElementById("quantity").value = "1";
      if (document.getElementById("selling-price")) document.getElementById("selling-price").value = "";
      if (document.getElementById("stock-display")) document.getElementById("stock-display").textContent = "";
    });
  }

  // Initialize page-specific loaders (if functions exist on the page)
  if (typeof loadCustomerSales === "function") loadCustomerSales();
  if (typeof loadProducts === "function") loadProducts();
  if (typeof loadVendors === "function") loadVendors();
  if (typeof loadLoanRecords === "function") loadLoanRecords();
});
