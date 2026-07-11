-- =====================================================================
-- Sao Tech Market — Schéma de la base de données (espace vendeur)
-- =====================================================================
-- Comment utiliser ce fichier sur Hostinger :
-- 1. Va dans hPanel → Bases de données → phpMyAdmin
-- 2. Sélectionne ta base de données à gauche
-- 3. Onglet "Importer" → choisis ce fichier "schema.sql" → clique "Exécuter"
-- =====================================================================

CREATE TABLE IF NOT EXISTS sellers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_name VARCHAR(150) NOT NULL,
    owner_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    city VARCHAR(50) NOT NULL DEFAULT 'Bukavu',
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS seller_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    department VARCHAR(50) NOT NULL DEFAULT 'electronique',
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) NULL,
    discount INT NOT NULL DEFAULT 0,
    image VARCHAR(500) NULL,
    description TEXT NOT NULL,
    colors VARCHAR(255) NULL,
    sizes VARCHAR(255) NULL,
    in_stock TINYINT(1) NOT NULL DEFAULT 1,
    rating DECIMAL(2,1) NOT NULL DEFAULT 0,
    reviews INT NOT NULL DEFAULT 0,
    sku VARCHAR(50) NOT NULL,
    tags VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seller_products_seller
        FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Comptes clients (pour la création de compte et le suivi de commandes)
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Commandes passées par les clients (pour le suivi "Mon compte")
-- ---------------------------------------------------------------------
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
