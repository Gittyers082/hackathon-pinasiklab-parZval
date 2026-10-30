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
