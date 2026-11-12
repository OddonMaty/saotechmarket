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
    is_official TINYINT(1) NOT NULL DEFAULT 0,
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
    images TEXT NULL,
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

-- ---------------------------------------------------------------------
-- Carnet d'adresses des clients (réutilisables d'une commande à l'autre)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    label VARCHAR(50) NOT NULL DEFAULT 'Adresse',
    city VARCHAR(50) NOT NULL DEFAULT 'Bukavu',
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_addresses_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Notifications vendeur : prévient qu'un de ses produits a été commandé
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seller_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    order_number VARCHAR(20) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seller_notifications_seller
        FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Messagerie directe client <-> vendeur (une conversation par paire)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    seller_id INT NOT NULL,
    context_product_name VARCHAR(200) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversations_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_conversations_seller
        FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_customer_seller (customer_id, seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS conversation_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_type ENUM('customer', 'seller') NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
