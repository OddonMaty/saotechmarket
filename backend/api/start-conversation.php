<?php
// POST — Le client démarre une conversation avec un vendeur (ou récupère la
// conversation existante s'il en a déjà une avec ce vendeur), et envoie son
// premier message.
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$customerId = requireCustomerLogin();
$input = jsonInput();

$sellerId = isset($input['sellerId']) ? (int)$input['sellerId'] : 0;
$productName = trim($input['productName'] ?? '');
$message = trim($input['message'] ?? '');

if ($sellerId <= 0) {
    jsonResponse(['error' => 'Vendeur introuvable.'], 400);
}
if ($message === '') {
    jsonResponse(['error' => 'Merci de saisir un message.'], 400);
}

$pdo = getDb();

if (!tableExists($pdo, 'conversations') || !tableExists($pdo, 'conversation_messages')) {
    jsonResponse(['error' => "La messagerie n'est pas encore disponible sur ce site : la mise à jour de la base de données n'a pas encore été appliquée. Contacte l'administrateur du site."], 503);
}

// Le vendeur doit exister
$sellerCheck = $pdo->prepare('SELECT id FROM sellers WHERE id = ?');
$sellerCheck->execute([$sellerId]);
if (!$sellerCheck->fetch()) {
    jsonResponse(['error' => 'Vendeur introuvable.'], 404);
}

// Récupère la conversation existante entre ce client et ce vendeur, ou en crée une
$find = $pdo->prepare('SELECT id FROM conversations WHERE customer_id = ? AND seller_id = ?');
$find->execute([$customerId, $sellerId]);
$conversation = $find->fetch();

if ($conversation) {
    $conversationId = (int)$conversation['id'];
    if ($productName !== '') {
        $update = $pdo->prepare('UPDATE conversations SET context_product_name = ? WHERE id = ?');
        $update->execute([$productName, $conversationId]);
    }
} else {
    $insert = $pdo->prepare('INSERT INTO conversations (customer_id, seller_id, context_product_name) VALUES (?, ?, ?)');
    $insert->execute([$customerId, $sellerId, $productName ?: null]);
    $conversationId = (int)$pdo->lastInsertId();
}

$msgStmt = $pdo->prepare('INSERT INTO conversation_messages (conversation_id, sender_type, message) VALUES (?, ?, ?)');
$msgStmt->execute([$conversationId, 'customer', $message]);

jsonResponse(['success' => true, 'conversationId' => $conversationId], 201);
