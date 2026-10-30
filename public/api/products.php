<?php
// GET         -> all products {id, name, stock, low_at, cost, price, expires_on}; cost/price in centavos or null
// GET ?low=1  -> products where stock <= low_at
// POST {name, stock, cost, price, expires_on} -> saves the product (adds it if it is new)
//   cost/price in pesos, expires_on 'YYYY-MM-DD'; send '' or null to leave them blank
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
        $name = clean_text($in['name'] ?? '');
        $stock = filter_var($in['stock'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 100000]]);
        $cost = optional_centavos($in['cost'] ?? null);
        $price = optional_centavos($in['price'] ?? null);
        $expires = $in['expires_on'] ?? null;
        $expires = ($expires === null || $expires === '') ? null : (string) $expires;
        $date = $expires === null ? null : DateTime::createFromFormat('!Y-m-d', $expires);

        if ($name === '') send_json(['error' => 'Kulang ang pangalan'], 400);
        if ($stock === false) send_json(['error' => 'Mali ang bilang'], 400);
        if ($cost === false) send_json(['error' => 'Mali ang puhunan'], 400);
        if ($price === false) send_json(['error' => 'Mali ang presyo'], 400);
        if ($expires !== null && (!$date || $date->format('Y-m-d') !== $expires)) send_json(['error' => 'Mali ang expiry'], 400);

        $stmt = db()->prepare(
            'INSERT INTO products (name, stock, cost_centavos, price_centavos, expires_on) VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE stock = VALUES(stock), cost_centavos = VALUES(cost_centavos),
                                     price_centavos = VALUES(price_centavos), expires_on = VALUES(expires_on)'
        );
        $stmt->execute([$name, $stock, $cost, $price, $expires]);
        send_json(['ok' => true]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $sql = isset($_GET['low'])
            ? 'SELECT ' . PRODUCT_COLUMNS . ' FROM products WHERE stock <= low_at ORDER BY stock, name'
            : 'SELECT ' . PRODUCT_COLUMNS . ' FROM products ORDER BY name';
        send_json(db()->query($sql)->fetchAll());
    }

    send_json(['error' => 'Bawal ang method na ito'], 405);
} catch (Throwable $e) {
    error_log($e->getMessage());
    send_json(['error' => 'Server error'], 500);
}
