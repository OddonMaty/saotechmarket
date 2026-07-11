<?php
// POST — Déconnexion du vendeur actuellement connecté
require_once __DIR__ . '/../helpers.php';

$_SESSION = [];
session_destroy();

jsonResponse(['success' => true]);
