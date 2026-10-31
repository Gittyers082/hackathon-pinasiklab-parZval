<?php
// Read-only combined ledger: benta, gastos, utang and bayad.
// Requires same database as the existing API; no new tables or migrations.
require __DIR__ . '/../../src/helpers.php';
require __DIR__ . '/../../src/db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') send_json(['error' => 'Method not allowed'], 405);
    $from = DateTime::createFromFormat('!Y-m-d', (string) ($_GET['from'] ?? ''));
    $to = DateTime::createFromFormat('!Y-m-d', (string) ($_GET['to'] ?? ''));
    if (!$from || !$to || $from >= $to) send_json(['error' => 'Invalid date range'], 400);
    $fromDate = $from->format('Y-m-d');
    $toDate = $to->format('Y-m-d');
    $stmt = db()->prepare(
        "SELECT id, type, item, qty, centavos, created_at, '' AS name FROM entries
         WHERE created_at >= ? AND created_at < ?
         UNION ALL
         SELECT id, type, item, 1 AS qty, centavos, created_at, name FROM utang
         WHERE created_at >= ? AND created_at < ?
         ORDER BY created_at DESC, id DESC"
    );
    $stmt->execute([$fromDate, $toDate, $fromDate, $toDate]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $row['id'] = (int) $row['id'];
        $row['qty'] = (int) $row['qty'];
        $row['centavos'] = (int) $row['centavos'];
    }
    send_json($rows);
} catch (Throwable $e) {
    api_fail($e, 'records');
}
