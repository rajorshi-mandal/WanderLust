const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    // console.log(result);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//Reviews
//Post Review Route
router.post("/", 
    validateReview, 
    wrapAsync(
        async (req,res) => {
            console.log(req.params.id); //needed mergeParams here to work since in express router object the paramaters matched stayed in the app,js but later paramters are pased on to the other routes but we need here the params so we will merge them to send to other routes as well
            let listing = await Listing.findById(req.params.id);
            let newReview = new Review(req.body.review);

            listing.reviews.push(newReview);
            await newReview.save();
            await listing.save();

            // console.log("New Review Saved");
            // res.send("New Review Saved");

            res.redirect(`/listings/${listing._id}`);
}));

//Delete Review Route
router.delete("/:reviewId",
    wrapAsync(
        async (req,res) => {
            let {id, reviewId} = req.params;
            await Listing.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});
            await Review.findByIdAndDelete(reviewId);

            res.redirect(`/listings/${id}`);
        }
    )
);

module.exports = router;