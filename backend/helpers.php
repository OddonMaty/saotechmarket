<?php
// =====================================================================
// Fonctions utilitaires communes à toutes les pages de l'API
// =====================================================================

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

// Villes proposées aux clients et vendeurs à l'inscription. À tenir à jour
// avec les formulaires du site (index.html, js/sellers.js).
define('ALLOWED_CITIES', ['Bukavu', 'Uvira', 'Goma', 'Baraka', 'Autre']);

// Les identifiants produits vendeurs sont décalés de cette valeur lorsqu'ils
// sont envoyés au site, afin de ne jamais entrer en collision avec les
// identifiants du catalogue officiel (js/data.js, qui utilise de petits
// nombres comme 1, 2, 3…).
define('SELLER_ID_OFFSET', 100000);

// Liste des rayons (départements) proposés aux vendeurs. À tenir à jour
// avec le menu "Nos produits" du site (js/main.js → departmentLabels).
define('ALLOWED_DEPARTMENTS', ['electronique', 'construction', 'vetements', 'imprimantes']);

function formatSellerProductRow($row, $shopName) {
    return [
        'id' => SELLER_ID_OFFSET + (int)$row['id'],
        'sellerId' => (int)$row['seller_id'],
        'sellerName' => $shopName,
        'isSellerProduct' => true,
        'department' => $row['department'],
        'name' => $row['name'],
        'category' => $row['category'],
        'price' => (float)$row['price'],
        'originalPrice' => $row['original_price'] !== null ? (float)$row['original_price'] : null,
        'discount' => (int)$row['discount'],
        'image' => $row['image'],
        'description' => $row['description'],
        'colors' => $row['colors'] !== null && $row['colors'] !== '' ? explode(',', $row['colors']) : [],
        'sizes' => $row['sizes'] !== null && $row['sizes'] !== '' ? explode(',', $row['sizes']) : [],
        'inStock' => (bool)$row['in_stock'],
        'rating' => (float)$row['rating'],
        'reviews' => (int)$row['reviews'],
        'sku' => $row['sku'],
        'tags' => $row['tags'] !== null && $row['tags'] !== '' ? explode(',', $row['tags']) : [],
    ];
}
