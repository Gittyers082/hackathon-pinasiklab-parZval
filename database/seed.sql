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
INSERT INTO products (name, stock, low_at) VALUES
('sardinas', 24, 6),
('corned beef', 8, 3),
('meat loaf', 2, 3),
('kape 3-in-1', 40, 10),
('kape', 5, 5),
('itlog', 30, 12),
('mantika', 3, 3),
('bigas', 25, 5),
('asukal', 6, 3),
('asin', 10, 3),
('toyo', 7, 3),
('suka', 1, 3),
('patis', 5, 2),
('noodles', 36, 10),
('pancit canton', 20, 6),
('sabon', 12, 4),
('sabong panlaba', 2, 4),
('shampoo', 48, 12),
('conditioner', 20, 6),
('toothpaste', 6, 2),
('softdrinks', 18, 6),
('softdrinks litro', 0, 2),
('tubig', 24, 6),
('gatas', 10, 4),
('biskwit', 30, 10),
('tinapay', 4, 5),
('kandila', 15, 4),
('posporo', 9, 3),
('yelo', 0, 5),
('load', 50, 10);

-- Some benta and gastos for today.
INSERT INTO entries (type, item, qty, centavos, created_at) VALUES
('benta',  'sardinas', 2, 5000, NOW()),
('benta',  'kape 3-in-1', 5, 4000, NOW()),
('benta',  'softdrinks', 3, 7500, NOW()),
('benta',  'itlog', 6, 5400, NOW()),
('benta',  'bigas', 2, 11000, NOW()),
('gastos', 'yelo', 1, 6000, NOW()),
('gastos', 'pamasahe', 1, 2600, NOW());
