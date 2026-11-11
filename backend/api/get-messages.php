<?php
// GET ?conversationId=X — Renvoie tous les messages d'une conversation, et
// marque comme lus les messages envoyés par l'autre partie.
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$who = requireCustomerOrSeller();
$conversationId = isset($_GET['conversationId']) ? (int)$_GET['conversationId'] : 0;

if ($conversationId <= 0) {
    jsonResponse(['error' => 'Conversation introuvable.'], 400);
}

$pdo = getDb();

if (!tableExists($pdo, 'conversations') || !tableExists($pdo, 'conversation_messages')) {
    jsonResponse(['error' => "La messagerie n'est pas encore disponible sur ce site (mise à jour de la base de données en attente)."], 503);
}

$ownerColumn = $who['type'] === 'customer' ? 'customer_id' : 'seller_id';
$check = $pdo->prepare("
    SELECT c.*, s.shop_name, cu.first_name, cu.last_name
    FROM conversations c
    JOIN sellers s ON s.id = c.seller_id
    JOIN customers cu ON cu.id = c.customer_id
    WHERE c.id = ? AND c.$ownerColumn = ?
");
$check->execute([$conversationId, $who['id']]);
$conversation = $check->fetch();

if (!$conversation) {
    jsonResponse(['error' => 'Conversation introuvable ou accès refusé.'], 404);
}

// Marque comme lus les messages envoyés par l'AUTRE partie
$otherType = $who['type'] === 'customer' ? 'seller' : 'customer';
$markRead = $pdo->prepare('UPDATE conversation_messages SET is_read = 1 WHERE conversation_id = ? AND sender_type = ?');
$markRead->execute([$conversationId, $otherType]);

$stmt = $pdo->prepare('SELECT * FROM conversation_messages WHERE conversation_id = ? ORDER BY created_at ASC');
$stmt->execute([$conversationId]);
$rows = $stmt->fetchAll();

$messages = array_map(function ($row) {
    return [
        'id' => (int)$row['id'],
        'senderType' => $row['sender_type'],
        'message' => $row['message'],
        'createdAt' => str_replace(' ', 'T', $row['created_at']),
    ];
}, $rows);

jsonResponse([
    'conversation' => [
        'id' => (int)$conversation['id'],
        'sellerName' => $conversation['shop_name'],
        'customerName' => trim($conversation['first_name'] . ' ' . $conversation['last_name']),
        'contextProductName' => $conversation['context_product_name'],
    ],
    'messages' => $messages,
]);
