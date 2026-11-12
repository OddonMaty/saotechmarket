<?php
// GET — Liste les commandes du client actuellement connecté
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$customerId = requireCustomerLogin();

$pdo = getDb();
$stmt = $pdo->prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC');
$stmt->execute([$customerId]);
$rows = $stmt->fetchAll();

$orders = array_map(function ($row) {
    return [
        'orderNumber' => $row['order_number'],
        'items' => json_decode($row['items'], true) ?: [],
        'totalPrice' => (float)$row['total_price'],
        'shippingCity' => $row['shipping_city'],
        'shippingAddress' => $row['shipping_address'],
        'shippingPhone' => $row['shipping_phone'],
        'status' => $row['status'],
        'createdAt' => $row['created_at'],
    ];
}, $rows);

jsonResponse(['orders' => $orders]);
