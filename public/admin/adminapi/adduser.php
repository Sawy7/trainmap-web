<?php
require __DIR__ . "/../../dbbase.php";

$auth = new \Delight\Auth\Auth($db);

if (!$auth->hasRole(\Delight\Auth\Role::ADMIN)) {
    die('{"type": "error", "value": "permissions"}');
}

try {
    $userId = $auth->admin()->createUser($_POST['email'], $_POST['password'], NULL);
    $auth->forgotPassword($_POST['email'], function ($selector, $token) {
        $url = $_SERVER['SERVER_NAME'];
        if ($_SERVER['SERVER_PORT'] == 80)
            $url = 'http://' . $url;
        else if ($_SERVER['SERVER_PORT'] == 443)
            $url = 'https://' . $url;
        else
            $url .= ':' . $_SERVER['SERVER_PORT'];
        $url .= '/resetpass?selector=' . \urlencode($selector) . '&token=' . \urlencode($token) . '&email=' . \urlencode($_POST['email']);
        die('{"type": "success", "value": "success", "reseturl": "' . $url . '"}');
    });
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
