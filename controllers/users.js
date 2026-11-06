
const User = require("../models/user.js");


module.exports.signup=async(req,res)=>{
   try{
     let{username,email,password}=req.body;
    const newuser=new User({username,email});
    await User.register(newuser,password);
    req.login(newuser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to Wanderlust");
    res.redirect("/listings");
    })
    
   } catch(e){
    req.flash("error",e.message);
    res.redirect("/signup");
   }
}

module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
}

module.exports.login=async(req,res)=>{
    req.flash("success","Welcome back!");
   res.redirect(res.locals.redirectUrl||"/listings");
}

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You have been logged out!");
        res.redirect("/listings");
    });
}