const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const app = express();

const UserModel = require("./models/User");
const mongoURI = 'mongodb+srv://Lyubo12345:password12345@cluster3.xp7ri.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

mongoose.connect(mongoURI,{
    useNewUrlParser: true, 
    useUnifiedTopology: true, 

})

.then((res) => {
    console.log("MongoDB Connected")
});

const store = new MongoDBSession({
    uri: mongoURI,
    collection: 'mySessions',

});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(express.static(__dirname+ '/Css'));

app.use(session({
    secret: 'key that will sign cookie.',
    resave: false,
    saveUninitialized: false,
    store: store,

}))

const isAuth = (req, res, next) => {
    if(req.session.isAuth) {
        next()
    } else {
        res.redirect("/login")

    }
    }


app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/login", (req, res )=> {
    res.render("login");
});

app.post("/login", async (req, res)=> {
    const {email, password} = req.body;
    const user = await UserModel.findOne({email});

    if(!user){
        return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        return res.redirect('/login');
    }

    req.session.isAuth = true;
    res.redirect("/dashboard");


});

app.get("/register", (req, res)=> {
    res.render("register");
});

app.post("/register", async (req, res)=> {
    const { username, email, password } = req.body;

    let user = await UserModel.findOne({email})

    if(user) {
        return res.redirect('/register');
    }


    const hashedPsw = await bcrypt.hash(password, 12);

    user = new UserModel({
        username,
        email,
        password: hashedPsw,
    });

    await user.save()

    res.redirect('/login');
});

app.get("/dashboard", isAuth, (req, res) => {
    res.render("dashboard");
});

app.get("/todolist", isAuth, (req, res) => {
    res.render("todolist");
});


app.post('/logout',(req, res) =>{
    req.session.destroy((err) => {
        if(err) throw err;
        res.redirect("/");


    })

})


app.listen(5000, console.log("Server running on http://localhost:5000"));
