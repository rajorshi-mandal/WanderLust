const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const port = 8080;

const sessionOptions = {
    secret: "mysupersecretscode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};

app.get("/", (req,res) => {
    res.send("Hi, I am root");
})

app.use(session(sessionOptions));
app.use(flash());

//passport needs session
app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
async function main() {
    await mongoose.connect(MONGO_URL);
}

main().then(() => {
    console.log("connectd to DB");
}).catch((err) => {
    console.log(err);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    // console.log(res.locals.success);
    next();
});

// app.get("/demouser", async (req,res) => {
//     let fakeuser = new User({
//         email : "student@gmail.com",
//         username: "delta-student",
//     });

//     let registeredUser = await User.register(fakeuser, "helloworld");
//     res.send(registeredUser);
// });

//routes
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

//error handling for visiting route that doesn't exist
app.all("*",(req,res,next) => {
    next(new ExpressError(404, "Page not found!"))
});

//custom Express Error
app.use((err,req,res,next) => {
    let {statusCode=500, message="Something went wrong!"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {message});
    // res.send("Something went wrong!");
});

app.listen(port, () => {
    console.log(`Server is listening at port ${port}`)
});