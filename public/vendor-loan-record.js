// ---------------------------
// vendor-loan-record.js
// ---------------------------

document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 vendor-loan-record.js loaded.");

    const barcodeInput = document.getElementById("product-barcode");
    if (barcodeInput) {
        barcodeInput.addEventListener("keypress", handleVendorLoanBarcode);
    }

    const productSelect = document.getElementById("product-select");
    if (productSelect) {
        productSelect.addEventListener("change", handleVendorLoanProductSelect);
    }
});

/* ---------------------------------------------------------
   A. BARCODE → Load product & batches
   (NEVER auto-add anything)
---------------------------------------------------------- */
async function handleVendorLoanBarcode(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const barcode = e.target.value.trim();
    if (!barcode) return;

    try {
        const supabase = await ensureSupabaseClient();

        const { data: product } = await supabase
            .from("products")
            .select("id, name, barcode, price")
            .eq("barcode", barcode)
            .limit(1)
            .maybeSingle();

        if (!product) {
            document.getElementById("stock-display").textContent = "Product not found";
            return;
        }

        // Load batches
        const res = await loadProductAndBatches(product.id, false);

        // Update dropdown
        const productSelect = document.getElementById("product-select");
        if (productSelect) productSelect.value = product.id;

        const priceInput = document.getElementById("selling-price");
        if (priceInput) priceInput.value = product.price || 0;

        // Apply batch handling
        applyVendorBatchLogic(res);

        // Clear barcode field
        e.target.value = "";

    } catch (error) {
        console.error("handleVendorLoanBarcode error:", error);
    }
}

/* ---------------------------------------------------------
   B. PRODUCT SELECT → Load batches
---------------------------------------------------------- */
async function handleVendorLoanProductSelect(e) {
    const productId = e.target.value;
    if (!productId) return;

    const res = await loadProductAndBatches(productId, false);
    applyVendorBatchLogic(res);
}

/* ---------------------------------------------------------
   Batch logic for Vendor Loan Page
---------------------------------------------------------- */
function applyVendorBatchLogic(res) {
    const batchEl = document.getElementById("batch-no");
    const stockDisplay = document.getElementById("stock-display");

    if (!batchEl) return;

    batchEl.innerHTML = "";

    let batches = res?.batches || [];

// 🔥 Filter out zero-stock batches
batches = batches.filter(b => (b.remaining_quantity ?? 0) > 0);

// Populate filtered dropdown
batchEl.innerHTML = batches
    .map(b => `<option value="${b.id}">${b.batch_number} (Stock: ${b.remaining_quantity})</option>`)
    .join("");

    // Auto-select only if EXACTLY 1 batch
    if (batches.length === 1) {
        batchEl.value = batches[0].id;
    } else {
        batchEl.insertAdjacentHTML(
            "afterbegin",
            `<option value="" disabled selected>-- Select Batch No. --</option>`
        );
    }

    // Update stock text
    if (stockDisplay) {
        const total = batches.reduce((s, b) => s + (b.remaining_quantity || 0), 0);
        stockDisplay.textContent = `Stock: ${total}`;
    }
}
