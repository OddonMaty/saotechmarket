-- =====================================================================
-- MIGRATION — à exécuter UNIQUEMENT si tu as déjà importé schema.sql
-- avant l'ajout des rayons (Gadgets Électroniques / Matériaux de
-- Construction / Vêtements et Chaussures / Imprimantes).
--
-- Si tu repars d'une base neuve, tu n'as pas besoin de ce fichier :
-- le schema.sql à jour contient déjà cette colonne.
--
-- Comment l'utiliser : hPanel → phpMyAdmin → sélectionne ta base →
-- onglet "Importer" → choisis ce fichier → "Exécuter".
-- =====================================================================

-- Si ce script affiche une erreur du type "Duplicate column name", c'est
-- que la colonne existe déjà : tout est en ordre, tu peux l'ignorer.
ALTER TABLE seller_products
    ADD COLUMN department VARCHAR(50) NOT NULL DEFAULT 'electronique' AFTER seller_id;
