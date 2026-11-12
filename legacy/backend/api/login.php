<?php
// POST — Connexion à un compte vendeur existant
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$input = jsonInput();
$email = strtolower(trim($input['email'] ?? ''));
$password = (string)($input['password'] ?? '');

if (!$email || !$password) {
    jsonResponse(['error' => 'Merci de renseigner votre e-mail et votre mot de passe.'], 400);
}

$pdo = getDb();
$stmt = $pdo->prepare('SELECT * FROM sellers WHERE email = ?');
$stmt->execute([$email]);
$seller = $stmt->fetch();

if (!$seller || !password_verify($password, $seller['password_hash'])) {
    jsonResponse(['error' => 'E-mail ou mot de passe incorrect.'], 401);
}

$_SESSION['seller_id'] = (int)$seller['id'];

jsonResponse([
    'id' => (int)$seller['id'],
    'shopName' => $seller['shop_name'],
    'ownerName' => $seller['owner_name'],
    'phone' => $seller['phone'],
    'email' => $seller['email'],
    'city' => $seller['city'],
    'isOfficial' => (bool)$seller['is_official'],
]);
