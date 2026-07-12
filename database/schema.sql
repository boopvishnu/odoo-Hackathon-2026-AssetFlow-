show databases;
use assetflow;
show tables;
create table user(id int primary key auto_increment, name varchar(80) not null,
    email varchar(80) unique not null, password_hash varchar(80) not null,
	role enum("Admin", "Asset Manager", "Department Head", "Employee") default "Employee",
	status enum("Active", "Inactive") default "Active",
	created_at timestamp default current_timestamp);
select * from user;

create table if not exists categories (
    id int auto_increment primary key,
    name varchar(100) not null unique,
    created_at timestamp default current_timestamp
);

create table if not exists locations (
    id int auto_increment primary key,
    building varchar(100) not null,
    floor varchar(50) not null,
    room varchar(50),
    created_at timestamp default current_timestamp
);

create table if not exists assets (
    id int auto_increment primary key,
    name varchar(150) not null,
    serial_number varchar(100) unique,
    status enum('available', 'booked', 'maintenance', 'retired') default 'available',
    category_id int,
    location_id int,
    created_at timestamp default current_timestamp,
    foreign key (category_id) references categories(id) on delete set null,
    foreign key (location_id) references locations(id) on delete set null
);

create table if not exists bookings (
    id int auto_increment primary key,
    user_id int not null,
    asset_id int not null,
    start_time datetime not null,
    end_time datetime not null,
    status enum('pending', 'approved', 'rejected', 'completed') default 'pending',
    created_at timestamp default current_timestamp,
    foreign key (user_id) references users(id) on delete cascade,
    foreign key (asset_id) references assets(id) on delete cascade
);

create table if not exists maintenance_requests (
    id int auto_increment primary key,
    asset_id int not null,
    reported_by int not null,
    description text not null,
    cost decimal(10,2) default 0.00,
    status enum('pending', 'in_progress', 'resolved', 'cancelled') default 'pending',
    created_at timestamp default current_timestamp,
    foreign key (asset_id) references assets(id) on delete cascade,
    foreign key (reported_by) references user(id) on delete cascade
);

create table if not exists audit_discrepancies (
    id int auto_increment primary key,
    asset_id int not null,
    audited_by int not null,
    details text not null,
    resolved_status enum('open', 'resolved') default 'open',
    created_at timestamp default current_timestamp,
    foreign key (asset_id) references assets(id) on delete cascade,
    foreign key (audited_by) references user(id) on delete cascade
);

