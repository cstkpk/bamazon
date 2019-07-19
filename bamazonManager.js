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

// Gives the manager all of their action choices, and based on their answer, runs the appropriate function
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
                addProduct();
                break;
            case "Exit":
                console.log("\nGoodbye!\n");
                connection.end();
                break;
        };
    });
};

// Asks the manager whether or not they want to return to the main menu
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
                console.log("\nGoodbye!\n");
                connection.end();
            };
        });
};

// If the manager chooses "View products for sale," display all available products
function displayProducts() {
    var display = "SELECT item_id AS 'Item ID', product_name AS 'Product Name', price AS 'Price', stock_quantity AS 'Stock Quantity' FROM products;";
    connection.query(display, function(err, res) {
        if (err) throw err;
        var columns = columnify(res, {
            columnSplitter: " | ",
        })
        console.log("-----------------------------");
        console.log("All products for sale:");
        console.log("-----------------------------");
        console.log(columns);
        backToMenu();
    });
};

// If the manager chooses "View low inventory," display all products with inventory < 5
function lowInventory() {
    var inventory = "SELECT item_id AS 'Item ID', product_name AS 'Product Name', department_name AS 'Department Name', price AS 'Price', stock_quantity AS 'Stock Quantity', product_sales AS 'Product Sales' FROM products WHERE stock_quantity < 5;";
    connection.query(inventory, function(err, res) {
        if (err) throw err;
        if (res[0]) {
            var columns = columnify(res, {
                columnSplitter: " | ",
            })
            console.log("-----------------------------");
            console.log("Products with fewer than 5 in stock:");
            console.log("-----------------------------");
            console.log(columns);
            backToMenu();
        }
        else {
            console.log("-----------------------------");
            console.log("There are currently no items low in stock.")
            console.log("-----------------------------");
            backToMenu();
        }
    });
};

// If the manager chooses "Add to inventory," prompt for information about which item and quantity and update table
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
                    message: "How many would you like to add to stock?",
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
                var query2 = "SELECT * FROM products WHERE product_name = ?;";
                connection.query(query2, [answer.item], function(err, res) {
                    if (err) throw err;
                    var query3 = "UPDATE products SET stock_quantity = stock_quantity+? WHERE product_name = ?;";
                    connection.query(query3, [answer.quantity, answer.item], function(err, res) {
                        if (err) throw err;
                        console.log("-----------------------------");
                        console.log("You've added " + answer.quantity + " " + answer.item + " to stock.");
                        console.log("-----------------------------");
                        backToMenu();
                    });
                });
            });
        
    });
};

// If manager chooses "Add new product," prompt for product information and add to table
var departmentArr = [];
function addProduct() {
    var query = "SELECT department_name FROM departments;";
    connection.query(query, function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            departmentArr.push(res[i].department_name);
        }
        inquirer
        .prompt([
            {
                name: "product",
                type: "input",
                message: "What is the name of the product you'd like to add?"
            },
            {
                name: "department",
                type: "list",
                message: "What department does this product belong to?",
                choices: departmentArr
            },
            {
                name: "price",
                type: "input",
                message: "How much does this product cost?",
                validate: function(value) {
                    if (isNaN(value) === false && value > 0) {
                        return true;
                    }
                    console.log("\nPlease enter a number greater than 0.");
                    return false;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "How many would you like to stock?",
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
            var query = "INSERT INTO products SET ?;";
            connection.query(query, 
                [{
                    product_name: answer.product,
                    department_name: answer.department,
                    price: answer.price,
                    stock_quantity: answer.quantity
                }], 
                function(err, res) {
                if (err) throw err;
                var query2 = "SELECT item_id AS 'Item ID', product_name AS 'Product Name', department_name AS 'Department Name', price AS 'Price', stock_quantity AS 'Stock Quantity' FROM products WHERE product_name = ?;";
                connection.query(query2, [answer.product], function(err, res) {
                    if (err) throw err;
                    var columns = columnify(res, {
                        columnSplitter: " | ",
                    })
                    console.log("-----------------------------");
                    console.log("You just added:");
                    console.log("-----------------------------");
                    console.log(columns);
                    backToMenu();
                });
            });
        });
    });
};