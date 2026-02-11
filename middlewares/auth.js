function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.flash = { type: "error", message: "กรุณาเข้าสู่ระบบก่อน" };
    return res.redirect("/login");
  }
  next();
}

module.exports = { requireAuth };
