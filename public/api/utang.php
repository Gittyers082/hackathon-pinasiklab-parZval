<?php
// POST {name, amount, type:'utang'|'bayad', item}; a bayad needs an existing balance and can't exceed it
// GET ?name=...  -> {name, balance, history[]}
// GET            -> [{name, balance}] for everyone with balance > 0, biggest first
require __DIR__ . '/../../src/helpers.php';
require __DIR__ . '/../../src/db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $in = read_json();
        $name = clean_text($in['name'] ?? '');
        $type = $in['type'] ?? '';
        $centavos = to_centavos($in['amount'] ?? null);
        $item = clean_text($in['item'] ?? '');

        if ($name === '') send_json(['error' => 'Kulang ang pangalan'], 400);
        if (!in_array($type, ['utang', 'bayad'], true)) send_json(['error' => 'Mali ang uri'], 400);
        if ($centavos === null) send_json(['error' => 'Mali ang halaga'], 400);

        $pdo = db();
        $pdo->beginTransaction();
        // A bayad must pay off an existing utang, and not more than what is owed.
        // FOR UPDATE: two payments sent at once can't both pass the check.
        if ($type === 'bayad') {
            $stmt = $pdo->prepare("SELECT COALESCE(SUM(IF(type = 'utang', centavos, -centavos)), 0) FROM utang WHERE name = ? FOR UPDATE");
            $stmt->execute([$name]);
            $balance = (int) $stmt->fetchColumn();
            if ($balance <= 0 || $centavos > $balance) {
                $pdo->rollBack();
                send_json(['error' => $balance <= 0
                    ? "Walang utang si $name. Tingnan ang pangalan sa listahan ng Utang."
                    : "Sobra ang bayad. ₱" . number_format($balance / 100, 2) . " lang ang utang ni $name."], 400);
            }
        }

        $stmt = $pdo->prepare('INSERT INTO utang (name, type, centavos, item) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $type, $centavos, $item]);
        $id = (int) $pdo->lastInsertId();
        $pdo->commit();
        send_json(['ok' => true, 'id' => $id], 201);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['name'])) {
            $name = clean_text($_GET['name']);
            if ($name === '') send_json(['error' => 'Kulang ang pangalan'], 400);

            $stmt = db()->prepare('SELECT type, centavos, item, created_at FROM utang WHERE name = ? ORDER BY created_at DESC, id DESC');
            $stmt->execute([$name]);
            $history = $stmt->fetchAll();

            $balance = 0;
            foreach ($history as $row) {
                $balance += $row['type'] === 'utang' ? $row['centavos'] : -$row['centavos'];
            }
            send_json(['name' => $name, 'balance' => $balance, 'history' => $history]);
        }

        $rows = db()->query(
            "SELECT name,
                    SUM(IF(type = 'utang', centavos, 0)) - SUM(IF(type = 'bayad', centavos, 0)) AS balance
             FROM utang
             GROUP BY name
             HAVING balance > 0
             ORDER BY balance DESC"
        )->fetchAll();
        foreach ($rows as &$row) {
            $row['balance'] = (int) $row['balance']; // SUM() comes back as a string
        }
        send_json($rows);
    }

    send_json(['error' => 'Bawal ang method na ito'], 405);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log($e->getMessage());
    send_json(['error' => 'Server error'], 500);
}
