-- 서비스 리스트 테이블
create table if not exists services (
  id bigint generated always as identity primary key,
  reception_type text not null,       -- 접수구분: 반응형원서, 공통원서, 일반원서, 일반접수
  service_id text not null,           -- 서비스ID
  university_name text not null,      -- 대학명
  region text,                        -- 지역
  service_name text not null,         -- 서비스명
  university_type text,               -- 대학구분: 4년제, 대학원, 초중고교 등
  category text,                      -- 카테고리: 수시, 정시, 편입 등
  operator text,                      -- 운영자
  developer text,                     -- 개발자
  writing_start timestamptz,          -- 작성시작
  writing_end timestamptz,            -- 작성마감
  payment_start timestamptz,          -- 결제시작
  payment_end timestamptz,            -- 결제마감
  is_exclusive boolean default true,  -- 단독여부
  status text default 'active',       -- 상태: active, completed, upcoming
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 인덱스
create index if not exists idx_services_university on services(university_name);
create index if not exists idx_services_operator on services(operator);
create index if not exists idx_services_developer on services(developer);
create index if not exists idx_services_category on services(category);
create index if not exists idx_services_region on services(region);
create index if not exists idx_services_status on services(status);
create index if not exists idx_services_service_id on services(service_id);

-- RLS 활성화
alter table services enable row level security;

-- 인증된 사용자 읽기 허용
create policy "Authenticated users can read services"
  on services for select
  to authenticated
  using (true);

-- 인증된 사용자 수정 허용
create policy "Authenticated users can update services"
  on services for update
  to authenticated
  using (true);

-- updated_at 자동 갱신 트리거
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger services_updated_at
  before update on services
  for each row
  execute function update_updated_at();
