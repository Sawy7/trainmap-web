<?php

header("Access-Control-Allow-Origin: *"); // NOTE: This can be configured in Apache
header("Content-Type: application/json");

// TODO: Make timestamp update process automatic (somehow)
$lastOnlineUpdate = 1673034014186;

echo '{ "type": "OnlineDBCheck", "timestamp": ' . $lastOnlineUpdate . ' }';

?>