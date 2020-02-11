SELECT * FROM public.usuario;

ALTER TABLE usuario ALTER COLUMN id TYPE serial;

insert into public.usuario (psid, contexto) values (5,null);

//pegar contexto
select contexto from usuario where psid=9; 
