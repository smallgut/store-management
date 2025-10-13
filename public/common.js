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
async function addItemToCart() {
  // read fields
  const productSelect = document.getElementById("product-select");
  const barcodeInput = document.getElementById("product-barcode");
  const batchSelect = document.getElementById("batch-no");
  const qtyInput = document.getElementById("quantity");
  const priceInput = document.getElementById("selling-price");

  // determine chosen product: prefer productSelect if set, else barcode lookup (barcodeInput assumed already resolved to product id in handler)
  let productId = productSelect ? productSelect.value : "";
  let barcode = barcodeInput ? barcodeInput.value.trim() : "";
  let batchId = batchSelect ? batchSelect.value : "";
  const quantity = Number(qtyInput?.value || 0);
  const sellingPrice = Number(priceInput?.value || 0);

  if ((!productId && !barcode) || !batchId) {
    alert("Please select product and batch, and enter quantity & selling price.");
    return;
  }
  if (quantity <= 0 || isNaN(quantity)) {
    alert("Please enter a valid quantity.");
    return;
  }
  if (isNaN(sellingPrice) || sellingPrice < 0) {
    alert("Please enter a valid selling price.");
    return;
  }

  // resolve product name & barcode via loadProductAndBatches if needed
  let product, batches;
  if (productId) {
    const res = await loadProductAndBatches(productId, false);
    if (!res) {
      alert("Product not found");
      return;
    }
    product = res.product;
    batches = res.batches;
  } else {
    const res = await loadProductAndBatches(barcode, true);
    if (!res) {
      alert("Product not found");
      return;
    }
    product = res.product;
    batches = res.batches;
    productId = product.id;
  }

  const chosenBatch = batches.find(b => String(b.id) === String(batchId));
  const batchNumber = chosenBatch ? chosenBatch.batch_number : "";

  cart.push({
    productId: Number(productId),
    productName: `${product.name}${product.barcode ? " (" + product.barcode + ")" : ""}`,
    barcode: product.barcode || barcode || "",
    batchId: Number(batchId),
    batchNumber: `${batchNumber}${chosenBatch && chosenBatch.remaining_quantity != null ? " (Stock: " + chosenBatch.remaining_quantity + ")" : ""}`,
    quantity,
    sellingPrice,
    units: product.units || ""
  });

  debugLog("🛒 Added to cart:", cart[cart.length - 1]);
  renderCart();
}

// -----------------------------
// Checkout: create order + items in two-step, roll back if items insert fails
// and decrement stock using RPC
// -----------------------------
async function checkoutOrder() {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }
  const supabase = await ensureSupabaseClient();
  try {
    const customerName = document.getElementById("customer-name")?.value || "";
    const saleDateInput = document.getElementById("sale-date")?.value;
    const saleDate = saleDateInput ? new Date(saleDateInput).toISOString() : new Date().toISOString();
    const total = cart.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.sellingPrice || 0), 0);

    debugLog("💳 Checking out order...", new Date().toISOString());

    // 1) insert order
    const { data: orderData, error: orderErr } = await supabase
      .from("customer_sales")
      .insert([{ customer_name: customerName, sale_date: saleDate, total }])
      .select()
      .single();

    if (orderErr) throw orderErr;
    debugLog("🆕 Order created:", orderData);

    // 2) prepare items payload
    const itemsPayload = cart.map(it => ({
      order_id: orderData.id,
      product_id: it.productId,
      batch_id: it.batchId,
      quantity: it.quantity,
      selling_price: it.sellingPrice
    }));

    // 3) insert items
    const { data: insertedItems, error: itemsErr } = await supabase
      .from("customer_sales_items")
      .insert(itemsPayload)
      .select();

    if (itemsErr) {
      // rollback - delete created order
      console.error("❌ Failed inserting items, rolling back order...", itemsErr);
      await supabase.from("customer_sales").delete().eq("id", orderData.id);
      throw itemsErr;
    }
    debugLog("📦 Items inserted:", insertedItems);

    // 4) decrement stock for each batch via RPC
    for (const it of itemsPayload) {
      try {
        const { error: rpcErr } = await supabase.rpc("decrement_remaining_quantity", { p_batch_id: it.batch_id, p_quantity: it.quantity });
        if (rpcErr) {
          console.error("❌ Failed to decrement stock for batch", it.batch_id, rpcErr);
          // not throwing here to allow other updates to continue; you can choose to fail hard instead
        } else {
          debugLog("✅ Decremented batch", it.batch_id, "by", it.quantity);
        }
      } catch (rpcEx) {
        console.error("RPC error:", rpcEx);
      }
    }

    // success
    cart = []; // clear cart
    renderCart();
    loadCustomerSales(); // refresh list

    // show receipt
    showReceipt(orderData.id);

  } catch (err) {
    console.error("❌ checkoutOrder failed:", err);
    alert("Checkout failed: " + (err.message || JSON.stringify(err)));
  }
}


// --------------------
// 📊 Loaders per page
// --------------------

// -----------------------------
// Load customer sales (for table)
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
    tbody.innerHTML = "";

    for (const sale of sales || []) {
      // count items
      const { data: items, error: itemsErr } = await supabase
        .from("customer_sales_items")
        .select("quantity")
        .eq("order_id", sale.id);

      let itemCount = 0;
      if (!itemsErr && items) itemCount = items.reduce((s, it) => s + (it.quantity || 0), 0);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2 text-blue-600 cursor-pointer" onclick="showReceipt(${sale.id})">#${sale.id}</td>
        <td class="border p-2">${itemCount}</td>
        <td class="border p-2">${(Number(sale.total) || 0).toFixed(2)}</td>
        <td class="border p-2">${shortDate(sale.sale_date)}</td>
        <td class="border p-2">${sale.customer_name || ""}</td>
        <td class="border p-2"><button class="bg-gray-200 px-2 py-1 rounded" onclick="showReceipt(${sale.id})">Receipt</button></td>
      `;
      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error("❌ loadCustomerSales failed:", err);
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
async function loadProducts(onlyInStock = false) {
  console.log("📦 Loading products...");
  const supabase = await ensureSupabaseClient();

  // 1️⃣ Fetch all products
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, barcode, price, vendor_id, batch_no, units")
    .order("id", { ascending: true });

  if (prodErr) {
    console.error("❌ loadProducts failed:", prodErr);
    return;
  }
  console.log(`✅ Products loaded: (${products.length})`, products);

  // 2️⃣ Fetch vendors (so we can map vendor_id → name)
  const { data: vendors, error: vendorErr } = await supabase
    .from("vendors")
    .select("id, name");
  if (vendorErr) {
    console.error("❌ Failed to load vendors for join:", vendorErr);
    return;
  }

  // 3️⃣ Map vendor ID → name for easy lookup
  const vendorMap = {};
  vendors.forEach(v => (vendorMap[v.id] = v.name));

  // 4️⃣ Optionally fetch batch info (remaining quantities)
  const { data: batches, error: batchErr } = await supabase
    .from("product_batches")
    .select("product_id, batch_number, remaining_quantity");
  if (batchErr) {
    console.warn("⚠️ Failed to load product_batches:", batchErr.message);
  }

  // Build a map from product_id → total remaining quantity
  const remainingMap = {};
  if (batches && batches.length > 0) {
    batches.forEach(b => {
      if (!remainingMap[b.product_id]) remainingMap[b.product_id] = 0;
      remainingMap[b.product_id] += b.remaining_quantity || 0;
    });
  }

  // 5️⃣ Render table
  const tbody = document.getElementById("products-body");
  if (!tbody) {
    console.warn("⚠️ #products-body not found in DOM");
    return;
  }

  tbody.innerHTML = "";

  // Apply filter if user selected “Show Only In-Stock”
  let filtered = products;
  if (onlyInStock) {
    filtered = products.filter(p => (remainingMap[p.id] || 0) > 0);
  }

  if (filtered.length === 0) {
    tbody.innerHTML =
      `<tr><td colspan="8" class="text-center p-2 text-gray-500">No products found</td></tr>`;
    return;
  }

  filtered.forEach(p => {
    const vendorName = vendorMap[p.vendor_id] || "(No Vendor)";
    const remaining = remainingMap[p.id] ?? 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${p.id}</td>
      <td class="border p-2">${p.name}</td>
      <td class="border p-2">${p.barcode}</td>
      <td class="border p-2">${parseFloat(p.price).toFixed(2)}</td>
      <td class="border p-2">${p.units}</td>
      <td class="border p-2">${vendorName}</td>
      <td class="border p-2">${p.batch_no || ""}</td>
      <td class="border p-2">${remaining}</td>
      <td class="border p-2 space-x-2">
        <button class="bg-blue-500 text-white px-2 py-1 rounded" onclick="showAdjustProduct(${p.id})">Adjust</button>
        <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="removeProduct(${p.id})">Remove</button>
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



// =========================================================
// Products Management
// =========================================================

// Add new product with initial quantity
// Add Product (includes creating initial batch)
// Add Product (auto validates and creates initial stock batch)
async function addProduct(event) {
  event.preventDefault();
  const supabase = ensureSupabaseClient();

  const name = document.getElementById("name").value.trim();
  const barcode = document.getElementById("barcode").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const units = document.getElementById("units").value;
  const vendor_id = parseInt(document.getElementById("vendor").value);
  const quantity = parseInt(document.getElementById("quantity").value);

  if (!vendor_id) return alert("Please select a vendor.");

  const { data: product, error: pErr } = await supabase
    .from("products")
    .insert([{ name, barcode, price, units, vendor_id }])
    .select()
    .maybeSingle();
  if (pErr || !product) {
    console.error("❌ addProduct failed (products):", pErr);
    alert("Failed to insert product");
    return;
  }

  const batchNo = "BN" + Date.now().toString().slice(-10);
  const { error: bErr } = await supabase.from("product_batches").insert([
    {
      product_id: product.id,
      vendor_id,
      buy_in_price: price,
      remaining_quantity: quantity,
      batch_number: batchNo.slice(0, 12),
    },
  ]);
  if (bErr) {
    console.error("❌ addProduct failed (batch):", bErr);
    alert("Failed to create product batch");
    return;
  }

  alert("✅ Product added successfully");
  event.target.reset();
  loadProducts();
}


/* ---------------- VENDORS ---------------- */
// 🧩 Debug-friendly version of loadVendors()
async function loadVendors() {
  console.log("📦 Loading vendors...");
  const supabase = await ensureSupabaseClient();

  // 🔹 Fetch vendors with all key fields
  const { data: vendors, error } = await supabase
    .from("vendors")
    .select("id, name, contact, phone_number, address")
    .order("id", { ascending: true });

  if (error) {
    console.error("❌ loadVendors failed:", error);
    return;
  }

  console.log(`✅ Vendors loaded: (${vendors.length})`, vendors);

  // =============== 🧱 Manage Vendors Page ===============
  const tableBody = document.querySelector("#vendors-table tbody");
  if (tableBody) {
    console.log("🔹 Populating vendor table...");
    tableBody.innerHTML = "";

    if (vendors.length === 0) {
      tableBody.innerHTML =
        `<tr><td colspan="6" class="text-center text-gray-500 p-2">No vendors found</td></tr>`;
    } else {
      vendors.forEach(v => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="border p-2">${v.id}</td>
          <td class="border p-2">${v.name}</td>
          <td class="border p-2">${v.contact || ""}</td>
          <td class="border p-2">${v.phone_number || ""}</td>
          <td class="border p-2">${v.address || ""}</td>
          <td class="border p-2 text-center">
            <button onclick="removeVendor(${v.id})"
                    class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Remove</button>
          </td>`;
        tableBody.appendChild(tr);
      });
    }
  } else {
    console.log("ℹ️ Not on Manage Vendors page (table not found)");
  }

  // =============== 🧱 Manage Products Page ===============
  const vendorSelect = document.getElementById("vendor");
  if (vendorSelect) {
    console.log("🔹 Populating vendor dropdown...");
    vendorSelect.innerHTML = `<option value="">-- Select Vendor --</option>`;

    vendors.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = v.name;
      vendorSelect.appendChild(opt);
    });

    console.log(`✅ Vendor dropdown populated with ${vendors.length} options`);
  } else {
    console.log("ℹ️ Not on Manage Products page (vendor select not found)");
  }

  console.log("🎯 loadVendors() completed");
}

// --- delete vendor ---
async function deleteVendor(id) {
  if (!confirm("Delete this vendor?")) return;
  const supabase = ensureSupabaseClient();
  const { error } = await supabase.from("vendors").delete().eq("id", id);
  if (error) console.error(error);
  loadVendors();
}


// --- remove product ---
async function removeProduct(id) {
  if (!confirm("Delete this product?")) return;
  const supabase = ensureSupabaseClient();
  await supabase.from("products").delete().eq("id", id);
  loadProducts();
}

// --- adjust product modal ---
function showAdjustProduct(id, price, units, qty) {
  document.getElementById("adjust-id").value = id;
  document.getElementById("adjust-price").value = price;
  document.getElementById("adjust-units").value = units;
  document.getElementById("adjust-qty").value = qty;
  document.getElementById("adjust-modal").classList.remove("hidden");
}
function hideAdjustProduct() {
  document.getElementById("adjust-modal").classList.add("hidden");
}

// Apply Adjust (safe for varchar(12) batch_number)
async function applyAdjustProduct() {
  const supabase = ensureSupabaseClient();
  const id = parseInt(document.getElementById("adjust-id").value);
  const price = parseFloat(document.getElementById("adjust-price").value);
  const units = document.getElementById("adjust-units").value;
  const qty = parseInt(document.getElementById("adjust-qty").value);

  const { error: pErr } = await supabase.from("products").update({ price, units }).eq("id", id);
  if (pErr) {
    console.error("❌ applyAdjustProduct failed (product):", pErr);
    alert("Failed to update product");
    return;
  }

  const { data: batch } = await supabase.from("product_batches").select("id").eq("product_id", id).maybeSingle();
  if (batch) {
    const { error: bErr } = await supabase
      .from("product_batches")
      .update({ remaining_quantity: qty })
      .eq("id", batch.id);
    if (bErr) console.error("❌ batch update failed:", bErr);
  }

  hideAdjustProduct();
  alert("✅ Product updated successfully");
  loadProducts();
}


async function addVendor(event) {
  event.preventDefault();
  const supabase = ensureSupabaseClient();
  const name = document.getElementById("vendor-name").value.trim();
  const contact = document.getElementById("vendor-contact").value.trim();
  const phone_number = document.getElementById("vendor-phone").value.trim();

  if (!name) return alert("Vendor name required.");

  const { error } = await supabase.from("vendors").insert([
    { name, contact, phone_number, contact_email: "", address: "" },
  ]);

  if (error) {
    console.error("❌ addVendor failed:", error);
    if (error.message.includes("duplicate key"))
      alert("⚠️ Vendor name already exists.");
    else alert("Failed adding vendor");
    return;
  }

  alert("✅ Vendor added successfully");
  event.target.reset();
  loadVendors();
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

  // add item button
  const addBtn = document.getElementById("add-item");
  if (addBtn) addBtn.addEventListener("click", addItemToCart);
  // wire addItemToCart wrapper to collect user inputs
  async function addItemToCart(e) {
    e?.preventDefault();
    await addItemToCart_core();
  }
  // keep a core function named differently to avoid confusion
  async function addItemToCart_core() {
    await addItemToCart_actual();
  }
  // actual add (kept modular)
  async function addItemToCart_actual() {
    await addItemToCart_internal();
  }
  // internal function that calls the real addItemToCart implementation above
  async function addItemToCart_internal() {
    await addItemToCartImpl();
  }
  // finally: the real implementation (to avoid duplicate function names across versions)
  async function addItemToCartImpl() {
    await addItemToCartReal();
  }
  async function addItemToCartReal() {
    // fallback to global addItemToCart
    return addItemToCart ? await addItemToCart() : null;
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
});
