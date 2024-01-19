<?php
require __DIR__ . "/../dbbase.php";

$auth = new \Delight\Auth\Auth($db);

try {
    $auth->resetPassword($_POST['selector'], $_POST['token'], $_POST['password']);
    header("Location:/login?success=password-set");
    exit;
}
catch (\Delight\Auth\InvalidSelectorTokenPairException $e) {
    header("Location:/login?error=invalid-selector-token");
    exit;
}
catch (\Delight\Auth\TokenExpiredException $e) {
    header("Location:/login?error=token-expired");
    exit;
}
catch (\Delight\Auth\ResetDisabledException $e) {
    header("Location:/login?error=resets-disabled");
    exit;
}
catch (\Delight\Auth\InvalidPasswordException $e) {
    header("Location:/login?error=wrong-pass");
    exit;
}
catch (\Delight\Auth\TooManyRequestsException $e) {
    header("Location:/login?error=too-many-reqs");
    exit;
}
?>