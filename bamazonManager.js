var mysql = require("mysql");
var columnify = require('columnify');
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon_db"
});

connection.connect(function(err) {
    if (err) throw err;
    mainMenu();
});

// Gives the user all of their action choices, and based on their answer, runs to appropriate function
function mainMenu() {
   inquirer
    .prompt({
        name: "action",
        type: "list",
        message: "Welcome! What would you like to do?",
        choices: [
            "View products for sale",
            "View low inventory",
            "Add to inventory",
            "Add new product",
            "Exit"
        ]
    })
    .then(function(answer) {
        switch (answer.action) {
            case "View products for sale":
                displayProducts();
                break;
            case "View low inventory":
                lowInventory();
                break;
            case "Add to inventory":
                addInventory();
                break;
            case "Add new product":
                // Function
                break;
            case "Exit":
                console.log("Goodbye!");
                connection.end();
                break;
        };
    });
};

// Asks the user whether or not they want to return to the main menu
function backToMenu() {
    inquirer
        .prompt({
            name: "confirm",
            type: "confirm",
            message: "Would you like to return to the main menu?",
            default: true
        })
        .then(function(answer){
            if (answer.confirm) {
                mainMenu();
            }
            else {
                console.log("Goodbye!");
                connection.end();
            };
        });
};

// If the manager chooses "View products for sale," display all available products
function displayProducts() {
    var display = "SELECT item_id, product_name, price, stock_quantity FROM products;";
    connection.query(display, function(err, res) {
        if (err) throw err;
        var columns = columnify(res, {
            columnSplitter: " | ",
        })
        console.log("All products for sale:");
        console.log("-----------------------------");
        console.log(columns);
        backToMenu();
    });
};

function lowInventory() {
    var inventory = "SELECT * FROM products WHERE stock_quantity < 5;";
    connection.query(inventory, function(err, res) {
        if (err) throw err;
        var columns = columnify(res, {
            columnSplitter: " | ",
        })
        console.log("Products with fewer than 5 in stock:");
        console.log("-----------------------------");
        console.log(columns);
        backToMenu();
    });
};

var itemArr = [];
function addInventory() {
    var query = "SELECT product_name FROM products;";
    connection.query(query, function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            itemArr.push(res[i].product_name);
        }
        inquirer
            .prompt([
                {
                    name: "item",
                    type: "list",
                    message: "Which item would you like to purchase more of?",
                    choices: itemArr
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to purchase?",
                    validate: function(value) {
                        if (isNaN(value) === false) {
                          return true;
                        }
                        return false;
                    }
                }
            ])
            .then(function(answer) {

            });
        
    });
};