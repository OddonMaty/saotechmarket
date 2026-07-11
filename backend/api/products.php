<?php
// GET — Liste PUBLIQUE de tous les produits publiés par tous les vendeurs
// (utilisée pour les afficher dans le catalogue général du site, et pour
// que le tableau de bord de chaque vendeur puisse filtrer ses propres produits)
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$pdo = getDb();
$stmt = $pdo->query('
    SELECT sp.*, s.shop_name
    FROM seller_products sp
    JOIN sellers s ON s.id = sp.seller_id
    ORDER BY sp.created_at DESC
');
$rows = $stmt->fetchAll();

$products = array_map(function ($row) {
    return formatSellerProductRow($row, $row['shop_name']);
}, $rows);

jsonResponse(['products' => $products]);
