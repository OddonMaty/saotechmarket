<?php
// GET — Renvoie le client actuellement connecté (ou null)
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

if (empty($_SESSION['customer_id'])) {
    jsonResponse(['customer' => null]);
}

$pdo = getDb();
$stmt = $pdo->prepare('SELECT id, first_name, last_name, email, phone, city FROM customers WHERE id = ?');
$stmt->execute([$_SESSION['customer_id']]);
$customer = $stmt->fetch();

if (!$customer) {
    unset($_SESSION['customer_id']);
    jsonResponse(['customer' => null]);
}

jsonResponse(['customer' => [
    'id' => (int)$customer['id'],
    'firstName' => $customer['first_name'],
    'lastName' => $customer['last_name'],
    'email' => $customer['email'],
    'phone' => $customer['phone'],
    'city' => $customer['city'],
]]);
