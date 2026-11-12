<?php
// POST — Supprime une adresse appartenant au client connecté
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$customerId = requireCustomerLogin();
$input = jsonInput();

$id = isset($input['id']) ? (int)$input['id'] : 0;
if ($id <= 0) {
    jsonResponse(['error' => 'Adresse introuvable.'], 400);
}

$pdo = getDb();
$stmt = $pdo->prepare('DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?');
$stmt->execute([$id, $customerId]);

if ($stmt->rowCount() === 0) {
    jsonResponse(['error' => 'Adresse introuvable ou vous n\'êtes pas autorisé(e) à la supprimer.'], 404);
}

jsonResponse(['success' => true]);
