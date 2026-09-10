if(process.env.NODE_ENV != 'production') {
    require("dotenv").config()
}
const express = require("express")
const app = express()
const port= 3000
const mongoose = require('mongoose');
const path = require("path")
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
const ExpressError = require("./Utils/ExpressError.js")
const {listingSchema,reviewSchema} = require("./schema.js")
const listingsRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")
const session = require("express-session")
const MongoStore = require('connect-mongo').default
const flash = require("connect-flash")
const passport = require("passport")
const localStrategy = require("passport-local")
const User = require("./models/user.js");

const dbUrl = process.env.ATLASDB_URL;
   
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on('error',() => {
    console.log("ERROR in MONGO SESSION STORE",err)
})

const sessionOptions = {
        store,
        secret:process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            expires: Date.now() + 7*24*60*60*1000,
            maxAge: 7*24*60*60*1000,
            httpOnly: true,
        }
    }


main().then((result) => {
    console.log(result)
}).catch((err) => {
    console.log(err)
})


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate)
app.use(express.static(path.join(__dirname,"/public")))

app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
})


async function main() {
  await mongoose.connect(dbUrl);
}

app.get("/root",(req,res) => {
    res.send("it is Working")
})

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

app.use("/listings",listingsRouter)

// Reviews 

app.use("/listings",reviewsRouter)

// Users Router
app.use("/", userRouter)

// catch-all 404 handler (no path = matches everything not already handled)
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"))
})

// error handler — renders the error.ejs view instead of plain text
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err
    res.status(statusCode).render("error.ejs", { statusCode, message })
})

app.listen(port,() => {
    console.log(`Server is Running On port ${port}`)
})