<?php
// POST — Déconnexion du client actuellement connecté
require_once __DIR__ . '/../helpers.php';

// On ne retire que la clé "customer_id" : si la même personne est aussi
// connectée à un espace vendeur dans le même navigateur, cette session
// vendeur reste active.
unset($_SESSION['customer_id']);

jsonResponse(['success' => true]);
