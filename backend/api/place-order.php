<?php
// POST — Enregistre une nouvelle commande pour le client connecté
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$customerId = requireCustomerLogin();
$input = jsonInput();

$items = $input['items'] ?? null;
$shippingCity = trim($input['shippingCity'] ?? '');
$shippingAddress = trim($input['shippingAddress'] ?? '');
$shippingPhone = trim($input['shippingPhone'] ?? '');

if (!is_array($items) || count($items) === 0) {
    jsonResponse(['error' => 'Votre panier est vide.'], 400);
}
if ($shippingCity === '' || $shippingAddress === '' || $shippingPhone === '') {
    jsonResponse(['error' => 'Merci de renseigner une ville, une adresse et un téléphone de livraison.'], 400);
}

// Recalcule le total côté serveur à partir des articles reçus (on ne fait
// jamais confiance à un total envoyé par le navigateur).
$total = 0;
$cleanItems = [];
foreach ($items as $item) {
    $price = isset($item['price']) ? (float)$item['price'] : 0;
    $quantity = isset($item['quantity']) ? max(1, (int)$item['quantity']) : 1;
    $total += $price * $quantity;
    $cleanItems[] = [
        'id' => $item['id'] ?? null,
        'name' => isset($item['name']) ? (string)$item['name'] : 'Produit',
        'price' => $price,
        'quantity' => $quantity,
        'image' => $item['image'] ?? null,
        'color' => $item['color'] ?? '',
        'size' => $item['size'] ?? '',
    ];
}

$orderNumber = 'CMD-' . date('ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));

$pdo = getDb();
$stmt = $pdo->prepare('
    INSERT INTO orders (customer_id, order_number, items, total_price, shipping_city, shipping_address, shipping_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
');
$stmt->execute([
    $customerId,
    $orderNumber,
    json_encode($cleanItems, JSON_UNESCAPED_UNICODE),
    $total,
    $shippingCity,
    $shippingAddress,
    $shippingPhone
]);

jsonResponse([
    'success' => true,
    'orderNumber' => $orderNumber,
    'total' => $total
], 201);
