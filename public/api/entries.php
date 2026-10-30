<?php
// POST {type:'benta'|'gastos', item, qty, amount}
// GET ?today=1 -> {benta, gastos, kumita} in centavos
require __DIR__ . '/../../src/helpers.php';
require __DIR__ . '/../../src/db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $in = read_json();
        $type = $in['type'] ?? '';
        $item = clean_text($in['item'] ?? '');
        $qty = filter_var($in['qty'] ?? 1, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 10000]]);
        $centavos = to_centavos($in['amount'] ?? null);

        if (!in_array($type, ['benta', 'gastos'], true)) send_json(['error' => 'Mali ang uri'], 400);
        if ($item === '') send_json(['error' => 'Kulang ang item'], 400);
        if ($qty === false) send_json(['error' => 'Mali ang dami'], 400);
        if ($centavos === null) send_json(['error' => 'Mali ang halaga'], 400);

        $pdo = db();
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('INSERT INTO entries (type, item, qty, centavos) VALUES (?, ?, ?, ?)');
        $stmt->execute([$type, $item, $qty, $centavos]);
        $id = (int) $pdo->lastInsertId();
        if ($type === 'benta') {
            // Only touches a row if the item matches a product name.
            $stmt = $pdo->prepare('UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE name = ?');
            $stmt->execute([$qty, $item]);
        }
        $pdo->commit();
        send_json(['ok' => true, 'id' => $id], 201);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (!isset($_GET['today'])) send_json(['error' => 'Gamitin ang ?today=1'], 400);

        $row = db()->query(
            "SELECT COALESCE(SUM(IF(type = 'benta', centavos, 0)), 0) AS benta,
                    COALESCE(SUM(IF(type = 'gastos', centavos, 0)), 0) AS gastos
             FROM entries
             WHERE created_at >= CURDATE() AND created_at < CURDATE() + INTERVAL 1 DAY"
        )->fetch();
        $benta = (int) $row['benta'];
        $gastos = (int) $row['gastos'];
        send_json(['benta' => $benta, 'gastos' => $gastos, 'kumita' => $benta - $gastos]);
    }

    send_json(['error' => 'Bawal ang method na ito'], 405);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log($e->getMessage());
    send_json(['error' => 'Server error'], 500);
}
