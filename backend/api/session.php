<?php
// GET — Renvoie le vendeur actuellement connecté (ou null)
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

if (empty($_SESSION['seller_id'])) {
    jsonResponse(['seller' => null]);
}

$pdo = getDb();
$stmt = $pdo->prepare('SELECT id, shop_name, owner_name, phone, email, city FROM sellers WHERE id = ?');
$stmt->execute([$_SESSION['seller_id']]);
$seller = $stmt->fetch();

if (!$seller) {
    // Le compte a peut-être été supprimé entre-temps : on nettoie la session.
    $_SESSION = [];
    jsonResponse(['seller' => null]);
}

jsonResponse(['seller' => [
    'id' => (int)$seller['id'],
    'shopName' => $seller['shop_name'],
    'ownerName' => $seller['owner_name'],
    'phone' => $seller['phone'],
    'email' => $seller['email'],
    'city' => $seller['city'],
]]);
