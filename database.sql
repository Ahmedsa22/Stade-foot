-- Création de la base de données
CREATE DATABASE IF NOT EXISTS stadefoot;
USE stadefoot;

-- Table des utilisateurs
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des matchs
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    base_price DECIMAL(5,2) NOT NULL,
    category ENUM('standard', 'premium') NOT NULL
);

-- Table des réservations
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) DEFAULT NULL,
    `email` VARCHAR(100) NOT NULL,
    match_id INT NOT NULL,
    section VARCHAR(50),
    quantity INT NOT NULL,
    total_price DECIMAL(7,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id)
);


INSERT INTO matches (home_team, away_team, date, time, base_price, category) VALUES
('FC Marseille', 'PSG', '2025-06-15', '20:00:00', 1.5, 'premium'),
('Lyon', 'Monaco', '2025-06-18', '18:00:00', 1.2, 'standard'),
('Bordeaux', 'Nice', '2025-06-22', '15:00:00', 1.0, 'standard'),
('Lille', 'Rennes', '2025-06-25', '21:00:00', 1.3, 'premium');
