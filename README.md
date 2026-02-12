
YMShop – Online Store Website

ระบบร้านค้าออนไลน์ (Online Shopping Website) พัฒนาด้วย Node.js (Express.js) และ EJS Template Engine 

เชื่อมต่อฐานข้อมูล MySQL รองรับการใช้งานทั้งฝั่งผู้ใช้ (User) และผู้ดูแลระบบ (Admin)

ข้อมูลผู้พัฒนา (Developer Information)

ชื่อโครงงาน: ระบบร้านค้าออนไลน์ (YMShop)

รหัสนักศึกษา   ชื่อ-นามสกุล       หน้าที่รับผิดชอบ

67021860     นันทพงศ์ ปวงคำมา  Frontend Developer
-            ChatGPTPlus      Backend Developer

เทคโนโลยีที่ใช้ (Technology Stack)

Node.jsExpress.js

EJS

MySQL

Express-session

dotenv

CSS (Responsive Design)

ขั้นตอนการติดตั้ง (Installation Guide)

1.Clone โปรเจค

git clone https://github.com/67021860/YMShop.git cd YMShop

2.ติดตั้ง Dependencies

ในโฟลเดอร์โปรเจค รันคำสั่ง:

npm install

ตั้งค่าฐานข้อมูล (Database Setup)

3.1 เปิด MySQL

หากใช้ XAMPP → Start MySQL

หรือเปิด MySQL Service

3.2 สร้างฐานข้อมูล

เข้า phpMyAdmin

สร้างฐานข้อมูลชื่อ:

ymshop

Collation:

utf8mb4_unicode_ci

3.3 Import ฐานข้อมูล

เลือกฐานข้อมูล ymshop

กดแท็บ Import

เลือกไฟล์:

db/schema.sql

กด Import

ตั้งค่า Environment Variables

สร้างไฟล์ชื่อ:.env

ใส่ค่าดังนี้:

PORT=3000

DB_HOST=localhost

DB_USER=root

DB_PASSWORD=yourpassword

DB_NAME=ymshop

SESSION_SECRET=ymshop_secret

การรันระบบ (Run Project)

ในโฟลเดอร์โปรเจค รัน: npm start หรือ node app.js

เปิดเว็บที่:http://localhost:3000

คู่มือการใช้งาน (User Guide)

ผู้ใช้งานทั่วไป (User)

สมัครสมาชิก

เข้าสู่ระบบ

เลือกหมวดหมู่สินค้า

เพิ่มสินค้าในตะกร้า

ปรับจำนวนสินค้า

ชำระเงิน

ดูประวัติการสั่งซื้อ

ผู้ดูแลระบบ (Admin)

เพิ่มสินค้า

แก้ไขสินค้า

ลบสินค้า

จัดการหมวดหมู่

ตรวจสอบรายการสั่งซื้อ

โครงสร้างฐานข้อมูล (Database Schema)

ตารางในระบบประกอบด้วย:

users

categories

products

cart

orders

order_items

ER Diagram อยู่ในไฟล์:

docs/Database_Schema.pdf

รายงาน อยู่ในไฟล์:

docs/เว็บไซต์ร้านค้าออนไลน์.pdf

คุณสมบัติของระบบ

Responsive Design (รองรับมือถือ)

ระบบ Authentication

ระบบตะกร้าสินค้า

ระบบสั่งซื้อสินค้า

เชื่อมต่อ MySQL

แยกการทำงาน Frontend / Backend

Assignment Submission

GitHub Repository:

https://github.com/67021860/YMShop