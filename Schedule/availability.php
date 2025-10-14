<?php
// availability.php — GET tutor_id & date=YYYY-MM-DD → { hours: [...] }
require __DIR__ . '/config.php';

$tutor_id = isset($_GET["tutor_id"]) ? intval($_GET["tutor_id"]) : 0;
$date_str = isset($_GET["date"]) ? $_GET["date"] : ""; // YYYY-MM-DD

if ($tutor_id <= 0 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_str)) {
  http_response_code(400);
  echo json_encode(["error" => "tutor_id and date are required"]);
  exit;
}

$col = str_replace('-', '_', $date_str); // YYYY_MM_DD
if (!preg_match('/^\d{4}_\d{2}_\d{2}$/', $col)) {
  http_response_code(400);
  echo json_encode(["error" => "bad date"]);
  exit;
}

$sql = "SELECT `$col` AS hours FROM Scheduling WHERE tutor_id = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("i", $tutor_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

$hours = [];
if ($row && !empty($row["hours"])) {
  foreach (explode(',', $row["hours"]) as $h) {
    $h = trim($h);
    if ($h !== '' && ctype_digit($h)) $hours[] = (int)$h;
  }
}

echo json_encode(["tutor_id" => $tutor_id, "date" => $date_str, "hours" => $hours]);
