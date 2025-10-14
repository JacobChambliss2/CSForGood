<?php
// rank.php — compute ranked tutors
require __DIR__ . '/config.php';

// Accept JSON body, form POST, or querystring
$raw = file_get_contents('php://input');
$in  = json_decode($raw, true);
if (!is_array($in)) $in = array_merge($_GET ?? [], $_POST ?? []);

$age_target       = isset($in['Age']) ? intval($in['Age']) : 17;
$school_target    = isset($in['School']) ? trim($in['School']) : 'Castle';
$sat_weight       = isset($in['SAT_weight']) ? floatval($in['SAT_weight']) : 5.0;
$distance_weight  = isset($in['distance_weight']) ? floatval($in['distance_weight']) : 1.0;

$weights = [
  'Age'      => 1.0,
  'School'   => 1.0,
  'SAT'      => $sat_weight,
  'distance' => $distance_weight
];
$weight_sum = array_sum($weights);

$sql = "SELECT id, first_name, last_name, age, school, sat_score, distance FROM tutors";
$res = $mysqli->query($sql);
$tutors = [];
while ($row = $res->fetch_assoc()) {
  $tutors[] = [
    'id'         => (int)$row['id'],
    'first_name' => $row['first_name'],
    'last_name'  => $row['last_name'],
    'Age'        => is_null($row['age']) ? null : (int)$row['age'],
    'School'     => $row['school'],
    'SAT'        => is_null($row['sat_score']) ? null : (int)$row['sat_score'],
    'distance'   => is_null($row['distance']) ? null : (float)$row['distance'],
  ];
}

if (!$tutors) { echo json_encode([]); exit; }

// bases
$ages  = array_values(array_filter(array_column($tutors, 'Age'), fn($v)=>$v!==null));
$sats  = array_values(array_filter(array_column($tutors, 'SAT'), fn($v)=>$v!==null));
$dists = array_values(array_filter(array_column($tutors, 'distance'), fn($v)=>$v!==null));

$minmax = function($arr){ return [min($arr), max($arr)]; };
list($sat_min, $sat_max) = $sats ? $minmax($sats) : [0,0];
$max_dist = $dists ? max($dists) : 0;
$max_age_diff = 0;
foreach ($ages as $a) $max_age_diff = max($max_age_diff, abs($a - $age_target));

// scoring
foreach ($tutors as &$t) {
  $age_score = ($t['Age'] === null) ? 0
              : (($max_age_diff == 0) ? 1.0 : max(0.0, 1.0 - (abs($t['Age'] - $age_target) / $max_age_diff)));
  $school_score = (strcasecmp($t['School'], $school_target) === 0) ? 1.0 : 0.0;

  if ($t['SAT'] === null) $sat_score = 0;
  else {
    $sat_score = ($sat_max == $sat_min) ? 1.0 : ($t['SAT'] - $sat_min) / max(1.0, ($sat_max - $sat_min));
    $sat_score = max(0.0, min(1.0, $sat_score));
  }

  if ($t['distance'] === null) $dist_score = 0;
  else {
    $dist_score = ($max_dist == 0) ? 1.0 : max(0.0, 1.0 - ($t['distance'] / $max_dist));
  }

  $t['Score'] = round((
    $age_score    * $weights['Age'] +
    $school_score * $weights['School'] +
    $sat_score    * $weights['SAT'] +
    $dist_score   * $weights['distance']
  ) / max(1e-9, $weight_sum), 12);
}
unset($t);

// sort: Score DESC, SAT DESC, distance ASC
usort($tutors, function($a,$b){
  if ($a['Score']     != $b['Score'])     return ($a['Score']     < $b['Score'])     ? 1 : -1;
  if ($a['SAT']       != $b['SAT'])       return ($a['SAT']       < $b['SAT'])       ? 1 : -1;
  if ($a['distance']  != $b['distance'])  return ($a['distance']  > $b['distance'])  ? 1 : -1;
  return 0;
});

echo json_encode(array_slice($tutors, 0, 10));
