alter table public.credit_scores
  add column if not exists bureau text,
  add column if not exists score_date date,
  add column if not exists notes text;

update public.credit_scores
set bureau = case
  when lower(provider) = 'experian' then 'Experian'
  when lower(provider) = 'equifax' then 'Equifax'
  when lower(provider) = 'transunion' then 'TransUnion'
  else 'Other'
end
where bureau is null;
