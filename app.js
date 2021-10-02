const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

//Esto es para que funcione el ejs despues de instalarlo en el npm, ponlo debajo de app
app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
  extended: true
}));
mongoose.connect("mongodb+srv://admin-antonio:Gaarafan92@clusterdb.rna9w.mongodb.net/todolistDB?retryWrites=true&w=majority");

var today = new Date();
var options = {
  weekday: "long",
  day: "numeric",
  month: "long",
};

var day = today.toLocaleDateString("en-UK", options);



const itemsSchema = {
  name: String
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
});

const defItems = [defItem1, defItem2, defItem3];


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Default items added successfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        dayOfWeek: day,
        newListItems: foundItems,
        listTitle: "Today"
      });
    }

  });
});


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if (!err){
      if (!foundList){
        const list = new List({
          name: customListName,
          items: defItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          dayOfWeek: day,
          newListItems: foundList.items
        });
      }
    }
  });

});



app.post("/", function(req, res) {

  const newItemName = req.body.newInput;
  const listName = req.body.list;
  var newItem = new Item({
    name: newItemName
  });

  if (listName === "Today"){
    newItem.save(function(err, Item) {
      if (err) {
        console.log(err);
      } else {
        console.log("New item " + newItemName + " successfully added.");
      }
    });
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err,foundList){
      if (err){
        console.log(err);
      }else{
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);

    }});
  }

});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item successfully deleted");
      }
    });

  }else{
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }



});




app.listen(3000, function(req, res) {
  console.log("Server is running on port 3000");
});
