-- Fake demo data only. All names are made up.
-- WARNING: this empties the tables first so you can re-run it any time.

USE kitaklaro;

TRUNCATE TABLE utang;
TRUNCATE TABLE entries;
TRUNCATE TABLE products;

-- 10 fake suki. Money is in centavos.
INSERT INTO utang (name, type, centavos, item, created_at) VALUES
('aling rosing', 'utang', 5000, 'sardinas',   NOW() - INTERVAL 6 DAY),
('aling rosing', 'utang', 3500, 'kape',       NOW() - INTERVAL 3 DAY),
('aling rosing', 'bayad', 2000, '',           NOW() - INTERVAL 1 DAY),
('mang tonyo',   'utang', 12000, 'bigas',     NOW() - INTERVAL 5 DAY),
('mang tonyo',   'utang', 2500, 'softdrinks', NOW() - INTERVAL 2 DAY),
('ate joy',      'utang', 8000, 'mantika',    NOW() - INTERVAL 7 DAY),
('ate joy',      'bayad', 8000, '',           NOW() - INTERVAL 2 DAY),
('kuya ben',     'utang', 1500, 'itlog',      NOW() - INTERVAL 1 DAY),
('manang lita',  'utang', 20000, 'bigas',     NOW() - INTERVAL 10 DAY),
('manang lita',  'bayad', 5000, '',           NOW() - INTERVAL 4 DAY),
('manang lita',  'utang', 4550, 'sabon',      NOW() - INTERVAL 1 DAY),
('manong pido',  'utang', 6000, 'de lata',    NOW() - INTERVAL 3 DAY),
('ate cel',      'utang', 2200, 'shampoo',    NOW() - INTERVAL 2 DAY),
('ate cel',      'bayad', 1000, '',           NOW()),
('kuya jun',     'utang', 9850, 'noodles',    NOW() - INTERVAL 8 DAY),
('kuya jun',     'bayad', 4000, '',           NOW() - INTERVAL 5 DAY),
('lola pacing',  'utang', 3000, 'asukal',     NOW() - INTERVAL 1 DAY),
('tita mely',    'utang', 7500, 'gatas',      NOW() - INTERVAL 6 DAY),
('tita mely',    'bayad', 7500, '',           NOW() - INTERVAL 1 DAY);

-- 30 common sari-sari products. A few are already at or below low_at.
-- cost/price are centavos per piece. tinapay, gatas and meat loaf (already expired) show on the Home expiry card.
INSERT INTO products (name, stock, low_at, cost_centavos, price_centavos, expires_on) VALUES
('sardinas', 24, 6, 2200, 2800, CURDATE() + INTERVAL 540 DAY),
('corned beef', 8, 3, 3800, 4500, CURDATE() + INTERVAL 400 DAY),
('meat loaf', 2, 3, 2400, 3000, CURDATE() - INTERVAL 1 DAY),
('kape 3-in-1', 40, 10, 700, 1000, CURDATE() + INTERVAL 200 DAY),
('kape', 5, 5, 1100, 1500, CURDATE() + INTERVAL 300 DAY),
('itlog', 30, 12, 750, 900, CURDATE() + INTERVAL 10 DAY),
('mantika', 3, 3, 5500, 6500, CURDATE() + INTERVAL 240 DAY),
('bigas', 25, 5, 4800, 5500, NULL),
('asukal', 6, 3, 7500, 8500, NULL),
('asin', 10, 3, 1800, 2500, NULL),
('toyo', 7, 3, 1600, 2000, CURDATE() + INTERVAL 365 DAY),
('suka', 1, 3, 1500, 2000, CURDATE() + INTERVAL 365 DAY),
('patis', 5, 2, 1700, 2200, CURDATE() + INTERVAL 365 DAY),
('noodles', 36, 10, 950, 1300, CURDATE() + INTERVAL 180 DAY),
('pancit canton', 20, 6, 1400, 1800, CURDATE() + INTERVAL 150 DAY),
('sabon', 12, 4, 2600, 3200, NULL),
('sabong panlaba', 2, 4, 900, 1200, NULL),
('shampoo', 48, 12, 550, 800, NULL),
('conditioner', 20, 6, 550, 800, NULL),
('toothpaste', 6, 2, 3200, 4000, NULL),
('softdrinks', 18, 6, 1700, 2000, CURDATE() + INTERVAL 90 DAY),
('softdrinks litro', 0, 2, 6000, 7000, CURDATE() + INTERVAL 90 DAY),
('tubig', 24, 6, 1200, 1500, CURDATE() + INTERVAL 365 DAY),
('gatas', 10, 4, 4500, 5200, CURDATE() + INTERVAL 5 DAY),
('biskwit', 30, 10, 700, 1000, CURDATE() + INTERVAL 60 DAY),
('tinapay', 4, 5, 450, 600, CURDATE() + INTERVAL 2 DAY),
('kandila', 15, 4, 500, 800, NULL),
('posporo', 9, 3, 150, 300, NULL),
('yelo', 0, 5, 300, 500, NULL),
('load', 50, 10, NULL, NULL, NULL);

-- Some benta and gastos for today.
INSERT INTO entries (type, item, qty, centavos, created_at) VALUES
('benta',  'sardinas', 2, 5000, NOW()),
('benta',  'kape 3-in-1', 5, 4000, NOW()),
('benta',  'softdrinks', 3, 7500, NOW()),
('benta',  'itlog', 6, 5400, NOW()),
('benta',  'bigas', 2, 11000, NOW()),
('gastos', 'yelo', 1, 6000, NOW()),
('gastos', 'pamasahe', 1, 2600, NOW());
