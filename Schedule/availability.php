<?php
require __DIR__ . '/config.php';

// availability.php — allow ?date=, else default to today
$date_str = isset($_GET["date"]) ? $_GET["date"] : date('Y-m-d');
$col = str_replace('-', '_', $date_str);

// Check if column exists
$check = $mysqli->query("SHOW COLUMNS FROM Scheduling LIKE '$col'");
if ($check->num_rows === 0) {
    echo json_encode(["error" => "No availability data for today ($col)"]);
    exit;
}

// Query all tutors' hours for today
$sql = "SELECT tutor_id, `$col` AS hours FROM Scheduling";
$result = $mysqli->query($sql);

$all = [];
while ($row = $result->fetch_assoc()) {
    $hours = [];
    if (!empty($row["hours"])) {
        foreach (explode(',', $row["hours"]) as $h) {
            $h = trim($h);
            if ($h !== '' && ctype_digit($h)) {
                $hours[] = (int)$h;
            }
        }
    }
    $all[] = [
        "tutor_id" => (int)$row["tutor_id"],
        "hours" => $hours
    ];
}

echo json_encode([
    "date" => $date_str,
    "tutors" => $all
]);
