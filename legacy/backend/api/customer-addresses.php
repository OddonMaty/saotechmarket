<?php
// GET — Liste les adresses enregistrées du client connecté
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$customerId = requireCustomerLogin();

$pdo = getDb();
$stmt = $pdo->prepare('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC');
$stmt->execute([$customerId]);
$rows = $stmt->fetchAll();

$addresses = array_map(function ($row) {
    return [
        'id' => (int)$row['id'],
        'label' => $row['label'],
        'city' => $row['city'],
        'address' => $row['address'],
        'phone' => $row['phone'],
        'isDefault' => (bool)$row['is_default'],
    ];
}, $rows);

jsonResponse(['addresses' => $addresses]);
