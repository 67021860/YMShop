DROP DATABASE IF EXISTS ymshop;
CREATE DATABASE ymshop CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE ymshop;

-- USERS
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- PRODUCTS
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- CART ITEMS
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ORDERS
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ORDER ITEMS
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  qty INT NOT NULL,
  price_each DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Seed categories
INSERT INTO categories(name) VALUES
('เครื่องนุ่งห่ม'),
('อุปกรณ์การเรียน');

-- Seed products (ใส่รูปเป็นลิงก์ภายนอกได้ หรือใส่ไฟล์ใน public/images แล้วชี้ /images/xxx.png)
-- เสื้อ/กางเกง
INSERT INTO products(category_id, name, price, image_url) VALUES
(1, 'ชุดนักเรียน', 120.00, 'https://via.placeholder.com/300x200?text=Uniform'),
(1, 'กางเกงนักเรียน', 150.00, 'https://via.placeholder.com/300x200?text=Pants'),
(2, 'ปากกา', 15.00, 'https://via.placeholder.com/300x200?text=Pen'),
(2, 'ดินสอ', 10.00, 'https://via.placeholder.com/300x200?text=Pencil');
