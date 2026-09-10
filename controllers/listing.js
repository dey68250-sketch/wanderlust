const Listing = require("../models/listing.js")

module.exports.index = async (req,res) => {
    const allListings = await Listing.find({})
    res.render("./listings/index.ejs",{allListings})
}

module.exports.newListing = (req,res) => {
    res.render("./listings/new.ejs")
}

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
        path: "author", // assumes Review model has an "author" ref to User
        },
    })
    .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing)
    res.render("./listings/show.ejs", { listing });
}

module.exports.addListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;

  newListing.image = {
    url: req.file.path,
    filename: req.file.filename,
  };

  await newListing.save();

  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("./listings/edit.ejs", { listing });
}

module.exports.updatedListing = module.exports.updatedListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req,res) =>{
    const {id} = req.params
    await Listing.findByIdAndDelete(id)
    res.redirect(`/listings`)
}

module.exports.searchListings = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    req.flash("error", "Please enter something to search for");
    return res.redirect("/listings");
  }

  const allListings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
    ],
  });

  if (allListings.length === 0) {
    req.flash("error", `No listings found for "${q}"`);
  }

  res.render("listings/index.ejs", { allListings, query: q });
};