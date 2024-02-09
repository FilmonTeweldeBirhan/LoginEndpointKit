const multer = require("multer");
const APPError = require("./APPError");

/* ==============================
   =====MULTER CONFIGURATION=====
   ============================== */
// Choose multerStorage
const multerStorage = multer.memoryStorage();

// Filter Files
const multerFilter = (req, file, cb) => {
  // Check if the file is an image if not send an error!
  if (!file.mimetype.startsWith("image")) {
    return cb(
      new APPError("Invalid file, please provide images only.", 400),
      false
    );
  }

  // if the file is an image send it through!
  cb(null, true);
};

// Configure the multer using the multerStorage and multerFilter

module.exports = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
