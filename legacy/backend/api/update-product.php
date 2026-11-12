<?php
// POST — Modifie un produit existant appartenant au vendeur connecté
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$sellerId = requireLogin();
$input = jsonInput();

$id = isset($input['id']) ? (int)$input['id'] - SELLER_ID_OFFSET : 0;
if ($id <= 0) {
    jsonResponse(['error' => 'Produit introuvable.'], 400);
}

$pdo = getDb();

// Vérifie que ce produit appartient bien au vendeur connecté avant de le modifier
$check = $pdo->prepare('SELECT id FROM seller_products WHERE id = ? AND seller_id = ?');
$check->execute([$id, $sellerId]);
if (!$check->fetch()) {
    jsonResponse(['error' => 'Produit introuvable ou vous n\'êtes pas autorisé(e) à le modifier.'], 404);
}

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

$stmt = $pdo->prepare('
    UPDATE seller_products
    SET department = ?, name = ?, category = ?, price = ?, original_price = ?, discount = ?,
        image = ?, description = ?, colors = ?, sizes = ?, images = ?, in_stock = ?
    WHERE id = ? AND seller_id = ?
');
$stmt->execute([
    $department, $name, $category, $price, $originalPrice, $discount,
    $image, $description, $colors, $sizes, $images, $inStock, $id, $sellerId
]);

jsonResponse(['success' => true]);
