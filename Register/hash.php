<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $password = $_POST["password"] ?? "";

    if ($password === "") {
        echo "No password received.";
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    // SEND BACK TO JS (optional)
    echo $hash;

    // LOG TO PHP SERVER (this shows in PowerShell)
    error_log("Password hashed: " . $hash);
}
?>
