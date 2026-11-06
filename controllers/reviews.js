const Listing = require("../models/listing");
const Review = require("../models/reviews");


module.exports.createReview=async(req,res)=>{
    console.log("--> POST review route hit");
    console.log("req.body:", req.body);
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);  
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("--> Review saved, redirecting...");
    req.flash("success","Review Added!");
    res.redirect(`/listings/${listing._id}`);

}

module.exports.deleteReview=async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}