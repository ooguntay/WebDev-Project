<?php
// get_leaderboard.php
header('Content-Type: application/json');
$file = __DIR__ . '/scores.json';
if (!file_exists($file)) {
    echo json_encode(['success'=>true, 'scores'=>[]]);
    exit;
}
$contents = file_get_contents($file);
$scores = json_decode($contents, true);
if (!is_array($scores)) $scores = [];
echo json_encode(['success'=>true, 'scores'=>$scores]);
