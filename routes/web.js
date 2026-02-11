// routes/web.js
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db/db");
const { requireAuth } = require("../middlewares/auth");

const router = express.Router();

/** flash helper (ต้องมี middleware ใน app.js ที่อ่าน req.session.flash ไปแสดงบนหน้า) */
function flash(req, type, message) {
  req.session.flash = { type, message };
}

/** Root */
router.get("/", (req, res) => {
  if (req.session.user) return res.redirect("/categories");
  return res.redirect("/login");
});

/** =========================
 *  AUTH
 *  ========================= */

/** Login page */
router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/categories");
  res.render("login", { title: "เข้าสู่ระบบ" });
});

/** Login action */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      flash(req, "error", "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return res.redirect("/login");
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) {
      flash(req, "error", "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      return res.redirect("/login");
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      flash(req, "error", "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      return res.redirect("/login");
    }

    req.session.user = { id: user.id, username: user.username };
    flash(req, "success", "เข้าสู่ระบบสำเร็จ");
    return res.redirect("/categories");
  } catch (err) {
    console.error(err);
    flash(req, "error", "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    return res.redirect("/login");
  }
});

/** Register page */
router.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/categories");
  res.render("register", { title: "สมัครสมาชิก" });
});

/** Register action */
router.post("/register", async (req, res) => {
  try {
    const { username, password, confirm_password } = req.body;

    const usernameRe = /^[a-z][a-z0-9_]{3,19}$/i;
    if (!usernameRe.test(username || "")) {
      flash(req, "error", "Username ต้องขึ้นต้นด้วยตัวอักษร และยาว 4-20 (a-z,0-9,_)");
      return res.redirect("/register");
    }
    if (!password || password.length < 6 || password.length > 30) {
      flash(req, "error", "รหัสผ่านต้องยาว 6-30 ตัวอักษร");
      return res.redirect("/register");
    }
    if (password !== confirm_password) {
      flash(req, "error", "ยืนยันรหัสผ่านไม่ตรงกัน");
      return res.redirect("/register");
    }

    const [exists] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
    if (exists.length > 0) {
      flash(req, "error", "ชื่อผู้ใช้นี้ถูกใช้แล้ว");
      return res.redirect("/register");
    }

    const password_hash = await bcrypt.hash(password, 10);

    // ต้องมีคอลัมน์ balance ใน users (คุณมีแล้ว เพราะเคยขึ้น duplicate column balance)
    await pool.query(
      "INSERT INTO users (username, password_hash, balance) VALUES (?,?,0)",
      [username, password_hash]
    );

    flash(req, "success", "สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
    return res.redirect("/login");
  } catch (err) {
    console.error(err);
    flash(req, "error", "เกิดข้อผิดพลาดในการสมัครสมาชิก");
    return res.redirect("/register");
  }
});

/** Logout */
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

/** =========================
 *  HELPERS
 *  ========================= */
async function getBalance(userId) {
  const [rows] = await pool.query("SELECT balance FROM users WHERE id = ?", [userId]);
  return Number(rows[0]?.balance ?? 0);
}

/** =========================
 *  CATEGORIES / PRODUCTS
 *  ========================= */

/** Categories (หน้าแรกหลัง login) */
router.get("/categories", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const balance = await getBalance(userId);
    const [categories] = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.render("categories", { title: "หมวดหมู่", categories, balance });
  } catch (e) {
    console.error(e);
    flash(req, "error", "โหลดหมวดหมู่ไม่สำเร็จ");
    res.redirect("/login");
  }
});

/** Products in category */
router.get("/category/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const balance = await getBalance(userId);

    const categoryId = Number(req.params.id);
    const [[category]] = await pool.query("SELECT * FROM categories WHERE id = ?", [categoryId]);
    if (!category) {
      flash(req, "error", "ไม่พบหมวดหมู่");
      return res.redirect("/categories");
    }

    const [products] = await pool.query(
      "SELECT * FROM products WHERE category_id = ? ORDER BY id ASC",
      [categoryId]
    );

    res.render("products", { title: category.name, category, products, balance });
  } catch (e) {
    console.error(e);
    flash(req, "error", "โหลดสินค้าไม่สำเร็จ");
    res.redirect("/categories");
  }
});

/** =========================
 *  CART
 *  ========================= */

/** Add to cart (เพิ่ม/สะสมจำนวน) */
router.post("/cart/add", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const productId = Number(req.body.product_id);
    const qty = Math.max(1, Number(req.body.qty || 1));

    if (!Number.isFinite(productId) || productId <= 0) {
      flash(req, "error", "สินค้าไม่ถูกต้อง");
      return res.redirect(req.get("referer") || "/categories");
    }

    // ต้องมี UNIQUE KEY (user_id, product_id) ในตาราง cart_items เพื่อให้ ON DUPLICATE KEY ใช้ได้
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, qty)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)`,
      [userId, productId, qty]
    );

    flash(req, "success", "หยิบใส่ตะกร้าแล้ว ✅");
    res.redirect(req.get("referer") || "/categories");
  } catch (err) {
    console.error(err);
    flash(req, "error", "เพิ่มลงตะกร้าไม่สำเร็จ");
    res.redirect("/categories");
  }
});

/** Cart page */
router.get("/cart", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const balance = await getBalance(userId);

    const [items] = await pool.query(
      `SELECT 
          ci.id AS cart_id,
          ci.qty,
          p.id AS product_id,
          p.name,
          p.price,
          p.image_url
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.id ASC`,
      [userId]
    );

    // ✅ ตามที่คุณขอ: ยังไม่เลือกสินค้าก็ "ไม่ต้องรวมยอด"
    // ให้หน้า cart.ejs / main.js เป็นคนคำนวณจาก checkbox ทีหลัง
    const total = 0;

    res.render("cart", { title: "ตะกร้า", items, total, balance });
  } catch (e) {
    console.error(e);
    flash(req, "error", "โหลดตะกร้าไม่สำเร็จ");
    res.redirect("/categories");
  }
});

/**
 * Update qty ในตะกร้า (สำหรับปุ่ม + / - ใน cart)
 * body: { cartItemId, qty }
 * qty = 0 จะลบแถวทิ้ง
 */
router.post("/cart/update", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const cartItemId = Number(req.body.cartItemId);
    const qty = Number(req.body.qty);

    if (!Number.isFinite(cartItemId) || cartItemId <= 0) {
      return res.status(400).json({ ok: false, message: "cartItemId invalid" });
    }
    if (!Number.isFinite(qty) || qty < 0) {
      return res.status(400).json({ ok: false, message: "qty invalid" });
    }

    if (qty === 0) {
      await pool.query("DELETE FROM cart_items WHERE id = ? AND user_id = ?", [cartItemId, userId]);
      return res.json({ ok: true });
    }

    await pool.query("UPDATE cart_items SET qty = ? WHERE id = ? AND user_id = ?", [
      qty,
      cartItemId,
      userId,
    ]);

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "server error" });
  }
});

/** =========================
 *  CHECKOUT
 *  =========================
 *  รับ selectedIds จากฟอร์ม/JS เช่น "1,2,3"
 *  ชำระเฉพาะรายการที่เลือก
 */
router.post("/checkout", requireAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.session.user.id;
    const username = req.session.user.username || "";

    const selectedIds = (req.body.selectedIds || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0);

    if (selectedIds.length === 0) {
      // ไม่เลือกอะไร -> ไม่ให้ชำระ
      return res.send(`<script>alert('กรุณาเลือกสินค้าที่ต้องการชำระเงิน'); location.href='/cart';</script>`);
    }

    await conn.beginTransaction();

    // lock รายการตะกร้าที่เลือก
    const [items] = await conn.query(
      `SELECT ci.id, ci.product_id, ci.qty, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ? AND ci.id IN (?)
       FOR UPDATE`,
      [userId, selectedIds]
    );

    if (items.length === 0) {
      await conn.rollback();
      return res.send(`<script>alert('ไม่พบสินค้าที่เลือก'); location.href='/cart';</script>`);
    }

    const total = items.reduce((s, it) => s + Number(it.qty) * Number(it.price), 0);

    // lock ยอดเงิน user
    const [[u]] = await conn.query("SELECT balance FROM users WHERE id = ? FOR UPDATE", [userId]);
    const balance = Number(u?.balance ?? 0);

    if (balance < total) {
      await conn.rollback();
      return res.send(`<script>alert('ยอดเงินไม่พอ'); location.href='/topup';</script>`);
    }

    // หักเงิน
    await conn.query("UPDATE users SET balance = balance - ? WHERE id = ?", [total, userId]);

    /**
     * สำคัญ: คุณเคยเจอ error: Field 'fullname' doesn't have a default value
     * แปลว่าตาราง orders ของคุณ "น่าจะมี column fullname NOT NULL"
     * ดังนั้นเราใส่ fullname = username (แทนชื่อจริง) เพื่อไม่ให้ล่ม
     */
    let orderRes;
    try {
      // กรณี orders มี fullname
      [orderRes] = await conn.query(
        "INSERT INTO orders (user_id, total, fullname) VALUES (?,?,?)",
        [userId, total, username]
      );
    } catch (e) {
      // กรณี orders ไม่มี fullname
      [orderRes] = await conn.query("INSERT INTO orders (user_id, total) VALUES (?,?)", [
        userId,
        total,
      ]);
    }

    const orderId = orderRes.insertId;

    // order_items (พยายามรองรับทั้ง price_each และ price)
    for (const it of items) {
      try {
        await conn.query(
          "INSERT INTO order_items (order_id, product_id, qty, price_each) VALUES (?,?,?,?)",
          [orderId, it.product_id, it.qty, it.price]
        );
      } catch (e) {
        await conn.query(
          "INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?,?,?,?)",
          [orderId, it.product_id, it.qty, it.price]
        );
      }
    }

    // ลบเฉพาะที่ชำระออกจากตะกร้า
    await conn.query("DELETE FROM cart_items WHERE user_id = ? AND id IN (?)", [userId, selectedIds]);

    await conn.commit();
    return res.send(`<script>alert('ชำระเงินสำเร็จ ✅'); location.href='/history';</script>`);
  } catch (e) {
    console.error(e);
    try {
      await conn.rollback();
    } catch {}
    return res.status(500).send("server error");
  } finally {
    conn.release();
  }
});

/** =========================
 *  HISTORY
 *  ========================= */
router.get("/history", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const balance = await getBalance(userId);

    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    const orderIds = orders.map((o) => o.id);
    const itemsByOrder = {};

    if (orderIds.length > 0) {
      const [items] = await pool.query(
        `SELECT oi.*, p.name, p.image_url
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id IN (${orderIds.map(() => "?").join(",")})
         ORDER BY oi.id ASC`,
        orderIds
      );

      for (const it of items) {
        const oid = it.order_id;
        if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
        itemsByOrder[oid].push(it);
      }
    }

    res.render("history", { title: "ประวัติการซื้อ", orders, itemsByOrder, balance });
  } catch (e) {
    console.error(e);
    flash(req, "error", "โหลดประวัติไม่สำเร็จ");
    res.redirect("/categories");
  }
});

/** =========================
 *  TOPUP
 *  ========================= */
router.get("/topup", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const balance = await getBalance(userId);
    res.render("topup", { title: "เติมเงิน", balance });
  } catch (e) {
    console.error(e);
    res.redirect("/categories");
  }
});

router.post("/topup", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const amount = Number(req.body.amount || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      flash(req, "error", "กรุณากรอกจำนวนเงินให้ถูกต้อง");
      return res.redirect("/topup");
    }

    await pool.query("UPDATE users SET balance = balance + ? WHERE id = ?", [amount, userId]);
    flash(req, "success", `เติมเงินสำเร็จ +${amount.toFixed(2)} บาท`);
    return res.redirect("/categories");
  } catch (e) {
    console.error(e);
    flash(req, "error", "เติมเงินไม่สำเร็จ");
    return res.redirect("/topup");
  }
});

module.exports = router;
