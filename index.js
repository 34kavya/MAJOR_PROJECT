if(process.env.NODE_ENV!="production"){
require("dotenv").config();}

console.log(process.env.SECRET);


const express=require("express");
const app =express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

const ejsmate=require("ejs-mate");
app.engine("ejs",ejsmate); 
//to use static css,html files
app.use(express.static(path.join(__dirname,"public")));
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore=require('connect-mongo').default
const flash=require("connect-flash");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/reviews.js");
const listings=require("./routes/listing.js");
const review=require("./routes/review.js");
const reviews = require("./models/reviews.js");
const user=require("./routes/user.js"); 
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const port=8080;
const dbUrl=process.env.ATLASDB_URL;

main().catch(err => console.log(err));

main().then(()=>{
    console.log("Connected to database");
}).catch(err=>{
    console.log("Error connecting to database");
})
async function main() {
  await mongoose.connect(dbUrl);

}


app.listen(port,()=>{
    console.log("App is listening to port 8080");
})
const store=MongoStore.create({
    mongoUrl:dbUrl,
    touchAfter:24*60*60,
    crypto:{
        secret:process.env.SECRET
    }
});
store.on("error",function(e){
    console.log("Session store error",e);
})
const sessionOptions={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: "abc@gmail.com",
        username: "abc",
    });
    let registeredUser = await User.register(fakeUser, "abc123");
    res.send(registeredUser);
});

app.use("/listings",listings);
app.use("/listings/:id/reviews",review);
app.use("/",user);


//post route of reviews

app.all("{*splat}",(req,res,next)=> {
    next(new ExpressError(404,"Page not found"));
})



app.use((err,req,res,next)=>{
let {statusCode=500,message="Something went wrong"}=err;
res.status(statusCode).render("error.ejs",{message});
})