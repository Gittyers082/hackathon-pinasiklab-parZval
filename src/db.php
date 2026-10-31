<?php
// Database connection. The private .env remains OUTSIDE the public web root.

function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $configFile = __DIR__ . '/../.env';
    if (!is_file($configFile) || !is_readable($configFile)) {
        throw new RuntimeException('KK_DB_CONFIG_MISSING');
    }

    // A malformed .env should be an identifiable configuration problem,
    // not an HTML warning that breaks the JSON API.
    $env = @parse_ini_file($configFile);
    if (!is_array($env)) throw new RuntimeException('KK_DB_CONFIG_INVALID');
    foreach (['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS'] as $key) {
        if (!array_key_exists($key, $env)) {
            throw new RuntimeException('KK_DB_CONFIG_INVALID');
        }
    }
    foreach (['DB_HOST', 'DB_NAME', 'DB_USER'] as $key) {
        if (!is_string($env[$key]) || trim($env[$key]) === '') {
            throw new RuntimeException('KK_DB_CONFIG_INVALID');
        }
    }

    if (!extension_loaded('pdo_mysql')) {
        throw new RuntimeException('KK_DB_DRIVER_MISSING');
    }

    // Port is deliberately NOT hardcoded: WAMP may be using MySQL on 3306
    // or a user-configured port. DB_PORT is optional.
    $dsn = 'mysql:host=' . $env['DB_HOST'];
    if (isset($env['DB_PORT']) && $env['DB_PORT'] !== '') {
        $port = filter_var($env['DB_PORT'], FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 65535],
        ]);
        if ($port === false) throw new RuntimeException('KK_DB_CONFIG_INVALID');
        $dsn .= ';port=' . $port;
    }
    $dsn .= ';dbname=' . $env['DB_NAME'] . ';charset=utf8mb4';

    $pdo = new PDO($dsn, $env['DB_USER'], (string) $env['DB_PASS'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $pdo->exec("SET time_zone = '+08:00'");
    return $pdo;
}
