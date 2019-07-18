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
    supervisorMenu();
});

function supervisorMenu() {
    inquirer
        .prompt({
            name: "menu",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View product sales by department",
                "Create a new department",
                "Exit"
            ]
        })
        .then(function(answer) {
            switch (answer.menu) {
                case "View product sales by department":
                    productSales();
                    break;
                case "Create a new department":
                    newDepartment();
                    break;
                case "Exit":
                    console.log("Goodbye!");
                    connection.end();
                    break;
            }
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
                supervisorMenu();
            }
            else {
                console.log("Goodbye!");
                connection.end();
            };
        });
};

// If supervisor chooses "View product sales by department," show product sales by department
function productSales() {
    var query = "SELECT * FROM departments INNER JOIN products ON products.department_name = departments.department_name;";
    connection.query(query, function(err, res) {
        if (err) throw err;
        var query2 = "UPDATE departments SET total_profit = total_profit + ?;";
        var departmentSales = 
        
        var profitArr = [];
        for (var i = 0; i < res[i]; i++) {
            var test = res[i].overhead_costs - res[i].product_sales;
            profitArr.push(test);
        }
        connection.query(query2, profitArr, function(err, res) {
            if (err) throw err;
            var columns = columnify(res, {
                columnSplitter: " | ",
            })
            console.log("-----------------------------");
            console.log("Product sales by department:");
            console.log("-----------------------------");
            console.log(columns);
            backToMenu();
        })
    })
}

// If supervisor chooses "Create a new department," prompt for information and add to table
function newDepartment() {
    inquirer
        .prompt([
            {
                name: "department",
                type: "input",
                message: "What is the name of the department you want to create?"
            },
            {
                name: "overhead",
                type: "input",
                message: "What is the overhead cost for this department?",
                validate: function(value) {
                    if (isNaN(value) === false && value > 0) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function(answer) {
            var depQuery = "INSERT INTO departments SET ?;";
            connection.query(depQuery, 
            [{
                department_name: answer.department,
                overhead_costs: answer.overhead,
            }], 
            function(err, res) {
                if (err) throw err;
            });
            // If leaving total_profit in table, change * to include only id, name, and overhead costs
            var depQuery2 = "SELECT * FROM departments WHERE department_name = ?;";
            connection.query(depQuery2, [answer.department], function(err, res) {
                var columns = columnify(res, {
                    columnSplitter: " | ",
                })
                console.log("-----------------------------");
                console.log("You've added the following department:");
                console.log("-----------------------------");
                console.log(columns);
                backToMenu();
            });
        });
};