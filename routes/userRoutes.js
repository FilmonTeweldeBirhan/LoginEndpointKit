const {
  uploadUserImage,
  resizeUserPhoto,
  signup,
  login,
  logout,
  getMe,
  updateMe,
  updateMyPassword,
  deleteMyAccount,
  forgotPassword,
  resetPassword,
  restrictTo,
  getAllUsers,
  getUser,
  deleteUser,
  getFileName,
  returnJsonFile,
} = require("./../controllers/userController");
const APPError = require("./../utils/APPError");

const { isAuth, isNotAuth } = require("./../utils/authMiddleware");

// const passport = require("passport");

const router = require("express").Router();

router.post(
  "/signup",
  uploadUserImage,
  getFileName,
  signup,
  resizeUserPhoto,
  returnJsonFile
);

router.post("/login", login);

router.get("/logout", logout);

router.patch("/forgotPassword", forgotPassword);

router.patch("/resetPassword", resetPassword);

/* ===========message routes controllers================ */
router.get("/success", (req, res) => {
  res.status(200).json({
    status: "logged in",
  });
});

router.get("/error", (req, res, next) => {
  // res.status(401).json({
  //   status: "Unauthurized",
  //   message: req.session.messages[0],
  // });
  next(new APPError(req.session.messages[0], 401));
});

router.use(isAuth);

router.get("/me", getMe);

router.patch(
  "/updateMe",
  uploadUserImage,
  getFileName,
  updateMe,
  resizeUserPhoto,
  returnJsonFile
);

router.patch("/updateMyPassword", updateMyPassword);

router.delete("/deleteMyAccount", deleteMyAccount);

// Only an admin can access routes from this point on!.
router.use(restrictTo("admin"));

router.get("/", getAllUsers);

router.route("/:userID").get(getUser).delete(deleteUser);

module.exports = router;
