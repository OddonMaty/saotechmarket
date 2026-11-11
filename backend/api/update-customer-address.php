<?php
// POST — Modifie une adresse existante appartenant au client connecté
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$customerId = requireCustomerLogin();
$input = jsonInput();

$id = isset($input['id']) ? (int)$input['id'] : 0;
if ($id <= 0) {
    jsonResponse(['error' => 'Adresse introuvable.'], 400);
}

$pdo = getDb();

$check = $pdo->prepare('SELECT id FROM customer_addresses WHERE id = ? AND customer_id = ?');
$check->execute([$id, $customerId]);
if (!$check->fetch()) {
    jsonResponse(['error' => 'Adresse introuvable ou vous n\'êtes pas autorisé(e) à la modifier.'], 404);
}

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

if ($isDefault) {
    $reset = $pdo->prepare('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?');
    $reset->execute([$customerId]);
}

$stmt = $pdo->prepare('UPDATE customer_addresses SET label = ?, city = ?, address = ?, phone = ?, is_default = ? WHERE id = ? AND customer_id = ?');
$stmt->execute([$label, $city, $address, $phone, $isDefault, $id, $customerId]);

jsonResponse(['success' => true]);
