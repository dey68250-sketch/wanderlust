const mongoose = require('mongoose');
const review = require('./review.js');

let listSchema = mongoose.Schema({
    title:{
        type : String,
        required : true
    },
    description: {
        type: String
    },
    image: {
        url: {
            type: String,
            default: "https://getwallpapers.com/wallpaper/full/7/4/3/800111-widescreen-spring-nature-wallpaper-2592x1620.jpg",
            set: (v) => v === "" 
                ? "https://getwallpapers.com/wallpaper/full/7/4/3/800111-widescreen-spring-nature-wallpaper-2592x1620.jpg" 
                : v
        },
        filename: {
            type: String,
            default: "listingimage"
        }
    },
    price: {
        type: Number,
        required: true,
    },
    location: String,
    country: String,
    reviews : [
        {
           type :  mongoose.Schema.Types.ObjectId,
           ref : "Review",
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

listSchema.post("findOneAndDelete", async(listing) => {
    if(listing) {
        await review.deleteMany({_id:{ $in : listing.reviews}})
    }
})

const Listing = mongoose.model("Listing", listSchema);

module.exports = Listing