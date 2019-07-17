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
    runDisplay();
});

// Function to display current items in stock/for sale to the customer
function runDisplay() {
    var display = "SELECT item_id, product_name, price FROM products;";
    connection.query(display, function(err, res) {
        if (err) throw err;
        // console.log(res);
        
        var columns = columnify(res, {
            columnSplitter: ' | ',
            // paddingChr: '.'
        })
        console.log(columns)
        // connection.end();
        runSearch();
    });
}

var idArr = [];

function runSearch() {
    var query = "SELECT item_id FROM products;";
    connection.query(query, function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            idArr.push(res[i].item_id);
        }
        // console.log(idArr);
        inquirer
        .prompt([
            {
                name: "purchase",
                type: "list",
                message: "Please choose the id of the item you would like to purchase:",
                choices: idArr
            },
            {
                name: "quantity",
                type: "input",
                message: "How many units would you like to purchase?"
            }
        ])
        .then(function(answer) {
            var query = "SELECT * FROM products WHERE item_id = ?;";
            connection.query(query, [answer.purchase], function(err, res) {
                if (err) throw err;
                // console.log(res);
                // console.log(res[0].stock_quantity);
                if (answer.quantity > res[0].stock_quantity) {
                    console.log("Sorry! It looks like we don't have enough of that item to fulfill your order.");
                    exit();
                }
                else {
                    console.log("Congratulations! Here are " + answer.quantity + " " + res[0].product_name + "!");
                    var query2 = "UPDATE products SET stock_quantity = stock_quantity-? WHERE item_id = ?;";
                    connection.query(query2, [answer.quantity, answer.purchase], function(err, res) {
                        if (err) throw err;
                    });
                    var query3 = "SELECT * FROM products WHERE item_id = ?;";
                    connection.query(query3, [answer.purchase], function(err, res) {
                        if (err) throw err;
                        // console.log(res);
                        var cost = res[0].price * answer.quantity;
                        console.log("Your total cost is: $" + cost);
                        exit();
                    });
                }
            });
        })
    })
}

function exit() {
    inquirer
    .prompt({
        type: "confirm",
        message: "Would you like to place another order?",
        name: "confirm",
        default: true
    })
    .then(function(answer){
        if (answer.confirm) {
            runSearch();
        }
        else {
            console.log("Goodbye!");
            connection.end();
        }
    })
}