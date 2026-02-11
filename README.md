🛍️ YMShop – Online Store Website

ระบบร้านค้าออนไลน์สำหรับจำหน่ายสินค้า (ชุดพละ และ กระเป๋าผ้า)
พัฒนาด้วย Node.js + Express + EJS + MySQL

👥 Team Members
Student ID	Name	         Role
-           ChatgptPlus      Backend Developer
67021860    นันทพงศ์ ปวงคำมา  Frontend Developer
🚀 Features

✅ สมัครสมาชิก / เข้าสู่ระบบ

✅ แสดง / ซ่อนรหัสผ่าน

✅ แยกหมวดหมู่สินค้า (2 หมวด)

ชุดพละ

กระเป๋า

✅ เพิ่มสินค้าเข้าตะกร้า

✅ เลือกสินค้าเพื่อชำระเงิน

✅ เพิ่ม / ลด จำนวนสินค้า

✅ คำนวณยอดรวมเฉพาะสินค้าที่เลือก

✅ ระบบ Session

✅ Responsive รองรับมือถือ / แท็บเล็ต

🛠️ Technology Stack
Frontend

HTML

CSS

Vanilla JavaScript

EJS Template Engine

Backend

Node.js

Express.js

MySQL

express-session

bcrypt

dotenv

⚙️ Installation Guide
1️⃣ Clone โปรเจค
git clone https://github.com/67021860/YMShop.git
cd YMShop

2️⃣ ติดตั้ง Dependencies
npm install

3️⃣ ตั้งค่าฐานข้อมูล (Database Setup)
3.1 เปิด MySQL / XAMPP
3.2 สร้างฐานข้อมูลใหม่ชื่อ
ymshop

3.3 Import ไฟล์
db/schema.sql

4️⃣ ตั้งค่า Environment Variables

สร้างไฟล์ .env แล้วใส่ค่า:

PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=ymshop
SESSION_SECRET=ymshop_secret_key

5️⃣ รันโปรแกรม
node app.js


เข้าใช้งานที่:

http://localhost:3000

🗂️ Database Schema
ตารางที่ใช้ในระบบ (อย่างน้อย 5 ตาราง)

users

categories

products

cart_items

orders

ความสัมพันธ์หลัก:

users → cart_items

users → orders

categories → products

products → cart_items

👤 User Guide
👤 ผู้ใช้งานทั่วไป

สมัครสมาชิก

เข้าสู่ระบบ

เลือกหมวดหมู่สินค้า

เพิ่มสินค้าเข้าตะกร้า

เลือกสินค้าที่ต้องการชำระเงิน

ชำระเงิน

ดูประวัติการสั่งซื้อ

📱 Responsive Design

เว็บไซต์รองรับ:

Desktop

Tablet

Mobile

🧩 Project Structure
YMShop/
│
├── db/
│   └── schema.sql
│
├── middlewares/
│   └── auth.js
│
├── public/
│   ├── css/
│   ├── images/
│   └── js/
│
├── routes/
│   └── web.js
│
├── views/
│   ├── partials/
│   └── ejs
│
├── app.js
├── .env.example
└── package.json