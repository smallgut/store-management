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
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdWR1eWdtY3NwaXFhdWhyYWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTM5MzAsImV4cCI6MjA2MDgyOTkzMH0.s8WMvYdE9csSb1xb6jv84aiFBBU_LpDi1aserTQDg-k"
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
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// ---------------------------------------------------------
// 📦 Products + Batches
// ---------------------------------------------------------
async function populateProductDropdown() {
  const supabase = await ensureSupabaseClient();
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    console.error("❌ Failed to fetch products:", error);
    return;
  }
  console.log("📦 Products for dropdown:", data);
  const select = document.getElementById("product-select");
  if (select) {
    select.innerHTML = "<option value=''>-- Select Product --</option>";
    data.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.barcode})`;
      select.appendChild(opt);
    });
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

async function handleProductSelection(e) {
  const productId = e.target.value;
  if (!productId) return;
  console.log("📌 handleProductSelection triggered for ID:", productId);
  await loadProductAndBatches(productId, false);
}

async function loadProductAndBatches(productId, byBarcode) {
  const supabase = await ensureSupabaseClient();
  console.log("🔍 loadProductAndBatches called with:", productId, "byBarcode:", byBarcode);

  const { data: product, error: productError } = await supabase.from("products").select("*").eq("id", productId).single();
  if (productError || !product) {
    console.error("❌ Failed to load product:", productError);
    return;
  }
  console.log("✅ Product loaded:", product);

  const { data: batches, error: batchError } = await supabase.from("product_batches").select("*").eq("product_id", product.id);
  if (batchError) {
    console.error("❌ Failed to load batches:", batchError);
    return;
  }
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
    document.getElementById("stock-display").textContent = `Stock: ${batches[0].remaining_quantity}`;
  }
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
  const supabase = await ensureSupabaseClient();

  try {
    console.log("💳 Checking out order...", new Date().toISOString());

    const customerName = document.getElementById("customer-name").value.trim() || null;
    const saleDate = document.getElementById("sale-date").value || new Date().toISOString();

    if (!cart.length) {
      alert("Cart is empty!");
      return;
    }

    // 1️⃣ Insert into customer_sales
    const totalCost = cart.reduce((sum, item) => sum + (item.subTotal || 0), 0);
    const { data: sale, error: saleError } = await supabase
      .from("customer_sales")
      .insert([
        {
          customer_name: customerName,
          sale_date: saleDate,
          total: totalCost
        }
      ])
      .select()
      .single();

    if (saleError) throw saleError;
    console.log("🆕 Order created:", sale);

    // 2️⃣ Insert items into customer_sales_items
    const itemsPayload = cart.map(item => ({
      order_id: sale.id,
      product_id: item.productId,
      batch_id: item.batchId,
      quantity: item.quantity,
      selling_price: item.price,
      // sub_total will auto-generate in DB
    }));

    const { error: itemsError } = await supabase
      .from("customer_sales_items")
      .insert(itemsPayload);

    if (itemsError) {
      console.error("❌ Failed inserting items, rolling back order...");
      // rollback the order if items insert fails
      await supabase.from("customer_sales").delete().eq("id", sale.id);
      throw itemsError;
    }

    console.log("✅ Items inserted for order:", sale.id);

    // 3️⃣ Clear cart + refresh
    cart = [];
    renderCart();
    loadCustomerSales();
    alert(`Order #${sale.id} completed successfully ✅`);

  } catch (err) {
    console.error("❌ checkoutOrder failed:", err);
    alert("Failed to complete order: " + (err.message || err));
  }
}

// ---------------------------------------------------------
// 📊 Load Customer Sales
// ---------------------------------------------------------
async function loadCustomerSales() {
  const supabase = await ensureSupabaseClient();
  console.log("📦 Loading customer sales...");
  const { data: sales, error } = await supabase.from("customer_sales").select("*").order("id", { ascending: false });
  if (error) {
    console.error("❌ Failed to load customer sales:", error);
    return;
  }
  console.log("✅ Customer sales loaded:", sales);

  const tbody = document.getElementById("customer-sales-body");
  tbody.innerHTML = "";
  for (const s of sales) {
    const { count, error: itemError } = await supabase.from("customer_sales_items").select("id", { count: "exact", head: true }).eq("order_id", s.id);
    if (itemError) console.error("❌ Failed to count items:", itemError);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${s.id}</td>
      <td class="border p-2">${count || 0}</td>
      <td class="border p-2">${s.total ? parseFloat(s.total).toFixed(2) : "0.00"}</td>
      <td class="border p-2">${formatDate(s.sale_date)}</td>
      <td class="border p-2">${s.customer_name}</td>
      <td class="border p-2">
        <button onclick="showReceipt(${s.id})">View</button>
        <button onclick="printReceipt(${s.id})">Print</button>
      </td>
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
