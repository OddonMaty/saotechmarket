<?php
// POST — Ajoute un nouveau produit à la boutique du vendeur connecté
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$sellerId = requireLogin();
$input = jsonInput();

$name = trim($input['name'] ?? '');
$category = trim($input['category'] ?? '');
$department = trim($input['department'] ?? '');
$price = isset($input['price']) ? (float)$input['price'] : null;
$originalPrice = (isset($input['originalPrice']) && $input['originalPrice'] !== null && $input['originalPrice'] !== '')
    ? (float)$input['originalPrice'] : null;
$image = trim($input['image'] ?? '');
$description = trim($input['description'] ?? '');
$colors = isset($input['colors']) && is_array($input['colors'])
    ? implode(',', array_filter(array_map('trim', $input['colors']))) : '';
$sizes = isset($input['sizes']) && is_array($input['sizes'])
    ? implode(',', array_filter(array_map('trim', $input['sizes']))) : '';
$images = isset($input['images']) && is_array($input['images'])
    ? implode(',', array_filter(array_map('trim', $input['images']))) : '';
$inStock = !empty($input['inStock']) ? 1 : 0;

if ($name === '' || $category === '' || $price === null || $price < 0 || $description === '') {
    jsonResponse(['error' => 'Merci de remplir tous les champs obligatoires du produit.'], 400);
}
if (!in_array($department, ALLOWED_DEPARTMENTS, true)) {
    jsonResponse(['error' => 'Merci de choisir un rayon valide pour ce produit.'], 400);
}

$discount = ($originalPrice && $originalPrice > $price)
    ? (int)round((1 - $price / $originalPrice) * 100) : 0;
$sku = 'V-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));

$pdo = getDb();
$stmt = $pdo->prepare('
    INSERT INTO seller_products
        (seller_id, department, name, category, price, original_price, discount, image, description, colors, sizes, images, in_stock, sku, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
');
$stmt->execute([
    $sellerId, $department, $name, $category, $price, $originalPrice, $discount,
    $image, $description, $colors, $sizes, $images, $inStock, $sku, ''
]);

jsonResponse(['success' => true, 'id' => SELLER_ID_OFFSET + (int)$pdo->lastInsertId()], 201);
