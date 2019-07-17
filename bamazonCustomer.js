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
        console.log(res);
        
        var columns = columnify(res, {
            columnSplitter: ' | ',
            // paddingChr: '.'
        })
        console.log(columns)
        // connection.end();
        runSearch();
    });
}

function runSearch() {
    inquirer
      .prompt([
        {
            name: "purchase",
            type: "input",
            message: "Please choose the id of the item you would like to purchase:"
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
            // console.log(answer.purchase);
            // console.log(answer.quantity);
            console.log(res);
            // console.log(res[0].stock_quantity);
            if (answer.quantity > res[0].stock_quantity) {
                console.log("Sorry! It looks like we don't have enough of that item to fulfill your order.");
            }
            else {
                console.log("Congratulations! Here are " + answer.quantity + " " + res[0].product_name + "!");
                var query2 = "UPDATE products SET stock_quantity = 70-? WHERE item_id = ?;";
                connection.query(query2, [answer.quantity, answer.purchase], function(err, res) {
                    if (err) throw err;
                })
                var query3 = "SELECT * FROM products WHERE item_id = ?;";
                connection.query(query3, [answer.purchase], function(err, res) {
                    if (err) throw err;
                    console.log(res);
                    var cost = res[0].price * answer.quantity;
                    console.log(cost);
                })
            }
            connection.end();
      });
    })
}