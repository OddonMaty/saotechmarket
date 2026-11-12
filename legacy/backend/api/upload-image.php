<?php
// POST — Reçoit un fichier image envoyé depuis le téléphone/ordinateur d'un
// vendeur connecté, le valide, l'enregistre sur le serveur, et renvoie le
// chemin à utiliser comme "image" (ou entrée de "images") du produit.
require_once __DIR__ . '/../helpers.php';

// Authentification requise : seul un vendeur connecté peut téléverser une image.
requireLogin();

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE => "Le fichier est trop volumineux.",
        UPLOAD_ERR_FORM_SIZE => "Le fichier est trop volumineux.",
        UPLOAD_ERR_PARTIAL => "Le fichier n'a été que partiellement envoyé, réessaie.",
        UPLOAD_ERR_NO_FILE => "Aucun fichier reçu.",
    ];
    $code = $_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE;
    jsonResponse(['error' => $errorMessages[$code] ?? "Envoi du fichier impossible."], 400);
}

$file = $_FILES['file'];

// Limite de taille : 5 Mo (les photos de téléphone modernes peuvent
// facilement dépasser 5 Mo, mais on garde une limite raisonnable pour le site).
$maxSizeBytes = 5 * 1024 * 1024;
if ($file['size'] > $maxSizeBytes) {
    jsonResponse(['error' => "L'image est trop lourde (5 Mo maximum). Essaie une photo compressée."], 400);
}

// Vérifie le vrai contenu du fichier (pas seulement son nom), pour être sûr
// que c'est bien une image et pas un script déguisé.
$imageInfo = @getimagesize($file['tmp_name']);
if ($imageInfo === false) {
    jsonResponse(['error' => "Ce fichier ne semble pas être une image valide."], 400);
}

$allowedMimeToExt = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
];
$mime = $imageInfo['mime'] ?? '';
if (!isset($allowedMimeToExt[$mime])) {
    jsonResponse(['error' => "Format d'image non supporté. Utilise un JPG, PNG, WEBP ou GIF."], 400);
}

$uploadsDir = __DIR__ . '/../../uploads/products';
if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0755, true);
}
if (!is_dir($uploadsDir) || !is_writable($uploadsDir)) {
    jsonResponse(['error' => "Le dossier d'envoi des images n'est pas accessible en écriture sur le serveur."], 500);
}

$extension = $allowedMimeToExt[$mime];
$filename = 'p' . date('ymd') . '-' . bin2hex(random_bytes(8)) . '.' . $extension;
$destination = $uploadsDir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    jsonResponse(['error' => "Impossible d'enregistrer l'image sur le serveur."], 500);
}

jsonResponse(['success' => true, 'path' => 'uploads/products/' . $filename], 201);
