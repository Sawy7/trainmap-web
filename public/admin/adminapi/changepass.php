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
    $auth->admin()->changePasswordForUserById($userID, $_POST["password"]);
    die('{"type": "success", "value": "success"}');
}
catch (\Delight\Auth\UnknownIdException $e) {
    die('{"type": "error", "value": "wrong-email"}');
}
catch (\Delight\Auth\InvalidPasswordException $e) {
    die('{"type": "error", "value": "wrong-pass"}');
}
?>