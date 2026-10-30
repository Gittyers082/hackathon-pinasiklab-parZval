-- KitaKlaro schema. Run this first, then seed.sql.
-- Money is always integer centavos (P85.50 -> 8550). Names are stored trimmed + lowercase.

CREATE DATABASE IF NOT EXISTS kitaklaro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kitaklaro;

-- Utang (credit) and bayad (payment) are separate rows.
-- Balance = SUM(utang) - SUM(bayad) per name.
CREATE TABLE IF NOT EXISTS utang (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(60) NOT NULL,
  type       ENUM('utang', 'bayad') NOT NULL,
  centavos   INT UNSIGNED NOT NULL,
  item       VARCHAR(60) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (name)
) ENGINE=InnoDB;

-- Benta (sales) and gastos (expenses).
CREATE TABLE IF NOT EXISTS entries (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type       ENUM('benta', 'gastos') NOT NULL,
  item       VARCHAR(60) NOT NULL,
  qty        INT UNSIGNED NOT NULL DEFAULT 1,
  centavos   INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(60) NOT NULL UNIQUE,
  stock  INT NOT NULL DEFAULT 0,
  low_at INT NOT NULL DEFAULT 3
) ENGINE=InnoDB;
