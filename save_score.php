<?php
// save_score.php
// Accepts JSON POST {name, score, total, timestamp} and appends to scores.json
header('Content-Type: application/json');

// Read raw body
$raw = file_get_contents('php://input');
if (!$raw) {
    echo json_encode(['success'=>false, 'error'=>'No input']);
    exit;
}

$data = json_decode($raw, true);
if (!$data) {
    echo json_encode(['success'=>false, 'error'=>'Invalid JSON']);
    exit;
}

// Basic validation / sanitization
$name = isset($data['name']) ? substr(trim($data['name']),0,32) : 'Anonymous';
$score = isset($data['score']) ? intval($data['score']) : 0;
$total = isset($data['total']) ? intval($data['total']) : 0;
$timestamp = isset($data['timestamp']) ? intval($data['timestamp']) : time();

$entry = [
    'name' => htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
    'score' => $score,
    'total' => $total,
    'timestamp' => $timestamp
];

// scores file
$file = __DIR__ . '/scores.json';
if (!file_exists($file)) {
    // create empty array
    file_put_contents($file, json_encode([]));
}

// Read, append, write with locking
$fp = fopen($file, 'c+');
if (!$fp) {
    echo json_encode(['success'=>false, 'error'=>'Cannot open scores file']);
    exit;
}

flock($fp, LOCK_EX);
$contents = stream_get_contents($fp);
$existing = json_decode($contents, true);
if (!is_array($existing)) $existing = [];
$existing[] = $entry;

// Sort descending by score then timestamp
usort($existing, function($a,$b){
    if ($a['score'] === $b['score']) return $b['timestamp'] - $a['timestamp'];
    return $b['score'] - $a['score'];
});

rewind($fp);
ftruncate($fp, 0);
fwrite($fp, json_encode($existing, JSON_PRETTY_PRINT));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

echo json_encode(['success'=>true]);
