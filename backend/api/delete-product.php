<?php
// POST — Supprime un produit appartenant au vendeur connecté
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$sellerId = requireLogin();
$input = jsonInput();

$id = isset($input['id']) ? (int)$input['id'] - SELLER_ID_OFFSET : 0;
if ($id <= 0) {
    jsonResponse(['error' => 'Produit introuvable.'], 400);
}

$pdo = getDb();
$stmt = $pdo->prepare('DELETE FROM seller_products WHERE id = ? AND seller_id = ?');
$stmt->execute([$id, $sellerId]);

if ($stmt->rowCount() === 0) {
    jsonResponse(['error' => 'Produit introuvable ou vous n\'êtes pas autorisé(e) à le supprimer.'], 404);
}

jsonResponse(['success' => true]);
