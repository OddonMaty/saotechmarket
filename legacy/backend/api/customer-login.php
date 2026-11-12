<?php
// POST — Connexion à un compte client existant
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$input = jsonInput();
$email = strtolower(trim($input['email'] ?? ''));
$password = (string)($input['password'] ?? '');

if (!$email || !$password) {
    jsonResponse(['error' => 'Merci de renseigner votre e-mail et votre mot de passe.'], 400);
}

$pdo = getDb();
$stmt = $pdo->prepare('SELECT * FROM customers WHERE email = ?');
$stmt->execute([$email]);
$customer = $stmt->fetch();

if (!$customer || !password_verify($password, $customer['password_hash'])) {
    jsonResponse(['error' => 'E-mail ou mot de passe incorrect.'], 401);
}

$_SESSION['customer_id'] = (int)$customer['id'];

jsonResponse([
    'id' => (int)$customer['id'],
    'firstName' => $customer['first_name'],
    'lastName' => $customer['last_name'],
    'email' => $customer['email'],
    'phone' => $customer['phone'],
    'city' => $customer['city'],
]);
