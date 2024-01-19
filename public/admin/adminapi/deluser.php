<?php
require __DIR__ . "/../../dbbase.php";

$auth = new \Delight\Auth\Auth($db);

if (!$auth->hasRole(\Delight\Auth\Role::ADMIN)) {
    die('{"type": "error", "value": "permissions"}');
}

try {
    $auth->admin()->deleteUserByEmail($_POST['email']);
    die('{"type": "success", "value": "success"}');
}
catch (\Delight\Auth\InvalidEmailException $e) {
    die('{"type": "error", "value": "wrong-email"}');
}
?>