SELECT * FROM public.usuario;

ALTER TABLE usuario DROP COLUMN cord_rf_ob;

ALTER TABLE usuario add COLUMN id_uf_oab integer;

--Consulta de advogados ativos para o PD
SELECT nome, num_oab, id_uf_oab FROM public.usuario;

ALTER TABLE usuario ALTER COLUMN id TYPE serial;

--salva psid - cadastra usuário
insert into public.usuario (psid, contexto) values ('2486860938102801','cadastro');

--Inserir usuario
insert into public.usuario (psid, num_oab, id_uf_oab, nome) values ('99999','6766',21, 'maria');
insert into public.usuario (psid, num_oab, id_uf_oab, nome) values ('3820305377987483','3640',21, 'Pedro');

-- Deletar Usuario
DELETE FROM public.usuario WHERE num_oab = '6766';

--muda contexto/estado
UPDATE public.usuario
SET contexto = 'cadastro.nome'
WHERE
   psid=2486860938102801;
   
UPDATE public.usuario
SET num_oab = '99'
WHERE
   psid='10';
   
SELECT * FROM public.usuario;
   
--pegar contexto
select contexto from usuario where psid=9; 

--Create table usuario
CREATE TABLE usuario (
	psid text PRIMARY KEY,
	contexto text,
	num_oab text,
	cord_rf_ob integer,
	num_cfc text,
	tipo_usuario text
);

TRUNCATE public.usuario;


