import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  Card,
} from "@/components/common";

interface UniversityContact {
  name: string;
  person: string;
  phone: string;
  email: string;
  dept: string;
  role: string;
  updated: string;
  services: string[];
}

const contacts: UniversityContact[] = [
  { name: "서울대학교", person: "김정호", phone: "02-880-5114", email: "jh.kim@snu.ac.kr", dept: "입학관리본부", role: "입학팀장", updated: "2026.03.20", services: ["PIMS", "경쟁률"] },
  { name: "연세대학교", person: "이미경", phone: "02-2123-2200", email: "mk.lee@yonsei.ac.kr", dept: "입학처", role: "입학사정관", updated: "2026.03.18", services: ["PIMS", "접수관리자"] },
  { name: "고려대학교", person: "박성우", phone: "02-3290-1154", email: "sw.park@korea.ac.kr", dept: "입학사정관실", role: "계장", updated: "2026.03.15", services: ["PIMS", "경쟁률", "정산"] },
  { name: "성균관대학교", person: "최민지", phone: "02-760-0032", email: "mj.choi@skku.edu", dept: "입학처", role: "주임", updated: "2026.02.28", services: ["PIMS"] },
  { name: "한양대학교", person: "정태원", phone: "02-2220-0114", email: "tw.jung@hanyang.ac.kr", dept: "입학관리팀", role: "과장", updated: "2026.03.22", services: ["PIMS", "내부관리자", "경쟁률"] },
  { name: "중앙대학교", person: "한수빈", phone: "02-820-6038", email: "sb.han@cau.ac.kr", dept: "입학팀", role: "대리", updated: "2026.03.10", services: ["PIMS", "접수관리자"] },
  { name: "경희대학교", person: "윤서아", phone: "02-961-0031", email: "sa.yoon@khu.ac.kr", dept: "입학처", role: "팀장", updated: "2026.01.15", services: ["PIMS"] },
  { name: "이화여자대학교", person: "강하늘", phone: "02-3277-2114", email: "hn.kang@ewha.ac.kr", dept: "입학홍보처", role: "주임", updated: "2026.03.25", services: ["PIMS", "경쟁률", "생성툴"] },
  { name: "건국대학교", person: "오지훈", phone: "02-450-3114", email: "jh.oh@konkuk.ac.kr", dept: "입학관리팀", role: "사원", updated: "2026.03.05", services: ["PIMS"] },
  { name: "동국대학교", person: "신하영", phone: "02-2260-3114", email: "hy.shin@dongguk.edu", dept: "입학처", role: "대리", updated: "2026.02.20", services: ["PIMS", "접수관리자"] },
  { name: "숙명여자대학교", person: "조예린", phone: "02-2077-7000", email: "yr.cho@sookmyung.ac.kr", dept: "입학팀", role: "계장", updated: "2026.03.12", services: ["PIMS", "경쟁률"] },
  { name: "세종대학교", person: "임도현", phone: "02-3408-3114", email: "dh.lim@sejong.ac.kr", dept: "입학처", role: "주임", updated: "2026.03.01", services: ["PIMS"] },
];

export default function ContactsPage() {
  const totalUniversities = contacts.length;
  const recentlyUpdated = contacts.filter((c) => {
    const d = new Date(c.updated.replace(/\./g, "-"));
    return d >= new Date("2026-02-24");
  }).length;
  const totalServices = new Set(contacts.flatMap((c) => c.services)).size;

  return (
    <div className="space-y-8">
      <PageHeader
        title="대학연락처"
        description="거래 대학의 담당자 연락처를 관리합니다."
        breadcrumb={["운영", "대학연락처"]}
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface-variant text-sm font-semibold hover:bg-surface-bright transition-colors">
              <span className="material-symbols-outlined text-lg">upload_file</span>
              엑셀 가져오기
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-black hover:brightness-110 transition-all active:scale-95">
              <span className="material-symbols-outlined text-lg">person_add</span>
              연락처 추가
            </button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard icon="school" label="등록 대학수" value={totalUniversities.toString()} suffix="개" />
        <KpiCard icon="update" label="최근 업데이트" value={recentlyUpdated.toString()} suffix="개" change="최근 30일" trend="neutral" />
        <KpiCard icon="category" label="서비스 종류" value={totalServices.toString()} suffix="종" />
        <KpiCard icon="warning" label="미등록" value="3" suffix="개" alert />
      </KpiGrid>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">search</span>
          <input
            type="text"
            placeholder="대학명, 담당자명으로 검색..."
            className="w-full bg-surface-container border border-outline-variant/15 rounded-lg pl-9 pr-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none focus:border-primary/30"
          />
        </div>
        {[{ icon: "sort", label: "정렬" }, { icon: "filter_list", label: "필터" }].map((btn) => (
          <button key={btn.label} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant/15 text-on-surface-variant text-sm font-semibold hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-base">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Contact Card Grid */}
      <section>
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">등록 대학 목록</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {contacts.map((c) => (
            <Card key={c.name} hover className="p-5 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-surface-container-high">
                    <span className="material-symbols-outlined text-primary text-xl">school</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">{c.name}</h3>
                    <p className="text-[10px] text-on-surface-variant">{c.dept}</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                  <span className="material-symbols-outlined text-base">more_vert</span>
                </button>
              </div>
              {/* Contact Person */}
              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-surface-container-high/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-primary">{c.person.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{c.person}</p>
                  <p className="text-[10px] text-on-surface-variant">{c.role}</p>
                </div>
              </div>
              {/* Contact Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-sm">phone</span>
                  <span className="text-xs text-on-surface tabular-nums">{c.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-sm">mail</span>
                  <span className="text-xs text-on-surface truncate">{c.email}</span>
                </div>
              </div>
              {/* Service Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {c.services.map((svc) => (
                  <StatusBadge key={svc} variant="success">{svc}</StatusBadge>
                ))}
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-outline text-xs">update</span>
                  <span className="text-[10px] text-on-surface-variant">{c.updated}</span>
                </div>
                <div className="flex items-center gap-1">
                  {["phone", "mail", "edit"].map((icon) => (
                    <button key={icon} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-base">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center justify-between px-2 py-3">
        <p className="text-xs text-on-surface-variant">
          총 <span className="font-bold text-on-surface">{totalUniversities}</span>개 대학 등록
        </p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:bg-surface-container-high transition-colors">이전</button>
          <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary">1</button>
          <button className="px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:bg-surface-container-high transition-colors">2</button>
          <button className="px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:bg-surface-container-high transition-colors">다음</button>
        </div>
      </div>
    </div>
  );
}
