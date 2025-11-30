<?php
// list_tables.php
require __DIR__ . "/../config.php";

$sql = "SHOW TABLES";              // Native MySQL command
$result = $mysqli->query($sql);

$tables = [];
while ($row = $result->fetch_array()) {
    $tables[] = $row[0];
}

echo json_encode([
    "database" => $DB_NAME,
    "tables" => $tables
], JSON_PRETTY_PRINT);
?>
