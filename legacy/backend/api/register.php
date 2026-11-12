<?php
// POST — Créer un nouveau compte vendeur
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$input = jsonInput();

$shopName = trim($input['shopName'] ?? '');
$ownerName = trim($input['ownerName'] ?? '');
$phone = trim($input['phone'] ?? '');
$email = strtolower(trim($input['email'] ?? ''));
$city = trim($input['city'] ?? 'Bukavu');
$password = (string)($input['password'] ?? '');

if (!$shopName || !$ownerName || !$phone || !$email || !$password) {
    jsonResponse(['error' => 'Merci de remplir tous les champs obligatoires.'], 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Adresse e-mail invalide.'], 400);
}
if (strlen($password) < 4) {
    jsonResponse(['error' => 'Le mot de passe doit contenir au moins 4 caractères.'], 400);
}

$pdo = getDb();

$check = $pdo->prepare('SELECT id FROM sellers WHERE email = ?');
$check->execute([$email]);
if ($check->fetch()) {
    jsonResponse(['error' => 'Un compte vendeur existe déjà avec cette adresse e-mail.'], 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$insert = $pdo->prepare('INSERT INTO sellers (shop_name, owner_name, phone, email, city, password_hash) VALUES (?, ?, ?, ?, ?, ?)');
$insert->execute([$shopName, $ownerName, $phone, $email, $city, $hash]);

$_SESSION['seller_id'] = (int)$pdo->lastInsertId();

jsonResponse([
    'id' => $_SESSION['seller_id'],
    'shopName' => $shopName,
    'ownerName' => $ownerName,
    'phone' => $phone,
    'email' => $email,
    'city' => $city,
    'isOfficial' => false,
], 201);
