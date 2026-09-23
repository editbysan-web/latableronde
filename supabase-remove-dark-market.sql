-- Retrait demandé du Dark Market ; aucune table ni donnée joueur modifiée.
-- Sans CASCADE : une dépendance inattendue bloque l'opération.
begin;
drop function if exists public.get_dark_market_state_rpc();
notify pgrst, 'reload schema';
commit;

select to_regprocedure('public.get_dark_market_state_rpc()') is null as dark_market_removed;
