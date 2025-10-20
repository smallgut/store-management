// common.js (patched, debug-friendly)
// - Works with normalized schema:
//   customer_sales(id BIGINT, customer_name, sale_date timestamptz, total numeric, ...)
//   customer_sales_items(id BIGSERIAL, order_id BIGINT, product_id INT, batch_id INT, quantity INT, selling_price numeric, sub_total numeric GENERATED)
// - Provides product/vendor management helpers, POS cart, checkout, receipt modal + 58mm print
// - Includes analytics helper functions
// NOTE: set SUPABASE_URL and SUPABASE_ANON_KEY to your project values
/*******************************************************
 *  common.js — unified utilities for Supabase POS
 *******************************************************/
/*******************************************************
 * common.js — updated for Supabase POS (stable)
 *******************************************************/
console.log("⚡ common.js loaded");

// --- Supabase init ---
let supabaseClient = null;
function ensureSupabaseClient() {
  if (!supabaseClient) {
    console.log("🔑 Initializing Supabase Client...");
    if (typeof supabase === "undefined") throw new Error("Supabase SDK missing");
    supabaseClient = supabase.createClient(
      "https://aouduygmcspiqauhrabx.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdWR1eWdtY3NwaXFhdWhyYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTM5MzAsImV4cCI6MjA2MDgyOTkzMH0.s8WMvYdE9csSb1xb6jv84aiFBBU_LpDi1aserTQDg-k"
    );
  }
  return supabaseClient;
}



// -----------------------------
// Lightweight i18n toggle (ZH/TW)
// -----------------------------
let CURRENT_LANG = localStorage.getItem("lang") || "en";
function toggleLanguage() {
  CURRENT_LANG = CURRENT_LANG === "en" ? "zh" : "en";
  localStorage.setItem("lang", CURRENT_LANG);
  applyTranslations();
}
function applyTranslations() {
  // simple translator stub — you can extend this map
  const map = {
    "nav-home": { en: "Home", zh: "首頁" },
    "nav-login": { en: "Login", zh: "登入" },
    "nav-analytics": { en: "Analytics", zh: "分析" },
    "nav-manage-products": { en: "Manage Products", zh: "管理產品" },
    "nav-manage-vendors": { en: "Manage Vendors", zh: "管理供應商" },
    "nav-record-customer-sales": { en: "Record Customer Sales", zh: "記錄銷售" },
    "toggle-language": { en: "Toggle Language", zh: "切換語言" },
    "checkout": { en: "Checkout", zh: "結帳" },
    "add-item": { en: "Add Item", zh: "加入" }
  };
  document.querySelectorAll("[data-lang-key]").forEach(el => {
    const key = el.getAttribute("data-lang-key");
    if (!key) return;
    const txt = (map[key] && map[key][CURRENT_LANG]) || el.textContent;
    el.textContent = txt;
  });
  document.documentElement.lang = CURRENT_LANG === "zh" ? "zh-TW" : "en";
}


// ---------------------------------------------------------
// 📅 Date Formatter
// ---------------------------------------------------------
// ----------------------
// Helpers
// ----------------------
// -----------------------------
// Utilities
// -----------------------------
function debugLog(...args) {
  // toggle with a flag if needed
  console.log(...args);
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" })
       + " " + d.toLocaleTimeString("zh-TW", { hour12: false });
}

function shortDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-TW");
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


// Populate product dropdown (only show products having batches with remaining_quantity > 0)
async function populateProductDropdown() {
  const supabase = await ensureSupabaseClient();
  try {
    // Get all products
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, barcode, units, price")
      .order("name", { ascending: true });

    if (error) throw error;

    const out = [];
    for (const p of products || []) {
      // only include if there is at least one batch with stock > 0
      const { data: batches, error: batchErr } = await supabase
        .from("product_batches")
        .select("id, remaining_quantity")
        .eq("product_id", p.id)
        .gt("remaining_quantity", 0)  // only batches with stock > 0
        .limit(1);

      if (batchErr) throw batchErr;

      if (batches && batches.length > 0) {
        out.push(p);
      }
    }

    const sel = document.getElementById("product-select");
    if (!sel) return;
    sel.innerHTML = `<option value="">-- Select a Product --</option>` +
      out.map(p => `<option value="${p.id}">${p.name} ${p.barcode ? "(" + p.barcode + ")" : ""}</option>`).join("");

    debugLog("📦 Products for dropdown (filtered by stock > 0):", out);
  } catch (err) {
    console.error("populateProductDropdown error:", err);
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

// -----------------------------
// Products & batches helpers
// -----------------------------
/*
  loadProductAndBatches(productIdOrBarcode, byBarcode=false)
  returns { product, batches } or null on error
  Batches include remaining_quantity
*/
async function loadProductAndBatches(productIdOrBarcode, byBarcode = false) {
  const supabase = await ensureSupabaseClient();
  try {
    let productQuery = supabase.from("products").select("id, name, barcode, price, units, vendor_id").limit(1);
    if (byBarcode) productQuery = productQuery.eq("barcode", productIdOrBarcode);
    else productQuery = productQuery.eq("id", productIdOrBarcode);

    const { data: productArr, error: prodErr } = await productQuery;
    if (prodErr) throw prodErr;
    if (!productArr || productArr.length === 0) return null;
    const product = productArr[0];

    // batches that belong to product and have remaining quantity (we might include zero to allow seeing no stock)
    const { data: batches, error: batchErr } = await supabase
      .from("product_batches")
      .select("id, batch_number, remaining_quantity")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false });

    if (batchErr) throw batchErr;

    return { product, batches: batches || [] };
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

// populate vendor dropdown (for vendor-loan form)
async function populateVendorDropdown() {
  const supabase = await ensureSupabaseClient();
  try {
    const { data: vendors } = await supabase.from("vendors").select("id, name").order("name");
    const sel = document.getElementById("vendor-name");
    if (!sel) return;
    sel.innerHTML = `<option value="">-- Select a Vendor --</option>` + (vendors || []).map(v => `<option value="${v.id}">${v.name}</option>`).join("");
  } catch (err) {
    console.error("populateVendorDropdown stub", err);
  }
}


// -----------------------------
// Cart (single declaration to avoid duplicates)
// -----------------------------
let cart = []; // each item: {productId, productName, barcode, batchId, batchNumber, quantity, sellingPrice, units}

// Render cart table in the UI (assumes #cart-table tbody exists)
function renderCart() {
  const tbody = document.querySelector("#cart-table tbody");
  if (!tbody) {
    debugLog("cart tbody not found; skipping renderCart");
    return;
  }
  tbody.innerHTML = "";
  let total = 0;
  for (let idx = 0; idx < cart.length; idx++) {
    const it = cart[idx];
    const qty = parseInt(it.quantity || 0, 10);
    const price = Number(it.sellingPrice || 0);
    const subtotal = qty * price;
    total += subtotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${it.productName}</td>
      <td class="border p-2">${it.barcode || ""}</td>
      <td class="border p-2">${it.batchNumber}</td>
      <td class="border p-2"><input data-idx="${idx}" class="cart-qty border p-1 w-20" value="${qty}" /></td>
      <td class="border p-2"><input data-idx="${idx}" class="cart-price border p-1 w-28" value="${price.toFixed(2)}" /></td>
      <td class="border p-2">${subtotal.toFixed(2)}</td>
      <td class="border p-2"><button data-idx="${idx}" class="remove-cart-item bg-red-400 px-2 py-1 rounded">Remove</button></td>
    `;
    tbody.appendChild(tr);
  }

  const totalEl = document.getElementById("total-cost");
  if (totalEl) totalEl.textContent = total.toFixed(2);

  // attach events
  tbody.querySelectorAll(".remove-cart-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = Number(btn.getAttribute("data-idx"));
      cart.splice(idx, 1);
      renderCart();
    });
  });

  tbody.querySelectorAll(".cart-qty").forEach(inp => {
    inp.addEventListener("change", (e) => {
      const idx = Number(inp.getAttribute("data-idx"));
      cart[idx].quantity = Number(inp.value || 0);
      renderCart();
    });
  });

  tbody.querySelectorAll(".cart-price").forEach(inp => {
    inp.addEventListener("change", (e) => {
      const idx = Number(inp.getAttribute("data-idx"));
      cart[idx].sellingPrice = Number(inp.value || 0);
      renderCart();
    });
  });
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



// Adds item to cart using current form fields. Validates user-entered qty/price.
/* ---------------------- 🛒 CART ADD ITEM FIX ---------------------- */
/* Remove/replace any existing addItemToCartImpl/addItemToCart_internal/etc. */

/* ---------------------- 🛒 CART ADD ITEM (FIXED BATCH DISPLAY) ---------------------- */
async function addItemToCart(barcode, batchNo, quantity, price, productName) {
  try {
    console.log("🟢 addItemToCart() called", { barcode, batchNo, quantity, price, productName });

    // --- Validation ---
    if (!barcode || typeof barcode !== "string" || barcode.trim() === "") {
      alert("❌ Please enter a valid product barcode.");
      return;
    }
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      alert("❌ Please enter a valid quantity.");
      return;
    }
    if (!price || isNaN(price) || price <= 0) {
      alert("❌ Please enter a valid selling price.");
      return;
    }

    const supabase = await ensureSupabaseClient();

    // ✅ Fetch readable batch number
    let batchLabel = batchNo;
    if (batchNo && /^\d+$/.test(batchNo)) {
      const { data: b } = await supabase
        .from("product_batches")
        .select("batch_number")
        .eq("id", batchNo)
        .maybeSingle();
      if (b?.batch_number) batchLabel = b.batch_number;
    }

    const tbody = document.querySelector("#cart-table tbody");
    if (!tbody) {
      console.warn("⚠️ cart tbody not found; skipping addItemToCart");
      return;
    }

    // --- Merge duplicates ---
    const existingRow = Array.from(tbody.querySelectorAll("tr")).find(row => {
      const cellBarcode = row.querySelector("td:nth-child(2)")?.textContent?.trim();
      const cellBatch = row.querySelector("td:nth-child(3)")?.textContent?.trim();
      return cellBarcode === barcode && cellBatch === batchLabel;
    });

    if (existingRow) {
      const qtyCell = existingRow.querySelector("td:nth-child(4)");
      const subtotalCell = existingRow.querySelector("td:nth-child(6)");
      const oldQty = parseFloat(qtyCell.textContent) || 0;
      const newQty = oldQty + Number(quantity);
      qtyCell.textContent = newQty;
      subtotalCell.textContent = (newQty * Number(price)).toFixed(2);
    } else {
      const subtotal = (Number(quantity) * Number(price)).toFixed(2);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="border p-2">${productName || ""}</td>
        <td class="border p-2">${barcode}</td>
        <td class="border p-2">${batchLabel || ""}</td>
        <td class="border p-2">${quantity}</td>
        <td class="border p-2">${Number(price).toFixed(2)}</td>
        <td class="border p-2">${subtotal}</td>
        <td class="border p-2 text-center">
          <button class="bg-red-500 text-white px-2 py-1 rounded remove-item">🗑️</button>
        </td>
      `;
      tbody.appendChild(row);
    }

    updateCartTotal();

    // remove buttons
    tbody.querySelectorAll(".remove-item").forEach(btn => {
      btn.onclick = (e) => {
        e.target.closest("tr")?.remove();
        updateCartTotal();
      };
    });

  } catch (err) {
    console.error("❌ addItemToCart() failed:", err);
  }
}

/* 🔹 Helper: update total */
function updateCartTotal() {
  const tbody = document.querySelector("#cart-table tbody");
  if (!tbody) return;
  let total = 0;
  tbody.querySelectorAll("tr").forEach(row => {
    total += parseFloat(row.querySelector("td:nth-child(6)")?.textContent || "0");
  });
  const totalEl = document.getElementById("total-cost");
  if (totalEl) totalEl.textContent = total.toFixed(2);
}
/* ---------------------- 🛒 END CART FIX ---------------------- */


// -----------------------------
// Checkout: create order + items in two-step, roll back if items insert fails
// and decrement stock using RPC
// -----------------------------
/* ---------------------- 💳 CHECKOUT PROCESS FIX (v4 - omit generated sub_total) ---------------------- */
async function checkoutOrder(e) {
  if (e) e.preventDefault();

  try {
    const tbody = document.querySelector("#cart-table tbody");
    if (!tbody) {
      alert("❌ Cart table not found.");
      return;
    }

    const rows = Array.from(tbody.querySelectorAll("tr"));
    if (rows.length === 0) {
      alert("🛒 Your cart is empty.");
      return;
    }

    const customerName = document.getElementById("customer-name")?.value?.trim() || "Walk-in";
    const saleDate = document.getElementById("sale-date")?.value || new Date().toISOString();
    const total = parseFloat(document.getElementById("total-cost")?.textContent || "0");

    const supabase = await ensureSupabaseClient();

    // ✅ 1️⃣ Create main order in customer_sales
    const order = { customer_name: customerName, sale_date: saleDate, total };
    console.log("🧾 Creating order:", order);

    const { data: orderData, error: orderErr } = await supabase
      .from("customer_sales")
      .insert([order])
      .select("id")
      .single();

    if (orderErr) {
      console.error("❌ Failed to create order:", orderErr);
      alert("Failed to create order. See console.");
      return;
    }

    const orderId = orderData.id;

    // ✅ 2️⃣ Prepare items for customer_sales_items insert
    const items = rows.map((row) => {
      const cells = row.querySelectorAll("td");
      const batchId = parseInt(cells[2]?.textContent || "0"); // use numeric id
      const qty = parseFloat(cells[3]?.textContent || "0");
      const price = parseFloat(cells[4]?.textContent || "0");

      return {
        order_id: orderId,
        product_id: null,  // optional mapping
        batch_id: batchId,
        quantity: qty,
        selling_price: price
        // ⚠️ sub_total is omitted because it's a generated column
      };
    });

    console.log("📦 Inserting order items:", items);

    const { error: itemsErr } = await supabase
      .from("customer_sales_items")
      .insert(items);

    if (itemsErr) {
      console.error("❌ Failed to insert order items:", itemsErr);
      alert("Order created but failed to save items.");
      return;
    }

    // ✅ 3️⃣ Decrement stock in product_batches
    for (const item of items) {
      const { batch_id, quantity } = item;
      if (!batch_id || !quantity) continue;

      console.log(`🔻 Decrementing stock for batch ${batch_id} by ${quantity}...`);

      const { data: batchData, error: batchErr } = await supabase
        .from("product_batches")
        .select("remaining_quantity")
        .eq("id", batch_id)
        .single();

      if (batchErr) {
        console.warn(`⚠️ Could not fetch batch ${batch_id}:`, batchErr);
        continue;
      }

      const newQty = Math.max(0, (batchData?.remaining_quantity || 0) - quantity);
      const { error: updateErr } = await supabase
        .from("product_batches")
        .update({ remaining_quantity: newQty })
        .eq("id", batch_id);

      if (updateErr) {
        console.warn(`⚠️ Failed to update batch ${batch_id}:`, updateErr);
      } else {
        console.log(`✅ Batch ${batch_id} remaining_quantity updated to ${newQty}`);
      }
    }

    // ✅ 4️⃣ Final cleanup
    tbody.innerHTML = "";
    updateCartTotal();
    alert("✅ Checkout complete!");
    console.log("🎉 Order & items saved successfully, stock updated.");
    
// 🔄 Refresh sales list
loadCustomerSales();
    
  } catch (err) {
    console.error("❌ checkoutOrder() failed:", err);
    alert("Checkout failed. See console for details.");
  }
}
/* ---------------------- 💳 END CHECKOUT FIX ---------------------- */
// --------------------
// 📊 Loaders per page
// --------------------

// -----------------------------
// Load customer sales (for table)
// -----------------------------
// -----------------------------
// Load customer sales (merged improved version)
// -----------------------------
async function loadCustomerSales() {
  const supabase = await ensureSupabaseClient();
  try {
    debugLog("📦 Loading customer sales...");
    const { data: sales, error } = await supabase
      .from("customer_sales")
      .select("id, customer_name, sale_date, total")
      .order("id", { ascending: false });

    if (error) throw error;
    debugLog("✅ Customer sales loaded:", sales);

    const tbody = document.getElementById("customer-sales-body");
    if (!tbody) {
      console.warn("customer-sales-body not found on page.");
      return;
    }

    if (!sales || sales.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-gray-500">No sales found</td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    for (const sale of sales || []) {
      // Count items per sale
      const { data: items, error: itemsErr } = await supabase
        .from("customer_sales_items")
        .select("quantity")
        .eq("order_id", sale.id);

      let itemCount = 0;
      if (!itemsErr && items) itemCount = items.reduce((s, it) => s + (it.quantity || 0), 0);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2 text-blue-600 cursor-pointer" onclick="showReceipt(${sale.id})">#${sale.id}</td>
        <td class="border p-2 text-center">${itemCount}</td>
        <td class="border p-2 text-right">${(Number(sale.total) || 0).toFixed(2)}</td>
        <td class="border p-2 text-center">${shortDate(sale.sale_date)}</td>
        <td class="border p-2">${sale.customer_name || ""}</td>
        <td class="border p-2 text-center">
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded" onclick="showReceipt(${sale.id})">🧾</button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    console.log(`✅ Loaded ${sales.length} customer sales`);
  } catch (err) {
    console.error("❌ loadCustomerSales failed:", err);
    const tbody = document.getElementById("customer-sales-body");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-red-500">Failed to load sales</td></tr>`;
    }
  }
}

/* =========================================================
   📦 Products / Vendors / Loans stubs
   ========================================================= */
// ---------- Simple safe stubs and loaders for other pages ----------

// -----------------------------
// Products & Vendors management (simple UI API)
// -----------------------------
// Global toggle state
let showAllProducts = true;

// Load products into Manage Products table
// Load products for table
// --- load products ---
/* ---------------- PRODUCTS ---------------- */
// 🧩 Enhanced + debug-friendly loadProducts()
// ✅ Improved loadProducts() with vendor name join + batch_no display + stock logic
// 🧩 Load Products (with vendor join + latest batch_no)
async function loadProducts(stockOnly = false) {
  console.log("📦 Loading products...");
  const supabase = await ensureSupabaseClient();

  // 1️⃣ Get product info and vendor name
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, barcode, price, units, vendor_id, vendors(name)")
    .order("id", { ascending: true });

  if (prodErr) {
    console.error("❌ loadProducts failed:", prodErr);
    return;
  }

  // 2️⃣ Fetch latest batch info (each product may have multiple)
  const { data: batches, error: batchErr } = await supabase
    .from("product_batches")
    .select("product_id, batch_number, remaining_quantity, created_at")
    .order("created_at", { ascending: false });

  if (batchErr) {
    console.warn("⚠️ Failed to load product_batches:", batchErr.message);
  }

  // 🧠 Map product_id → latest batch number + total remaining
  const batchMap = {};
  if (batches && batches.length > 0) {
    for (const b of batches) {
      if (!batchMap[b.product_id]) {
        batchMap[b.product_id] = { batch_no: b.batch_number, total: 0 };
      }
      batchMap[b.product_id].total += b.remaining_quantity || 0;
    }
  }

  // 3️⃣ Render table
  const tbody = document.getElementById("products-body");
  if (!tbody) {
    console.warn("⚠️ #products-body not found in DOM");
    return;
  }
  tbody.innerHTML = "";

  let filtered = products;
  if (stockOnly) {
    filtered = products.filter(p => (batchMap[p.id]?.total || 0) > 0);
  }

  if (filtered.length === 0) {
    tbody.innerHTML =
      `<tr><td colspan="9" class="text-center p-2 text-gray-500">No products found</td></tr>`;
    return;
  }

  filtered.forEach(p => {
    const vendorName = p.vendors?.name || "—";
    const batch_no = batchMap[p.id]?.batch_no || "—";
    const remaining = batchMap[p.id]?.total ?? 0;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${p.id}</td>
      <td class="border p-2">${p.name}</td>
      <td class="border p-2">${p.barcode}</td>
      <td class="border p-2">${parseFloat(p.price).toFixed(2)}</td>
      <td class="border p-2">${p.units}</td>
      <td class="border p-2">${vendorName}</td>
      <td class="border p-2">${batch_no}</td>
      <td class="border p-2">${remaining}</td>
      <td class="border p-2 text-center space-x-2">
        <button class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                onclick="showAdjustProduct(${p.id})">Adjust</button>
        <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                onclick="removeProduct(${p.id})">Remove</button>
      </td>`;
    tbody.appendChild(tr);
  });

  console.log(`✅ Rendered ${filtered.length} products.`);
}

async function inStockProductIds() {
  const supabase = ensureSupabaseClient();
  const { data } = await supabase
    .from("product_batches")
    .select("product_id")
    .gt("remaining_quantity", 0);
  return data.map((r) => r.product_id);
}

// ✅ Auto-fill product name when barcode exists in Product Catalog
async function autofillProductNameByBarcode(barcode) {
  if (!barcode || barcode.trim() === "") return;

  try {
    const supabase = await ensureSupabaseClient();

    // 🔍 Look up in your "product_catalog" table
    const { data, error } = await supabase
      .from("product_catalog")
      .select("name")
      .eq("barcode", barcode.trim())
      .maybeSingle();

    if (error) {
      console.warn("⚠️ Barcode lookup failed:", error.message);
      return;
    }

    if (data && data.name) {
      const nameInput = document.querySelector("#name");
      if (nameInput) {
        nameInput.value = data.name;
        nameInput.classList.add("bg-green-50"); // subtle visual feedback
        console.log(`✅ Autofilled product name: ${data.name}`);
      }
    } else {
      console.log("ℹ️ No matching barcode found in Product Catalog.");
    }
  } catch (err) {
    console.error("❌ autofillProductNameByBarcode() error:", err);
  }
}

// =========================================================
// Products Management
// =========================================================

// Add new product with initial quantity
// Add Product (includes creating initial batch)
// Add Product (auto validates and creates initial stock batch)
// 🧩 Add Product with Auto Batch No. generation
// --- 🧩 Add Product with Auto Batch & Initial Quantity ---
async function addProduct(event) {
  event.preventDefault();
  console.log("🟢 addProduct() triggered");

  const supabase = await ensureSupabaseClient();

  const name = document.getElementById("name").value.trim();
  const barcode = document.getElementById("barcode").value.trim();
  const price = parseFloat(document.getElementById("price").value || 0);
  const units = document.getElementById("units").value.trim();
  const vendor_id = parseInt(document.getElementById("vendor").value || 0);
  const quantity = parseInt(document.getElementById("quantity").value || 0);

  if (!name || !price || !units || !vendor_id || isNaN(quantity)) {
    alert("⚠️ Please fill in all required fields (barcode optional).");
    return;
  }

  // ✅ Short unique batch number (12 chars max)
  const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const batch_no = `B-${uniqueSuffix}`; // example: B-AB12CD
  console.log(`🧾 Generated Batch No: ${batch_no}`);

  // 1️⃣ Insert into products
  const { data: newProduct, error: prodErr } = await supabase
    .from("products")
    .insert([{ name, barcode, price, units, vendor_id, batch_no }])
    .select()
    .maybeSingle();

  if (prodErr || !newProduct) {
    console.error("❌ Failed to add product:", prodErr);
    if (prodErr?.code === "23505") {
      alert("⚠️ Duplicate barcode & batch number combination. Try again.");
    } else if (prodErr?.code === "22001") {
      alert("⚠️ Batch number too long for database column. Please shorten it.");
    } else {
      alert(`Failed to add product: ${prodErr?.message || "Unknown error"}`);
    }
    return;
  }

  console.log(`✅ Product added with ID: ${newProduct.id}`);

  // 2️⃣ Insert matching product_batches record
  const { error: batchErr } = await supabase
    .from("product_batches")
    .insert([
      {
        product_id: newProduct.id,
        vendor_id,
        batch_number: batch_no,
        buy_in_price: price,
        remaining_quantity: quantity,
      },
    ]);

  if (batchErr) {
    console.error("⚠️ Failed to insert product_batches:", batchErr);
    alert("⚠️ Product added but failed to create batch record. See console.");
  } else {
    console.log("✅ Batch created successfully.");
  }

  // 3️⃣ Refresh list
  await loadProducts();
  alert(`✅ Product "${name}" added successfully!`);
  document.getElementById("add-product-form").reset();
}


/* ---------------- VENDORS ---------------- */
// 🧩 Debug-friendly version of loadVendors()
// ===============================
// 🧩 Safe Debounced Vendor Loader
// ===============================
/* =======================================================
   ✅ Vendor Management Section (Final Verified Version)
   ======================================================= */

// 🔹 Global vendor state control
window._loadVendorsBusy = false;
window._vendorInsertBusy = false;

/**
 * Load all vendors from Supabase and render to both:
 *  - Manage Vendors table
 *  - Product Vendor dropdown (if present)
 */
// ===============================
// ✅ Vendor Management Section
// ===============================

// Debounce flags to prevent overlapping calls
window._loadVendorsBusy = false;
window._vendorInsertBusy = false;

// ✅ Unified loadVendors() — works for both Manage Vendors and Manage Products
async function loadVendors() {
  if (window._loadVendorsBusy) {
    console.warn("⏳ loadVendors skipped — still running");
    return;
  }
  window._loadVendorsBusy = true;

  try {
    console.log("📦 Loading vendors...");
    const supabase = await ensureSupabaseClient();
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    console.log(`✅ Vendors loaded: (${data?.length || 0})`, data);

    // --- Populate vendor table (Manage Vendors page) ---
    const vendorTable = document.querySelector("#vendors-table tbody");
    if (vendorTable) {
      vendorTable.innerHTML = "";
      if (!data || data.length === 0) {
        vendorTable.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-gray-500">No vendors found.</td></tr>`;
      } else {
        data.forEach(v => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td class="border p-2">${v.id}</td>
            <td class="border p-2">${v.name || "-"}</td>
            <td class="border p-2">${v.contact || "-"}</td>
            <td class="border p-2">${v.phone_number || "-"}</td>
            <td class="border p-2">${v.address || "-"}</td>
            <td class="border p-2 text-center">
              <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onclick="removeVendor(${v.id})">Remove</button>
            </td>`;
          vendorTable.appendChild(tr);
        });
      }
    }

    // --- Populate vendor dropdown (Manage Products page) ---
    const vendorSelect = document.querySelector("#vendor");
    if (vendorSelect) {
      console.log("🔹 Populating vendor dropdown...");
      vendorSelect.innerHTML = `<option value="">-- Select Vendor --</option>`;
      data?.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.id;
        opt.textContent = v.name;
        vendorSelect.appendChild(opt);
      });
      console.log(`✅ Vendor dropdown populated with ${data?.length || 0} options`);
    }
  } catch (err) {
    console.error("❌ loadVendors failed:", err);
  } finally {
    window._loadVendorsBusy = false;
    console.log("🎯 loadVendors() completed");
  }
}

// 🗑️ Remove Vendor
/**
 * Remove a vendor by ID (with confirmation)
 */
/** Remove vendor */
// ✅ Remove Vendor (safe)
async function removeVendor(id) {
  if (!confirm("Are you sure you want to remove this vendor?")) return;
  try {
    const supabase = await ensureSupabaseClient();
    const { error } = await supabase.from("vendors").delete().eq("id", id);
    if (error) throw error;
    console.log(`✅ Vendor ${id} removed.`);
    await loadVendors();
  } catch (err) {
    console.error("❌ removeVendor failed:", err);
  }
}



// --- remove product ---
// 🧩 Remove product + its batches
async function removeProduct(productId) {
  const confirmDelete = confirm("Are you sure you want to remove this product?");
  if (!confirmDelete) return;

  const supabase = await ensureSupabaseClient();

  // Try delete product_batches first
  const { error: batchErr } = await supabase
    .from("product_batches")
    .delete()
    .eq("product_id", productId);

  if (batchErr) {
    console.error("⚠️ Failed to delete related batches:", batchErr);
    alert(
      "⚠️ This product has related sales data and cannot be deleted directly. Please clean up related sales first."
    );
    return;
  }

  // Then delete product
  const { error: prodErr } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (prodErr) {
    console.error("❌ Failed to delete product:", prodErr);
    alert(`Failed to delete product: ${prodErr.message}`);
    return;
  }

  console.log(`✅ Product ${productId} removed successfully.`);
  await loadProducts();
  alert("✅ Product removed successfully!");
}

// --- adjust product modal ---
// --- 🧩 Show Adjust Product Modal ---
async function showAdjustProduct(productId) {
  console.log("🪄 showAdjustProduct()", productId);
  const supabase = await ensureSupabaseClient();

  // 1️⃣ Load product with batch info
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, units, vendor_id, batch_no, product_batches(remaining_quantity)")
    .eq("id", productId)
    .maybeSingle();

  if (error || !data) {
    console.error("❌ Failed to load product for adjust:", error);
    alert("Failed to load product for adjustment.");
    return;
  }

  const currentQty = data.product_batches?.[0]?.remaining_quantity ?? 0;

  // 2️⃣ Populate modal fields
  document.getElementById("adjust-id").value = data.id;
  document.getElementById("adjust-price").value = data.price ?? 0;
  document.getElementById("adjust-units").value = data.units ?? "";
  document.getElementById("adjust-qty").value = currentQty;

  // 3️⃣ Show modal
  document.getElementById("adjust-modal").classList.remove("hidden");
}

function hideAdjustProduct() {
  document.getElementById("adjust-modal").classList.add("hidden");
}

// --- 🧩 Safe Adjust Product ---
// --- 🧩 Safe Apply Adjust Product ---
async function applyAdjustProduct(e) {
  e.preventDefault();
  console.log("⚙️ Adjusting product...");

  const supabase = await ensureSupabaseClient();
  const productId = parseInt(document.getElementById("adjust-id").value);
  const newPrice = parseFloat(document.getElementById("adjust-price").value);
  const newUnits = document.getElementById("adjust-units").value.trim();
  const newQty = parseInt(document.getElementById("adjust-qty").value);

  if (!productId || isNaN(newPrice) || !newUnits || isNaN(newQty)) {
    alert("⚠️ Please fill all fields correctly.");
    return;
  }

  // 1️⃣ Load product to get batch/vendor
  const { data: product, error: loadErr } = await supabase
    .from("products")
    .select("id, vendor_id, batch_no")
    .eq("id", productId)
    .single();

  if (loadErr || !product) {
    console.error("❌ Failed to load product before adjust:", loadErr);
    alert("Failed to load product before adjusting.");
    return;
  }

  // 2️⃣ Update price & units
  const { error: prodErr } = await supabase
    .from("products")
    .update({ price: newPrice, units: newUnits })
    .eq("id", productId);

  if (prodErr) {
    console.error("❌ Failed to update product:", prodErr);
    alert("Failed to update product info. See console.");
    return;
  }

  // 3️⃣ Check batch
  const { data: existingBatch, error: fetchBatchErr } = await supabase
    .from("product_batches")
    .select("id")
    .eq("product_id", productId)
    .maybeSingle();

  if (fetchBatchErr) console.warn("⚠️ Failed to fetch batch:", fetchBatchErr);

  if (existingBatch) {
    // Replace quantity
    const { error: updateBatchErr } = await supabase
      .from("product_batches")
      .update({ remaining_quantity: newQty })
      .eq("id", existingBatch.id);

    if (updateBatchErr) {
      console.error("❌ Failed to update batch quantity:", updateBatchErr);
      alert("Failed to update batch quantity.");
      return;
    }

    console.log(`✅ Quantity updated to ${newQty}.`);
  } else {
    // Create batch with vendor_id
    const { error: insertBatchErr } = await supabase
      .from("product_batches")
      .insert([
        {
          product_id: productId,
          vendor_id: product.vendor_id,
          batch_number: product.batch_no,
          remaining_quantity: newQty,
        },
      ]);

    if (insertBatchErr) {
      console.error("❌ Failed to create batch record:", insertBatchErr);
      alert("Failed to create new batch record.");
      return;
    }

    console.log("✅ New batch record created.");
  }

  hideAdjustProduct();
  await loadProducts();
  alert("✅ Product adjusted successfully!");
}
// 🧩 Add Vendor
/**
 * Safely add a new vendor — used by vendors.html
 */
/** Add vendor safely (debounced & duplicate-protected) */
// ✅ Add Vendor (duplicate-safe, debounced, and guarded)
async function addVendor({ name, contact, phone, address }) {
  if (window._vendorInsertBusy) {
    console.warn("⚠️ addVendor skipped — insert already in progress");
    return { success: false, error: { message: "Insert already in progress" } };
  }

  window._vendorInsertBusy = true;
  console.log("🟢 addVendor started");

  try {
    const supabase = await ensureSupabaseClient();

    // ✅ Extra input guard
    if (!name || typeof name !== "string" || name.trim() === "") {
      console.warn("🚫 Invalid vendor name — skipping insert");
      return { success: false, error: { message: "invalid_name" } };
    }

    // ✅ Fetch fresh vendors and check duplicates safely
    const { data: vendors, error: checkErr } = await supabase
      .from("vendors")
      .select("id, name");

    if (checkErr) throw checkErr;

    const newName = name.trim().toLowerCase();
    const exists =
      Array.isArray(vendors) &&
      vendors.some(v => {
        if (!v || typeof v.name !== "string") return false;
        const dbName = v.name?.trim?.().toLowerCase?.() || "";
        return dbName === newName;
      });

    if (exists) {
      console.warn("🚫 Duplicate vendor name detected");
      return { success: false, error: { message: "duplicate" } };
    }

    // ✅ Perform insert
    const { error: insertErr } = await supabase.from("vendors").insert([
      {
        name: name.trim(),
        contact: contact || null,
        phone_number: phone || null,
        address: address || null,
      },
    ]);

    if (insertErr) throw insertErr;

    console.log("✅ Vendor added successfully!");
    await loadVendors();
    return { success: true };
  } catch (err) {
    console.error("❌ addVendor failed:", err);
    return { success: false, error: err };
  } finally {
    window._vendorInsertBusy = false;
    console.log("🔵 addVendor finished, insert lock cleared");
  }
}

// ---------------------------------------------------------
// 🧾 Receipt
// ---------------------------------------------------------
// --------------------
// 🧾 Show Receipt
// -----------------------------
// Receipt modal + print
// -----------------------------
async function showReceipt(orderId) {
  try {
    debugLog("🧾 Loading receipt for order:", orderId);
    const supabase = await ensureSupabaseClient();

    const { data: order, error: orderErr } = await supabase
      .from("customer_sales")
      .select("id, customer_name, sale_date, total")
      .eq("id", orderId)
      .single();

    if (orderErr) throw orderErr;

    const { data: items, error: itemsErr } = await supabase
      .from("customer_sales_items")
      .select("product_id, batch_id, quantity, selling_price, products(name, barcode), product_batches(batch_number)")
      .eq("order_id", orderId);

    if (itemsErr) throw itemsErr;

    const totalQty = (items || []).reduce((s, i) => s + (i.quantity || 0), 0);
    const totalCost = (items || []).reduce((s, i) => s + (Number(i.quantity || 0) * Number(i.selling_price || 0)), 0);

    let html = `
      <h2 class="text-lg font-bold mb-2">Receipt</h2>
      <p><strong>Order #:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.customer_name || "(無)"}</p>
      <p><strong>Sale Date:</strong> ${formatDate(order.sale_date)}</p>
      <p><strong>Items:</strong> ${totalQty}</p>
      <p><strong>Total Cost:</strong> ${Number(order.total || totalCost).toFixed(2)}</p>

      <table class="w-full border mt-3">
        <thead>
          <tr class="border-b">
            <th class="p-1 text-left">Product</th>
            <th class="p-1">Barcode</th>
            <th class="p-1">Batch</th>
            <th class="p-1">Qty</th>
            <th class="p-1">Price</th>
            <th class="p-1">Sub-Total</th>
          </tr>
        </thead>
        <tbody>
          ${(items || []).map(i => `
            <tr class="border-b">
              <td class="p-1">${i.products?.name || ""}</td>
              <td class="p-1">${i.products?.barcode || ""}</td>
              <td class="p-1">${i.product_batches?.batch_number || ""}</td>
              <td class="p-1">${i.quantity}</td>
              <td class="p-1">${Number(i.selling_price || 0).toFixed(2)}</td>
              <td class="p-1">${(Number(i.quantity || 0) * Number(i.selling_price || 0)).toFixed(2)}</td>
            </tr>`).join("")}
        </tbody>
      </table>

      <div class="mt-4 text-right">
        <button id="print-receipt" class="bg-blue-500 text-white px-3 py-1 rounded">🖨 Print</button>
        <button id="close-receipt" class="ml-2 bg-gray-400 text-white px-3 py-1 rounded">Close</button>
      </div>
    `;

    const modal = document.getElementById("receipt-modal");
    if (!modal) {
      alert("Receipt modal not found in DOM");
      return;
    }
    modal.querySelector("#receipt-content").innerHTML = html;
    modal.classList.remove("hidden");

    modal.querySelector("#print-receipt").addEventListener("click", () => printReceipt(order, items));
    modal.querySelector("#close-receipt").addEventListener("click", () => closeReceiptModal());
  } catch (err) {
    console.error("❌ Failed to fetch order:", err);
    alert("Failed to fetch order: " + (err.message || JSON.stringify(err)));
  }
}

function closeReceiptModal() {
  const modal = document.getElementById("receipt-modal");
  if (modal) modal.classList.add("hidden");
}

// 58mm print function
function printReceipt(order, items) {
  const printWindow = window.open("", "PRINT", "height=600,width=400");
  let content = `
    <html><head><style>
      body { font-family: monospace; width: 58mm; }
      .center { text-align:center; }
      .bold { font-weight:bold; }
      .line { border-top:1px dashed #000; margin:4px 0; }
      .item-line { display:flex; justify-content:space-between; }
      .left { flex:1; }
      .mid { width:40px; text-align:center; }
      .right { width:60px; text-align:right; }
    </style></head><body>
    <div class="center bold">POS Receipt</div>
    <div>日期: ${shortDate(order.sale_date)}</div>
    <div>時間: ${new Date(order.sale_date).toLocaleTimeString("zh-TW",{hour12:false})}</div>
    <div>客戶: ${order.customer_name || "(無)"}</div>
    <div class="line"></div>
    <div class="item-line bold"><div class="left">商品</div><div class="mid">數量</div><div class="right">小計</div></div>
    <div class="line"></div>
  `;

  (items || []).forEach(item => {
    const subtotal = Number(item.quantity || 0) * Number(item.selling_price || 0);
    content += `
      <div class="item-line">
        <div class="left">${item.products?.name || ""}</div>
        <div class="mid">${item.quantity}</div>
        <div class="right">${subtotal.toFixed(2)}</div>
      </div>
    `;
  });

  content += `
    <div class="line"></div>
    <div class="item-line bold"><div class="left">合計</div><div class="mid"></div><div class="right">${(items || []).reduce((s,i)=>s + (Number(i.quantity || 0) * Number(i.selling_price || 0)), 0).toFixed(2)}</div></div>
    <div class="line"></div>
    <div class="center">感謝您的惠顧</div>
    </body></html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  // do not close automatically in case user wants to inspect
}


// -----------------------------
// Analytics helpers (simple)
// -----------------------------
async function analyticsSalesByDay(dateFrom, dateTo) {
  const supabase = await ensureSupabaseClient();
  let q = supabase
    .from("customer_sales")
    .select("sale_date, total");
  if (dateFrom) q = q.gte("sale_date", dateFrom);
  if (dateTo) q = q.lte("sale_date", dateTo);
  const { data, error } = await q;
  if (error) throw error;
  const map = {};
  (data || []).forEach(r => {
    const d = new Date(r.sale_date);
    const day = d.toLocaleDateString("zh-TW");
    map[day] = (map[day] || 0) + Number(r.total || 0);
  });
  return Object.keys(map).sort().map(k => ({ day: k, total: map[k] }));
}

async function analyticsSalesByProduct() {
  const supabase = await ensureSupabaseClient();
  const { data, error } = await supabase
    .from("customer_sales_items")
    .select("product_id, quantity, selling_price, products(name)")
    .order("product_id");
  if (error) throw error;
  const map = {};
  (data || []).forEach(r => {
    const name = r.products?.name || ("Product " + r.product_id);
    map[name] = (map[name] || 0) + (Number(r.quantity || 0) * Number(r.selling_price || 0));
  });
  return Object.keys(map).map(k => ({ product: k, total: map[k] }));
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

// -----------------------------
// Event wiring helpers for pages
// -----------------------------
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // ensure supabase ready (but don't block)
    await ensureSupabaseClient();
  } catch (err) {
    console.warn("Supabase init failed on DOMContentLoaded:", err);
  }

  // wire common UI buttons if present
  const toggleBtn = document.getElementById("toggle-language");
  if (toggleBtn) toggleBtn.addEventListener("click", toggleLanguage);
  applyTranslations();

  // if there's a product dropdown on the page, populate it and wire change handler
  if (document.getElementById("product-select")) {
    populateProductDropdown();
    document.getElementById("product-select").addEventListener("change", async (e) => {
      const id = e.target.value;
      if (!id) return;
      const res = await loadProductAndBatches(id, false);
      const batchEl = document.getElementById("batch-no");
      const stockDisplay = document.getElementById("stock-display");
      if (batchEl) {
        batchEl.innerHTML = (res?.batches || []).map(b => `<option value="${b.id}">${b.batch_number} ${b.remaining_quantity != null ? `(Stock: ${b.remaining_quantity})` : ""}</option>`).join("");
        if ((res?.batches || []).length === 1) batchEl.value = res.batches[0].id;
      }
      if (stockDisplay) {
        const sumStock = (res?.batches || []).reduce((s, b) => s + (b.remaining_quantity || 0), 0);
        stockDisplay.textContent = `Stock: ${sumStock}`;
      }
    });
  }
 /* ---------------------- 🧩 AUTO-FILL BARCODE ON PRODUCT SELECT ---------------------- */
const productSelect = document.getElementById("product-select");
if (productSelect) {
  productSelect.addEventListener("change", async (e) => {
    const productId = e.target.value;
    if (!productId) return;

    const supabase = await ensureSupabaseClient();

    // Try from "products" first (since that’s what your dropdown uses)
    let { data, error } = await supabase
      .from("products")
      .select("barcode")
      .eq("id", productId)
      .single();

    // If not found in "products", fall back to "product_catalog"
    if (error || !data) {
      const alt = await supabase
        .from("product_catalog")
        .select("barcode")
        .eq("id", productId)
        .maybeSingle(); // handles missing rows gracefully
      data = alt.data;
    }

    if (!data || !data.barcode) {
      console.warn("⚠️ No barcode found for selected product");
      return;
    }

    const barcodeField = document.getElementById("product-barcode");
    if (barcodeField) {
      barcodeField.value = data.barcode;
      console.log("✅ Barcode auto-filled:", data.barcode);
    }
  });
}
/* ---------------------- 🧩 END AUTO-FILL BARCODE ---------------------- */

  
  // barcode input Enter handler
  const barcodeInput = document.getElementById("product-barcode");
  if (barcodeInput) {
    barcodeInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const code = barcodeInput.value.trim();
        if (!code) return;
        debugLog("🔍 Barcode entered:", code);
        const result = await loadProductAndBatches(code, true);
        if (!result) {
          document.getElementById("stock-display").textContent = "Product not found";
          return;
        }
        // set product-select to product.id if present
        const prodSel = document.getElementById("product-select");
        if (prodSel) {
          prodSel.value = result.product.id;
          // trigger change to populate batches
          const ev = new Event("change");
          prodSel.dispatchEvent(ev);
        }
      }
    });
  }

 // ✅ Add Item button — collect inputs safely and call addItemToCart()
const addBtn = document.getElementById("add-item");
if (addBtn) {
  addBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const barcode = document.getElementById("product-barcode")?.value?.trim();
    const batchNo = document.getElementById("batch-no")?.value?.trim();
    const qty = parseFloat(document.getElementById("quantity")?.value || "0");
    const price = parseFloat(document.getElementById("selling-price")?.value || "0");
    const productSelect = document.getElementById("product-select");
    const productName =
      productSelect?.options[productSelect.selectedIndex]?.text ||
      document.getElementById("product-name")?.value ||
      "";

    addItemToCart(barcode, batchNo, qty, price, productName);
  });
}
  

  // fallback: if there is a Checkout button
  const checkoutBtn = document.getElementById("checkout");
  if (checkoutBtn) checkoutBtn.addEventListener("click", checkoutOrder);

  // bind product form submit (manage-products page)
  const addProductForm = document.getElementById("add-product-form");
  if (addProductForm) addProductForm.addEventListener("submit", addProduct);

  const addVendorForm = document.getElementById("add-vendor-form");
  if (addVendorForm) addVendorForm.addEventListener("submit", addVendor);

  // wire cart render initially
  renderCart();

  // ✅ Load sales table if applicable
  loadCustomerSales();
});
