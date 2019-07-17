DROP DATABASE IF EXISTS bamazon_db;
CREATE database bamazon_db;

USE bamazon_db;

CREATE TABLE products (
item_id INT NOT NULL AUTO_INCREMENT,
product_name VARCHAR(20) NOT NULL,
department_name VARCHAR(20),
price DECIMAL(10,2),
stock_quantity INT(6),
PRIMARY KEY (item_id)
);

SELECT * FROM products;

SELECT item_id, product_name, price FROM products;

SELECT stock_quantity FROM products WHERE item_id = 1;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Bananas", "Food & Drink", 1.00, 70);

UPDATE products SET stock_quantity = stock_quantity-2 WHERE item_id = 1;