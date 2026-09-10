const express = require("express")
const router = express.Router()
const wrapAsync = require("../Utils/wrapAsync.js")
const {listingSchema,reviewSchema} = require("../schema.js")
const ExpressError = require("../Utils/ExpressError.js")
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middlewar.js")
const { isOwner } = require("../middlewar.js")
const listingController = require("../controllers/listing.js")
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({storage })


const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

router.get("/search", wrapAsync(listingController.searchListings));

router.get("/", wrapAsync(listingController.index))


router.get("/new",isLoggedIn, listingController.newListing)

router.get("/:id", wrapAsync(listingController.showListing));

// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.addListing))
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.addListing)
);

router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editListing));

router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),   // 👈 এটা যোগ করুন
  validateListing,
  wrapAsync(listingController.updatedListing)
);

router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.deleteListing))

module.exports = router