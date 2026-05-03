'use client'

import { useState, useMemo } from 'react'
import {
  Coffee, Globe, ChevronRight, Shield, TrendingUp, Users, MapPin,
  Lock, FileCheck, BarChart3, Truck, TreePine, Award, Link2,
  CheckCircle2, ArrowRight, Building2, Eye, Zap, Globe2,
  Server, Database, KeyRound, ScanLine, Satellite, ChevronDown,
  Flag, HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/i18n'
import dynamic from 'next/dynamic'

const CoffeePriceTicker = dynamic(() => import('@/components/landing/coffee-price-ticker'), { ssr: false })

// Deterministic pseudo-random to avoid SSR/client mismatch
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

export default function LandingPage() {
  const router = useRouter()
  const { lang, setLang } = useI18n()
  const t = (vi: string, en: string) => lang === 'vi' ? vi : en
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
    { icon: ScanLine, title: 'Farm-to-Cup Coffee Traceability Software', titleVi: 'Phần mềm Truy xuất Cà phê Từ Nông trại Đến Tách', desc: 'Track every coffee bean from planting to delivery with QR code verification, batch-level tracking, and real-time supply chain visibility across all stages of production. Prove coffee origin and quality to buyers and regulators worldwide.', color: '#6D2932' },
    { icon: Shield, title: 'EUDR Compliance Software & Due Diligence Automation', titleVi: 'Phần mềm Tuân thủ EUDR & Tự động Hợp pháp Kỹ thuật', desc: 'Automated due diligence statements, satellite-based deforestation monitoring, geolocation verification, and TRACES certificate integration. Stay compliant with EU Deforestation Regulation effortlessly and access European markets without delay.', color: '#561C24' },
    { icon: Lock, title: 'Blockchain Coffee Supply Chain Verification', titleVi: 'Xác minh Chuỗi khối Chuỗi cung ứng Cà phê', desc: 'Immutable hash-chain records for every supply chain event. Tamper-proof audit trail with cryptographic signatures ensuring data integrity, stakeholder trust, and consumer confidence in every batch of coffee traced on the platform.', color: '#6D2932' },
    { icon: BarChart3, title: 'Coffee Supply Chain Analytics & Dashboards', titleVi: 'Phân tích Chuỗi cung ứng Cà phê & Bảng điều khiển', desc: 'Live KPIs, crop health monitoring, yield forecasting, procurement analytics, and quality distribution charts. Make data-driven decisions across your entire coffee operation from planting forecasts to export margin analysis.', color: '#561C24' },
    { icon: TreePine, title: 'Satellite Deforestation Risk Assessment for EUDR', titleVi: 'Đánh giá Rủi ro Phá rừng bằng Vệ tinh cho EUDR', desc: 'Satellite imagery analysis, land-use change detection, and automated risk scoring for every farm plot. Prove zero-deforestation sourcing with verifiable evidence required by EU regulators and sustainability-focused buyers.', color: '#6D2932' },
    { icon: Award, title: 'Coffee Certification Management — Organic, Fair Trade, Rainforest Alliance', titleVi: 'Quản lý Chứng nhận Cà phê — Hữu cơ, Thương mại Công bằng, Rainforest Alliance', desc: 'Manage Organic, Fair Trade, Rainforest Alliance, UTZ, and custom certifications. Automated renewal tracking, assessment scheduling, and compliance scoring per farm. Streamline audit preparation and maintain certification status effortlessly.', color: '#561C24' },
    { icon: Truck, title: 'Coffee Procurement & Cherry-to-Green-Bean Processing', titleVi: 'Mua sắm Cà phê & Xử lý Từ Quả đến Hạt xanh', desc: 'End-to-end procurement workflow with cherry-to-green-bean processing stages. Collection centre management, quality gate checks, outturn percentage tracking, and real-time inventory visibility from farm gate to warehouse.', color: '#6D2932' },
    { icon: Zap, title: 'Coffee RFQ, Smart Contract & Cross-Border Trading', titleVi: 'RFQ Cà phê, Hợp đồng Thông minh & Giao dịch Qua biên giới', desc: 'Request for quotation management, smart contract negotiations, escrow payment protection, and cross-border transaction support for international coffee trade. Multi-currency settlement and automated compliance documentation included.', color: '#561C24' },
  ]

  const stakeholderBenefits = [
    { icon: Users, type: 'Coffee Producers & Smallholder Farmers', typeVi: 'Nhà sản xuất Cà phê & Nông dân Nhỏ', benefits: ['Digital farmer enrollment & GPS-mapped land management', 'Crop monitoring, pest disease alerts & yield forecasting', 'Mobile money & bank payment integration', 'Certification compliance automation & renewal tracking', 'Harvest traceability with QR code verification', 'EUDR geolocation verification for EU market access'] },
    { icon: Building2, type: 'Coffee Cooperatives & Aggregator Management', typeVi: 'Hợp tác xã Cà phê & Quản lý Tập hợp', benefits: ['Multi-farmer procurement & collection centre operations', 'Processing pipeline tracking from cherry to green bean', 'Quality control, cup scoring & outturn management', 'RFQ management for bulk sales & export readiness', 'Export document generation & compliance packaging', 'Blockchain-verified batch aggregation for buyers'] },
    { icon: Globe2, type: 'Coffee Exporters — EUDR Compliance & Trade Management', typeVi: 'Nhà xuất khẩu Cà phê — Tuân thủ EUDR & Quản lý Thương mại', benefits: ['Cross-border transaction management & smart contracts', 'EUDR due diligence automation & TRACES integration', 'Shipment & logistics tracking with real-time visibility', 'Escrow payment protection & multi-currency settlement', 'Buyer relationship management & RFQ workflows', 'Automated export document generation & compliance'] },
    { icon: FileCheck, type: 'Coffee Certification Bodies & Audit Management', typeVi: 'Cơ quan Chứng nhận Cà phê & Quản lý Kiểm toán', benefits: ['Remote inspection scheduling & digital assessment workflows', 'Compliance scoring dashboards & audit trail management', 'Certificate lifecycle management & renewal automation', 'Deforestation verification tools with satellite data', 'Multi-standard audit trails — Organic, Fair Trade, RA, UTZ', 'Cross-tenant assessment capabilities for global reach'] },
  ]

  const securityFeatures = [
    { icon: Lock, title: 'AES-256 Encryption', desc: 'All sensitive data encrypted at rest and in transit using military-grade AES-256 encryption standard. Database-level encryption, TLS 1.3 for all API communications, and encrypted backup storage ensure your coffee supply chain data remains confidential.' },
    { icon: KeyRound, title: 'Role-Based Access Control', desc: 'Granular 8-role RBAC system with entity-type permissions. Producers see farms, exporters see trade, buyers see marketplace, certification bodies see audits — zero cross-tenant data leakage. Each role has precisely scoped access to only the modules and data relevant to their function.' },
    { icon: Database, title: 'Tenant Data Isolation', desc: 'Strict multi-tenant architecture where each organization operates in complete data isolation. No shared databases, no shared schemas. Tenant-scoped queries enforced at the ORM layer ensure that your supply chain data is never accessible to other organizations on the platform.' },
    { icon: Link2, title: 'Blockchain Immutability', desc: 'Hash-chain blocks cryptographically link every supply chain event. Any tampering attempt is immediately detectable and traceable. Each block references the previous block\'s hash, creating an unbreakable chain of custody from farm to cup that regulators and buyers can verify independently.' },
    { icon: Server, title: 'SOC 2 Compliant Infrastructure', desc: 'Hosted on enterprise-grade cloud infrastructure with regular security audits, penetration testing, and 99.9% uptime SLA. Automated vulnerability scanning, intrusion detection systems, and incident response protocols protect your data around the clock.' },
    { icon: Eye, title: 'Comprehensive Audit Logging', desc: 'Every user action, data modification, and system event is logged with timestamps, IP addresses, and user identity for complete accountability. Audit logs are immutable and retained for compliance reporting, making regulatory inspections and due diligence reviews seamless.' },
  ]

  const stats = [
    { value: '6', label: 'Entity Types Supported', sublabel: 'Producer, Aggregator, Exporter, Importer, Cert Body, Lab' },
    { value: '35+', label: 'Platform Modules', sublabel: 'Farm to market, every step covered' },
    { value: '5', label: 'Languages', sublabel: 'Vietnamese, English, Portuguese, Amharic, Swahili' },
    { value: '100%', label: 'EUDR Compliant', sublabel: 'Automated due diligence & deforestation monitoring' },
  ]

  const globalRegions = [
    { flag: '🇻🇳', country: 'Vietnam', keywords: 'Vietnam Coffee Traceability', desc: 'Metrang Coffee — Dak Lak highlands, Robusta & specialty Arabica supply chain tracking, VND settlement, Vietnamese-language interface for smallholder farmers.', color: '#6D2932' },
    { flag: '🇧🇷', country: 'Brazil', keywords: 'Brazil Coffee Supply Chain', desc: 'Cooxupé — Minas Gerais region, the world\'s largest coffee cooperative managing 5,000+ farmers with Rainforest Alliance certification tracking and BRL settlement.', color: '#561C24' },
    { flag: '🇪🇹', country: 'Ethiopia', keywords: 'Ethiopia Coffee Export Compliance', desc: 'Yirgacheffe Union — Gedeo zone specialty coffee origin verification, Fair Trade certification management, Amharic-language support, and ETB mobile money integration.', color: '#6D2932' },
    { flag: '🇰🇪', country: 'Kenya', keywords: 'Kenya Coffee Cooperative Management', desc: 'Othaya Cooperative — Nyeri County AA-grade coffee tracking, M-Pesa payment integration, Swahili-language interface, and cooperative governance transparency tools.', color: '#561C24' },
  ]

  const faqItems = [
    { q: 'What is EUDR compliance for coffee exporters?', qVi: 'Tuân thủ EUDR cho nhà xuất khẩu cà phê là gì?', a: 'EUDR (EU Deforestation Regulation) compliance requires coffee exporters to prove that their products do not originate from recently deforested land. Terra Brew automates this by providing satellite-based deforestation monitoring, GPS-verified farm geolocation, and automated due diligence statement generation for seamless EU market access. Our platform cross-references farm coordinates with historical satellite imagery to generate verifiable compliance evidence that satisfies EU regulator requirements.', aVi: 'Tuân thủ EUDR (Quy định về Phá rừng của EU) yêu cầu nhà xuất khẩu cà phê chứng minh sản phẩm không có nguồn gốc từ đất mới phá rừng. Terra Brew tự động hóa điều này bằng cách cung cấp giám sát phá rừng bằng vệ tinh, xác minh địa lý nông trại GPS và tạo tự động báo cáo hợp pháp kỹ thuật để tiếp cận thị trường EU dễ dàng.' },
    { q: 'How does blockchain improve coffee supply chain traceability?', qVi: 'Blockchain cải thiện truy xuất chuỗi cung ứng cà phê như thế nào?', a: 'Blockchain technology creates an immutable, tamper-proof record of every supply chain event — from planting and harvesting to processing and export. Each transaction is cryptographically linked as a hash-chain block, making it impossible to alter historical data. This builds trust among producers, exporters, certification bodies, and consumers who can verify coffee origin via QR codes. The transparency helps combat fraud, ensures fair pricing, and supports sustainability claims with cryptographic proof.', aVi: 'Công nghệ chuỗi khối tạo ra hồ sơ bất biến, chống giả mạo cho mọi sự kiện chuỗi cung ứng — từ trồng trọt và thu hoạch đến xử lý và xuất khẩu. Mỗi giao dịch được liên kết mật mã thành khối chuỗi băm, khiến việc thay đổi dữ liệu lịch sử là không thể.' },
    { q: 'Which certifications does Terra Brew support?', qVi: 'Terra Brew hỗ trợ những chứng nhận nào?', a: 'Terra Brew supports Organic, Fair Trade, Rainforest Alliance, UTZ, and custom certification programs. The platform manages the full certification lifecycle including assessment scheduling, compliance scoring per farm, renewal tracking, and digital audit trails for certification bodies. This eliminates manual spreadsheet tracking and ensures no certification lapses, protecting your market access and premium pricing opportunities.', aVi: 'Terra Brew hỗ trợ Hữu cơ, Thương mại Công bằng, Rainforest Alliance, UTZ và các chương trình chứng nhận tùy chỉnh. Nền tảng quản lý toàn bộ vòng đời chứng nhận bao gồm lên lịch đánh giá, chấm điểm tuân thủ cho mỗi nông trại và theo dõi gia hạn.' },
    { q: 'Is Terra Brew suitable for small coffee cooperatives?', qVi: 'Terra Brew có phù hợp cho hợp tác xã cà phê nhỏ không?', a: 'Yes, Terra Brew is designed for organizations of all sizes. Small cooperatives benefit from affordable starter plans, multi-farmer procurement management, mobile money integration (M-Pesa, telebirr), and simplified EUDR compliance tools. The platform supports multiple languages including Vietnamese, Portuguese, Amharic, and Swahili to serve cooperatives across Vietnam, Brazil, Ethiopia, and Kenya. Even a 10-farmer cooperative can digitize their entire supply chain without technical expertise.', aVi: 'Có, Terra Brew được thiết kế cho các tổ chức thuộc mọi quy mô. Hợp tác xã nhỏ được hưởng lợi từ các gói khởi động phải chăng, quản lý thu mua nhiều nông dân, tích hợp tiền мобиль và công cụ tuân thủ EUDR đơn giản hóa.' },
    { q: 'How does Terra Brew help with deforestation risk assessment?', qVi: 'Terra Brew giúp đánh giá rủi ro phá rừng như thế nào?', a: 'Terra Brew uses satellite imagery analysis and land-use change detection to automatically score deforestation risk for every farm plot. GPS-verified geolocation data is cross-referenced with historical satellite data to prove zero-deforestation sourcing, generating verifiable evidence required for EUDR compliance and due diligence statements. Risk scores are updated quarterly and flag any land-use changes within the mandated December 2020 cutoff date.', aVi: 'Terra Brew sử dụng phân tích hình ảnh vệ tinh và phát hiện thay đổi sử dụng đất để tự động chấm điểm rủi ro phá rừng cho mỗi mảnh đất nông trại. Dữ liệu địa lý GPS được đối chiếu với dữ liệu vệ tinh lịch sử để chứng minh nguồn gốc không phá rừng.' },
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

        {/* ═══ Coffee Price Ticker ═══ */}
        <CoffeePriceTicker />

        {/* ═══ Hero Section ═══ */}
        <section className="flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center">
          <div className="max-w-5xl mx-auto" style={{ animation: 'heroFadeIn 0.8s ease-out both' }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#6D2932]/10 text-[#6D2932] px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-[#6D2932]/20">
              <Satellite className="w-3.5 h-3.5" />
              {t('Phần mềm Truy xuất & Tuân thủ EUDR #1', '#1 Coffee Traceability & EUDR Compliance Software')}
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#561C24] mb-5 leading-tight">
              {t(
                'Phần mềm Truy xuất Cà phê — Từ Nông trại Đến Tách | Tuân thủ EUDR',
                'Coffee Traceability Software — Farm to Cup | EUDR Compliant'
              )}
            </h1>

            <p className="text-base md:text-xl text-[#6D2932]/70 mb-4 max-w-3xl mx-auto leading-relaxed">
              {t(
                'Phần mềm quản lý chuỗi cung ứng cà phê hàng đầu — tuân thủ EUDR, bảo mật chuỗi khối, được xây dựng cho mọi thực thể từ nhà sản xuất, hợp tác xã đến nhà xuất khẩu và cơ quan chứng nhận trên toàn thế giới.',
                'The leading coffee supply chain management software — EUDR compliant, blockchain-secured, and built for every entity from producers and cooperatives to exporters and certification bodies worldwide.'
              )}
            </p>

            <p className="text-sm text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t(
                'Được tin dùng bởi các hợp tác xã, nhà xuất khẩu và cơ quan chứng nhận tại Việt Nam, Brazil, Ethiopia và Kenya.',
                'Trusted by leading coffee cooperatives, exporters, and certification bodies across Vietnam, Brazil, Ethiopia, and Kenya.'
              )}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button size="lg" className="bg-[#6D2932] hover:bg-[#561C24] text-[#E8D8C4] px-8 py-6 text-base rounded-xl shadow-lg shadow-[#6D2932]/20 transition-all duration-300 hover:shadow-xl" onClick={() => router.push('/login')}>
                {t('Dùng thử Miễn phí', 'Start Free Trial')}
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
                {t('Tính năng Phần mềm Chuỗi cung ứng Cà phê', 'Coffee Supply Chain Software Features')}
              </h2>
              <p className="text-[#C7B7A3] max-w-2xl mx-auto">
                {t('Mọi công cụ bạn cần để quản lý truy xuất cà phê, tuân thủ EUDR và vận hành chuỗi cung ứng — từ nông trại đến thị trường toàn cầu.', 'Every tool you need to manage coffee traceability, EUDR compliance, and supply chain operations — from farm to global market.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {platformFeatures.map((feature, i) => (
                <div key={i} className="bg-[#6D2932]/40 backdrop-blur-sm rounded-xl p-5 border border-[#C7B7A3]/15 hover:border-[#C7B7A3]/30 hover:bg-[#6D2932]/60 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-lg bg-[#E8D8C4]/15 flex items-center justify-center mb-3 group-hover:bg-[#E8D8C4]/25 transition-colors">
                    <feature.icon className="w-5 h-5 text-[#E8D8C4]" />
                  </div>
                  <h3 className="font-bold text-[#E8D8C4] mb-1.5 text-sm">{t(feature.titleVi, feature.title)}</h3>
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
                {t('Phần mềm Chuỗi cung ứng Cà phê cho Mọi Bên tham gia', 'Coffee Supply Chain Software for Every Stakeholder')}
              </h2>
              <p className="text-[#6D2932]/70 max-w-2xl mx-auto">
                {t('Dù bạn là nhà sản xuất cà phê, hợp tác xã, nhà xuất khẩu, người nhập khẩu hay cơ quan chứng nhận — nền tảng truy xuất cà phê Terra Brew được xây dựng cho quy trình làm việc chính xác của bạn.', "Whether you're a coffee producer, cooperative, exporter, importer, or certification body — Terra Brew's coffee traceability platform is built for your exact workflow.")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stakeholderBenefits.map((sh, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#C7B7A3]/30 hover:border-[#6D2932]/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#6D2932] flex items-center justify-center shadow-sm">
                      <sh.icon className="w-6 h-6 text-[#E8D8C4]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#561C24]">{t(sh.typeVi, sh.type)}</h3>
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
                {t('Bảo mật Dữ liệu Chuỗi cung ứng Cà phê Cấp Doanh nghiệp', 'Enterprise-Grade Coffee Supply Chain Data Security')}
              </h2>
              <p className="text-[#6D2932]/70 max-w-2xl mx-auto">
                {t('Dữ liệu chuỗi cung ứng cà phê của bạn được bảo vệ bởi kiến trúc bảo mật đa lớp tiên tiến nhất ngành với mã hóa cấp quân sự, cách ly dữ liệu thuê bao và chuỗi khối bất biến.', 'Your coffee supply chain data is protected by the industry\'s most advanced multi-layer security architecture — military-grade encryption, tenant data isolation, and blockchain immutability.')}
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
              {t('Kiến trúc Chuỗi cung ứng Cà phê Đa thực thể', 'Multi-Entity Coffee Supply Chain Architecture')}
            </h2>
            <p className="text-[#6D2932]/70 max-w-2xl mx-auto mb-10">
              {t('Mỗi thực thể chuỗi cung ứng cà phê — nhà sản xuất, tập hợp, nhà xuất khẩu, người nhập khẩu, cơ quan chứng nhận hoặc phòng thí nghiệm — hoạt động trong môi trường cách ly hoàn toàn, được kiểm soát quyền hạn.', 'Each coffee supply chain entity — producer, aggregator, exporter, importer, certification body, or lab — operates in a fully isolated, permission-controlled environment.')}
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

        {/* ═══ Global Reach — Country-Specific SEO Section ═══ */}
        <section className="px-6 md:px-12 py-16 bg-[#561C24] text-[#E8D8C4] relative">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\' fill=\'%23E8D8C4\'/%3E%3C/svg%3E")', backgroundSize: '30px 30px' }} />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#E8D8C4]/15 text-[#E8D8C4] px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-[#E8D8C4]/20">
                <Globe2 className="w-3.5 h-3.5" />
                Global Coffee Supply Chain Coverage
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#E8D8C4]">
                {t('Truy xuất Cà phê trên Toàn cầu — Từ Đông Nam Á đến Nam Mỹ & Đông Phi', 'Coffee Traceability Across Continents — From Southeast Asia to South America & East Africa')}
              </h2>
              <p className="text-[#C7B7A3] max-w-2xl mx-auto">
                {t('Nền tảng Terra Brew hỗ trợ chuỗi cung ứng cà phê trên nhiều quốc gia với ngôn ngữ địa phương, tiền tệ và quy trình tuân thủ.', 'Terra Brew powers coffee supply chains across multiple countries with local language support, native currency settlement, and region-specific compliance workflows.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {globalRegions.map((region, i) => (
                <div key={i} className="bg-[#6D2932]/40 backdrop-blur-sm rounded-xl p-6 border border-[#C7B7A3]/15 hover:border-[#C7B7A3]/30 hover:bg-[#6D2932]/60 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{region.flag}</span>
                    <div>
                      <h3 className="font-bold text-[#E8D8C4] text-base">{region.country}</h3>
                      <span className="text-[#C7B7A3] text-xs font-medium">{region.keywords}</span>
                    </div>
                  </div>
                  <p className="text-[#C7B7A3]/80 text-sm leading-relaxed">{region.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ Section — Targets "People Also Ask" Rankings ═══ */}
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#6D2932]/10 text-[#6D2932] px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-[#6D2932]/20">
                <HelpCircle className="w-3.5 h-3.5" />
                Frequently Asked Questions
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#561C24] mb-3">
                {t('Câu hỏi Thường gặp về Truy xuất Cà phê & Tuân thủ EUDR', 'Coffee Traceability & EUDR Compliance FAQ')}
              </h2>
            </div>

            <div className="space-y-3">
              {faqItems.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#C7B7A3]/30 overflow-hidden transition-all duration-300 hover:border-[#6D2932]/20"
                >
                  <button
                    className="w-full flex items-center justify-between p-5 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-bold text-[#561C24] text-sm pr-4">{t(faq.qVi, faq.q)}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#6D2932] shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="px-5 pb-5 text-[#6D2932]/70 text-sm leading-relaxed">{t(faq.aVi, faq.a)}</p>
                  </div>
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
              {t('Sẵn sàng Số hóa Chuỗi cung ứng Cà phê với Truy xuất Tuân thủ EUDR?', 'Ready to Digitize Your Coffee Supply Chain with EUDR-Compliant Traceability?')}
            </h2>
            <p className="text-[#C7B7A3] mb-8 text-base md:text-lg">
              {t('Tham gia cùng các hợp tác xã, nhà xuất khẩu và cơ quan chứng nhận hàng đầu thế giới đang sử dụng Terra Brew cho truy xuất từ nông trại đến tách và tuân thủ EUDR.', 'Join leading coffee cooperatives, exporters, and certification bodies worldwide who use Terra Brew for farm-to-cup traceability and EUDR compliance.')}
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
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap justify-center">
                <span>{t('Phần mềm Truy xuất Cà phê', 'Coffee Traceability Software')}</span>
                <span>·</span>
                <span>{t('Nền tảng Tuân thủ EUDR', 'EUDR Compliance Platform')}</span>
                <span>·</span>
                <span>{t('Chuỗi khối Chuỗi cung ứng', 'Blockchain Supply Chain')}</span>
                <span>·</span>
                <span>{t('Từ Nông trại đến Tách', 'Farm to Cup')}</span>
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
