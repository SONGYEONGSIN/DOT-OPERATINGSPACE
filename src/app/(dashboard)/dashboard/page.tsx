export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black tracking-tight text-on-surface">
              통합 운영 현황
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              NOMINAL
            </span>
          </div>
          <p className="text-on-surface-variant text-sm">
            실시간 운영 지표 및 전술적 자원 관리 현황
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-high px-4 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-bright">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            필터
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-high px-4 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-bright">
            <span className="material-symbols-outlined text-sm">download</span>
            내보내기
          </button>
        </div>
      </section>

      {/* ── KPI Cards (4-column) ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group cursor-pointer rounded-xl border-l-2 border-primary bg-surface-container-lowest p-5 transition-all hover:bg-surface-container">
          <div className="mb-6 flex items-start justify-between">
            <div className="rounded-lg bg-primary-container/10 p-2 text-primary">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">
            서비스 가동률
          </div>
          <div className="text-4xl font-black tracking-tight text-on-surface group-hover:text-primary transition-colors">
            99.98%
          </div>
        </div>
        <div className="group cursor-pointer rounded-xl border-l-2 border-primary bg-surface-container-lowest p-5 transition-all hover:bg-surface-container">
          <div className="mb-6 flex items-start justify-between">
            <div className="rounded-lg bg-primary-container/10 p-2 text-primary">
              <span className="material-symbols-outlined">description</span>
            </div>
            <span className="rounded-full bg-primary-container/20 px-2.5 py-0.5 text-[10px] font-bold text-primary">
              +3 신규
            </span>
          </div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">
            활성 계약
          </div>
          <div className="text-4xl font-black tracking-tight text-on-surface group-hover:text-primary transition-colors">
            24건
          </div>
        </div>
        <div className="group cursor-pointer rounded-xl border-l-2 border-tertiary bg-surface-container-lowest p-5 transition-all hover:bg-surface-container">
          <div className="mb-6 flex items-start justify-between">
            <div className="rounded-lg bg-tertiary-container/10 p-2 text-tertiary">
              <span className="material-symbols-outlined">input</span>
            </div>
            <span className="rounded-full bg-error-container/20 px-2.5 py-0.5 text-[10px] font-bold text-error">
              2건 긴급
            </span>
          </div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">
            인수인계 진행
          </div>
          <div className="text-4xl font-black tracking-tight text-on-surface group-hover:text-tertiary transition-colors">
            4건
          </div>
        </div>
        <div className="group cursor-pointer rounded-xl border-l-2 border-error bg-surface-container-lowest p-5 transition-all hover:bg-surface-container">
          <div className="mb-6 flex items-start justify-between">
            <div className="rounded-lg bg-error-container/10 p-2 text-error">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <span className="rounded-full bg-error-container/20 px-2.5 py-0.5 text-[10px] font-bold text-error">
              90일 초과 2건
            </span>
          </div>
          <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">
            미수채권
          </div>
          <div className="text-4xl font-black tracking-tight text-on-surface group-hover:text-error transition-colors">
            4.5억
          </div>
        </div>
      </section>

      {/* ── Service Status Grid ── */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-on-surface">
          <span className="material-symbols-outlined text-primary">settings_remote</span>
          서비스 상태
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-on-surface">핵심 원격 분석</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="mb-4 text-xs text-on-surface-variant">전체 노드 텔레메트리 수집 정상 운영 중</p>
            <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-bright">
              <span className="material-symbols-outlined text-sm">monitoring</span>
              진단
            </button>
          </div>
          <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-on-surface">경계 그리드</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-error-container/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-error">
                <span className="h-1.5 w-1.5 rounded-full bg-error animate-pulse" />
                ALERT
              </span>
            </div>
            <p className="mb-4 text-xs text-on-surface-variant">비인가 접근 3건 감지, 즉시 확인 필요</p>
            <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-error-container/20 px-3 py-2 text-xs font-bold text-error transition-colors hover:bg-error-container/30">
              <span className="material-symbols-outlined text-sm">shield</span>
              해결
            </button>
          </div>
          <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-on-surface">릴레이 스테이션</span>
              <span className="rounded-full bg-tertiary-container/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-tertiary">
                MAINTENANCE
              </span>
            </div>
            <p className="mb-4 text-xs text-on-surface-variant">위성 링크 B 재정렬 작업 진행 중</p>
            <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-bright">
              <span className="material-symbols-outlined text-sm">build</span>
              진단
            </button>
          </div>
          <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-on-surface">아카이브 서비스</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="mb-4 text-xs text-on-surface-variant">데이터 백업 및 복원 서비스 정상 가동</p>
            <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-bright">
              <span className="material-symbols-outlined text-sm">monitoring</span>
              진단
            </button>
          </div>
        </div>
      </section>

      {/* ── Two-Column: Contract Table + Handover Timeline ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-on-surface">
                <span className="material-symbols-outlined text-primary">description</span>
                계약 관리
              </h2>
              <span className="text-xs text-on-surface-variant">활성 계약: 24</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-outline-variant/20 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  <tr>
                    <th className="pb-3">계약 ID</th>
                    <th className="pb-3">업체명</th>
                    <th className="pb-3">만료일</th>
                    <th className="pb-3">진행률</th>
                    <th className="pb-3 text-right">금액</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="group border-b border-outline-variant/10 transition-colors hover:bg-surface-container-high">
                    <td className="py-4 font-mono text-primary">#SH-9920-X</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">apartment</span>
                        <span className="font-bold text-on-surface">CyberDyne Systems</span>
                      </div>
                    </td>
                    <td className="py-4 text-on-surface-variant">2026.06.12</td>
                    <td className="py-4">
                      <div className="w-32">
                        <div className="mb-1 flex justify-between text-[10px]">
                          <span>84%</span>
                          <span className="font-bold text-error">CRITICAL</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-surface-container-highest">
                          <div className="h-full rounded-full bg-error" style={{ width: "84%" }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right font-bold text-on-surface">2.4억</td>
                  </tr>
                  <tr className="group border-b border-outline-variant/10 transition-colors hover:bg-surface-container-high">
                    <td className="py-4 font-mono text-primary">#SH-4412-B</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">local_shipping</span>
                        <span className="font-bold text-on-surface">Nova Logistics</span>
                      </div>
                    </td>
                    <td className="py-4 text-on-surface-variant">2026.09.05</td>
                    <td className="py-4">
                      <div className="w-32">
                        <div className="mb-1 flex justify-between text-[10px]">
                          <span>42%</span>
                          <span className="font-bold text-primary">STABLE</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-surface-container-highest">
                          <div className="h-full rounded-full bg-primary" style={{ width: "42%" }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right font-bold text-on-surface">1.2억</td>
                  </tr>
                  <tr className="group border-b border-outline-variant/10 transition-colors hover:bg-surface-container-high">
                    <td className="py-4 font-mono text-primary">#SH-1029-K</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">security</span>
                        <span className="font-bold text-on-surface">Aether Defense</span>
                      </div>
                    </td>
                    <td className="py-4 text-on-surface-variant">2027.02.14</td>
                    <td className="py-4">
                      <div className="w-32">
                        <div className="mb-1 flex justify-between text-[10px]">
                          <span>12%</span>
                          <span className="font-bold text-on-surface-variant">LOW</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-surface-container-highest">
                          <div className="h-full rounded-full bg-primary" style={{ width: "12%" }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right font-bold text-on-surface">0.9억</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 인수인계 타임라인 (1/3) */}
        <div className="lg:col-span-1">
          <div className="h-full rounded-xl border border-outline-variant/15 border-b-2 border-b-primary/30 bg-surface-container-high p-6">
            <h2 className="mb-8 flex items-center gap-2 text-lg font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary">input</span>
              인수인계 프로세스
            </h2>
            <div className="relative space-y-8">
              <div className="absolute bottom-2 left-[11px] top-2 w-px bg-outline-variant/30" />
              {/* Step 1: 완료 */}
              <div className="relative flex gap-4">
                <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <span className="material-symbols-outlined text-xs font-bold text-surface-container-lowest" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-tighter text-primary">로그 확정</div>
                  <div className="mt-0.5 text-[10px] text-on-surface-variant">Alpha 팀 04:00 완료</div>
                </div>
              </div>
              {/* Step 2: 완료 */}
              <div className="relative flex gap-4">
                <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <span className="material-symbols-outlined text-xs font-bold text-surface-container-lowest" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-tighter text-primary">자산 인수인계</div>
                  <div className="mt-0.5 text-[10px] text-on-surface-variant">12/12 항목 확인 완료</div>
                </div>
              </div>
              {/* Step 3: 진행 중 */}
              <div className="relative flex gap-4">
                <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full border-4 border-surface-container-high bg-primary">
                  <div className="h-2 w-2 rounded-full bg-surface-container-lowest" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-tighter text-on-surface">브리핑 세션</div>
                  <div className="mt-0.5 text-[10px] text-on-surface-variant">진행 중 (3/5 항목 완료)</div>
                  <div className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-surface-container-lowest">
                    <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "60%" }} />
                  </div>
                </div>
              </div>
              {/* Step 4: 대기 */}
              <div className="relative flex gap-4 opacity-50">
                <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full border-4 border-surface-container-high bg-outline-variant" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-tighter text-on-surface">완료</div>
                  <div className="mt-0.5 text-[10px] text-on-surface-variant">06:00 예정</div>
                </div>
              </div>
            </div>
            <div className="mt-10 rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-4">
              <div className="mb-2 text-[10px] font-bold uppercase text-on-surface-variant">현재 관리 책임</div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-bright">
                  <span className="material-symbols-outlined text-sm text-primary">shield</span>
                </div>
                <div className="text-sm font-bold text-on-surface">섹터 7 경비 부대</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Metrics Bar ── */}
      <footer className="grid grid-cols-1 gap-6 border-t border-outline-variant/15 pt-8 md:grid-cols-3">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-black tracking-tighter text-primary">99.98</div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface">UPTIME SCORE</div>
            <div className="text-[10px] text-on-surface-variant">최근 24시간 변동: +0.02%</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-black tracking-tighter text-on-surface">14.2M</div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface">HANDOVER SPEED</div>
            <div className="text-[10px] text-on-surface-variant">평균 목표: 15M (초과 달성)</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-black tracking-tighter text-primary">LOW</div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface">RISK EXPOSURE</div>
            <div className="text-[10px] text-on-surface-variant">위협 수준: Delta (최소)</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
