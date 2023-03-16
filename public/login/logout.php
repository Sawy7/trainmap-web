<?php
require __DIR__ . "/../dbbase.php";

$auth = new \Delight\Auth\Auth($db);

try {
    $auth->logOutEverywhere();
}
finally {
    header("Location:/login");
    exit;
}
?>
