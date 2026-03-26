"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/cn";

/* ── Intersection Observer Hook for scroll animations ── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

/* ── Animated Counter ── */
function LiveMetric({
  base,
  range,
  decimals,
  unit,
  label,
  trend,
  trendColor = "text-[#4ade80]",
  trendIcon = "trending_down",
}: {
  base: number;
  range: number;
  decimals: number;
  unit: string;
  label: string;
  trend: string;
  trendColor?: string;
  trendIcon?: string;
}) {
  const [value, setValue] = useState(base);

  const updateValue = useCallback(() => {
    const fluctuation = (Math.random() - 0.5) * 2 * range;
    setValue(parseFloat((base + fluctuation).toFixed(decimals)));
  }, [base, range, decimals]);

  useEffect(() => {
    const id = setInterval(updateValue, 50 + Math.random() * 100);
    return () => clearInterval(id);
  }, [updateValue]);

  return (
    <div className="flex-1 bg-surface-container-high border border-outline-variant/15 rounded-xl p-8 flex flex-col justify-center">
      <span className="text-[12px] text-on-surface-variant uppercase font-bold tracking-[0.2em] mb-2">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-black text-primary animate-counter-flicker">
          {value.toFixed(decimals)}
        </span>
        <span className="text-xl font-bold text-primary/60">{unit}</span>
      </div>
      <div className={cn("mt-4 flex items-center gap-2 text-xs", trendColor)}>
        <span className="material-symbols-outlined text-sm">{trendIcon}</span>
        <span>{trend}</span>
      </div>
    </div>
  );
}

/* ── Bar Chart ── */
function BarChart({
  title,
  value,
  heights,
}: {
  title: string;
  value: string;
  heights: number[];
}) {
  const { ref, isInView } = useInView();

  return (
    <div ref={ref}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
          {title}
        </span>
        <span className="text-primary font-bold text-sm">{value}</span>
      </div>
      <div className="h-24 flex items-end gap-1 px-2 border-l border-b border-outline-variant/20">
        {heights.map((h, i) => (
          <div
            key={i}
            className="w-full rounded-t-sm transition-all duration-700 ease-out animate-bar-pulse"
            style={{
              height: isInView ? `${h}%` : "0%",
              background: `rgba(217, 253, 83, ${0.15 + h * 0.007})`,
              transitionDelay: `${i * 50}ms`,
              animationDelay: `${(i % 3) * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Feature Card ── */
function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  delay: number;
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={cn(
        "bg-surface/40 p-6 rounded-lg border border-outline-variant/10 flex flex-col gap-4 hover:border-primary/40 transition-all cursor-pointer group",
        "transform transition-all duration-500 ease-out",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
      )}
      style={{ transitionDelay: `${delay * 1000}ms` }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined text-primary text-2xl">
          {icon}
        </span>
        <h4 className="font-bold text-lg tracking-tight">{title}</h4>
      </div>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/* ── Animated Section Wrapper ── */
function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={cn(
        "transform transition-all duration-700 ease-out",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Main Login Page
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* ━━━ Top NavBar ━━━ */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15 shadow-glow-strong">
        <div className="flex justify-between items-center h-16 px-6 w-full max-w-[1920px] mx-auto">
          <div className="flex items-center gap-2 text-xl font-black text-on-surface tracking-tighter uppercase">
            <span className="material-symbols-outlined text-primary text-3xl">
              hexagons
            </span>
            <span>SentinelHub</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:bg-surface-bright hover:text-primary transition-all duration-200 rounded-lg active:scale-95">
              <span className="material-symbols-outlined">light_mode</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-bright hover:text-primary transition-all duration-200 rounded-lg active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-bright hover:text-primary transition-all duration-200 rounded-lg active:scale-95">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button className="ml-2 bg-primary text-on-primary px-4 py-2 font-bold rounded-lg active:scale-95 transition-transform text-sm">
              관리자 로그인
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* ━━━ Hero Section ━━━ */}
        <section className="relative min-h-[700px] flex flex-col items-center justify-center overflow-hidden px-6">
          <div className="absolute inset-0 kinetic-grid pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 text-center max-w-4xl mx-auto mb-16 animate-fade-in">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary tracking-widest uppercase">
                Aegis Grid v2 Enabled
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
              운영의 모든 것을
              <br />
              <span className="text-primary">하나의 플랫폼에서.</span>
            </h1>

            <p className="text-on-surface-variant text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              서비스 관리, 계약, 인수인계, AI 분석까지 SentinelHub에서 모든 운영
              업무를 처리하세요.
            </p>
          </div>
        </section>

        {/* ━━━ Operational Intelligence Section ━━━ */}
        <section className="py-24 px-6 bg-surface-container-low relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            {/* Section Header */}
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <AnimatedSection>
                <h2 className="text-sm font-bold text-primary tracking-[0.3em] uppercase mb-4">
                  Tactical Intelligence
                </h2>
                <p className="text-4xl font-black tracking-tight">
                  지능형 운영의 중심
                </p>
              </AnimatedSection>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant/10">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Active Nodes
                  </span>
                  <span className="text-primary font-black">128</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant/10">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Global Status
                  </span>
                  <span className="text-[#4ade80] font-black">STABLE</span>
                </div>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Dashboard Window */}
              <AnimatedSection className="lg:col-span-8 bg-surface-container-high border border-outline-variant/15 rounded-xl overflow-hidden relative shadow-2xl">
                <div className="scan-line" />

                {/* Dashboard Header */}
                <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-bright/30">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">
                      analytics
                    </span>
                    <h3 className="font-bold text-lg">실시간 성능 모니터링</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                      Live Feed
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  {/* Feature Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <FeatureCard
                      icon="dashboard_customize"
                      title="통합 운영 관리"
                      description="서비스 관리, 계약, 인수인계 등 파편화된 모든 운영 업무를 단일 대시보드에서 효율적으로 통제하세요."
                      delay={0}
                    />
                    <FeatureCard
                      icon="smart_toy"
                      title="AI & 자동화"
                      description="반복적인 태스크는 스마트 자동화로, 복잡한 판단은 전용 AI 어시스턴트의 도움을 받아 최상의 효율성을 유지합니다."
                      delay={0.1}
                    />
                    <FeatureCard
                      icon="monitoring"
                      title="분석 & 보고"
                      description="실시간 리포팅 시스템을 통해 데이터 기반의 신속하고 정확한 의사결정 인사이트를 확보할 수 있습니다."
                      delay={0.2}
                    />
                  </div>

                  {/* Bar Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <BarChart
                      title="Network Traffic"
                      value="4.2 Gbps"
                      heights={[30, 45, 60, 40, 70, 55, 85, 65, 45, 50]}
                    />
                    <BarChart
                      title="CPU Utilization"
                      value="24.8%"
                      heights={[20, 30, 25, 40, 35, 50, 45, 30, 40, 25]}
                    />
                  </div>
                </div>
              </AnimatedSection>

              {/* Metrics Sidebar */}
              <AnimatedSection
                className="lg:col-span-4 flex flex-col gap-6"
                delay={200}
              >
                <LiveMetric
                  label="System Latency"
                  base={12.4}
                  range={0.5}
                  decimals={1}
                  unit="ms"
                  trend="8% improvement from last hour"
                  trendColor="text-[#4ade80]"
                  trendIcon="trending_down"
                />
                <LiveMetric
                  label="Data Throughput"
                  base={4.8}
                  range={0.2}
                  decimals={1}
                  unit="GB/s"
                  trend="Peak load handled successfully"
                  trendColor="text-on-surface-variant"
                  trendIcon="speed"
                />
                <LiveMetric
                  label="Error Rate"
                  base={0.002}
                  range={0.001}
                  decimals={3}
                  unit="%"
                  trend="2 isolated incidents flagged"
                  trendColor="text-error/80"
                  trendIcon="report_problem"
                />
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ━━━ Auth Section ━━━ */}
        <section className="py-24 px-6 relative bg-surface overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />

          <AnimatedSection className="max-w-md mx-auto relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black tracking-tighter mb-2">
                시작할 준비가 되셨나요?
              </h2>
              <p className="text-on-surface-variant text-sm">
                지금 SentinelHub의 파트너가 되어 보안 수준을 높이세요.
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-surface-container rounded-xl border border-outline-variant/15 overflow-hidden shadow-2xl">
              {/* Tabs */}
              <div className="flex border-b border-outline-variant/15">
                <button
                  onClick={() => setActiveTab("login")}
                  className={cn(
                    "flex-1 py-4 text-sm font-bold border-b-2 transition-colors",
                    activeTab === "login"
                      ? "border-primary text-on-surface bg-surface-container-high"
                      : "border-transparent text-on-surface-variant hover:text-on-surface",
                  )}
                >
                  로그인
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className={cn(
                    "flex-1 py-4 text-sm font-bold border-b-2 transition-colors",
                    activeTab === "register"
                      ? "border-primary text-on-surface bg-surface-container-high"
                      : "border-transparent text-on-surface-variant hover:text-on-surface",
                  )}
                >
                  계정 생성
                </button>
              </div>

              {/* Form Body */}
              <div className="p-8">
                {/* Microsoft OAuth */}
                <button className="w-full mb-8 py-3.5 bg-white text-black font-bold rounded-lg active:scale-95 transition-transform flex items-center justify-center gap-3 hover:bg-gray-100">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 23 23"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M11.4 24H0V12.6h11.4V24z" fill="#80bb03" />
                    <path d="M24 24H12.6V12.6H24V24z" fill="#ffba08" />
                    <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#f35325" />
                    <path d="M24 11.4H12.6V0H24v11.4z" fill="#05a6f0" />
                  </svg>
                  Microsoft로 계속하기
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/20" />
                  </div>
                  <span className="relative px-4 bg-surface-container text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">
                    또는 이메일로 로그인
                  </span>
                </div>

                {/* Email/Password Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">
                      워크스페이스 이메일
                    </label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      className={cn(
                        "w-full bg-surface-container-highest border-none rounded-lg",
                        "px-4 py-3 text-on-surface placeholder:text-outline",
                        "focus:ring-1 focus:ring-primary/50 focus:outline-none",
                        "transition-all",
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">
                      비밀번호
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={cn(
                        "w-full bg-surface-container-highest border-none rounded-lg",
                        "px-4 py-3 text-on-surface placeholder:text-outline",
                        "focus:ring-1 focus:ring-primary/50 focus:outline-none",
                        "transition-all",
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded-sm border-none bg-surface-container-highest text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="text-xs text-on-surface-variant">
                        로그인 유지
                      </span>
                    </label>
                    <a
                      href="#"
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      비밀번호 찾기
                    </a>
                  </div>
                  <button className="w-full py-4 bg-primary text-on-primary font-black rounded-lg active:scale-95 transition-transform mt-4 glow-primary hover:brightness-110">
                    시스템 접속
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-on-surface-variant">
              도움이 필요하신가요?{" "}
              <a href="#" className="text-primary hover:underline">
                기술 지원 센터
              </a>
              에 문의하세요.
            </p>
          </AnimatedSection>
        </section>
      </main>

      {/* ━━━ Footer ━━━ */}
      <footer className="bg-surface-container-lowest py-16 px-6 border-t border-outline-variant/15">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1">
            <div className="flex items-center gap-2 text-xl font-black tracking-tighter text-on-surface uppercase mb-6">
              <span className="material-symbols-outlined text-primary">
                hexagons
              </span>
              <span>SentinelHub</span>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              차세대 통합 운영 관리의 표준.
              <br />
              데이터와 지능으로 비즈니스를 보호합니다.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-6">
              Product
            </h4>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  기능 소개
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  보안 정책
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  API 가이드
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  릴리즈 노트
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-6">
              Company
            </h4>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  팀 소개
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  채용 정보
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  블로그
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  문의하기
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-6">
              Legal
            </h4>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  이용 약관
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  개인정보 처리방침
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  쿠키 정책
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-on-surface-variant">
            © 2024 SentinelHub Global. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
            <a
              href="#"
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">code</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
