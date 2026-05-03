'use client'

import { useState, useMemo } from 'react'
import {
  Coffee, Globe, ChevronRight, Shield, TrendingUp, Users, MapPin,
  Lock, FileCheck, BarChart3, Truck, TreePine, Award, Link2,
  CheckCircle2, ArrowRight, Building2, Eye, Zap, Globe2,
  Server, Database, KeyRound, ScanLine, Satellite
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/i18n'

// Deterministic pseudo-random to avoid SSR/client mismatch
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

export default function LandingPage() {
  const router = useRouter()
  const { lang, setLang } = useI18n()
  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const floatingBeans = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 5 + 1) * 100,
      y: seededRandom(i * 5 + 2) * 100,
      size: 12 + seededRandom(i * 5 + 3) * 24,
      duration: 8 + seededRandom(i * 5 + 4) * 12,
      delay: seededRandom(i * 5 + 5) * 5,
    })),
  [])

  // ─── SEO-Rich Content Sections ───

  const platformFeatures = [
    { icon: ScanLine, title: 'Farm-to-Cup Traceability', desc: 'Track every coffee bean from planting to delivery. QR code verification, batch-level tracking, and real-time supply chain visibility across all stages of production.', color: '#6D2932' },
    { icon: Shield, title: 'EUDR Compliance Engine', desc: 'Automated due diligence statements, satellite-based deforestation monitoring, geolocation verification, and TRACES certificate integration. Stay compliant with EU Deforestation Regulation effortlessly.', color: '#561C24' },
    { icon: Lock, title: 'Blockchain Verification', desc: 'Immutable hash-chain records for every supply chain event. Tamper-proof audit trail with cryptographic signatures ensuring data integrity and stakeholder trust.', color: '#6D2932' },
    { icon: BarChart3, title: 'Real-time Analytics & Dashboards', desc: 'Live KPIs, crop health monitoring, yield forecasting, procurement analytics, and quality distribution charts. Make data-driven decisions across your entire coffee operation.', color: '#561C24' },
    { icon: TreePine, title: 'Deforestation Risk Assessment', desc: 'Satellite imagery analysis, land-use change detection, and automated risk scoring for every farm plot. Prove zero-deforestation sourcing with verifiable evidence.', color: '#6D2932' },
    { icon: Award, title: 'Certification Management', desc: 'Manage Organic, Fair Trade, Rainforest Alliance, UTZ, and custom certifications. Automated renewal tracking, assessment scheduling, and compliance scoring per farm.', color: '#561C24' },
    { icon: Truck, title: 'Procurement & Processing Pipeline', desc: 'End-to-end procurement workflow with cherry-to-green-bean processing stages. Collection centre management, quality gate checks, and outturn percentage tracking.', color: '#6D2932' },
    { icon: Zap, title: 'RFQ & Trading Desk', desc: 'Request for quotation management, smart contract negotiations, escrow payment protection, and cross-border transaction support for international coffee trade.', color: '#561C24' },
  ]

  const stakeholderBenefits = [
    { icon: Users, type: 'Coffee Producers', benefits: ['Digital farmer enrollment & management', 'GPS-mapped farm land parcels', 'Crop monitoring & pest disease alerts', 'Harvest yield tracking & forecasting', 'Mobile money & bank payment integration', 'Certification compliance automation'] },
    { icon: Building2, type: 'Aggregators & Cooperatives', benefits: ['Multi-farmer procurement management', 'Processing pipeline tracking', 'Quality control & cup scoring', 'Collection centre operations', 'RFQ management for bulk sales', 'Export document generation'] },
    { icon: Globe2, type: 'Exporters & Importers', benefits: ['Cross-border transaction management', 'EUDR due diligence automation', 'Shipment & logistics tracking', 'Smart contract & escrow payments', 'Multi-currency & multi-language support', 'Buyer relationship management'] },
    { icon: FileCheck, type: 'Certification Bodies', benefits: ['Remote inspection scheduling', 'Digital assessment workflows', 'Compliance scoring dashboards', 'Certificate lifecycle management', 'Deforestation verification tools', 'Multi-standard audit trails'] },
  ]

  const securityFeatures = [
    { icon: Lock, title: 'AES-256 Encryption', desc: 'All sensitive data encrypted at rest and in transit using military-grade AES-256 encryption standard.' },
    { icon: KeyRound, title: 'Role-Based Access Control', desc: 'Granular 7-role RBAC system with entity-type permissions. Producers see farms, exporters see trade — zero cross-tenant data leakage.' },
    { icon: Database, title: 'Tenant Data Isolation', desc: 'Strict multi-tenant architecture where each organization operates in complete data isolation. No shared databases, no shared schemas.' },
    { icon: Link2, title: 'Blockchain Immutability', desc: 'Hash-chain blocks cryptographically link every supply chain event. Any tampering attempt is immediately detectable and traceable.' },
    { icon: Server, title: 'SOC 2 Compliant Infrastructure', desc: 'Hosted on enterprise-grade cloud infrastructure with regular security audits, penetration testing, and 99.9% uptime SLA.' },
    { icon: Eye, title: 'Comprehensive Audit Logging', desc: 'Every user action, data modification, and system event is logged with timestamps, IP addresses, and user identity for complete accountability.' },
  ]

  const stats = [
    { value: '6', label: 'Entity Types Supported', sublabel: 'Producer, Aggregator, Exporter, Importer, Cert Body, Lab' },
    { value: '35+', label: 'Platform Modules', sublabel: 'Farm to market, every step covered' },
    { value: '5', label: 'Languages', sublabel: 'Vietnamese, English, Portuguese, Amharic, Swahili' },
    { value: '100%', label: 'EUDR Compliant', sublabel: 'Automated due diligence & deforestation monitoring' },
  ]

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E8D8C4]/40 via-background to-background" />

      {/* Floating coffee beans */}
      {floatingBeans.map((bean) => (
        <div
          key={bean.id}
          className="absolute text-[#C7B7A3]/20 pointer-events-none select-none"
          style={{
            left: `${bean.x}%`,
            top: `${bean.y}%`,
            animation: `beanFloat ${bean.duration}s ease-in-out ${bean.delay}s infinite, beanRotate ${bean.duration}s linear ${bean.delay}s infinite`,
          }}
        >
          <Coffee size={bean.size} />
        </div>
      ))}

      {/* Gradient orbs */}
      <div className="absolute w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #C7B7A3, transparent)', top: '5%', right: '-5%', animation: 'orbPulse 8s ease-in-out infinite' }} />
      <div className="absolute w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #6D2932, transparent)', bottom: '10%', left: '-3%', animation: 'orbPulse 10s ease-in-out infinite' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ═══ Header ═══ */}
        <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#C7B7A3]/20" style={{ animation: 'fadeIn 0.6s ease-out both' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6D2932] flex items-center justify-center shadow-md">
              <Coffee className="w-6 h-6 text-[#E8D8C4]" />
            </div>
            <span className="text-xl font-bold text-[#561C24] tracking-tight">Terra Brew</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="gap-2 text-muted-foreground hover:text-foreground hover:bg-[#E8D8C4]/30">
              <Globe className="w-4 h-4" />
              {lang === 'vi' ? 'EN' : 'VI'}
            </Button>
            <Button size="sm" className="bg-[#6D2932] hover:bg-[#561C24] text-[#E8D8C4] rounded-xl shadow-sm" onClick={() => router.push('/login')}>
              {t('Đăng nhập', 'Sign In')}
            </Button>
          </div>
        </header>

        {/* ═══ Hero Section ═══ */}
        <section className="flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center">
          <div className="max-w-5xl mx-auto" style={{ animation: 'heroFadeIn 0.8s ease-out both' }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#6D2932]/10 text-[#6D2932] px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-[#6D2932]/20">
              <Satellite className="w-3.5 h-3.5" />
              {t('Nền tảng Truy xuất Cà phê #1', '#1 Coffee Traceability Platform')}
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#561C24] mb-5 leading-tight">
              {t(
                'Truy xuất Nguồn gốc Cà phê Từ Nông trại Đến Tách',
                'Coffee Traceability From Farm to Cup'
              )}
            </h1>

            <p className="text-base md:text-xl text-[#6D2932]/70 mb-4 max-w-3xl mx-auto leading-relaxed">
              {t(
                'Nền tảng đa thuê bao thế hệ mới cho chuỗi cung ứng cà phê toàn cầu. Tuân thủ EUDR, bảo mật chuỗi khối, RBAC đa thực thể — từ người sản xuất, nhà xuất khẩu đến cơ quan chứng nhận.',
                'Next-generation multi-tenant platform for the global coffee supply chain. EUDR compliant, blockchain-secured, multi-entity RBAC — from producers and exporters to certification bodies.'
              )}
            </p>

            <p className="text-sm text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t(
                'Được tin dùng bởi các hợp tác xã, nhà xuất khẩu và cơ quan chứng nhận tại Việt Nam, Brazil, Ethiopia và Kenya.',
                'Trusted by cooperatives, exporters, and certification bodies across Vietnam, Brazil, Ethiopia, and Kenya.'
              )}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button size="lg" className="bg-[#6D2932] hover:bg-[#561C24] text-[#E8D8C4] px-8 py-6 text-base rounded-xl shadow-lg shadow-[#6D2932]/20 transition-all duration-300 hover:shadow-xl" onClick={() => router.push('/login')}>
                {t('Bắt đầu Miễn phí', 'Start Free Trial')}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <Button variant="outline" size="lg" className="border-[#C7B7A3] text-[#561C24] hover:bg-[#E8D8C4]/40 px-8 py-6 text-base rounded-xl" onClick={() => router.push('/login')}>
                {t('Xem Demo', 'View Demo')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-[#C7B7A3]/30 text-center" style={{ animation: `countUp 0.5s ease-out ${0.3 + i * 0.1}s both` }}>
                  <div className="text-2xl md:text-3xl font-bold text-[#6D2932]">{stat.value}</div>
                  <div className="text-xs font-medium text-[#561C24] mt-1">{stat.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{stat.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Platform Features ═══ */}
        <section className="px-6 md:px-12 py-16 bg-[#561C24] text-[#E8D8C4] relative">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 0L40 20L20 40L0 20z\' fill=\'%23E8D8C4\' fill-opacity=\'0.3\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#E8D8C4]">
                {t('Tính năng Nền tảng Toàn diện', 'Comprehensive Platform Features')}
              </h2>
              <p className="text-[#C7B7A3] max-w-2xl mx-auto">
                {t('Mọi công cụ bạn cần để quản lý chuỗi cung ứng cà phê từ nông trại đến thị trường quốc tế.', 'Every tool you need to manage the coffee supply chain from farm to international market.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {platformFeatures.map((feature, i) => (
                <div key={i} className="bg-[#6D2932]/40 backdrop-blur-sm rounded-xl p-5 border border-[#C7B7A3]/15 hover:border-[#C7B7A3]/30 hover:bg-[#6D2932]/60 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-lg bg-[#E8D8C4]/15 flex items-center justify-center mb-3 group-hover:bg-[#E8D8C4]/25 transition-colors">
                    <feature.icon className="w-5 h-5 text-[#E8D8C4]" />
                  </div>
                  <h3 className="font-bold text-[#E8D8C4] mb-1.5 text-sm">{feature.title}</h3>
                  <p className="text-[#C7B7A3]/80 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Stakeholder Benefits ═══ */}
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#561C24] mb-3">
                {t('Lợi ích cho Mọi Bên tham gia', 'Benefits for Every Stakeholder')}
              </h2>
              <p className="text-[#6D2932]/70 max-w-2xl mx-auto">
                {t('Dù bạn là nhà sản xuất, nhà xuất khẩu hay cơ quan chứng nhận — Terra Brew được thiết kế cho vai trò cụ thể của bạn.', 'Whether you\'re a producer, exporter, or certification body — Terra Brew is designed for your specific role.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stakeholderBenefits.map((sh, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#C7B7A3]/30 hover:border-[#6D2932]/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#6D2932] flex items-center justify-center shadow-sm">
                      <sh.icon className="w-6 h-6 text-[#E8D8C4]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#561C24]">{sh.type}</h3>
                  </div>
                  <ul className="space-y-2">
                    {sh.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[#6D2932] shrink-0 mt-0.5" />
                        <span className="text-[#561C24]/80">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Data Security ═══ */}
        <section className="px-6 md:px-12 py-16 bg-[#E8D8C4]/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#561C24]/10 text-[#561C24] px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-[#561C24]/20">
                <Lock className="w-3.5 h-3.5" />
                Enterprise Security
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#561C24] mb-3">
                {t('Bảo mật Dữ liệu Cấp Doanh nghiệp', 'Enterprise-Grade Data Security')}
              </h2>
              <p className="text-[#6D2932]/70 max-w-2xl mx-auto">
                {t('Dữ liệu chuỗi cung ứng của bạn được bảo vệ bởi nhiều lớp bảo mật tiên tiến nhất ngành.', 'Your supply chain data is protected by the industry\'s most advanced multi-layer security architecture.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {securityFeatures.map((sec, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-[#C7B7A3]/30 hover:border-[#561C24]/20 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-[#561C24]/10 flex items-center justify-center mb-3">
                    <sec.icon className="w-5 h-5 text-[#561C24]" />
                  </div>
                  <h3 className="font-bold text-[#561C24] mb-1.5 text-sm">{sec.title}</h3>
                  <p className="text-[#6D2932]/70 text-xs leading-relaxed">{sec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Multi-Entity Architecture ═══ */}
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#561C24] mb-3">
              {t('Kiến trúc Đa thực thể', 'Multi-Entity Architecture')}
            </h2>
            <p className="text-[#6D2932]/70 max-w-2xl mx-auto mb-10">
              {t('Mỗi loại tổ chức có giao diện và quyền riêng. Không rò rỉ dữ liệu giữa các thuê bao.', 'Each organization type has its own interface and permissions. Zero cross-tenant data leakage.')}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: '🏭', type: 'Producer', vi: 'Nhà sản xuất' },
                { icon: '📦', type: 'Aggregator', vi: 'Tập hợp' },
                { icon: '🚢', type: 'Exporter', vi: 'Xuất khẩu' },
                { icon: '🏛️', type: 'Importer', vi: 'Nhập khẩu' },
                { icon: '✅', type: 'Cert Body', vi: 'Chứng nhận' },
                { icon: '🔬', type: 'Laboratory', vi: 'Phòng thí nghiệm' },
              ].map((entity, i) => (
                <div key={i} className="bg-white/80 rounded-xl p-4 border border-[#C7B7A3]/30 hover:border-[#6D2932]/30 hover:shadow-md transition-all duration-300">
                  <div className="text-3xl mb-2">{entity.icon}</div>
                  <div className="text-xs font-bold text-[#561C24]">{t(entity.vi, entity.type)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA Section ═══ */}
        <section className="px-6 md:px-12 py-20 bg-[#561C24] text-[#E8D8C4] text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\' fill=\'%23E8D8C4\'/%3E%3C/svg%3E")', backgroundSize: '30px 30px' }} />
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t('Sẵn sàng Biến đổi Chuỗi cung ứng Cà phê của Bạn?', 'Ready to Transform Your Coffee Supply Chain?')}
            </h2>
            <p className="text-[#C7B7A3] mb-8 text-base md:text-lg">
              {t('Tham gia cùng các hợp tác xã, nhà xuất khẩu và cơ quan chứng nhận hàng đầu thế giới đang sử dụng Terra Brew.', 'Join leading cooperatives, exporters, and certification bodies worldwide who trust Terra Brew.')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-[#E8D8C4] hover:bg-white text-[#561C24] px-8 py-6 text-base rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl font-bold" onClick={() => router.push('/login')}>
                {t('Bắt đầu Ngay', 'Get Started Now')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="border-[#C7B7A3] text-[#E8D8C4] hover:bg-[#6D2932] px-8 py-6 text-base rounded-xl" onClick={() => router.push('/login')}>
                {t('Xem Demo Trực tiếp', 'View Live Demo')}
              </Button>
            </div>
          </div>
        </section>

        {/* ═══ Footer ═══ */}
        <footer className="px-6 md:px-12 py-8 border-t border-[#C7B7A3]/20">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#6D2932] flex items-center justify-center">
                  <Coffee className="w-4 h-4 text-[#E8D8C4]" />
                </div>
                <span className="font-bold text-[#561C24]">Terra Brew</span>
              </div>
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span>{t('Nền tảng Truy xuất Cà phê', 'Coffee Traceability Platform')}</span>
                <span>·</span>
                <span>{t('Tuân thủ EUDR', 'EUDR Compliant')}</span>
                <span>·</span>
                <span>{t('Bảo mật Chuỗi khối', 'Blockchain Secured')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Terra Brew
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
