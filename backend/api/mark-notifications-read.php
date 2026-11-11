<?php
// POST — Marque toutes les notifications du vendeur connecté comme lues
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$sellerId = requireLogin();

$pdo = getDb();

if (!tableExists($pdo, 'seller_notifications')) {
    jsonResponse(['success' => true]);
}

$stmt = $pdo->prepare('UPDATE seller_notifications SET is_read = 1 WHERE seller_id = ? AND is_read = 0');
$stmt->execute([$sellerId]);

jsonResponse(['success' => true]);
