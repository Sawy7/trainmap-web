<?php
require __DIR__ . "/../../dbbase.php";

$auth = new \Delight\Auth\Auth($db);

if (!$auth->hasRole(\Delight\Auth\Role::ADMIN)) {
    die('{"type": "error", "value": "permissions"}');
}

try {
    $userId = $auth->register($_POST['email'], $_POST['password'], $_POST['username']);
    die('{"type": "success", "value": "success"}');
}
catch (\Delight\Auth\InvalidEmailException $e) {
    die('{"type": "error", "value": "wrong-email"}');
}
catch (\Delight\Auth\InvalidPasswordException $e) {
    die('{"type": "error", "value": "wrong-pass"}');
}
catch (\Delight\Auth\UserAlreadyExistsException $e) {
    die('{"type": "error", "value": "user-exists"}');
}
catch (\Delight\Auth\TooManyRequestsException $e) {
    die('{"type": "error", "value": "too-many-reqs"}');
}
?>