<?php
require __DIR__ . "/../../dbbase.php";

$auth = new \Delight\Auth\Auth($db);

try {
    $auth->changePassword($_POST['oldpassword'], $_POST['newpassword']);
    die('{"type": "success", "value": "success"}');
}
catch (\Delight\Auth\NotLoggedInException $e) {
    die('{"type": "error", "value": "not-logged-in"}');
}
catch (\Delight\Auth\InvalidPasswordException $e) {
    die('{"type": "error", "value": "wrong-pass"}');
}
catch (\Delight\Auth\TooManyRequestsException $e) {
    die('{"type": "error", "value": "too-many-reqs"}');
}
?>