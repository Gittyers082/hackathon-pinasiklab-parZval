<?php
// GET         -> all products
// GET ?low=1  -> products where stock <= low_at
// POST {name, stock} -> sets stock (adds the product if it is new)
require __DIR__ . '/../../src/helpers.php';
require __DIR__ . '/../../src/db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $in = read_json();
        $name = clean_text($in['name'] ?? '');
        $stock = filter_var($in['stock'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 100000]]);

        if ($name === '') send_json(['error' => 'Kulang ang pangalan'], 400);
        if ($stock === false) send_json(['error' => 'Mali ang bilang'], 400);

        $stmt = db()->prepare('INSERT INTO products (name, stock) VALUES (?, ?) ON DUPLICATE KEY UPDATE stock = ?');
        $stmt->execute([$name, $stock, $stock]);
        send_json(['ok' => true]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $sql = isset($_GET['low'])
            ? 'SELECT id, name, stock, low_at FROM products WHERE stock <= low_at ORDER BY stock, name'
            : 'SELECT id, name, stock, low_at FROM products ORDER BY name';
        send_json(db()->query($sql)->fetchAll());
    }

    send_json(['error' => 'Bawal ang method na ito'], 405);
} catch (Throwable $e) {
    error_log($e->getMessage());
    send_json(['error' => 'Server error'], 500);
}
