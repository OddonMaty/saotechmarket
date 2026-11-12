<?php
// GET — Liste les conversations de la personne connectée (client ou vendeur),
// avec un aperçu du dernier message et le nombre de messages non lus.
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$who = requireCustomerOrSeller();
$pdo = getDb();

if (!tableExists($pdo, 'conversations') || !tableExists($pdo, 'conversation_messages')) {
    jsonResponse(['conversations' => [], 'totalUnread' => 0]);
}

if ($who['type'] === 'customer') {
    $stmt = $pdo->prepare('
        SELECT c.*, s.shop_name AS other_name
        FROM conversations c
        JOIN sellers s ON s.id = c.seller_id
        WHERE c.customer_id = ?
        ORDER BY c.id DESC
    ');
    $otherType = 'seller';
} else {
    $stmt = $pdo->prepare('
        SELECT c.*, CONCAT(cu.first_name, " ", cu.last_name) AS other_name
        FROM conversations c
        JOIN customers cu ON cu.id = c.customer_id
        WHERE c.seller_id = ?
        ORDER BY c.id DESC
    ');
    $otherType = 'customer';
}
$stmt->execute([$who['id']]);
$rows = $stmt->fetchAll();

$conversations = [];
foreach ($rows as $row) {
    $lastMsgStmt = $pdo->prepare('SELECT message, sender_type, created_at FROM conversation_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1');
    $lastMsgStmt->execute([$row['id']]);
    $lastMsg = $lastMsgStmt->fetch();

    $unreadStmt = $pdo->prepare('SELECT COUNT(*) FROM conversation_messages WHERE conversation_id = ? AND sender_type = ? AND is_read = 0');
    $unreadStmt->execute([$row['id'], $otherType]);
    $unreadCount = (int)$unreadStmt->fetchColumn();

    $conversations[] = [
        'id' => (int)$row['id'],
        'otherName' => $row['other_name'],
        'contextProductName' => $row['context_product_name'],
        'lastMessage' => $lastMsg ? $lastMsg['message'] : '',
        'lastMessageAt' => $lastMsg ? str_replace(' ', 'T', $lastMsg['created_at']) : str_replace(' ', 'T', $row['created_at']),
        'unreadCount' => $unreadCount,
    ];
}

// Trie par message le plus récent d'abord
usort($conversations, function ($a, $b) {
    return strcmp($b['lastMessageAt'], $a['lastMessageAt']);
});

$totalUnread = array_sum(array_column($conversations, 'unreadCount'));

jsonResponse(['conversations' => $conversations, 'totalUnread' => $totalUnread]);
