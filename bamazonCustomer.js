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
    console.log("\nWelcome to Bamazon! Here is what we have in stock:\n");
    var display = "SELECT item_id AS 'Item ID', product_name AS 'Product Name', price AS 'Price' FROM products;";
    connection.query(display, function(err, res) {
        if (err) throw err;
        var columns = columnify(res, {
            columnSplitter: ' | ',
        })
        console.log(columns)
        runSearch();
    });
}

// Variable for first prompt question
var idArr = [];
// Function for customer to choose which item and quantity to buy
function runSearch() {
    var query = "SELECT item_id FROM products;";
    connection.query(query, function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            idArr.push(res[i].item_id);
        }
        inquirer
        .prompt([
            {
                name: "purchase",
                type: "list",
                message: "Please choose the ID of the item you would like to purchase:",
                choices: idArr
            },
            {
                name: "quantity",
                type: "input",
                message: "How many units would you like to purchase?",
                validate: function(value) {
                    if (isNaN(value) === false && value > 0) {
                        return true;
                    }
                    console.log("\nPlease enter a number greater than 0.");
                    return false;
                }
            }
        ])
        .then(function(answer) {
            var query = "SELECT * FROM products WHERE item_id = ?;";
            connection.query(query, [answer.purchase], function(err, res) {
                if (err) throw err;
                if (answer.quantity > res[0].stock_quantity) {
                    console.log("\nSorry! It looks like we don't have enough of that item to fulfill your order.\n");
                    exit();
                }
                else {
                    console.log("\nCongratulations! Here are " + answer.quantity + " " + res[0].product_name + "!");
                    var query2 = "UPDATE products SET stock_quantity = stock_quantity-? WHERE item_id = ?;";
                    connection.query(query2, [answer.quantity, answer.purchase], function(err, res) {
                        if (err) throw err;
                    });
                    var query3 = "SELECT * FROM products WHERE item_id = ?;";
                    connection.query(query3, [answer.purchase], function(err, res) {
                        if (err) throw err;
                        var cost = res[0].price * answer.quantity;
                        var query4 = "UPDATE products SET product_sales = product_sales + ? WHERE item_id = ?;";
                        connection.query(query4, [cost, answer.purchase], function(err, res) {
                            if (err) throw err;
                        })
                        console.log("Your total cost is: $" + cost + ".\n");
                        exit();
                    });
                };
            });
        });
    });
};

// Function to allow customer to either continue shopping or exit out of node
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
            console.log("\nGoodbye!\n");
            connection.end();
        };
    });
};