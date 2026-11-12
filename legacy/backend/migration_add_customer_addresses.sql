-- =====================================================================
-- MIGRATION — à exécuter UNIQUEMENT si tu as déjà importé schema.sql
-- avant l'ajout du carnet d'adresses clients.
--
-- Si tu repars d'une base neuve, tu n'as pas besoin de ce fichier :
-- le schema.sql à jour contient déjà cette table.
--
-- Comment l'utiliser : hPanel → phpMyAdmin → sélectionne ta base →
-- onglet "Importer" → choisis ce fichier → "Exécuter".
-- =====================================================================

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
