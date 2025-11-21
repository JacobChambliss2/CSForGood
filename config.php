<?php
/**
 * config.php
 * Shared database connection + base response headers
 * Include this file at the top of every PHP endpoint (rank.php, availability.php, etc.)
 */

header('Content-Type: application/json; charset=utf-8');

// ---------------------------------------------------------------------------
// CORS: allow local testing (e.g. http://127.0.0.1:5500)
// When fully hosted on the same domain, you can safely comment out this line.
// ---------------------------------------------------------------------------
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests quickly
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---------------------------------------------------------------------------
// DATABASE CONNECTION SETTINGS
// ---------------------------------------------------------------------------
$DB_HOST = "mi3-cl8-its1.a2hosting.com";   // remote MySQL host
$DB_USER = "chscscom_jacob";               // username
$DB_PASS = "Jacoshark11";                  // password
$DB_NAME = "chscscom_tutortrack";          // database name

// ---------------------------------------------------------------------------
// CONNECT
// ---------------------------------------------------------------------------
$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

// Check for connection errors
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode([
        "error" => "Database connection failed",
        "details" => $mysqli->connect_error
    ]);
    exit;
}

// Ensure UTF-8 encoding
$mysqli->set_charset("utf8mb4");

// ---------------------------------------------------------------------------
// OPTIONAL: error reporting level
// Comment out or adjust in production for quieter logs
// ---------------------------------------------------------------------------
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ---------------------------------------------------------------------------
// USAGE EXAMPLE (inside another PHP file)
// ---------------------------------------------------------------------------
// require __DIR__ . '/config.php';
// $result = $mysqli->query("SELECT * FROM tutors");
// while ($row = $result->fetch_assoc()) { ... }
//
// Don't close $mysqli manually—PHP cleans up automatically per request.
// ---------------------------------------------------------------------------
