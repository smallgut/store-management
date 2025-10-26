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
/* ============================================================
   🧩 PATCH: FIX CART + CHECKOUT + RECEIPT (vFinal)
   ============================================================ */

/* ---------------------- 🛒 FIXED ADD ITEM TO CART ---------------------- */
async function addItemToCart(barcode, batchId, quantity, price, productName) {
  try {
    console.log("🟢 addItemToCart() called", { barcode, batchId, quantity, price, productName });

    // --- Validation ---
    if (!barcode) return alert("❌ Invalid product barcode.");
    if (!quantity || quantity <= 0) return alert("❌ Quantity must be positive.");
    if (!price || price <= 0) return alert("❌ Price must be positive.");

    const tbody = document.querySelector("#cart-table tbody");
    if (!tbody) return console.warn("⚠️ cart tbody not found");

    // --- Check existing ---
    const existingRow = Array.from(tbody.querySelectorAll("tr")).find(row => {
      const cellBarcode = row.querySelector("td:nth-child(2)")?.textContent?.trim();
      const cellBatch = row.querySelector("td:nth-child(3)")?.dataset?.batchId;
      return cellBarcode === barcode && cellBatch === String(batchId);
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
        <td class="border p-2" data-batch-id="${batchId || ""}">${batchId || ""}</td>
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

    tbody.querySelectorAll(".remove-item").forEach(btn => {
      btn.onclick = e => {
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
/* ---------------------- 💳 FIXED CHECKOUT ORDER ---------------------- */
/* ---------------------- 🧩 PATCH 1 — Fix checkoutOrder() date to full timestamp ---------------------- */
async function checkoutOrder(e) {
  if (e) e.preventDefault();

  try {
    const tbody = document.querySelector("#cart-table tbody");
    if (!tbody || tbody.children.length === 0) {
      alert("🛒 Your cart is empty.");
      return;
    }

    const customerName = document.getElementById("customer-name")?.value?.trim() || "Walk-in";

    // ✅ Save actual time (ISO with local timezone)
    const saleDateInput = document.getElementById("sale-date")?.value;
    const saleDate = saleDateInput
      ? new Date(saleDateInput + "T" + new Date().toLocaleTimeString("en-GB")).toISOString()
      : new Date().toISOString();

    const total = parseFloat(document.getElementById("total-cost")?.textContent || "0");
    const supabase = await ensureSupabaseClient();

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
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const items = rows.map((r) => {
      const c = r.querySelectorAll("td");
      return {
        order_id: orderId,
        batch_id: parseInt(c[2]?.textContent || "0"),
        quantity: parseFloat(c[3]?.textContent || "0"),
        selling_price: parseFloat(c[4]?.textContent || "0"),
      };
    });

    console.log("📦 Inserting order items:", items);
    const { error: itemsErr } = await supabase.from("customer_sales_items").insert(items);
    if (itemsErr) throw itemsErr;

    // ✅ Decrement stock
    for (const it of items) {
      if (!it.batch_id || !it.quantity) continue;
      const { data: b } = await supabase
        .from("product_batches")
        .select("remaining_quantity")
        .eq("id", it.batch_id)
        .single();
      const newQty = Math.max(0, (b?.remaining_quantity || 0) - it.quantity);
      await supabase.from("product_batches").update({ remaining_quantity: newQty }).eq("id", it.batch_id);
      console.log(`✅ Batch ${it.batch_id} stock updated to ${newQty}`);
    }

    tbody.innerHTML = "";
    updateCartTotal();
    alert("✅ Checkout complete!");
    console.log("🎉 Order & items saved successfully, stock updated.");
    await loadCustomerSales();
  } catch (err) {
    console.error("❌ checkoutOrder() failed:", err);
    alert("Checkout failed. See console for details.");
  }
}
/* ---------------------- 🧩 END PATCH 1 ---------------------- */
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

 // ✅ Short unique batch number + date code
const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
const today = new Date();
const ymd = today.getFullYear().toString() +
            String(today.getMonth() + 1).padStart(2, "0") +
            String(today.getDate()).padStart(2, "0");
const batch_no = `B-${uniqueSuffix}-${ymd}`; // e.g. B-CFRABS-20251023
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
/* ---------------------- 🧾 SHOW RECEIPT MODAL (Hybrid with Print Support) ---------------------- */
/* ---------------------- 🧾 SHOW RECEIPT MODAL (with Print + Taiwan Timezone + Data Fix) ---------------------- */
/* ---------------------- 🧾 SHOW RECEIPT MODAL (Final Full Version) ---------------------- */
/* ---------------------- 🧾 SHOW RECEIPT MODAL (Final Fixed for 400 Error) ---------------------- */
/* ---------------------- 🧾 FINAL SHOW RECEIPT (PRODUCTS table + Taiwan TZ + Print) ---------------------- */
async function showReceipt(orderId) {
  try {
    const supabase = await ensureSupabaseClient();
    console.log(`🧾 Loading receipt for order #${orderId}...`);

    // 1️⃣ Fetch order header
    const { data: order, error: orderErr } = await supabase
      .from("customer_sales")
      .select("id, customer_name, sale_date, total")
      .eq("id", orderId)
      .single();
    if (orderErr || !order) throw orderErr || new Error("Order not found");

    // 2️⃣ Fetch order items
    const { data: items, error: itemsErr } = await supabase
      .from("customer_sales_items")
      .select("id, batch_id, quantity, selling_price")
      .eq("order_id", orderId);
    if (itemsErr) throw itemsErr;

    // 3️⃣ Join product + batch details
    const detailedItems = [];
    for (const it of items || []) {
      let productName = "Unknown";
      let barcode = "";
      let batchNum = "";

      if (it.batch_id) {
        // ✅ Get batch info
        const { data: batchData, error: batchErr } = await supabase
          .from("product_batches")
          .select("batch_number, product_id")
          .eq("id", it.batch_id)
          .maybeSingle();

        if (!batchErr && batchData) {
          batchNum = batchData.batch_number || "";

          // ✅ Now lookup product from PRODUCTS table (correct schema)
          if (batchData.product_id) {
            const { data: prodData, error: prodErr } = await supabase
              .from("products")
              .select("name, barcode")
              .eq("id", batchData.product_id)
              .maybeSingle();

            if (!prodErr && prodData) {
              productName = prodData.name || "Unnamed";
              barcode = prodData.barcode || "";
            }
          } else {
            console.warn(`⚠️ Batch ${it.batch_id} missing product_id`);
          }
        } else {
          console.warn(`⚠️ Failed to fetch batch ${it.batch_id}`, batchErr);
        }
      }

      detailedItems.push({
        name: productName,
        barcode,
        batch: batchNum,
        qty: it.quantity || 0,
        price: it.selling_price || 0,
        subtotal: ((it.quantity || 0) * (it.selling_price || 0)).toFixed(2),
      });
    }

    // 4️⃣ Render receipt modal
    const modal = document.getElementById("receipt-modal");
    const content = document.getElementById("receipt-content");
    if (!modal || !content) return;

    const dateStr = new Date(order.sale_date).toLocaleString("zh-TW", {
      timeZone: "Asia/Taipei",
      hour12: false,
    });

    content.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">Receipt #${order.id}</h2>
      <p><strong>Customer:</strong> ${order.customer_name || "(無)"}</p>
      <p><strong>Date:</strong> ${dateStr}</p>

      <table class="w-full border-collapse border border-gray-300 text-sm mt-4 mb-4">
        <thead class="bg-gray-100">
          <tr>
            <th class="border p-2 text-left">Product</th>
            <th class="border p-2 text-left">Barcode</th>
            <th class="border p-2 text-center">Batch</th>
            <th class="border p-2 text-center">Qty</th>
            <th class="border p-2 text-right">Price</th>
            <th class="border p-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${detailedItems.map(it => `
            <tr>
              <td class="border p-2">${it.name}</td>
              <td class="border p-2">${it.barcode}</td>
              <td class="border p-2 text-center">${it.batch}</td>
              <td class="border p-2 text-center">${it.qty}</td>
              <td class="border p-2 text-right">${Number(it.price).toFixed(2)}</td>
              <td class="border p-2 text-right">${it.subtotal}</td>
            </tr>`).join("")}
        </tbody>
        <tfoot>
          <tr class="bg-gray-100 font-semibold">
            <td colspan="5" class="border p-2 text-right">Total:</td>
            <td class="border p-2 text-right">$${Number(order.total).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div class="text-right space-x-2">
        <button id="print-receipt" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">🖨 Print</button>
        <button id="close-receipt" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Close</button>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    document.getElementById("close-receipt").onclick = () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    };

    document.getElementById("print-receipt").onclick = () =>
      printReceipt(order, detailedItems);

    console.log("✅ Receipt displayed successfully.");
  } catch (err) {
    console.error("❌ showReceipt() failed:", err);
    alert("Failed to show receipt. See console for details.");
  }
}

/* ---------------------- 🧩 PATCH 2 — Improved print layout (margins + font) ---------------------- */
/* ---------------------- 🧾 FINAL PRINT RECEIPT (POS STYLE 58mm) ---------------------- */
function printReceipt(order, items) {
  const printWindow = window.open("", "", "width=400,height=600");
  if (!printWindow) {
    alert("⚠️ 無法開啟列印視窗，請檢查瀏覽器彈出視窗設定。");
    return;
  }

  const dateObj = new Date(order.sale_date);
  const taiwanTime = dateObj.toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    hour12: false,
  });
  const [date, time] = taiwanTime.split(" ");

  let content = `
    <html>
    <head>
      <style>
        @page {
          size: 58mm auto;
          margin: 0;
        }
        body {
          width: 48mm; /* ✅ Safe printable width */
          font-family: monospace;
          font-size: 10.5px; /* ✅ Slightly smaller, prevents clipping */
          line-height: 1.35;
          margin: 0;
          padding: 2mm;
          box-sizing: border-box;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 2px 0; }
        .item-line { display: flex; }
        .left {
          flex: 1;
          word-break: break-word;
        }
        .mid {
          width: 8mm;
          text-align: right;
          padding-right: 1mm;
        }
        .right {
          width: 20mm; /* ✅ Reduced width to avoid cutoff */
          text-align: right;
          padding-right: 3mm; /* ✅ Adds right margin for digits */
          word-break: break-word;
        }
      </style>
    </head>
    <body>
      <!-- 🏪 Header -->
      <div class="center bold">James & Louis Superstore</div>
      <div class="center">TEL: 0123456789</div>
      <div class="line"></div>

      <!-- 🧾 Order Info -->
      <div>日期: ${date}</div>
      <div>時間: ${time}</div>
      <div>客戶: ${order.customer_name || "(無)"}</div>
      <div class="line"></div>

      <!-- 🧺 Table Header -->
      <div class="item-line bold">
        <div class="left">商品</div>
        <div class="mid">數量</div>
        <div class="right">小計</div>
      </div>
      <div class="line"></div>
  `;

  items.forEach((item) => {
    const name = item.name || "";
    const qty = String(item.qty || 0);
    const subtotal = (item.qty * item.price).toFixed(2);
    content += `
      <div class="item-line">
        <div class="left">${name}</div>
        <div class="mid">${qty}</div>
        <div class="right">${subtotal}</div>
      </div>
    `;
  });

  const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
  content += `
      <div class="line"></div>
      <div class="item-line bold">
        <div class="left">合計</div>
        <div class="mid"></div>
        <div class="right">${total.toFixed(2)}</div>
      </div>
      <div class="line"></div>
      <div class="center">感謝您的惠顧！</div>
      <div class="center">歡迎再次光臨</div>
    </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}
/* ---------------------- 🧾 END PRINT RECEIPT ---------------------- */
/* ---------------------- 🧩 END PATCH 2 ---------------------- */


// -----------------------------
// Analytics helpers (simple)
// -----------------------------
// 📊 Corrected: analyticsSalesByDay()
async function analyticsSalesByDay() {
  const supabase = await ensureSupabaseClient();
  const { data, error } = await supabase
    .from("customer_sales")
    .select("sale_date,total");

  if (error) {
    console.error("❌ analyticsSalesByDay failed", error);
    return [];
  }

  // 🧮 Aggregate totals per day
  const dailyTotals = {};
  (data || []).forEach((row) => {
    const d = new Date(row.sale_date);
    const day = d.toISOString().split("T")[0]; // YYYY-MM-DD key
    dailyTotals[day] = (dailyTotals[day] || 0) + Number(row.total || 0);
  });

  // 📅 Sort by actual date
  const sortedDays = Object.keys(dailyTotals).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // 🧾 Format for chart.js
  return sortedDays.map((day) => ({
    day: new Date(day).toLocaleDateString("zh-TW", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    total: dailyTotals[day],
  }));
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

/* ---------------------- 📊 ANALYTICS: VENDOR PURCHASE REPORT ---------------------- */
/* ---------------------- 📊 ANALYTICS: FIXED VENDOR PURCHASE REPORT ---------------------- */
async function analyticsVendorPurchases(vendorId, dateFrom, dateTo) {
  const supabase = await ensureSupabaseClient();
  console.log("📊 Generating Vendor Purchase Report for vendor:", vendorId, dateFrom, dateTo);

  // Step 1️⃣ — Fetch all batches for this vendor within the date range
  let batchQuery = supabase
    .from("product_batches")
    .select("id, product_id, batch_number, buy_in_price, remaining_quantity, created_at")
    .eq("vendor_id", vendorId);

  if (dateFrom) batchQuery = batchQuery.gte("created_at", dateFrom);
  if (dateTo) batchQuery = batchQuery.lte("created_at", dateTo);

  const { data: batches, error: batchErr } = await batchQuery;
  if (batchErr) throw batchErr;
  if (!batches?.length) return { rows: [], total: 0 };

  const resultRows = [];
  let grandTotal = 0;

  // Step 2️⃣ — Loop through each batch to calculate sold + loaned + remaining
  for (const b of batches) {
    const batchId = b.id;

    // 🧾 Fetch product name
    const { data: prod, error: prodErr } = await supabase
      .from("products")
      .select("name")
      .eq("id", b.product_id)
      .maybeSingle();
    if (prodErr) console.warn("⚠️ Failed to load product for batch", batchId, prodErr);

    const productName = prod?.name || "Unknown Product";

    // 💰 Total sold quantity from customer_sales_items
    const { data: soldItems, error: soldErr } = await supabase
      .from("customer_sales_items")
      .select("quantity")
      .eq("batch_id", batchId);
    const soldQty = soldErr ? 0 : soldItems.reduce((sum, i) => sum + Number(i.quantity || 0), 0);

    // 💰 Total loaned quantity from vendor_loans
    const { data: loanItems, error: loanErr } = await supabase
      .from("vendor_loans")
      .select("quantity")
      .eq("batch_no", b.batch_number);
    const loanQty = loanErr ? 0 : loanItems.reduce((sum, i) => sum + Number(i.quantity || 0), 0);

    const remainingQty = Number(b.remaining_quantity || 0);
    const buyInQty = soldQty + loanQty + remainingQty;
    const subtotal = buyInQty * Number(b.buy_in_price || 0);
    grandTotal += subtotal;

    resultRows.push({
      product: productName,
      batch: b.batch_number,
      price: Number(b.buy_in_price || 0).toFixed(2),
      qty: buyInQty,
      sold: soldQty,
      loaned: loanQty,
      remaining: remainingQty,
      subtotal: subtotal.toFixed(2),
    });
  }

  console.log("✅ Vendor Purchase Report generated:", resultRows);
  return { rows: resultRows, total: grandTotal };
}
/* ---------------------- 📊 END FIXED VENDOR PURCHASE REPORT ---------------------- */

/* ---------------------- 💰 ADD VENDOR LOAN RECORD (Corrected for vendor_id + products table) ---------------------- */
async function addLoanRecord(event) {
  event.preventDefault();
  const supabase = await ensureSupabaseClient();

  const vendorSelect = document.getElementById("vendor-name");
  const productSelect = document.getElementById("product-select");
  const batchSelect = document.getElementById("batch-no");
  const qtyInput = document.getElementById("quantity");
  const priceInput = document.getElementById("selling-price");
  const dateInput = document.getElementById("loan-date");
  const messageEl = document.getElementById("message");
  const errorEl = document.getElementById("error");

  messageEl.textContent = "";
  errorEl.textContent = "";

  try {
    const vendorId = vendorSelect.value;
    const productId = productSelect.value;
    const batchNo = batchSelect.options[batchSelect.selectedIndex]?.text?.trim();
    const quantity = parseFloat(qtyInput.value);
    const sellingPrice = parseFloat(priceInput.value);
    const loanDate = dateInput.value;

    if (!vendorId || !productId || !batchNo || !quantity || !sellingPrice || !loanDate) {
      errorEl.textContent = "⚠️ Please fill in all required fields.";
      return;
    }

    const newLoan = {
      vendor_id: vendorId,
      product_id: productId,
      batch_no: batchNo,
      quantity,
      selling_price: sellingPrice,
      date: new Date(loanDate).toISOString(),
    };

    console.log("📦 Inserting vendor loan:", newLoan);
    const { error } = await supabase.from("vendor_loans").insert([newLoan]);
    if (error) throw error;

    messageEl.textContent = "✅ Loan record added successfully!";
    document.getElementById("add-loan-record-form").reset();

    await loadLoanRecords(); // reload list
  } catch (err) {
    console.error("❌ addLoanRecord() failed:", err);
    errorEl.textContent = "❌ Failed to add loan record: " + (err.message || "Unknown error");
  }
}
/* ---------------------- 💰 END ADD VENDOR LOAN RECORD ---------------------- */



/* ---------------------- 📜 LOAD VENDOR LOAN RECORDS ---------------------- */
/* ---------------------- 📜 LOAD VENDOR LOAN RECORDS (Corrected for vendor_id) ---------------------- */
/* ---------------------- 📜 LOAD VENDOR LOAN RECORDS (fixed product lookup + Taiwan date) ---------------------- */
async function loadLoanRecords() {
  const supabase = await ensureSupabaseClient();
  const tableBody = document.querySelector("#loan-records-table tbody");
  if (!tableBody) return;

  try {
    const { data, error } = await supabase
      .from("vendor_loans")
      .select("id, vendor_id, product_id, batch_no, quantity, selling_price, date")
      .order("id", { ascending: false });

    if (error) throw error;
    console.log("📊 Vendor loans loaded:", data);

    if (!data || data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-gray-500 p-4">No loan records found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = "";

    for (const record of data) {
      // ✅ fetch vendor + product name properly
      const [vendorName, productName] = await Promise.all([
        (async () => {
          const { data: v } = await supabase
            .from("vendors")
            .select("name")
            .eq("id", record.vendor_id)
            .single();
          return v?.name || "Unknown Vendor";
        })(),
        (async () => {
          const { data: p } = await supabase
            .from("products") // ✅ switched from product_catalog → products
            .select("name")
            .eq("id", record.product_id)
            .single();
          return p?.name || "Unknown Product";
        })(),
      ]);

      const date = new Date(record.date).toLocaleDateString("zh-TW", {
        timeZone: "Asia/Taipei",
      });

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${vendorName}</td>
        <td class="border p-2">${productName}</td>
        <td class="border p-2">${record.batch_no}</td>
        <td class="border p-2 text-center">${record.quantity}</td>
        <td class="border p-2 text-right">${Number(record.selling_price).toFixed(2)}</td>
        <td class="border p-2 text-center">${date}</td>
        <td class="border p-2 text-center">
          <button class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded" 
            onclick="deleteLoanRecord(${record.id})">🗑 Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    }
  } catch (err) {
    console.error("❌ loadLoanRecords() failed:", err);
  }
}
/* ---------------------- 📜 END LOAD VENDOR LOAN RECORDS ---------------------- */


/* ---------------------- ❌ DELETE LOAN RECORD ---------------------- */
async function deleteLoanRecord(id) {
  if (!confirm("🗑 Are you sure you want to delete this loan record?")) return;
  const supabase = await ensureSupabaseClient();

  try {
    const { error } = await supabase.from("vendor_loans").delete().eq("id", id);
    if (error) throw error;

    alert("✅ Loan record deleted successfully.");
    await loadLoanRecords(); // refresh list
  } catch (err) {
    console.error("❌ deleteLoanRecord() failed:", err);
    alert("❌ Failed to delete record: " + (err.message || "Unknown error"));
  }
}
/* ---------------------- ❌ END DELETE LOAN RECORD ---------------------- */

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
