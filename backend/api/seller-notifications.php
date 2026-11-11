<?php
// GET — Liste les notifications du vendeur connecté (les plus récentes en premier)
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$sellerId = requireLogin();

$pdo = getDb();

if (!tableExists($pdo, 'seller_notifications')) {
    jsonResponse(['notifications' => [], 'unreadCount' => 0]);
}

$stmt = $pdo->prepare('SELECT * FROM seller_notifications WHERE seller_id = ? ORDER BY created_at DESC LIMIT 30');
$stmt->execute([$sellerId]);
$rows = $stmt->fetchAll();

$countStmt = $pdo->prepare('SELECT COUNT(*) FROM seller_notifications WHERE seller_id = ? AND is_read = 0');
$countStmt->execute([$sellerId]);
$unreadCount = (int)$countStmt->fetchColumn();

$notifications = array_map(function ($row) {
    return [
        'id' => (int)$row['id'],
        'orderNumber' => $row['order_number'],
        'productName' => $row['product_name'],
        'quantity' => (int)$row['quantity'],
        'isRead' => (bool)$row['is_read'],
        'createdAt' => str_replace(' ', 'T', $row['created_at']),
    ];
}, $rows);

jsonResponse(['notifications' => $notifications, 'unreadCount' => $unreadCount]);
