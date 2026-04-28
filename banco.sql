-- ============================================================
-- RESET (opcional, mas recomendado)
-- ============================================================
DROP DATABASE IF EXISTS ideias;
CREATE DATABASE ideias CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ideias;

-- ============================================================
-- TABELA: usuarios
-- ============================================================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  nome VARCHAR(150),
  senha VARCHAR(255) NOT NULL,
  tipo ENUM('manutentor', 'almoxarife') NOT NULL,
  oficina ENUM('MME', 'MEC', 'ELE') NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados de teste
INSERT INTO usuarios (cpf, nome, senha, tipo, oficina) VALUES
('000.000.000-00', 'João Manutentor', '1234', 'manutentor', 'MME'),
('111.111.111-11', 'Carlos Almoxarife', '1234', 'almoxarife', NULL);


-- ============================================================
-- TABELA: ferramentas
-- ============================================================
CREATE TABLE ferramentas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(150) NOT NULL,

  quantidade_estoque INT DEFAULT 0,
  entradas INT DEFAULT 0,
  saidas INT DEFAULT 0,
  estoque_final INT DEFAULT 0,

  status ENUM('disponivel', 'em_uso', 'manutencao')
    NOT NULL DEFAULT 'disponivel',

  usuario_id INT NULL,
  usuario_cpf VARCHAR(14),
  usuario_nome VARCHAR(150),
  usuario_area VARCHAR(10),
  data_retirada DATETIME,

  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_usuario_ferramenta
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABELA: movimentacoes (AGORA USANDO ID)
-- ============================================================
CREATE TABLE movimentacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,

  ferramenta_id INT NOT NULL,
  ferramenta_nome VARCHAR(150) NOT NULL,

  status_anterior ENUM('disponivel', 'em_uso', 'manutencao') NOT NULL,
  status_novo ENUM('disponivel', 'em_uso', 'manutencao') NOT NULL,

  usuario_id INT NULL,
  usuario_cpf VARCHAR(14),
  usuario_nome VARCHAR(150),
  usuario_area VARCHAR(10),

  observacao TEXT,

  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_mov_ferramenta
    FOREIGN KEY (ferramenta_id)
    REFERENCES ferramentas(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_mov_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  INDEX idx_ferramenta (ferramenta_id),
  INDEX idx_data (criado_em)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- DADOS DE TESTE (ferramentas)
-- ============================================================
INSERT INTO ferramentas (codigo, nome, quantidade_estoque, estoque_final)
VALUES
('F001', 'Martelo', 10, 10),
('F002', 'Chave de Fenda', 15, 15),
('F003', 'Alicate', 8, 8);


-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
SELECT * FROM usuarios;
SELECT * FROM ferramentas;
SELECT * FROM movimentacoes;