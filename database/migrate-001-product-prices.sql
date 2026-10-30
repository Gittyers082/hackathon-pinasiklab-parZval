-- Run ONCE on a database created before products had prices and expiry.
-- (A fresh schema.sql already has these columns; running this on it fails with "Duplicate column".)
USE kitaklaro;

ALTER TABLE products
  ADD COLUMN cost_centavos  INT UNSIGNED NULL AFTER stock,
  ADD COLUMN price_centavos INT UNSIGNED NULL AFTER cost_centavos,
  ADD COLUMN expires_on     DATE NULL AFTER low_at;
