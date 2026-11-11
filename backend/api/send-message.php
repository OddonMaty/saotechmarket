<?php
// POST — Envoie un message dans une conversation existante (client ou vendeur)
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$who = requireCustomerOrSeller();
$input = jsonInput();

$conversationId = isset($input['conversationId']) ? (int)$input['conversationId'] : 0;
$message = trim($input['message'] ?? '');

if ($conversationId <= 0 || $message === '') {
    jsonResponse(['error' => 'Message invalide.'], 400);
}

$pdo = getDb();

if (!tableExists($pdo, 'conversations') || !tableExists($pdo, 'conversation_messages')) {
    jsonResponse(['error' => "La messagerie n'est pas encore disponible sur ce site (mise à jour de la base de données en attente)."], 503);
}

// Vérifie que cette conversation appartient bien à la personne connectée
$ownerColumn = $who['type'] === 'customer' ? 'customer_id' : 'seller_id';
$check = $pdo->prepare("SELECT id FROM conversations WHERE id = ? AND $ownerColumn = ?");
$check->execute([$conversationId, $who['id']]);
if (!$check->fetch()) {
    jsonResponse(['error' => 'Conversation introuvable ou accès refusé.'], 404);
}

$stmt = $pdo->prepare('INSERT INTO conversation_messages (conversation_id, sender_type, message) VALUES (?, ?, ?)');
$stmt->execute([$conversationId, $who['type'], $message]);

jsonResponse(['success' => true], 201);
