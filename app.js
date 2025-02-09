require("dotenv").config();
const path = require("path");
const express = require("express");
const PORT = 8000 || process.env.PORT;
const cookieParser = require('cookie-parser')

const Blog = require('./model/blogs')

const userRoute = require("./routes/user");
const blogRoute = require('./routes/blog')
const mongoose = require("mongoose");
const { checkAuthenticationCookie } = require("./middleware/authentication");
const app = express();

///mongo connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("mongoDB connected"))
  .catch((err) => console.log("mongo error",err));

  //setting views
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

//middlewares
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkAuthenticationCookie("token"))
app.use(express.static(path.resolve('./public')))

//routes

app.use((req, res, next) => {
  res.locals.theme = req.cookies.theme || 'dark'; 
  next();
});

app.get("/toggle-theme",(req,res)=>{
  let currentTheme = req.cookies.theme == 'dark' ? 'light':'dark'
  res.cookie("theme", currentTheme)
  res.redirect(req.get("Referrer") )
})


app.get("/", async(req, res) => {
  const allBlogs = await Blog.find({}).sort({"createdAt": -1});
  res.render("home",{
    users: req.user,
    blogs: allBlogs,
  });
});


app.use("/user", userRoute);

app.use("/blog", blogRoute);

app.listen(PORT, () => {
  console.log("Server is started on Port", PORT);
});
