-- Limpa tudo na ordem certa (por causa das foreign keys)
DROP DATABASE IF EXISTS ideias;
CREATE DATABASE ideias DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ideias;

-- Usuários
CREATE TABLE usuarios (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  cpf     VARCHAR(14) NOT NULL UNIQUE,
  nome    VARCHAR(150),
  senha   VARCHAR(255) NOT NULL,
  tipo    ENUM('manutentor', 'almoxarife') NOT NULL,
  oficina ENUM('MME', 'MEC', 'ELE') NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ferramentas
CREATE TABLE ferramentas (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  codigo             VARCHAR(20) NOT NULL UNIQUE,
  nome               VARCHAR(150) NOT NULL,
  quantidade_estoque INT DEFAULT 0,
  entradas           INT DEFAULT 0,
  saidas             INT DEFAULT 0,
  estoque_final      INT DEFAULT 0,
  status             ENUM('disponivel','em_uso','manutencao') NOT NULL DEFAULT 'disponivel',
  usuario_id         INT DEFAULT NULL,
  usuario_cpf        VARCHAR(14) DEFAULT NULL,
  usuario_nome       VARCHAR(150) DEFAULT NULL,
  usuario_area       VARCHAR(10) DEFAULT NULL,
  observacao         TEXT DEFAULT NULL,
  data_retirada      DATETIME DEFAULT NULL,
  criado_em          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Movimentações
CREATE TABLE movimentacoes (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  ferramenta_id    INT NOT NULL,
  ferramenta_nome  VARCHAR(150) NOT NULL,
  status_anterior  VARCHAR(20),
  status_novo      VARCHAR(20),
  usuario_id       INT DEFAULT NULL,
  usuario_cpf      VARCHAR(14) DEFAULT NULL,
  usuario_nome     VARCHAR(150) DEFAULT NULL,
  usuario_area     VARCHAR(10) DEFAULT NULL,
  observacao       TEXT DEFAULT NULL,
  criado_em        DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ferramenta_id) REFERENCES ferramentas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trocas
CREATE TABLE trocas (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  ferramenta_id     INT NOT NULL,
  ferramenta_nome   VARCHAR(150) NOT NULL,
  solicitante_nome  VARCHAR(150) NOT NULL,
  solicitante_area  VARCHAR(10) NOT NULL,
  destinatario_nome VARCHAR(150) NOT NULL,
  destinatario_area VARCHAR(10) NOT NULL,
  status            ENUM('pendente','aceita','recusada') NOT NULL DEFAULT 'pendente',
  criado_em         DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ferramenta_id) REFERENCES ferramentas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuários de teste
INSERT INTO usuarios (cpf, nome, senha, tipo, oficina) VALUES
('000.000.000-00', 'Carlos Silva',   '1234', 'manutentor', 'MME'),
('111.111.111-11', 'João Souza',     '1234', 'manutentor', 'MEC'),
('222.222.222-22', 'Pedro Alves',    '1234', 'manutentor', 'ELE'),
('333.333.333-33', 'Ana Lima',       '1234', 'almoxarife',  NULL),
('444.444.444-44', 'Maria Oliveira', '1234', 'almoxarife',  NULL),
('381.592.740-12', 'BRUNO', '1234', 'manutentor', 'MME'),
('924.185.376-55', 'BRUNO', '1234', 'manutentor', 'MEC'),
('517.903.284-61', 'MARCOS', '1234', 'manutentor', 'MME'),
('763.418.920-33', 'MARCOS', '1234', 'manutentor', 'ELE'),
('842.730.195-22', 'LUCAS', '1234', 'manutentor', 'MME'),
('190.374.825-66', 'LUCAS', '1234', 'manutentor', 'MEC'),
('605.928.173-40', 'CARLOS', '1234', 'manutentor', 'MME'),
('478.203.916-77', 'CARLOS', '1234', 'manutentor', 'ELE'),
('329.740.518-09', 'ANDERSON', '1234', 'manutentor', 'MME'),
('814.592.306-21', 'ANDERSON', '1234', 'manutentor', 'MEC'),
('950.137.482-64', 'FERNANDO', '1234', 'manutentor', 'MME'),
('176.402.985-88', 'FERNANDO', '1234', 'manutentor', 'ELE'),
('284.759.301-19', 'RODRIGO', '1234', 'manutentor', 'MME'),
('693.840.217-52', 'RODRIGO', '1234', 'manutentor', 'MEC'),
('748.201.395-73', 'PAULO', '1234', 'manutentor', 'MME'),
('539.184.726-44', 'PAULO', '1234', 'manutentor', 'ELE'),
('462.830.915-27', 'JOAO', '1234', 'manutentor', 'MME'),
('817.394.205-68', 'JOAO', '1234', 'manutentor', 'MEC'),
('274.819.530-91', 'FELIPE', '1234', 'manutentor', 'MME'),
('683.502.174-36', 'FELIPE', '1234', 'manutentor', 'ELE'),
('395.217.860-05', 'EDUARDO', '1234', 'manutentor', 'MME'),
('702.948.315-80', 'EDUARDO', '1234', 'manutentor', 'MEC'),
('158.709.324-47', 'GUSTAVO', '1234', 'manutentor', 'MME'),
('964.215.873-26', 'GUSTAVO', '1234', 'manutentor', 'ELE'),
('347.180.592-63', 'VINICIUS', '1234', 'manutentor', 'MME'),
('891.254.376-11', 'VINICIUS', '1234', 'manutentor', 'MEC'),
('529.730.418-72', 'DANIEL', '1234', 'manutentor', 'MME'),
('603.915.284-39', 'DANIEL', '1234', 'manutentor', 'ELE');

-- Confirma
SELECT id, cpf, nome, tipo, oficina FROM usuarios;

ALTER TABLE trocas MODIFY COLUMN status ENUM('pendente','aceita','recusada','concluida') NOT NULL DEFAULT 'pendente';