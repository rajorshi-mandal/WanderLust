const express = require("express");
const app = express();
const port = 3000;
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const cookieParser = require("cookie-parser");

app.use(cookieParser("secretcode"));

app.get("/getsignedcookie", (req,res) => {
    res.cookie("made-in", "India", {signed: true});
    res.send("signed cookie sent!");
});

app.get("/verify", (req,res) => {
    console.log(req.signedCookies);
    res.send("verified!");
});

app.get("/greet", (req,res) => {
    let {name = "anonymous"} = req.cookies;
    res.send(`Hi, I am ${name}`);
});

app.get("/getcookies", (req,res) => {
    res.cookie("greet", "hello");
    res.cookie("madeIn", "India");
    res.send("sent you some cookies!");
});

app.get("/", (req,res) => {
    console.dir(req.cookies);
    res.send("Hi, I am root!");
});

app.use("/users", users);
app.use("/posts", posts);

app.listen(port, () => {
    console.log(`Server is listening at ${port}`);
})

