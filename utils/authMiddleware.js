exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  res.status(401).json({
    status: "fail",
    message: "Please login first to get access to this resource.",
  });
};

exports.isNotAuth = (req, res, next) => {
  if (!req.isAuthenticated()) return next();

  res.redirect("/");
};
