const fs = require('fs');
//const { Result } = require("postcss");
const Home = require("../models/home");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing :false,
    isLoggedIn : req.isLoggedIn,
      user: req.session.user,
  });
};

exports.getEditHome = (req, res, next) => {
   const homeId= req.params.homeId;
   const editing= req.query.editing==='true'; 

   Home.findById(homeId).then(home=>{
    if(!home){
      console.log('home not dound for editing');
      return res.redirect("/host/host-home-list");
    }
      console.log(homeId,editing,home); 
     res.render("host/edit-home", {
      home:home,
    pageTitle: "edit your home",
    currentPage: "host-homes",
    editing :editing,
    isLoggedIn : req.isLoggedIn,
      user: req.session.user,
   });
  });
};

exports.getHostHomes = (req, res, next) => {
 Home.find().then(registeredHomes=>{
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn : req.isLoggedIn,
        user: req.session.user,
    })
});
};

exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, description} = req.body;
  console.log(houseName, price, location, rating, description);
  console.log(req.file);

  if (!req.file) {
    return res.status(422).send("No image provided");
  }

  const photo = req.file.path;

  const home = new Home({houseName, price, location, rating, photo,description});
  home.save()
  .then(()=>{
    console.log('home saves');
  });

  res.redirect("/host/host-home-list");

};

exports.postEditHome = (req, res, next) => {
  const { id,houseName, price, location, rating, description} = req.body;
  Home.findById(id).then((home)=>{
    if(!home){
      console.log('home not found for editing');
      res.redirect("/host/host-home-list");
    }
    home.houseName = houseName;
    home.price = price;
    home.location = location;
    home.rating = rating;
    home.description = description;

    if(req.file){
      fs.unlink(home.photo,(err)=>{
        if(err){
          console.log('error while deleting file',err);
        }
      });
      home.photo = req.file.path;
    }
     return home.save();
  })
 .then(()=>{
     res.redirect("/host/host-home-list");
  })
  .catch((err)=>{
    console.log('error while updating',err);
  });
};

exports.postDeleteHome = (req, res, next) => {
  const homeId =req.params.homeId;
  Home.findByIdAndDelete(homeId)
  .then(()=>{
    res.redirect("/host/host-home-list");
  }).catch(error=>{
    console.log('error while deleting',error);
  })
};