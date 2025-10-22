<?php
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/config.php'; // gives $mysqli

$input    = json_decode(file_get_contents('php://input'), true) ?? [];
$date_str = isset($input['date']) ? trim($input['date']) : '';
$tutor_id = isset($input['tutor_id']) ? (int)$input['tutor_id'] : 0;
$hour     = isset($input['hour']) ? (int)$input['hour'] : -1;

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_str) || $tutor_id <= 0 || $hour < 0 || $hour > 23) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing/invalid date, tutor_id, or hour']);
  exit;
}

$col = str_replace('-', '_', $date_str);
if (!preg_match('/^\d{4}_\d{2}_\d{2}$/', $col)) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid date column']);
  exit;
}
$col_sql = "`$col`";

/* Ensure the dynamic date column exists (TEXT CSV of hours) */
$check = $mysqli->query("SHOW COLUMNS FROM `Scheduling` LIKE '{$col}'");
if (!$check) {
  http_response_code(500);
  echo json_encode(['error' => 'Schema check failed', 'detail' => $mysqli->error]);
  exit;
}
if ($check->num_rows === 0) {
  if (!$mysqli->query("ALTER TABLE `Scheduling` ADD COLUMN $col_sql TEXT NOT NULL DEFAULT ''")) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to add date column', 'detail' => $mysqli->error]);
    exit;
  }
}

/* Make sure tutor row exists */
$exists = $mysqli->prepare("SELECT 1 FROM `Scheduling` WHERE `tutor_id`=?");
$exists->bind_param('i', $tutor_id);
$exists->execute();
$exists->store_result();
if ($exists->num_rows === 0) {
  $ins = $mysqli->prepare("INSERT INTO `Scheduling` (`tutor_id`, $col_sql) VALUES (?, '')");
  if (!$ins) { http_response_code(500); echo json_encode(['error'=>'Prepare insert failed']); exit; }
  $ins->bind_param('i', $tutor_id);
  if (!$ins->execute()) { http_response_code(500); echo json_encode(['error'=>'Insert failed','detail'=>$ins->error]); exit; }
}

/* Read current CSV for this tutor+date */
$sel = $mysqli->prepare("SELECT $col_sql AS hours FROM `Scheduling` WHERE `tutor_id`=?");
$sel->bind_param('i', $tutor_id);
$sel->execute();
$res = $sel->get_result();
$row = $res->fetch_assoc();
$csv = $row ? (string)$row['hours'] : '';

/* Parse → toggle hour → serialize */
$set = [];
if ($csv !== '') {
  foreach (explode(',', $csv) as $h) {
    $h = trim($h);
    if ($h !== '' && ctype_digit($h)) $set[(int)$h] = true;
  }
}

if (isset($set[$hour])) {
  // was available → remove (becomes unavailable/booked)
  unset($set[$hour]);
  $is_available = 0;
} else {
  // was unavailable → add (becomes available)
  $set[$hour] = true;
  $is_available = 1;
}

$hours_arr = array_keys($set);
sort($hours_arr, SORT_NUMERIC);
$new_csv = implode(',', $hours_arr);

/* Write back */
$upd = $mysqli->prepare("UPDATE `Scheduling` SET $col_sql=? WHERE `tutor_id`=?");
if (!$upd) { http_response_code(500); echo json_encode(['error'=>'Prepare update failed','detail'=>$mysqli->error]); exit; }
$upd->bind_param('si', $new_csv, $tutor_id);
if (!$upd->execute()) { http_response_code(500); echo json_encode(['error'=>'Update failed','detail'=>$upd->error]); exit; }

/* Done */
echo json_encode([
  'success'      => true,
  'date'         => $date_str,
  'tutor_id'     => $tutor_id,
  'hour'         => $hour,
  'is_available' => $is_available,
  'hours'        => $hours_arr
]);
