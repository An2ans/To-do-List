const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// const request = require("request");

const app = express();

app.use(express.static("public"));
//Esto es para que funcione el ejs despues de instalarlo en el npm, ponlo debajo de app
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema ={
  name:String
};

const Item = mongoose.model("Item", itemsSchema);

const defItem1 = new Item({
  name: "Welcome to your To-do List!"
});

const defItem2 = new Item({
  name: "Click on the + buttom to add a new item."
});

const defItem3 = new Item({
  name: "<--- Hit this to delete an item. "
})

const defItems = [defItem1, defItem2, defItem3];



app.post("/", function(req, res){

  const newItemName = req.body.newInput;
  var newItem = new Item({
    name: newItemName
  });

  newItem.save(function(err,Item){
    if(err){
      console.log(err);
    }else{
      console.log("New item " + newItemName + " successfully added.");
    }
  });
  res.redirect("/");
});

app.post("/delete", function(req, res){
const checkedItemId = req.body.checkbox;
Item.findByIdAndRemove(checkedItemId, function(err){
  if(err){
    console.log(err);
  }else{
    console.log("Item successfully deleted");
  }
});

});

app.get("/", function(req, res) {
  var today = new Date();
  var options = {
    weekday:"long",
    day: "numeric",
    month: "long",
  };

  var day = today.toLocaleDateString("en-UK", options);

  let foundItems = [];
  Item.find({}, function(err, foundItems){

  if (foundItems.length === 0){
    Item.insertMany(defItems, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Default items added successfully");
      }
    });
    res.redirect("/");
  }else{
    res.render("list", {dayOfWeek:day, newListItems:foundItems});
  }

  });






//   var currentDay = today.getDay();
//   var day = "";
//   switch (currentDay) {
//     case 0:
//       day = "Sunday"
//       break;
//     case 1:
//       day = "Monday"
//       break;
//     case 2:
//       day = "Tuesday"
//       break;
//     case 3:
//       day = "Wednesday"
//       break;
//     case 4:
//       day = "Thurday"
//       break;
//     case 5:
//       day = "Friday"
//       break;
//     case 6:
//       day = "Saturday"
//       break;
//     default:
//       console.log("There is an error, the current day is " + currentDay);
//   }
// //Esto es para hacer correr el ejs substituyendo la var dayOfWeek por el valor de day
//   res.render("list", {dayOfWeek:day});

// Se puede hacer if else pero cuando son mas de 5 casos es mas eficiente hacer switch
//   if (today.getDay() === 1) {
//     res.send("It's Monday!")
//   } else if (today.getDay() === 2) {
//     res.send("It's Tuesday!")
//   } else if (today.getDay() === 3) {
//     res.send("It's Wednesday!")
//   } else if (today.getDay() === 4) {
//     res.send("It's Thurday!")
//   } else if (today.getDay() === 5) {
//     res.send("Yeah it's Friday!!")
//   } else if (today.getDay() === 6) {
//     res.send("It's Saturday!!!")
//   } else {
//     res.send("It's Sunday !!!")
//   }
});




app.listen(3000, function(req, res) {
  console.log("Server is running on port 3000");
});
