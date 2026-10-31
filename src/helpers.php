<?php
// Small helpers shared by every endpoint in public/api/.

// Warnings would break the JSON and leak file paths; they still go to the PHP error log.
ini_set('display_errors', '0');

function send_json($data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function read_json(): array
{
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

// Trim, squeeze spaces, lowercase, max 60 chars (matches VARCHAR(60)).
function clean_text($value): string
{
    $text = preg_replace('/\s+/u', ' ', trim((string) $value));
    return mb_substr(mb_strtolower($text), 0, 60);
}

// Pesos (e.g. 85.5) -> centavos (8550). Returns null unless 0 < amount <= 100000 pesos.
function to_centavos($amount): ?int
{
    if (!is_numeric($amount)) {
        return null;
    }
    $centavos = (int) round($amount * 100);
    return ($centavos > 0 && $centavos <= 10000000) ? $centavos : null;
}

// Return a safe, actionable error code. Never expose passwords, SQL, stack traces
// or filesystem paths to the browser. Full details stay in PHP's error log.
function api_fail(Throwable $error, string $endpoint): void
{
    error_log('KitaKlaro ' . $endpoint . ': ' . $error->getMessage());

    $code = 'SERVER_ERROR';
    $status = 500;
    $internal = $error->getMessage();
    if ($internal === 'KK_DB_CONFIG_MISSING') {
        $code = 'DB_CONFIG_MISSING';
        $status = 503;
    } elseif ($internal === 'KK_DB_CONFIG_INVALID') {
        $code = 'DB_CONFIG_INVALID';
        $status = 503;
    } elseif ($internal === 'KK_DB_DRIVER_MISSING' || stripos($internal, 'could not find driver') !== false) {
        $code = 'DB_DRIVER_MISSING';
        $status = 503;
    } elseif ($error instanceof PDOException) {
        $number = (int) ($error->errorInfo[1] ?? 0);
        $sqlState = (string) $error->getCode();
        if (in_array($number, [1044, 1045, 2002, 2003, 2006, 2013], true) || $sqlState === '28000') {
            $code = 'DB_CONNECT_FAILED';
            $status = 503;
        } elseif ($number === 1049) {
            $code = 'DB_DATABASE_MISSING';
            $status = 503;
        } elseif (in_array($number, [1054, 1146], true) || in_array($sqlState, ['42S02', '42S22'], true)) {
            $code = 'DB_SCHEMA_MISSING';
            $status = 503;
        }
    } elseif (str_contains($internal, 'undefined function mb_')) {
        $code = 'PHP_MBSTRING_MISSING';
    }

    send_json(['error' => 'Server error', 'code' => $code], $status);
}
