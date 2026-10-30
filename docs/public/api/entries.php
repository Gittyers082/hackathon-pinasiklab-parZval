<?php
// POST {type:'benta'|'gastos', item, qty, amount, add_product?}
//   add_product: true on a gastos for an item not in the inventory creates it (stock = qty, puhunan = amount / qty)
// GET ?today=1 -> {benta, gastos, kumita} in centavos
// GET ?from=YYYY-MM-DD&to=YYYY-MM-DD -> entry rows with from <= created_at < to
require __DIR__ . '/../../src/helpers.php';
require __DIR__ . '/../../src/db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $in = read_json();
        $type = $in['type'] ?? '';
        $item = clean_text($in['item'] ?? '');
        $qty = filter_var($in['qty'] ?? 1, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 10000]]);
        $centavos = to_centavos($in['amount'] ?? null);
        $addProduct = ($in['add_product'] ?? false) === true;

        if (!in_array($type, ['benta', 'gastos'], true)) send_json(['error' => 'Mali ang uri'], 400);
        if ($item === '') send_json(['error' => 'Kulang ang item'], 400);
        if ($qty === false) send_json(['error' => 'Mali ang dami'], 400);
        if ($centavos === null) send_json(['error' => 'Mali ang halaga'], 400);

        $pdo = db();
        $pdo->beginTransaction();
        if ($type === 'benta') {
            // Can't sell more than is in stock (items not in the inventory are not checked).
            $stmt = $pdo->prepare('SELECT stock FROM products WHERE name = ? FOR UPDATE');
            $stmt->execute([$item]);
            $stock = $stmt->fetchColumn();
            if ($stock !== false && (int) $stock < $qty) {
                $pdo->rollBack();
                send_json(['error' => "Kulang ang stock: $stock na lang ang $item. Ayusin ang bilang sa Imbentaryo kung mali."], 400);
            }
        }
        $stmt = $pdo->prepare('INSERT INTO entries (type, item, qty, centavos) VALUES (?, ?, ?, ?)');
        $stmt->execute([$type, $item, $qty, $centavos]);
        $id = (int) $pdo->lastInsertId();
        // Benta lowers stock, gastos (restocking) raises it. Only touches a row if the item matches a product name.
        $stmt = $pdo->prepare($type === 'benta'
            ? 'UPDATE products SET stock = stock - ? WHERE name = ?'
            : 'UPDATE products SET stock = stock + ? WHERE name = ?');
        $stmt->execute([$qty, $item]);
        // No product matched (0 rows changed) and the owner ticked "add to inventory": create it.
        // Unticked, an unknown item (pamasahe, kuryente, a typo) stays an expense only.
        if ($type === 'gastos' && $addProduct && $stmt->rowCount() === 0) {
            $stmt = $pdo->prepare('INSERT INTO products (name, stock, cost_centavos) VALUES (?, ?, ?)');
            $stmt->execute([$item, $qty, (int) round($centavos / $qty)]);
        }
        $pdo->commit();
        send_json(['ok' => true, 'id' => $id], 201);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['from'], $_GET['to'])) {
        // Raw rows for the Ulat page, which does the adding up (same code as demo mode).
        $from = DateTime::createFromFormat('!Y-m-d', (string) $_GET['from']);
        $to = DateTime::createFromFormat('!Y-m-d', (string) $_GET['to']);
        if (!$from || !$to || $from >= $to) send_json(['error' => 'Mali ang petsa'], 400);
        $stmt = db()->prepare('SELECT type, item, qty, centavos, created_at FROM entries WHERE created_at >= ? AND created_at < ? ORDER BY created_at');
        $stmt->execute([$from->format('Y-m-d'), $to->format('Y-m-d')]);
        send_json($stmt->fetchAll());
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (!isset($_GET['today'])) send_json(['error' => 'Gamitin ang ?today=1 o ?from=...&to=...'], 400);

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
