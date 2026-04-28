CREATE DATABASE IF NOT EXISTS ideias;
USE ideias;


CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cpf VARCHAR(14) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo ENUM('manutentor', 'almoxarife') NOT NULL,
  oficina ENUM('MME', 'MEC', 'ELE') NULL
);

-- Usuário de teste: Manutentor
INSERT INTO usuarios (cpf, senha, tipo, oficina) 
VALUES ('000.000.000-00', '1234', 'manutentor', 'MME');

-- Usuário de teste: Almoxarife
INSERT INTO usuarios (cpf, senha, tipo, oficina) 
VALUES ('111.111.111-11', '1234', 'almoxarife', NULL);


CREATE TABLE ferramentas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(150) NOT NULL,
  quantidade_estoque INT DEFAULT 0,
  entradas INT DEFAULT 0,
  saidas INT DEFAULT 0,
  estoque_final INT DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


SELECT * FROM ferramentas LIMIT 5;