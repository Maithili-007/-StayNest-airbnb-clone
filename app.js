// Core Module
const path = require('path');

// External Module
const express = require('express');
const multer = require('multer');
const session  = require('express-session'); 
const MongoDBStore = require('connect-mongodb-session')(session);
const DB_PATH = "mongodb+srv://root:root@completecoding.pxuvpxm.mongodb.net/airbnb?retryWrites=true&w=majority&appName=CompleteCoding";
const { default: mongoose } = require('mongoose');


//Local Module
const storeRouter = require("./routes/storeRouter")
const authRouter = require("./routes/authRouter")
const hostRouter = require("./routes/hostRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const { Result } = require('postcss');
const { error } = require('console');


const app = express();

app.set('view engine', 'ejs'); 
app.set('views', 'views');

const store = new MongoDBStore({
  uri:DB_PATH,
  collection:'sessions'
})

const randomString =(length)=>{
const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
const storage  =multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const multerOptions = {
  storage,fileFilter
};

app.use(express.urlencoded());
app.use(multer(multerOptions).single('photo'));
app.use(express.static(path.join(rootDir, 'public')));
app.use("/uploads",express.static(path.join(rootDir,'uploads')));
app.use("/host/uploads/",express.static(path.join(rootDir,'uploads')));


app.use(session({
secret:"learning backend",
resave:false,
saveUninitialized:true,
store:store,
}));

app.use((req,res,next)=>{
  console.log("Logged in?", req.session.isLoggedIn);
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

app.use(storeRouter);
app.use(authRouter);
app.use("/host", (req,res,next)=>{
if(req.isLoggedIn){
   next();
}
else{
  res.redirect('/login');
}
});
app.use("/host", hostRouter);

app.use(errorsController.pageNotFound);

const PORT = 3000;
mongoose.connect("mongodb+srv://root:root@completecoding.pxuvpxm.mongodb.net/airbnb?retryWrites=true&w=majority&appName=CompleteCoding")
.then(()=>{
 console.log('connected to mongodb');
 app.listen(PORT, () => {
  console.log(`Server running on address http://localhost:${PORT}`);
});
}).catch((err)=>{
  console.log('error while connecting to mongodb',err);
});
