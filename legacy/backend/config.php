<?php
// =====================================================================
// CONFIGURATION DE LA BASE DE DONNÉES
// =====================================================================
// ⚠️ À FAIRE AVANT DE METTRE LE SITE EN LIGNE :
// Remplace les 3 valeurs ci-dessous par celles de TA base de données,
// que tu trouveras dans hPanel → Bases de données → Bases de données MySQL.
//
// - DB_NAME et DB_USER ressemblent à quelque chose comme "u123456789_saotech"
// - DB_PASS est le mot de passe que tu as choisi en créant la base
// - DB_HOST est presque toujours "localhost" sur l'hébergement Hostinger
// =====================================================================

define('DB_HOST', 'localhost');
define('DB_NAME', 'REMPLACER_PAR_LE_NOM_DE_LA_BASE');
define('DB_USER', 'REMPLACER_PAR_LUTILISATEUR_MYSQL');
define('DB_PASS', 'REMPLACER_PAR_LE_MOT_DE_PASSE');

// =====================================================================
// NOTIFICATIONS DE COMMANDE
// =====================================================================
// L'adresse e-mail qui reçoit une notification à chaque nouvelle commande
// (toi / ton équipe). Change-la si besoin.
define('ADMIN_NOTIFICATION_EMAIL', 'contact@saotechmarket.com');
