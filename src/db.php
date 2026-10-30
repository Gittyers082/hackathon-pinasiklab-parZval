<?php
// PDO connection. Settings come from .env in the project root (outside public/).

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $env = parse_ini_file(__DIR__ . '/../.env');
        if ($env === false) {
            throw new RuntimeException('Missing .env file');
        }
        $dsn = 'mysql:host=' . $env['DB_HOST'] . ';dbname=' . $env['DB_NAME'] . ';charset=utf8mb4';
        $pdo = new PDO($dsn, $env['DB_USER'], $env['DB_PASS'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false, // real prepared statements, INT columns come back as int
        ]);
    }
    return $pdo;
}
