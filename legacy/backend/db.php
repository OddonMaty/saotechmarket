<?php
// =====================================================================
// Connexion à la base de données (PDO / MySQL)
// =====================================================================
require_once __DIR__ . '/config.php';

function getDb() {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'error' => "Connexion à la base de données impossible. Vérifiez les identifiants dans backend/config.php."
            ]);
            exit;
        }
    }

    return $pdo;
}
