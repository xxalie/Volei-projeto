USE volei_db;

-- Tabela de torneios
CREATE TABLE IF NOT EXISTS torneios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    local_evento VARCHAR(100) NOT NULL,
    data_evento DATE NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de inscrições
CREATE TABLE IF NOT EXISTS inscricoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_jogador VARCHAR(100) NOT NULL,
    email_jogador VARCHAR(100),
    telefone VARCHAR(20),
    dupla VARCHAR(100),
    torneio_id INT NOT NULL,
    inscrito_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (torneio_id) REFERENCES torneios(id) ON DELETE CASCADE
);


DELIMITER $$

CREATE PROCEDURE relatorio_inscricoes()
BEGIN
    -- Total de inscritos por torneio
    SELECT 
        t.nome AS torneio,
        COUNT(i.id) AS total_inscritos
    FROM torneios t
    LEFT JOIN inscricoes i ON t.id = i.torneio_id
    GROUP BY t.id
    ORDER BY total_inscritos DESC;

    -- Listagem de todos os inscritos com o nome do torneio
    SELECT 
        i.nome_jogador,
        i.dupla,
        i.telefone,
        i.email_jogador,
        t.nome AS torneio,
        i.inscrito_em
    FROM inscricoes i
    INNER JOIN torneios t ON i.torneio_id = t.id
    ORDER BY i.inscrito_em DESC;

    -- Torneio com mais inscrições
    SELECT 
        t.nome AS torneio_mais_popular,
        COUNT(i.id) AS total
    FROM torneios t
    LEFT JOIN inscricoes i ON t.id = i.torneio_id
    GROUP BY t.id
    ORDER BY total DESC
    LIMIT 1;

    -- Período com mais inscrições
    SELECT 
        DATE(i.inscrito_em) AS data,
        COUNT(*) AS total_no_dia
    FROM inscricoes i
    GROUP BY DATE(i.inscrito_em)
    ORDER BY total_no_dia DESC
    LIMIT 1;

    -- Média de inscrições por torneio
    SELECT 
        ROUND(COUNT(i.id) / (SELECT COUNT(*) FROM torneios), 2) AS media_inscricoes
    FROM inscricoes i;

    -- Último torneio cadastrado
    SELECT 
        nome AS ultimo_torneio,
        data_evento,
        local_evento
    FROM torneios
    ORDER BY criado_em DESC
    LIMIT 1;
END $$

DELIMITER ;

CALL relatorio_inscricoes();




INSERT INTO inscricoes (nome_jogador, email_jogador, telefone, dupla, torneio_id)
VALUES
('Felipe Costa', 'felipe.costa@email.com', '5521912345678', 'Felipe e Pedro', 6),
('Mariana Lima', 'mariana.lima@email.com', '5511998765432', 'Mar e Sol', 6),
('Ricardo Santos', 'ricardo.santos@email.com', '5531987654321', 'Os Santásticos', 6);

-- Torneio ID 8: teste (Goiânia, 2025-10-16)
INSERT INTO inscricoes (nome_jogador, email_jogador, telefone, dupla, torneio_id)
VALUES
('Paula Oliveira', 'paula.oliveira@email.com', '5562911223344', 'Paula e Bia', 8),
('Thiago Mendes', 'thiago.mendes@email.com', '5562955667788', 'Gyn Vôlei', 8),
('Larissa Vieira', 'larissa.vieira@email.com', '5561944556677', 'As do Centro', 8);

-- Torneio ID 7: Copa Estadual de Volei de Praia (Arena Top Sport, 2025-10-31)
INSERT INTO inscricoes (nome_jogador, email_jogador, telefone, dupla, torneio_id)
VALUES
('Lucas Pereira', 'lucas.pereira@email.com', '5541933221100', 'Lucas e João', 7),
('Camila Rocha', 'camila.rocha@email.com', '5547900112233', 'Dupla Dinâmica', 7),
('Gustavo Alves', 'gustavo.alves@email.com', '5551988776655', 'Gaúchos do Vôlei', 7);

-- Torneio ID 2: Desafio das Dunas (Praia do Sol, 2025-11-20)
INSERT INTO inscricoes (nome_jogador, email_jogador, telefone, dupla, torneio_id)
VALUES
('Sofia Nogueira', 'sofia.nogueira@email.com', '5585912312345', 'Dunas Power', 2),
('Jorge Castro', 'jorge.castro@email.com', '5584998798765', 'Os Nordestinos', 2);

select * from torneios;