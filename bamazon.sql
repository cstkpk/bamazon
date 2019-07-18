DROP DATABASE IF EXISTS bamazon_db;
CREATE database bamazon_db;

USE bamazon_db;

DROP TABLE products;

CREATE TABLE products (
item_id INT NOT NULL AUTO_INCREMENT,
product_name VARCHAR(30) NOT NULL,
department_name VARCHAR(20),
price DECIMAL(10,2),
stock_quantity INT(6),
product_sales DECIMAL(10,2) DEFAULT 0.00,
PRIMARY KEY (item_id)
);

SELECT * FROM products;

SELECT item_id, product_name, price FROM products;

SELECT stock_quantity FROM products WHERE item_id = 1;

SELECT * FROM products WHERE stock_quantity < 5;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Bananas", "Food & Drink", 1.00, 70),
("Kites", "Toys", 14.75, 56), ("Cacti", "Plants", 8.95, 23), ("Butternut squash", "Food & Drink", 3.50, 40),
("Scissors", "Office Supplies", 7.00, 50), ("Tibetan singing bowls", "Music", 22.50, 15),
("Shower curtains", "Household Items", 18.90, 80), ("Rubber ducks", "Toys", 2.25, 1000),
("French presses", "Food & Drink", 18.00, 97), ("Russian nesting dolls", "Toys", 500.00, 20000); 

UPDATE products SET stock_quantity = stock_quantity-2 WHERE item_id = 1;

UPDATE products SET stock_quantity = stock_quantity+2 WHERE item_id = 2;

DROP TABLE departments;

CREATE TABLE departments (
department_id INT NOT NULL AUTO_INCREMENT,
department_name VARCHAR(20),
overhead_costs DECIMAL(10,2),
-- total_profit DECIMAL(10,2) DEFAULT 0.00,
PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, overhead_costs)
VALUES ("Food & Drink", 50000.00),("Plants", 10000.00), ("Household Items", 46000.00);

SELECT * FROM departments;

--
SELECT department_id, department_name, overhead_costs,
           SUM(product_sales) AS product_sales,
           SUM(overhead_costs - product_sales) AS total_profit
FROM products
INNER JOIN departments
USING (department_name)
GROUP BY  products.department_name;
--


SELECT * FROM departments INNER JOIN products ON products.department_name = departments.department_name;

SELECT * FROM departments INNER JOIN products ON products.department_name = departments.department_name GROUP BY products.department_name;

SELECT department_id, departments.department_name, overhead_costs, product_sales FROM departments INNER JOIN products ON products.department_name = departments.department_name;
