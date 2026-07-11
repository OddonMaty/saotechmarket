<?php
// POST — Créer un nouveau compte client
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$input = jsonInput();

$firstName = trim($input['firstName'] ?? '');
$lastName = trim($input['lastName'] ?? '');
$email = strtolower(trim($input['email'] ?? ''));
$phone = trim($input['phone'] ?? '');
$city = trim($input['city'] ?? 'Bukavu');
$password = (string)($input['password'] ?? '');
$newsletter = !empty($input['newsletter']) ? 1 : 0;

if (!in_array($city, ALLOWED_CITIES, true)) {
    $city = 'Bukavu';
}

if (!$firstName || !$lastName || !$email || !$phone || !$password) {
    jsonResponse(['error' => 'Merci de remplir tous les champs obligatoires.'], 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Adresse e-mail invalide.'], 400);
}
if (strlen($password) < 4) {
    jsonResponse(['error' => 'Le mot de passe doit contenir au moins 4 caractères.'], 400);
}

$pdo = getDb();

$check = $pdo->prepare('SELECT id FROM customers WHERE email = ?');
$check->execute([$email]);
if ($check->fetch()) {
    jsonResponse(['error' => 'Un compte existe déjà avec cette adresse e-mail.'], 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$insert = $pdo->prepare('INSERT INTO customers (first_name, last_name, email, phone, city, password_hash, newsletter) VALUES (?, ?, ?, ?, ?, ?, ?)');
$insert->execute([$firstName, $lastName, $email, $phone, $city, $hash, $newsletter]);

$_SESSION['customer_id'] = (int)$pdo->lastInsertId();

jsonResponse([
    'id' => $_SESSION['customer_id'],
    'firstName' => $firstName,
    'lastName' => $lastName,
    'email' => $email,
    'phone' => $phone,
    'city' => $city,
], 201);
