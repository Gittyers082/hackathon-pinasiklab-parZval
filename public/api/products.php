<?php
// GET         -> all products {id, name, stock, low_at, cost, price, expires_on}; cost/price in centavos or null
// POST {id?, name, stock, low_at, cost, price, expires_on}
//   with id: edits that product (name included); without id: saves by name (adds it if it is new)
//   low_at left out (or null) keeps the product's current value; a new product gets 3
//   cost/price in pesos, expires_on 'YYYY-MM-DD'; send '' or null to leave them blank
//   Price below cost and a past expiry date are ACCEPTED on purpose (clearance sale, recording
//   stock that already expired). The Inventory form asks the owner to confirm them instead.
// DELETE ?id=... -> removes the product (past benta/gastos entries are kept)
require __DIR__ . '/../../src/helpers.php';
require __DIR__ . '/../../src/db.php';

const PRODUCT_COLUMNS = 'id, name, stock, low_at, cost_centavos AS cost, price_centavos AS price, expires_on';

// '' / null -> null (blank), otherwise centavos; false if the amount is invalid.
function optional_centavos($amount)
{
    if ($amount === null || $amount === '') return null;
    return to_centavos($amount) ?? false;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $in = read_json();
        $id = isset($in['id']) ? filter_var($in['id'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) : null;
        $name = clean_text($in['name'] ?? '');
        $stock = filter_var($in['stock'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 100000]]);
        $lowAt = isset($in['low_at']) ? filter_var($in['low_at'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 100000]]) : null;
        $cost = optional_centavos($in['cost'] ?? null);
        $price = optional_centavos($in['price'] ?? null);
        $expires = $in['expires_on'] ?? null;
        $expires = ($expires === null || $expires === '') ? null : (string) $expires;
        $date = $expires === null ? null : DateTime::createFromFormat('!Y-m-d', $expires);

        if ($id === false) send_json(['error' => 'Mali ang produkto'], 400);
        if ($name === '') send_json(['error' => 'Kulang ang pangalan'], 400);
        if ($stock === false) send_json(['error' => 'Mali ang bilang'], 400);
        if ($lowAt === false) send_json(['error' => 'Mali ang babala'], 400);
        if ($cost === false) send_json(['error' => 'Mali ang puhunan'], 400);
        if ($price === false) send_json(['error' => 'Mali ang presyo'], 400);
        if ($expires !== null && (!$date || $date->format('Y-m-d') !== $expires)) send_json(['error' => 'Mali ang expiry'], 400);

        $values = [$name, $stock, $lowAt, $cost, $price, $expires];
        try {
            if ($id) {
                $stmt = db()->prepare('UPDATE products SET name = ?, stock = ?, low_at = COALESCE(?, low_at), cost_centavos = ?, price_centavos = ?, expires_on = ? WHERE id = ?');
                $stmt->execute([...$values, $id]);
            } else {
                $stmt = db()->prepare(
                    'INSERT INTO products (name, stock, low_at, cost_centavos, price_centavos, expires_on) VALUES (?, ?, COALESCE(?, 3), ?, ?, ?)
                     ON DUPLICATE KEY UPDATE stock = VALUES(stock), low_at = IF(? IS NULL, low_at, VALUES(low_at)), cost_centavos = VALUES(cost_centavos),
                                             price_centavos = VALUES(price_centavos), expires_on = VALUES(expires_on)'
                );
                $stmt->execute([...$values, $lowAt]);
            }
        } catch (PDOException $e) {
            // Renamed to a name another product already has (name is UNIQUE).
            if ($e->getCode() === '23000') send_json(['error' => "May produkto nang \"$name\"."], 409);
            throw $e;
        }
        send_json(['ok' => true]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($id === false) send_json(['error' => 'Mali ang produkto'], 400);
        db()->prepare('DELETE FROM products WHERE id = ?')->execute([$id]);
        send_json(['ok' => true]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        send_json(db()->query('SELECT ' . PRODUCT_COLUMNS . ' FROM products ORDER BY name')->fetchAll());
    }

    send_json(['error' => 'Bawal ang method na ito'], 405);
} catch (Throwable $e) {
    api_fail($e, 'products');
}
