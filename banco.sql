-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema ideias
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `ideias` ;

-- -----------------------------------------------------
-- Schema ideias
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ideias` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
USE `ideias` ;

-- -----------------------------------------------------
-- Table `ideias`.`usuarios`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ideias`.`usuarios` ;

CREATE TABLE IF NOT EXISTS `ideias`.`usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cpf` VARCHAR(14) NOT NULL,
  `nome` VARCHAR(150) NULL DEFAULT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `tipo` ENUM('manutentor', 'almoxarife') NOT NULL,
  `oficina` ENUM('MME', 'MEC', 'ELE') NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `cpf` (`cpf` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `ideias`.`ferramentas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ideias`.`ferramentas` ;

CREATE TABLE IF NOT EXISTS `ideias`.`ferramentas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(20) NOT NULL,
  `nome` VARCHAR(150) NOT NULL,
  `quantidade_estoque` INT NULL DEFAULT '0',
  `entradas` INT NULL DEFAULT '0',
  `saidas` INT NULL DEFAULT '0',
  `estoque_final` INT NULL DEFAULT '0',
  `status` ENUM('disponivel', 'em_uso', 'manutencao') NOT NULL DEFAULT 'disponivel',
  `usuario_id` INT NULL DEFAULT NULL,
  `usuario_cpf` VARCHAR(14) NULL DEFAULT NULL,
  `usuario_nome` VARCHAR(150) NULL DEFAULT NULL,
  `usuario_area` VARCHAR(10) NULL DEFAULT NULL,
  `data_retirada` DATETIME NULL DEFAULT NULL,
  `criado_em` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `observacao` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `codigo` (`codigo` ASC) VISIBLE,
  INDEX `fk_usuario_ferramenta` (`usuario_id` ASC) VISIBLE,
  CONSTRAINT `fk_usuario_ferramenta`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `ideias`.`usuarios` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 203
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `ideias`.`movimentacoes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ideias`.`movimentacoes` ;

CREATE TABLE IF NOT EXISTS `ideias`.`movimentacoes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ferramenta_id` INT NOT NULL,
  `ferramenta_nome` VARCHAR(150) NOT NULL,
  `status_anterior` ENUM('disponivel', 'em_uso', 'manutencao') NOT NULL,
  `status_novo` ENUM('disponivel', 'em_uso', 'manutencao') NOT NULL,
  `usuario_id` INT NULL DEFAULT NULL,
  `usuario_cpf` VARCHAR(14) NULL DEFAULT NULL,
  `usuario_nome` VARCHAR(150) NULL DEFAULT NULL,
  `usuario_area` VARCHAR(10) NULL DEFAULT NULL,
  `observacao` TEXT NULL DEFAULT NULL,
  `criado_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_mov_usuario` (`usuario_id` ASC) VISIBLE,
  INDEX `idx_ferramenta` (`ferramenta_id` ASC) VISIBLE,
  INDEX `idx_data` (`criado_em` ASC) VISIBLE,
  CONSTRAINT `fk_mov_ferramenta`
    FOREIGN KEY (`ferramenta_id`)
    REFERENCES `ideias`.`ferramentas` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_usuario`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `ideias`.`usuarios` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 20
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
