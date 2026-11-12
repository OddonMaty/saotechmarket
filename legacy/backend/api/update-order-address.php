<?php
// POST — Modifie l'adresse de livraison d'une commande existante, tant que
// celle-ci est encore "En attente" (pas encore expédiée/livrée)
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$customerId = requireCustomerLogin();
$input = jsonInput();

$orderNumber = trim($input['orderNumber'] ?? '');
$shippingCity = trim($input['shippingCity'] ?? '');
$shippingAddress = trim($input['shippingAddress'] ?? '');
$shippingPhone = trim($input['shippingPhone'] ?? '');

if ($orderNumber === '') {
    jsonResponse(['error' => 'Commande introuvable.'], 400);
}
if ($shippingCity === '' || $shippingAddress === '' || $shippingPhone === '') {
    jsonResponse(['error' => 'Merci de renseigner une ville, une adresse et un téléphone de livraison.'], 400);
}
if (!in_array($shippingCity, ALLOWED_CITIES, true)) {
    jsonResponse(['error' => 'Merci de choisir une ville valide.'], 400);
}

$pdo = getDb();

// Vérifie que la commande appartient bien au client connecté, et qu'elle
// peut encore être modifiée (pas déjà expédiée ou livrée).
$check = $pdo->prepare('SELECT status FROM orders WHERE order_number = ? AND customer_id = ?');
$check->execute([$orderNumber, $customerId]);
$order = $check->fetch();

if (!$order) {
    jsonResponse(['error' => 'Commande introuvable ou vous n\'êtes pas autorisé(e) à la modifier.'], 404);
}
if ($order['status'] !== 'En attente') {
    jsonResponse(['error' => 'Cette commande est déjà en cours de livraison : son adresse ne peut plus être modifiée en ligne. Contactez notre service client.'], 409);
}

$stmt = $pdo->prepare('UPDATE orders SET shipping_city = ?, shipping_address = ?, shipping_phone = ? WHERE order_number = ? AND customer_id = ?');
$stmt->execute([$shippingCity, $shippingAddress, $shippingPhone, $orderNumber, $customerId]);

jsonResponse(['success' => true]);
