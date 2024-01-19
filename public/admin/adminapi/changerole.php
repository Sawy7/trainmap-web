<?php
require __DIR__ . "/../../dbbase.php";

$auth = new \Delight\Auth\Auth($db);

if (!$auth->hasRole(\Delight\Auth\Role::ADMIN)) {
    die('{"type": "error", "value": "permissions"}');
}

$rs = $db->prepare("SELECT id FROM users WHERE email = ?;");
$rs->execute([$_POST["email"]]);
$userID = $rs->fetch()["id"];

try {
    // Get new role
    $newRole = $_POST["role"];

    // Remove existing roles
    $userRoles = $auth->admin()->getRolesForUserById($userID);
    $allRolesValue = \Delight\Auth\Role::getMap();
    $allRolesName = array_flip($allRolesValue);
    foreach ($userRoles as &$role) {
        $toRemove = $allRolesName[$role];
        $auth->admin()->removeRoleForUserById($userID, $toRemove);
    }

    // Assign new role
    if (array_key_exists($newRole, $allRolesValue))
        $auth->admin()->addRoleForUserById($userID, $newRole);
    die('{"type": "success", "value": "success"}');
}
catch (\Delight\Auth\UnknownIdException $e) {
    die('{"type": "error", "value": "wrong-email"}');
}
catch (\Delight\Auth\InvalidPasswordException $e) {
    die('{"type": "error", "value": "wrong-pass"}');
}
?>