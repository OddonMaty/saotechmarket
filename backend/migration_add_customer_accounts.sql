-- =====================================================================
-- MIGRATION — à exécuter UNIQUEMENT si tu as déjà importé schema.sql
-- avant l'ajout des comptes clients ("Mon compte") et du suivi de
-- commandes.
--
-- Si tu repars d'une base neuve, tu n'as pas besoin de ce fichier :
-- le schema.sql à jour contient déjà ces tables.
--
-- Comment l'utiliser : hPanel → phpMyAdmin → sélectionne ta base →
-- onglet "Importer" → choisis ce fichier → "Exécuter".
-- =====================================================================

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    city VARCHAR(50) NOT NULL DEFAULT 'Bukavu',
    password_hash VARCHAR(255) NOT NULL,
    newsletter TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    items JSON NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    shipping_city VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_phone VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'En attente',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
