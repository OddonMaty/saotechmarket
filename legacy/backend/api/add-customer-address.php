<?php
// POST — Ajoute une nouvelle adresse au carnet du client connecté
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$customerId = requireCustomerLogin();
$input = jsonInput();

$label = trim($input['label'] ?? '') ?: 'Adresse';
$city = trim($input['city'] ?? 'Bukavu');
$address = trim($input['address'] ?? '');
$phone = trim($input['phone'] ?? '');
$isDefault = !empty($input['isDefault']) ? 1 : 0;

if (!in_array($city, ALLOWED_CITIES, true)) {
    $city = 'Bukavu';
}

if ($address === '' || $phone === '') {
    jsonResponse(['error' => 'Merci de renseigner une adresse et un numéro de téléphone.'], 400);
}

$pdo = getDb();

// Si cette adresse devient la valeur par défaut, on retire ce statut des autres
if ($isDefault) {
    $reset = $pdo->prepare('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?');
    $reset->execute([$customerId]);
}

// La toute première adresse enregistrée devient automatiquement la valeur par défaut
$countStmt = $pdo->prepare('SELECT COUNT(*) FROM customer_addresses WHERE customer_id = ?');
$countStmt->execute([$customerId]);
if ((int)$countStmt->fetchColumn() === 0) {
    $isDefault = 1;
}

$stmt = $pdo->prepare('INSERT INTO customer_addresses (customer_id, label, city, address, phone, is_default) VALUES (?, ?, ?, ?, ?, ?)');
$stmt->execute([$customerId, $label, $city, $address, $phone, $isDefault]);

jsonResponse(['success' => true, 'id' => (int)$pdo->lastInsertId()], 201);
