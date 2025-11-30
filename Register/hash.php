<?php
require __DIR__ . "/../config.php";  // adjust path if needed

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST["username"] ?? "");
    $password = $_POST["password"] ?? "";

    if ($username === "" || $password === "") {
        echo "Missing username or password";
        error_log("Missing username or password");
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $mysqli->prepare("
        INSERT INTO users (username, password_hash)
        VALUES (?, ?)
    ");

    if (!$stmt) {
        echo "Prepare failed: " . $mysqli->error;
        error_log("Prepare failed: " . $mysqli->error);
        exit;
    }

    $stmt->bind_param("ss", $username, $hash);

    if ($stmt->execute()) {
        echo "User created with ID: " . $stmt->insert_id;
        error_log("User registered: $username");
    } else {
        if ($mysqli->errno === 1062) {
            echo "Username already exists";
            error_log("Username already exists: $username");
        } else {
            echo "Database error: " . $mysqli->error;
            error_log("Database error: " . $mysqli->error);
        }
    }

    $stmt->close();
}
?>
