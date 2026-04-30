DROP DATABASE IF EXISTS ideias;
CREATE DATABASE ideias DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ideias;

-- Usuários
CREATE TABLE usuarios (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  cracha  VARCHAR(4) NOT NULL UNIQUE,
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
  usuario_cracha     VARCHAR(4) DEFAULT NULL,
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
  usuario_cracha   VARCHAR(4) DEFAULT NULL,
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
  status            ENUM('pendente','aceita','recusada','concluida') NOT NULL DEFAULT 'pendente',
  criado_em         DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ferramenta_id) REFERENCES ferramentas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE solicitacoes_retirada (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ferramenta_id INT NOT NULL,
  ferramenta_nome VARCHAR(150) NOT NULL,
  manutentor_cracha VARCHAR(4) NOT NULL,
  manutentor_nome VARCHAR(150) NOT NULL,
  manutentor_area VARCHAR(10) NOT NULL,
  ordem_servico VARCHAR(50) NOT NULL,
  status ENUM('pendente','aprovada','recusada') DEFAULT 'pendente',
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (ferramenta_id) REFERENCES ferramentas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuários de teste
INSERT INTO usuarios (cracha, nome, senha, tipo, oficina) VALUES
('0001', 'Carlos Silva',   '1234', 'manutentor', 'MME'),
('0002', 'João Souza',     '1234', 'manutentor', 'MEC'),
('0003', 'Pedro Alves',    '1234', 'manutentor', 'ELE'),
('0004', 'Ana Lima',       '1234', 'almoxarife',  NULL),
('0005', 'Maria Oliveira', '1234', 'almoxarife',  NULL),
('0006', 'BRUNO',          '1234', 'manutentor', 'MME'),
('0007', 'BRUNO',          '1234', 'manutentor', 'MEC'),
('0008', 'MARCOS',         '1234', 'manutentor', 'MME'),
('0009', 'MARCOS',         '1234', 'manutentor', 'ELE'),
('0010', 'LUCAS',          '1234', 'manutentor', 'MME'),
('0011', 'LUCAS',          '1234', 'manutentor', 'MEC'),
('0012', 'CARLOS',         '1234', 'manutentor', 'MME'),
('0013', 'CARLOS',         '1234', 'manutentor', 'ELE'),
('0014', 'ANDERSON',       '1234', 'manutentor', 'MME'),
('0015', 'ANDERSON',       '1234', 'manutentor', 'MEC'),
('0016', 'FERNANDO',       '1234', 'manutentor', 'MME'),
('0017', 'FERNANDO',       '1234', 'manutentor', 'ELE'),
('0018', 'RODRIGO',        '1234', 'manutentor', 'MME'),
('0019', 'RODRIGO',        '1234', 'manutentor', 'MEC'),
('0020', 'PAULO',          '1234', 'manutentor', 'MME'),
('0021', 'PAULO',          '1234', 'manutentor', 'ELE'),
('0022', 'JOAO',           '1234', 'manutentor', 'MME'),
('0023', 'JOAO',           '1234', 'manutentor', 'MEC'),
('0024', 'FELIPE',         '1234', 'manutentor', 'MME'),
('0025', 'FELIPE',         '1234', 'manutentor', 'ELE'),
('0026', 'EDUARDO',        '1234', 'manutentor', 'MME'),
('0027', 'EDUARDO',        '1234', 'manutentor', 'MEC'),
('0028', 'GUSTAVO',        '1234', 'manutentor', 'MME'),
('0029', 'GUSTAVO',        '1234', 'manutentor', 'ELE'),
('0030', 'VINICIUS',       '1234', 'manutentor', 'MME'),
('0031', 'VINICIUS',       '1234', 'manutentor', 'MEC'),
('0032', 'DANIEL',         '1234', 'manutentor', 'MME'),
('0033', 'DANIEL',         '1234', 'manutentor', 'ELE');

SELECT id, cracha, nome, tipo, oficina FROM usuarios;