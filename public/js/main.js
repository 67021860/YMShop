// ===== Cart Page Logic (for current cart.ejs) =====
(function () {
  const cartList = document.getElementById("cartList");
  if (!cartList) return; // ไม่ใช่หน้าตะกร้า

  const checkAll = document.getElementById("checkAll");
  const totalText = document.getElementById("totalText");
  const selectedIdsInput = document.getElementById("selectedIds");
  const checkoutForm = document.getElementById("checkoutForm");

  function money(n) {
    return (Number(n) || 0).toFixed(2);
  }

  function getRows() {
    return Array.from(document.querySelectorAll(".cart-item"));
  }

  function calc() {
    const rows = getRows();
    let total = 0;
    const selectedIds = [];

    rows.forEach((row) => {
      const checked = row.querySelector(".selectItem")?.checked;
      const price = Number(row.dataset.price || 0);
      const qty = Number(row.querySelector(".qtyText")?.textContent || 0);

      if (checked) {
        total += price * qty;
        selectedIds.push(row.dataset.cartId);
      }
    });

    totalText.textContent = money(total);
    selectedIdsInput.value = selectedIds.join(",");

    // ถ้าไม่ได้เลือกอะไร ห้าม submit
    if (checkoutForm) {
      const btn = checkoutForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = selectedIds.length === 0 || total <= 0;
    }
  }

  async function updateQty(cartItemId, newQty) {
    const res = await fetch("/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId, qty: newQty }),
    });

    if (!res.ok) {
      const t = await res.text();
      alert("อัปเดตตะกร้าไม่สำเร็จ\n" + t);
      return false;
    }
    return true;
  }

  // เริ่มต้น: ยังไม่ติ๊กอะไร → total = 0
  getRows().forEach((row) => {
    const cb = row.querySelector(".selectItem");
    if (cb) cb.checked = false;
  });
  if (checkAll) {
    checkAll.checked = false;
    checkAll.indeterminate = false;
  }
  calc();

  // เลือกทั้งหมด
  if (checkAll) {
    checkAll.addEventListener("change", () => {
      const v = checkAll.checked;
      getRows().forEach((row) => {
        const cb = row.querySelector(".selectItem");
        if (cb) cb.checked = v;
      });
      calc();
    });
  }

  // events รายชิ้น
  cartList.addEventListener("change", (e) => {
    if (!e.target.classList.contains("selectItem")) return;

    const rows = getRows();
    const allChecked = rows.length > 0 && rows.every((r) => r.querySelector(".selectItem")?.checked);
    const anyChecked = rows.some((r) => r.querySelector(".selectItem")?.checked);

    if (checkAll) {
      checkAll.checked = allChecked;
      checkAll.indeterminate = !allChecked && anyChecked;
    }
    calc();
  });

  // ปุ่ม +/- (ใช้ event delegation)
  cartList.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const row = btn.closest(".cart-item");
    if (!row) return;

    const cartItemId = Number(row.dataset.cartId);
    const qtyEl = row.querySelector(".qtyText");
    if (!qtyEl) return;

    let q = Number(qtyEl.textContent || 0);
    if (!Number.isFinite(q)) q = 0;

    if (btn.classList.contains("minus")) {
      if (q <= 0) return;
      q -= 1;

      const ok = await updateQty(cartItemId, q);
      if (!ok) return;

      if (q === 0) {
        row.remove();
      } else {
        qtyEl.textContent = String(q);
      }
      // หลังลบ/ลด qty ต้องอัปเดต checkAll และ total
      const rows = getRows();
      const allChecked = rows.length > 0 && rows.every((r) => r.querySelector(".selectItem")?.checked);
      const anyChecked = rows.some((r) => r.querySelector(".selectItem")?.checked);
      if (checkAll) {
        checkAll.checked = allChecked;
        checkAll.indeterminate = !allChecked && anyChecked;
      }
      calc();
    }

    if (btn.classList.contains("plus")) {
      q += 1;

      const ok = await updateQty(cartItemId, q);
      if (!ok) return;

      qtyEl.textContent = String(q);
      calc();
    }
  });

  // กัน submit ถ้าไม่ได้เลือกอะไร
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      const ids = (selectedIdsInput.value || "").trim();
      if (!ids) {
        e.preventDefault();
        alert("กรุณาเลือกสินค้าก่อนชำระเงิน");
      }
    });
  }
})();
