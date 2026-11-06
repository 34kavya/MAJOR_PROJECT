const Listing=require("./models/listing");
const Review=require("./models/reviews");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        //created a property in session to store the url that user was trying to access before login
        req.session.redirectUrl=req.originalUrl;

        req.flash("error","You must be logged in first");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner= async(req,res,next)=>{
     let {id}=req.params;
        let lisitng=await Listing.findById(id);
        if(!lisitng.owner.equals(res.locals.currUser._id)){
            req.flash("error","You don't have permission to edit this listing!");
            return res.redirect(`/listings/${id}`);
                }
                next();
            }

module.exports.isAuthor= async(req,res,next)=>{
     let {id,reviewId}=req.params;
        let review=await Review.findById(reviewId);
        if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }
        if(!review.author.equals(res.locals.currUser._id)){
            req.flash("error","You are not the author of this review!");
            return res.redirect(`/listings/${id}`);
                }
                next();
            }