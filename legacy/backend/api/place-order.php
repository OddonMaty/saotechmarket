<?php
// POST — Enregistre une nouvelle commande pour le client connecté
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$customerId = requireCustomerLogin();
$input = jsonInput();

$items = $input['items'] ?? null;
$shippingCity = trim($input['shippingCity'] ?? '');
$shippingAddress = trim($input['shippingAddress'] ?? '');
$shippingPhone = trim($input['shippingPhone'] ?? '');

if (!is_array($items) || count($items) === 0) {
    jsonResponse(['error' => 'Votre panier est vide.'], 400);
}
if ($shippingCity === '' || $shippingAddress === '' || $shippingPhone === '') {
    jsonResponse(['error' => 'Merci de renseigner une ville, une adresse et un téléphone de livraison.'], 400);
}

$pdo = getDb();

// Recalcule le total côté serveur à partir des articles reçus et sécurise les prix
// en interrogeant directement la base pour les produits vendeurs.
$total = 0;
$cleanItems = [];
$sellerProductStmt = $pdo->prepare('SELECT id, name, price, in_stock FROM seller_products WHERE id = ?');

foreach ($items as $item) {
    $itemId = isset($item['id']) ? (int)$item['id'] : 0;
    $quantity = isset($item['quantity']) ? max(1, (int)$item['quantity']) : 1;
    $name = isset($item['name']) ? (string)$item['name'] : 'Produit';
    $price = isset($item['price']) ? (float)$item['price'] : 0;

    // Pour les produits vendeurs, on récupère le vrai prix et nom depuis la BDD
    if ($itemId > SELLER_ID_OFFSET) {
        $realProductId = $itemId - SELLER_ID_OFFSET;
        $sellerProductStmt->execute([$realProductId]);
        $spRow = $sellerProductStmt->fetch();
        if ($spRow) {
            $price = (float)$spRow['price'];
            $name = (string)$spRow['name'];
        }
    }

    if ($price < 0) {
        $price = 0;
    }

    $total += $price * $quantity;
    $cleanItems[] = [
        'id' => $itemId > 0 ? $itemId : null,
        'name' => $name,
        'price' => $price,
        'quantity' => $quantity,
        'image' => $item['image'] ?? null,
        'color' => $item['color'] ?? '',
        'size' => $item['size'] ?? '',
    ];
}

$orderNumber = 'CMD-' . date('ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));

$stmt = $pdo->prepare('
    INSERT INTO orders (customer_id, order_number, items, total_price, shipping_city, shipping_address, shipping_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
');
$stmt->execute([
    $customerId,
    $orderNumber,
    json_encode($cleanItems, JSON_UNESCAPED_UNICODE),
    $total,
    $shippingCity,
    $shippingAddress,
    $shippingPhone
]);

// ---------------------------------------------------------------------
// Notifications par e-mail : une pour l'équipe Sao Tech Market avec le
// détail complet, et une pour chaque vendeur dont au moins un produit
// fait partie de cette commande (avec seulement ses propres articles).
// Un échec d'envoi n'empêche jamais la commande d'être enregistrée.
// ---------------------------------------------------------------------
$customerStmt = $pdo->prepare('SELECT first_name, last_name, email, phone FROM customers WHERE id = ?');
$customerStmt->execute([$customerId]);
$customer = $customerStmt->fetch();
$customerName = $customer ? trim($customer['first_name'] . ' ' . $customer['last_name']) : 'Client';
$customerEmail = $customer ? $customer['email'] : '';

// Taux de conversion approximatif utilisé uniquement pour l'affichage dans
// les e-mails (le site affiche toujours les prix en FC au taux du jour ;
// cette valeur de référence peut légèrement différer du taux exact du jour).
define('EMAIL_DISPLAY_USD_TO_CDF_RATE', 2800);
function formatFcForEmail($usdAmount) {
    return number_format($usdAmount * EMAIL_DISPLAY_USD_TO_CDF_RATE, 0, ',', ' ') . ' FC';
}

$itemsSummary = '';
foreach ($cleanItems as $item) {
    $itemsSummary .= "- {$item['name']} (x{$item['quantity']}) — " . formatFcForEmail($item['price'] * $item['quantity']) . "\n";
}

$deliveryInfo = "Client : $customerName ($customerEmail, $shippingPhone)\nLivraison : $shippingAddress, $shippingCity\n";

// 1) Notification à l'équipe Sao Tech Market (toujours, avec tous les articles)
sendNotificationEmail(
    ADMIN_NOTIFICATION_EMAIL,
    "Nouvelle commande $orderNumber",
    "Une nouvelle commande vient d'être passée sur Sao Tech Market.\n\n" .
    "Commande : $orderNumber\n$deliveryInfo\nArticles :\n$itemsSummary\n" .
    "Total : " . formatFcForEmail($total) . " (montant approximatif, voir le montant exact dans phpMyAdmin)\n\n" .
    "Connectez-vous à phpMyAdmin pour voir le détail complet."
);

// 2) Notification à chaque vendeur concerné, uniquement pour ses propres articles
$sellerItemsMap = []; // seller_id => ['seller' => [...], 'items' => [...]]
foreach ($cleanItems as $item) {
    $itemId = (int)($item['id'] ?? 0);
    if ($itemId <= SELLER_ID_OFFSET) continue; // produit du catalogue officiel, pas un vendeur tiers

    $realProductId = $itemId - SELLER_ID_OFFSET;
    $sellerLookup = $pdo->prepare('
        SELECT s.id AS seller_id, s.shop_name, s.email, s.is_official
        FROM seller_products sp
        JOIN sellers s ON s.id = sp.seller_id
        WHERE sp.id = ?
    ');
    $sellerLookup->execute([$realProductId]);
    $sellerRow = $sellerLookup->fetch();
    if (!$sellerRow) continue;

    $sid = (int)$sellerRow['seller_id'];
    if (!isset($sellerItemsMap[$sid])) {
        $sellerItemsMap[$sid] = ['seller' => $sellerRow, 'items' => []];
    }
    $sellerItemsMap[$sid]['items'][] = $item;
}

foreach ($sellerItemsMap as $sid => $data) {
    $seller = $data['seller'];
    $sellerItemsSummary = '';
    foreach ($data['items'] as $item) {
        $sellerItemsSummary .= "- {$item['name']} (x{$item['quantity']}) — " . formatFcForEmail($item['price'] * $item['quantity']) . "\n";

        // Notification en base de données : plus fiable qu'un e-mail (les
        // e-mails via mail() PHP arrivent parfois en spam ou pas du tout
        // sur certains hébergements). Visible directement dans le tableau
        // de bord du vendeur, avec un badge non-lu.
        //
        // IMPORTANT : entouré d'un try/catch. Si la table n'existe pas
        // encore (migration pas encore importée), la commande doit quand
        // même être enregistrée avec succès — cette notification est un
        // bonus, jamais une condition bloquante.
        try {
            $notifStmt = $pdo->prepare('
                INSERT INTO seller_notifications (seller_id, order_number, product_name, quantity)
                VALUES (?, ?, ?, ?)
            ');
            $notifStmt->execute([$sid, $orderNumber, $item['name'], $item['quantity']]);
        } catch (\Throwable $e) {
            // On ignore silencieusement : la commande reste valide même
            // sans notification (ex. table "seller_notifications" absente).
        }
    }

    sendNotificationEmail(
        $seller['email'],
        "Nouvelle vente sur votre boutique — commande $orderNumber",
        "Bonjour {$seller['shop_name']},\n\n" .
        "Un ou plusieurs de vos produits viennent d'être commandés sur Sao Tech Market !\n\n" .
        "Commande : $orderNumber\n$deliveryInfo\nVos articles commandés :\n$sellerItemsSummary\n" .
        "Connectez-vous à votre espace vendeur pour voir votre tableau de bord.\n\n" .
        "— Sao Tech Market"
    );
}

jsonResponse([
    'success' => true,
    'orderNumber' => $orderNumber,
    'total' => $total
], 201);
