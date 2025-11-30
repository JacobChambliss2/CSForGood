<?php
require __DIR__ . "/config.php";

$sql = "
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

if ($mysqli->query($sql) === TRUE) {
    echo json_encode(["ok" => true, "message" => "users table ready"]);
} else {
    echo json_encode(["ok" => false, "error" => $mysqli->error]);
}
