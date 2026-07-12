create database if not exists booking_system;
use booking_system;

create table if not exists departments (
    id int auto_increment primary key,
    name varchar(100) not null unique,
    code varchar(10) not null unique
);

create table if not exists users (
    id int auto_increment primary key,
    fullname varchar(150) not null,
    email varchar(150) not null unique,
    username varchar(50) not null unique,
    password_hash varchar(255) not null,
    role enum('admin', 'asset_manager', 'dept_head', 'employee') not null default 'employee',
    department_id int,
    created_at timestamp default current_timestamp,
    foreign key (department_id) references departments(id) on delete set null
);

insert ignore into departments (id, name, code) values 
(1, 'Information Technology', 'IT'),
(2, 'Human Resources', 'HR'),
(3, 'Finance', 'FIN'),
(4, 'Operations', 'OPS');
