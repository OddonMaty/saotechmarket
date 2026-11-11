<?php
// =====================================================================
// Fonctions utilitaires communes à toutes les pages de l'API
// =====================================================================

// Charge la configuration en tout premier (identifiants base de données,
// e-mail admin...) : ainsi, la vraie valeur définie dans config.php a
// toujours priorité sur les valeurs de secours ci-dessous, quel que soit
// l'ordre des require_once dans les fichiers qui appellent helpers.php.
require_once __DIR__ . '/config.php';

// Ajuste automatiquement la sécurité du cookie de session selon que le
// site est servi en https (cas normal sur Hostinger avec le SSL gratuit)
// ou en http (ex. tests locaux).
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

session_set_cookie_params([
    'lifetime' => 60 * 60 * 24 * 30, // 30 jours
    'path' => '/',
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

header('Content-Type: application/json; charset=utf-8');

// Lit le corps JSON envoyé par le site (fetch) et le renvoie sous forme de tableau PHP
function jsonInput() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// Envoie une réponse JSON et arrête l'exécution du script
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Vérifie qu'un vendeur est bien connecté ; sinon, arrête avec une erreur 401.
// Retourne l'identifiant du vendeur connecté.
function requireLogin() {
    if (empty($_SESSION['seller_id'])) {
        jsonResponse(['error' => 'Vous devez être connecté(e) à votre espace vendeur.'], 401);
    }
    return (int)$_SESSION['seller_id'];
}

// Vérifie qu'un client est bien connecté ; sinon, arrête avec une erreur 401.
// Retourne l'identifiant du client connecté.
function requireCustomerLogin() {
    if (empty($_SESSION['customer_id'])) {
        jsonResponse(['error' => 'Vous devez être connecté(e) à votre compte pour continuer.'], 401);
    }
    return (int)$_SESSION['customer_id'];
}

// Pour la messagerie : accepte indifféremment un client OU un vendeur
// connecté (les deux peuvent envoyer/lire des messages). Retourne un
// tableau ['type' => 'customer'|'seller', 'id' => ...].
function requireCustomerOrSeller() {
    if (!empty($_SESSION['customer_id'])) {
        return ['type' => 'customer', 'id' => (int)$_SESSION['customer_id']];
    }
    if (!empty($_SESSION['seller_id'])) {
        return ['type' => 'seller', 'id' => (int)$_SESSION['seller_id']];
    }
    jsonResponse(['error' => 'Vous devez être connecté(e) pour utiliser la messagerie.'], 401);
}

// Villes proposées aux clients et vendeurs à l'inscription. À tenir à jour
// avec les formulaires du site (index.html, js/sellers.js).
define('ALLOWED_CITIES', ['Bukavu', 'Uvira', 'Goma', 'Baraka', 'Autre']);

// Sécurité : si un site déjà en ligne n'a pas encore cette ligne dans son
// config.php (ajoutée après une mise à jour), on évite une erreur fatale
// en définissant une valeur de secours. Ajoute la vraie ligne dans ton
// config.php pour recevoir les notifications à la bonne adresse.
if (!defined('ADMIN_NOTIFICATION_EMAIL')) {
    define('ADMIN_NOTIFICATION_EMAIL', 'contact@saotechmarket.com');
}

// Envoie un e-mail de notification (nouvelle commande, etc.). Ne bloque
// jamais le reste du site : une erreur d'envoi est simplement ignorée.
function sendNotificationEmail($to, $subject, $message) {
    try {
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $headers .= "From: Sao Tech Market <" . ADMIN_NOTIFICATION_EMAIL . ">\r\n";
        @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $message, $headers);
    } catch (\Throwable $e) {
        // On ignore silencieusement : l'e-mail est un bonus, pas un
        // pré-requis pour que la commande soit enregistrée.
    }
}

// Les identifiants produits vendeurs sont décalés de cette valeur lorsqu'ils
// sont envoyés au site, afin de ne jamais entrer en collision avec les
// identifiants du catalogue officiel (js/data.js, qui utilise de petits
// nombres comme 1, 2, 3…).
define('SELLER_ID_OFFSET', 100000);

// Liste des rayons (départements) proposés aux vendeurs. À tenir à jour
// avec le menu "Nos produits" du site (js/main.js → departmentLabels).
define('ALLOWED_DEPARTMENTS', ['electronique', 'construction', 'vetements', 'imprimantes']);

// Vérifie qu'une table existe dans la base (utilisé pour éviter un plantage
// si une migration n'a pas encore été importée, plutôt qu'une erreur 500).
function tableExists($pdo, $tableName) {
    try {
        $stmt = $pdo->query('SHOW TABLES LIKE ' . $pdo->quote($tableName));
        return $stmt->rowCount() > 0;
    } catch (\Throwable $e) {
        return false;
    }
}

function formatSellerProductRow($row, $shopName, $isOfficial = false) {
    return [
        'id' => SELLER_ID_OFFSET + (int)$row['id'],
        'sellerId' => (int)$row['seller_id'],
        'sellerName' => $shopName,
        'isSellerProduct' => true,
        'isOfficial' => (bool)$isOfficial,
        'department' => $row['department'],
        'createdAt' => str_replace(' ', 'T', $row['created_at']),
        'name' => $row['name'],
        'category' => $row['category'],
        'price' => (float)$row['price'],
        'originalPrice' => $row['original_price'] !== null ? (float)$row['original_price'] : null,
        'discount' => (int)$row['discount'],
        'image' => $row['image'],
        'description' => $row['description'],
        'colors' => $row['colors'] !== null && $row['colors'] !== '' ? explode(',', $row['colors']) : [],
        'sizes' => $row['sizes'] !== null && $row['sizes'] !== '' ? explode(',', $row['sizes']) : [],
        'images' => $row['images'] !== null && $row['images'] !== '' ? explode(',', $row['images']) : [],
        'inStock' => (bool)$row['in_stock'],
        'rating' => (float)$row['rating'],
        'reviews' => (int)$row['reviews'],
        'sku' => $row['sku'],
        'tags' => $row['tags'] !== null && $row['tags'] !== '' ? explode(',', $row['tags']) : [],
    ];
}
