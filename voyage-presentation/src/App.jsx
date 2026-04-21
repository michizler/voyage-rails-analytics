import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  Brain,
  Database,
  AlertTriangle,
  BarChart3,
  Users,
  DollarSign,
  Shield,
  Zap,
  Server,
  Code,
  Layers,
  CheckCircle,
  ArrowRight,
  Globe,
  Train,
  Activity,
  Cloud,
  Container,
  GitBranch,
  Sparkles,
  LineChart,
  Clock,
  Award,
  Eye,
} from "lucide-react";

// Color palette - Deep rail/travel theme
const C = {
  bg1: "#0A1628",
  bg2: "#0F1F3A",
  bg3: "#081220",
  primary: "#D97706",
  primaryLight: "#F59E0B",
  secondary: "#0EA5E9",
  tertiary: "#10B981",
  accent: "#F43F5E",
  purple: "#8B5CF6",
  navy: "#1E3A8A",
  slate: "#1E293B",
  slate2: "#334155",
  tp: "#F8FAFC",
  ts: "#CBD5E1",
  tm: "#64748B",
  wh: "#FFFFFF",
  dng: "#EF4444",
  suc: "#22C55E",
  cb: "rgba(15,31,58,0.6)",
  cbr: "rgba(217,119,6,0.2)",
};

// Fonts
const fl = document.createElement("link");
fl.href =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
fl.rel = "stylesheet";
document.head.appendChild(fl);

// Primitives
const Glow = ({ s, t, l, c, d = 0 }) => (
  <div
    style={{
      position: "absolute",
      top: t,
      left: l,
      width: s,
      height: s,
      borderRadius: "50%",
      background: `radial-gradient(circle,${c}22 0%,transparent 70%)`,
      filter: "blur(50px)",
      animation: `pg 7s ease-in-out ${d}s infinite alternate`,
      pointerEvents: "none",
    }}
  />
);

const Grid = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity: 0.025,
      pointerEvents: "none",
      backgroundImage: `linear-gradient(${C.primary} 1px,transparent 1px),linear-gradient(90deg,${C.primary} 1px,transparent 1px)`,
      backgroundSize: "60px 60px",
    }}
  />
);

const Cd = ({ children, style = {}, glow }) => (
  <div
    style={{
      background: C.cb,
      border: `1px solid ${C.cbr}`,
      borderRadius: 16,
      padding: "24px",
      backdropFilter: "blur(14px)",
      boxShadow: glow
        ? `0 0 40px ${C.primary}15`
        : "0 4px 24px rgba(0,0,0,0.25)",
      ...style,
    }}
  >
    {children}
  </div>
);

const Tg = ({ text, color = C.primaryLight }) => (
  <div
    style={{
      display: "inline-block",
      fontSize: 10.5,
      fontWeight: 700,
      color,
      textTransform: "uppercase",
      letterSpacing: 2.5,
      fontFamily: "Space Grotesk",
      background: `${color}15`,
      border: `1px solid ${color}35`,
      padding: "6px 16px",
      borderRadius: 20,
      marginBottom: 16,
    }}
  >
    {text}
  </div>
);

const Ti = ({ children }) => (
  <h2
    style={{
      fontSize: "clamp(26px, 3vw, 36px)",
      fontWeight: 700,
      color: C.tp,
      fontFamily: "Space Grotesk",
      lineHeight: 1.15,
      marginBottom: 8,
      letterSpacing: -0.5,
    }}
  >
    {children}
  </h2>
);

const Sb = ({ children }) => (
  <p
    style={{
      fontSize: "clamp(13px, 1.1vw, 15px)",
      color: C.ts,
      fontFamily: "Manrope",
      lineHeight: 1.65,
      maxWidth: 720,
      marginBottom: 24,
    }}
  >
    {children}
  </p>
);

const Bg = ({ label, color = C.primary }) => (
  <span
    style={{
      display: "inline-block",
      padding: "5px 12px",
      borderRadius: 8,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: "Manrope",
      background: `${color}15`,
      border: `1px solid ${color}35`,
      color,
      marginRight: 6,
      marginBottom: 6,
    }}
  >
    {label}
  </span>
);

const CB = ({ children, style = {} }) => (
  <div
    style={{
      fontFamily: "JetBrains Mono,monospace",
      fontSize: 11,
      lineHeight: 1.75,
      padding: 14,
      background: C.bg1,
      borderRadius: 10,
      border: `1px solid ${C.cbr}`,
      color: C.ts,
      overflowX: "auto",
      ...style,
    }}
  >
    {children}
  </div>
);

const St = ({ icon: I, value, label, color = C.primary }) => (
  <Cd style={{ textAlign: "center", padding: "22px 16px" }} glow>
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 12px",
        background: `${color}18`,
      }}
    >
      <I size={22} color={color} />
    </div>
    <div
      style={{
        fontSize: 30,
        fontWeight: 800,
        color,
        fontFamily: "Space Grotesk",
        lineHeight: 1.1,
      }}
    >
      {value}
    </div>
    <div
      style={{ fontSize: 12, color: C.ts, marginTop: 5, fontFamily: "Manrope" }}
    >
      {label}
    </div>
  </Cd>
);

const IR = ({ icon: I, title, desc, color = C.primary }) => (
  <div
    style={{
      display: "flex",
      gap: 14,
      alignItems: "flex-start",
      marginBottom: 14,
    }}
  >
    <div
      style={{
        minWidth: 38,
        height: 38,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `${color}18`,
        border: `1px solid ${color}35`,
        flexShrink: 0,
      }}
    >
      <I size={17} color={color} />
    </div>
    <div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: C.tp,
          fontFamily: "Manrope",
          marginBottom: 3,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: C.ts,
          lineHeight: 1.55,
          fontFamily: "Manrope",
        }}
      >
        {desc}
      </div>
    </div>
  </div>
);

// ContentSlide wrapper - centers all content slides uniformly
const ContentSlide = ({ children }) => (
  <div
    style={{
      width: "100%",
      maxWidth: 1200,
      margin: "0 auto",
      padding: "16px 0",
      position: "relative",
    }}
  >
    {children}
  </div>
);

const SI =
  ({ number, title, subtitle, icon: Icon, color = C.primary }) =>
  () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
        textAlign: "center",
        position: "relative",
        width: "100%",
      }}
    >
      <Glow s="400px" t="20%" l="55%" c={color} />
      <Glow s="250px" t="60%" l="10%" c={C.secondary} d={1.5} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            fontFamily: "Space Grotesk",
            color: `${color}12`,
            lineHeight: 1,
            marginBottom: -30,
          }}
        >
          {number}
        </div>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 22px",
            background: `${color}18`,
            border: `1px solid ${color}40`,
          }}
        >
          <Icon size={30} color={color} />
        </div>
        <h1
          style={{
            fontSize: "clamp(32px, 4vw, 44px)",
            fontWeight: 800,
            fontFamily: "Space Grotesk",
            color: C.tp,
            marginBottom: 14,
            letterSpacing: -0.5,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: "clamp(14px, 1.2vw, 16px)",
            color: C.ts,
            fontFamily: "Manrope",
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );

const slides = [
  // 1. TITLE
  () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
        textAlign: "center",
        position: "relative",
        width: "100%",
      }}
    >
      <Glow s="450px" t="-100px" l="60%" c={C.primary} />
      <Glow s="350px" t="50%" l="-5%" c={C.secondary} d={2} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg,${C.primary},${C.primaryLight})`,
              boxShadow: `0 0 40px ${C.primary}50`,
            }}
          >
            <Train size={28} color={C.wh} />
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: C.tp,
              fontFamily: "Space Grotesk",
              letterSpacing: 2,
            }}
          >
            VOYAGE RAILS
          </span>
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 52px)",
            fontWeight: 800,
            fontFamily: "Space Grotesk",
            lineHeight: 1.1,
            background: `linear-gradient(135deg,${C.wh} 0%,${C.primaryLight} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 20,
            maxWidth: 780,
            letterSpacing: -1,
          }}
        >
          Dynamic Ticket Pricing & Revenue Management
        </h1>
        <p
          style={{
            fontSize: "clamp(14px, 1.3vw, 17px)",
            color: C.ts,
            fontFamily: "Manrope",
            maxWidth: 600,
            margin: "0 auto 34px",
            lineHeight: 1.6,
          }}
        >
          An explainable machine learning framework for demand forecasting and
          price optimization in the rail travel sector
        </p>
        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: Brain, label: "Explainable ML" },
            { icon: Container, label: "Dockerized Stack" },
            { icon: LineChart, label: "Revenue Optimization" },
          ].map((it, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "10px 20px",
                borderRadius: 12,
                background: C.cb,
                border: `1px solid ${C.cbr}`,
              }}
            >
              <it.icon size={16} color={C.primaryLight} />
              <span
                style={{
                  fontSize: 13,
                  color: C.ts,
                  fontFamily: "Manrope",
                  fontWeight: 500,
                }}
              >
                {it.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  // 2. AGENDA
  () => (
    <ContentSlide>
      <Glow s="280px" t="-30px" l="70%" c={C.primary} />
      <Tg text="Overview" />
      <Ti>Presentation Agenda</Ti>
      <Sb>
        A structured walkthrough from business challenge through the technical
        solution, deployment architecture, and projected costs.
      </Sb>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 14,
        }}
      >
        {[
          {
            n: "01",
            t: "Business Context",
            d: "VoyageRail Ltd. & the rail travel market",
          },
          {
            n: "02",
            t: "The Challenge",
            d: "Revenue leakage & pricing inefficiency",
          },
          {
            n: "03",
            t: "Project Rationale",
            d: "Why dynamic pricing is the right answer",
          },
          { n: "04", t: "Objectives", d: "Five measurable goals for success" },
          {
            n: "05",
            t: "Data & Features",
            d: "Dataset, engineering & preprocessing",
          },
          {
            n: "06",
            t: "Model & Explainability",
            d: "Training, SHAP analysis, MLflow tracking",
          },
          {
            n: "07",
            t: "Solution Architecture",
            d: "FastAPI + Streamlit + Docker stack",
          },
          {
            n: "08",
            t: "Deployment Costs",
            d: "AWS vs Azure vs GCP for containerized ML",
          },
        ].map((it, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 14,
              padding: "14px 18px",
              borderRadius: 12,
              background: C.cb,
              border: `1px solid ${C.cbr}`,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                fontFamily: "Space Grotesk",
                color: `${C.primary}50`,
                minWidth: 32,
              }}
            >
              {it.n}
            </span>
            <div>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: C.tp,
                  fontFamily: "Manrope",
                }}
              >
                {it.t}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: C.tm,
                  fontFamily: "Manrope",
                  marginTop: 2,
                }}
              >
                {it.d}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ContentSlide>
  ),

  // 3. SECTION 01
  SI({
    number: "01",
    title: "Business Context",
    subtitle:
      "Understanding VoyageRail's market position, operations, and commercial profile.",
    icon: Globe,
    color: C.primary,
  }),

  // 4. COMPANY OVERVIEW
  () => (
    <ContentSlide>
      <Glow s="300px" t="30%" l="75%" c={C.secondary} d={1} />
      <Tg text="Company Profile" />
      <Ti>VoyageRail Ltd.</Ti>
      <Sb>
        A regional rail operator running passenger services across multiple
        routes, seat classes, and booking channels. Post-pandemic demand has
        recovered — but revenue per seat hasn't kept pace.
      </Sb>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <St
          icon={Train}
          value="Multi-Route"
          label="Network Coverage"
          color={C.primary}
        />
        <St
          icon={Users}
          value="3 Tiers"
          label="Customer Segments"
          color={C.secondary}
        />
        <St
          icon={Clock}
          value="24/7"
          label="Booking Windows"
          color={C.tertiary}
        />
        <St
          icon={Award}
          value="4 Classes"
          label="Service Tiers"
          color={C.purple}
        />
      </div>
      <Cd>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}
        >
          {[
            {
              icon: Train,
              title: "Routes & Services",
              desc: "Multiple origin-destination pairs including Leeds↔York, Manchester↔London, with Standard and First Class tiers",
            },
            {
              icon: Users,
              title: "Customer Segments",
              desc: "Leisure travellers, business commuters, and daily commuters — each with distinct price sensitivities",
            },
            {
              icon: BarChart3,
              title: "Key Metrics",
              desc: "Load factor, yield per seat, booking lead time, and revenue per passenger-kilometre",
            },
          ].map((it, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <it.icon
                size={24}
                color={C.primaryLight}
                style={{ marginBottom: 12 }}
              />
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: C.tp,
                  fontFamily: "Manrope",
                  marginBottom: 6,
                }}
              >
                {it.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.ts,
                  lineHeight: 1.55,
                  fontFamily: "Manrope",
                }}
              >
                {it.desc}
              </div>
            </div>
          ))}
        </div>
      </Cd>
    </ContentSlide>
  ),

  // 5. SECTION 02
  SI({
    number: "02",
    title: "The Business Challenge",
    subtitle:
      "Static pricing rules and revenue leakage are eroding yield per seat across every route.",
    icon: AlertTriangle,
    color: C.accent,
  }),

  // 6. CHALLENGE
  () => (
    <ContentSlide>
      <Glow s="280px" t="-30px" l="80%" c={C.accent} d={0.5} />
      <Tg text="The Problem" color={C.accent} />
      <Ti>Revenue Leakage & Pricing Inefficiency</Ti>
      <Sb>
        Despite stable ticket volumes, yield per seat varies significantly —
        especially during peak and near-peak periods. Five core issues.
      </Sb>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 18,
        }}
      >
        <div>
          <IR
            icon={Zap}
            title="Static Rule-Based Pricing"
            desc="Predefined fare rules fail to respond to real-time demand signals. Monday's price doesn't reflect Thursday's reality."
            color={C.accent}
          />
          <IR
            icon={TrendingUp}
            title="Revenue Leakage"
            desc="Seats sold below optimal price during high demand. Overpriced during low demand, leading to unsold capacity."
            color={C.primaryLight}
          />
          <IR
            icon={Users}
            title="Customer Price Sensitivity"
            desc="Different segments react differently to price, but strategies lack personalization or segmentation awareness."
            color={C.secondary}
          />
        </div>
        <div>
          <IR
            icon={Layers}
            title="Operational Complexity"
            desc="Multiple routes, classes, booking windows, and seasonal patterns create inefficiencies that resist manual management."
            color={C.tertiary}
          />
          <IR
            icon={Eye}
            title="Limited Explainability"
            desc="Previous models offered little transparency. Commercial teams couldn't trust or defend black-box recommendations."
            color={C.purple}
          />
          <Cd
            style={{
              marginTop: 4,
              background: `${C.accent}08`,
              borderColor: `${C.accent}25`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AlertTriangle size={18} color={C.accent} />
              <span
                style={{ fontSize: 13, color: C.tp, fontFamily: "Manrope" }}
              >
                Yield per seat varies{" "}
                <span style={{ color: C.primaryLight, fontWeight: 700 }}>
                  significantly
                </span>{" "}
                during peak periods
              </span>
            </div>
          </Cd>
        </div>
      </div>
    </ContentSlide>
  ),

  // 7. SECTION 03
  SI({
    number: "03",
    title: "Project Rationale",
    subtitle:
      "Why machine learning-driven dynamic pricing is the industry standard for rail and travel.",
    icon: Target,
    color: C.tertiary,
  }),

  // 8. RATIONALE
  () => (
    <ContentSlide>
      <Glow s="300px" t="10%" l="70%" c={C.tertiary} />
      <Tg text="Strategic Case" color={C.tertiary} />
      <Ti>Why Dynamic Pricing, Why Now</Ti>
      <Sb>
        Leading travel companies already use ML to forecast demand, price in
        real time, and explain decisions. Without this, organizations risk
        falling behind competitors who monetize demand more effectively.
      </Sb>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 18,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.primaryLight,
              fontFamily: "Manrope",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Industry Adoption
          </div>
          {[
            {
              name: "Machine Learning Forecasting",
              desc: "Predict demand across routes, dates, and time windows",
            },
            {
              name: "Real-Time Pricing Engines",
              desc: "Adjust prices based on booking velocity and inventory",
            },
            {
              name: "Explainable AI",
              desc: "Support regulatory, internal governance, and commercial trust",
            },
          ].map((it, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 12,
                padding: "12px 14px",
                borderRadius: 10,
                background: C.cb,
                border: `1px solid ${C.cbr}`,
              }}
            >
              <CheckCircle
                size={15}
                color={C.suc}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.tp,
                    fontFamily: "Manrope",
                  }}
                >
                  {it.name}
                </span>
                <div
                  style={{
                    fontSize: 12,
                    color: C.ts,
                    fontFamily: "Manrope",
                    marginTop: 2,
                    lineHeight: 1.5,
                  }}
                >
                  {it.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.primaryLight,
              fontFamily: "Manrope",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Top Five Strategic Reasons
          </div>
          {[
            {
              icon: DollarSign,
              t: "Revenue Optimization",
              d: "Maximize yield per seat without increasing capacity",
            },
            {
              icon: TrendingUp,
              t: "Demand-Supply Alignment",
              d: "Match prices to real-time booking patterns & inventory",
            },
            {
              icon: Users,
              t: "Customer Experience",
              d: "Avoid abrupt or illogical price changes that erode trust",
            },
            {
              icon: Zap,
              t: "Operational Efficiency",
              d: "Reduce manual pricing interventions & rule maintenance",
            },
            {
              icon: Shield,
              t: "Competitive Advantage",
              d: "Respond to market shifts while rivals stay static",
            },
          ].map((it, i) => (
            <IR
              key={i}
              icon={it.icon}
              title={it.t}
              desc={it.d}
              color={i % 2 === 0 ? C.primary : C.secondary}
            />
          ))}
        </div>
      </div>
    </ContentSlide>
  ),

  // 9. SECTION 04
  SI({
    number: "04",
    title: "Project Objectives",
    subtitle:
      "Five measurable goals that define success for the VoyageRail pricing framework.",
    icon: BarChart3,
    color: C.secondary,
  }),

  // 10. OBJECTIVES
  () => (
    <ContentSlide>
      <Glow s="280px" t="20%" l="80%" c={C.secondary} d={0.5} />
      <Tg text="Goals" color={C.secondary} />
      <Ti>Five Pillars of Success</Ti>
      <Sb>
        Each objective ties directly to a measurable business outcome, from
        demand forecasting to revenue uplift.
      </Sb>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {[
          {
            icon: Brain,
            n: "01",
            t: "Predict Demand Accurately",
            d: "Use historical and behavioural data to forecast ticket demand across routes, dates, and time windows.",
            c: C.primary,
          },
          {
            icon: DollarSign,
            n: "02",
            t: "Optimize Pricing Decisions",
            d: "Determine optimal price points that balance revenue maximization and seat utilization.",
            c: C.secondary,
          },
          {
            icon: Users,
            n: "03",
            t: "Incorporate Customer Behaviour",
            d: "Account for booking lead time, travel purpose, and individual price sensitivity by segment.",
            c: C.tertiary,
          },
          {
            icon: Eye,
            n: "04",
            t: "Enhance Explainability",
            d: "Apply interpretable ML techniques (SHAP) to justify every pricing decision to commercial teams.",
            c: C.purple,
          },
        ].map((it, i) => (
          <Cd key={i} glow>
            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                fontFamily: "Space Grotesk",
                color: `${it.c}25`,
                marginBottom: 4,
              }}
            >
              {it.n}
            </div>
            <it.icon size={20} color={it.c} />
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.tp,
                fontFamily: "Manrope",
                margin: "8px 0 6px",
              }}
            >
              {it.t}
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.ts,
                lineHeight: 1.55,
                fontFamily: "Manrope",
              }}
            >
              {it.d}
            </div>
          </Cd>
        ))}
      </div>
      <Cd
        style={{
          marginTop: 16,
          background: `${C.tertiary}08`,
          borderColor: `${C.tertiary}30`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `${C.tertiary}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TrendingUp size={18} color={C.tertiary} />
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.tp,
                fontFamily: "Manrope",
              }}
            >
              05 — Drive Measurable Business Impact
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.ts,
                fontFamily: "Manrope",
                marginTop: 2,
              }}
            >
              Increase revenue per seat, improve load factors, and reduce unsold
              inventory across the network
            </div>
          </div>
        </div>
      </Cd>
    </ContentSlide>
  ),

  // 11. SECTION 05
  SI({
    number: "05",
    title: "Data & Features",
    subtitle:
      "The historical booking dataset, feature engineering, and preprocessing pipeline.",
    icon: Database,
    color: C.purple,
  }),

  // 12. DATA
  () => (
    <ContentSlide>
      <Glow s="250px" t="50%" l="75%" c={C.purple} d={1} />
      <Tg text="Dataset" color={C.purple} />
      <Ti>Historical Booking Records</Ti>
      <Sb>
        Source data captures the full picture of each trip — route, timing,
        customer, and realized pricing. 17 features feed the model.
      </Sb>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 18,
        }}
      >
        <Cd glow>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.primaryLight,
              fontFamily: "Manrope",
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Feature Categories
          </div>
          {[
            {
              c: "Route & Trip",
              items: [
                "origin",
                "destination",
                "distance_km",
                "route_category",
                "seat_class",
                "total_seats",
              ],
              color: C.primary,
            },
            {
              c: "Booking & Timing",
              items: [
                "days_before_travel",
                "booking_frequency_quarter",
                "booking_channel",
              ],
              color: C.secondary,
            },
            {
              c: "Pricing & Revenue",
              items: [
                "price_premium",
                "average_spend_gbp",
                "load_factor",
                "seats_sold_realised",
                "remaining_seats_realised",
              ],
              color: C.tertiary,
            },
            {
              c: "Demand & Customer",
              items: ["demand_index", "customer_segment", "loyalty_status"],
              color: C.purple,
            },
          ].map((g, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: g.color,
                  fontFamily: "Manrope",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                {g.c}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {g.items.map((it, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: 10,
                      fontFamily: "JetBrains Mono",
                      color: C.ts,
                      background: `${g.color}10`,
                      padding: "3px 7px",
                      borderRadius: 4,
                      border: `1px solid ${g.color}20`,
                    }}
                  >
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div
            style={{
              marginTop: 12,
              padding: "8px 12px",
              borderRadius: 8,
              background: `${C.primary}10`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Target size={14} color={C.primary} />
            <span
              style={{ fontSize: 11.5, color: C.tp, fontFamily: "Manrope" }}
            >
              Target: <strong>ticket_price</strong> (regression)
            </span>
          </div>
        </Cd>
        <div>
          <Cd style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.primaryLight,
                fontFamily: "Manrope",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Preprocessing Pipeline
            </div>
            <CB>
              <span style={{ color: C.tm }}># preprocess.ipynb workflow</span>
              {"\n"}
              <span style={{ color: C.primaryLight }}>import</span> pandas{" "}
              <span style={{ color: C.primaryLight }}>as</span> pd{"\n"}
              <span style={{ color: C.primaryLight }}>from</span>{" "}
              sklearn.preprocessing{" "}
              <span style={{ color: C.primaryLight }}>import</span>
              {"\n"}
              {"  "}StandardScaler, OneHotEncoder{"\n"}
              <span style={{ color: C.primaryLight }}>from</span>{" "}
              sklearn.model_selection{" "}
              <span style={{ color: C.primaryLight }}>import</span>
              {"\n"}
              {"  "}train_test_split{"\n"}
              {"\n"}
              df = pd.read_csv(
              <span style={{ color: C.suc }}>"travel_data.csv"</span>){"\n"}
              {"\n"}
              <span style={{ color: C.tm }}># Feature engineering</span>
              {"\n"}
              df[<span style={{ color: C.suc }}>'load_x_demand'</span>] = \
              {"\n"}
              {"  "}df[<span style={{ color: C.suc }}>'load_factor'</span>] *
              df[<span style={{ color: C.suc }}>'demand_index'</span>]
            </CB>
          </Cd>
          <Cd>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.tertiary,
                fontFamily: "Manrope",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Transformations Applied
            </div>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}
            >
              {[
                {
                  t: "One-Hot Encoding",
                  d: "origin, destination, booking_channel",
                },
                {
                  t: "Label Encoding",
                  d: "seat_class, loyalty_status (ordinal)",
                },
                {
                  t: "Standard Scaling",
                  d: "continuous features for model convergence",
                },
                { t: "Interaction Features", d: "load_factor × demand_index" },
              ].map((it, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                >
                  <CheckCircle
                    size={13}
                    color={C.tertiary}
                    style={{ marginTop: 2, flexShrink: 0 }}
                  />
                  <div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.tp,
                        fontFamily: "Manrope",
                      }}
                    >
                      {it.t}
                    </span>{" "}
                    <span
                      style={{
                        fontSize: 11.5,
                        color: C.tm,
                        fontFamily: "JetBrains Mono",
                      }}
                    >
                      — {it.d}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Cd>
        </div>
      </div>
    </ContentSlide>
  ),

  // 13. SECTION 06
  SI({
    number: "06",
    title: "Model & Explainability",
    subtitle:
      "Training, SHAP analysis, and MLflow tracking — from notebook to reproducible pipeline.",
    icon: Brain,
    color: C.primary,
  }),

  // 14. MODEL TRAINING
  () => (
    <ContentSlide>
      <Glow s="280px" t="40%" l="80%" c={C.primary} />
      <Tg text="Training" />
      <Ti>Model Selection & Evaluation</Ti>
      <Sb>
        Multiple regression algorithms were trained, cross-validated, and
        compared. The best performer is serialized as model.pkl.
      </Sb>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 18,
        }}
      >
        <Cd glow>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.primaryLight,
              fontFamily: "Manrope",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Models Compared
          </div>
          {[
            { m: "Linear Regression", p: "Baseline benchmark", c: C.tm },
            {
              m: "Random Forest",
              p: "Non-linear, robust to scale",
              c: C.secondary,
            },
            {
              m: "Gradient Boosting",
              p: "Strong tabular performance",
              c: C.tertiary,
            },
          ].map((it, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 10,
                padding: "10px 12px",
                borderRadius: 8,
                background: `${it.c}08`,
                border: `1px solid ${it.c}20`,
              }}
            >
              <div
                style={{
                  minWidth: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: it.c,
                  marginTop: 6,
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.tp,
                    fontFamily: "Manrope",
                  }}
                >
                  {it.m}
                </div>
                <div
                  style={{ fontSize: 11.5, color: C.ts, fontFamily: "Manrope" }}
                >
                  {it.p}
                </div>
              </div>
            </div>
          ))}
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: 8,
              background: `${C.primary}15`,
              border: `1px solid ${C.primary}30`,
            }}
          >
            <div style={{ fontSize: 11, color: C.tp, fontFamily: "Manrope" }}>
              <strong>Task:</strong> Regression · <strong>Metrics:</strong>{" "}
              RMSE, MAE, R²
            </div>
          </div>
        </Cd>
        <div>
          <Cd style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.primaryLight,
                fontFamily: "Manrope",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Training Code
            </div>
            <CB>
              <span style={{ color: C.primaryLight }}>from</span>{" "}
              sklearn.ensemble{" "}
              <span style={{ color: C.primaryLight }}>import</span>
              {"\n"}
              {"  "}GradientBoostingRegressor{"\n"}
              <span style={{ color: C.primaryLight }}>import</span> mlflow{"\n"}
              {"\n"}
              mlflow.start_run(){"\n"}
              model = GradientBoostingRegressor({"\n"}
              {"  "}n_estimators=<span style={{ color: C.secondary }}>300</span>
              ,{"\n"}
              {"  "}max_depth=<span style={{ color: C.secondary }}>6</span>,
              {"\n"}
              {"  "}learning_rate=
              <span style={{ color: C.secondary }}>0.05</span>
              {"\n"}){"\n"}
              model.fit(X_train, y_train){"\n"}
              mlflow.sklearn.log_model(model,{" "}
              <span style={{ color: C.suc }}>"voyage"</span>)
            </CB>
          </Cd>
          <Cd>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.suc,
                fontFamily: "Manrope",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Example Prediction
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span
                style={{ fontSize: 11.5, color: C.ts, fontFamily: "Manrope" }}
              >
                Leeds → York, Standard, 21 days out
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "baseline",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: C.suc,
                  fontFamily: "Space Grotesk",
                }}
              >
                £37.30
              </span>
              <span
                style={{ fontSize: 11, color: C.tm, fontFamily: "Manrope" }}
              >
                demand 0.92 · load 0.44
              </span>
            </div>
            <div
              style={{
                marginTop: 8,
                padding: "5px 10px",
                borderRadius: 6,
                background: `${C.secondary}15`,
                display: "inline-block",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: C.secondary,
                  fontFamily: "Manrope",
                  fontWeight: 600,
                }}
              >
                Fare Band: Moderate
              </span>
            </div>
          </Cd>
        </div>
      </div>
    </ContentSlide>
  ),

  // 15. EXPLAINABILITY
  () => (
    <ContentSlide>
      <Glow s="280px" t="20%" l="75%" c={C.secondary} />
      <Tg text="Explainability" color={C.secondary} />
      <Ti>SHAP Values & MLflow Tracking</Ti>
      <Sb>
        Commercial teams don't act on recommendations they can't explain. SHAP
        and MLflow are first-class requirements — not afterthoughts.
      </Sb>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 18,
        }}
      >
        <Cd glow>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.primaryLight,
              fontFamily: "Manrope",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Top SHAP Feature Importance
          </div>
          {[
            { f: "demand_index", v: 95, c: C.primary },
            { f: "load_factor", v: 82, c: C.secondary },
            { f: "days_before_travel", v: 71, c: C.tertiary },
            { f: "seat_class", v: 58, c: C.purple },
            { f: "route_category", v: 52, c: C.primary },
            { f: "booking_channel", v: 44, c: C.secondary },
            { f: "customer_segment", v: 38, c: C.tertiary },
            { f: "average_spend_gbp", v: 32, c: C.purple },
          ].map((it, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: C.ts,
                    fontFamily: "JetBrains Mono",
                  }}
                >
                  {it.f}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: C.tm,
                    fontFamily: "JetBrains Mono",
                  }}
                >
                  {it.v}%
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: C.slate,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    width: `${it.v}%`,
                    background: `linear-gradient(90deg,${it.c},${it.c}99)`,
                  }}
                />
              </div>
            </div>
          ))}
          <div
            style={{
              marginTop: 10,
              fontSize: 10.5,
              color: C.tm,
              fontFamily: "Manrope",
              fontStyle: "italic",
            }}
          >
            Demand signals dominate; customer + booking context refine the price
          </div>
        </Cd>
        <div>
          <Cd style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.tertiary,
                fontFamily: "Manrope",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              MLflow Tracking
            </div>
            <CB>
              <span style={{ color: C.tm }}># Every run logs:</span>
              {"\n"}
              mlflow.log_params(param_dict){"\n"}
              mlflow.log_metric(<span style={{ color: C.suc }}>"rmse"</span>,
              rmse){"\n"}
              mlflow.log_metric(<span style={{ color: C.suc }}>"mae"</span>,
              mae){"\n"}
              mlflow.log_metric(<span style={{ color: C.suc }}>"r2"</span>, r2)
              {"\n"}
              mlflow.log_artifact(
              <span style={{ color: C.suc }}>"shap_summary.png"</span>){"\n"}
              mlflow.sklearn.log_model(model,{" "}
              <span style={{ color: C.suc }}>"v1"</span>)
            </CB>
          </Cd>
          <Cd>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.primaryLight,
                fontFamily: "Manrope",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Business Narrative
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.ts,
                fontFamily: "Manrope",
                lineHeight: 1.65,
                fontStyle: "italic",
                padding: 12,
                background: `${C.primary}08`,
                borderRadius: 8,
                borderLeft: `3px solid ${C.primary}`,
              }}
            >
              "We recommend £37.30 for this Leeds→York booking because demand
              sits at 92% of capacity, with 21 days lead time and moderate load
              factor — historically this configuration yields the best revenue."
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 11,
                color: C.tm,
                fontFamily: "Manrope",
              }}
            >
              A defensible, auditable decision — not a black-box output.
            </div>
          </Cd>
        </div>
      </div>
    </ContentSlide>
  ),

  // 16. SECTION 07
  SI({
    number: "07",
    title: "Solution Architecture",
    subtitle:
      "FastAPI inference backend, Streamlit UI, and Docker Compose orchestration.",
    icon: Layers,
    color: C.secondary,
  }),

  // 17. ARCHITECTURE
  () => (
    <ContentSlide>
      <Glow s="300px" t="10%" l="70%" c={C.secondary} d={0.5} />
      <Tg text="Architecture" color={C.secondary} />
      <Ti>Containerized Microservices</Ti>
      <Sb>
        Two independent services — FastAPI backend and Streamlit frontend —
        orchestrated through Docker Compose with internal networking.
      </Sb>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 18,
        }}
      >
        <Cd glow style={{ padding: "22px" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.primaryLight,
              fontFamily: "Manrope",
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Service Flow
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 10,
                background: `${C.tertiary}10`,
                border: `1px solid ${C.tertiary}30`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${C.tertiary}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Users size={16} color={C.tertiary} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.tp,
                    fontFamily: "Manrope",
                  }}
                >
                  1. User Input
                </div>
                <div
                  style={{ fontSize: 11, color: C.ts, fontFamily: "Manrope" }}
                >
                  Streamlit UI (:8501) — 17 booking features
                </div>
              </div>
            </div>
            <div
              style={{ textAlign: "center", fontSize: 18, color: C.primary }}
            >
              ↓
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 10,
                background: `${C.secondary}10`,
                border: `1px solid ${C.secondary}30`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${C.secondary}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Server size={16} color={C.secondary} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.tp,
                    fontFamily: "Manrope",
                  }}
                >
                  2. POST /predict
                </div>
                <div
                  style={{ fontSize: 11, color: C.ts, fontFamily: "Manrope" }}
                >
                  FastAPI backend (:8000) — Pydantic validation
                </div>
              </div>
            </div>
            <div
              style={{ textAlign: "center", fontSize: 18, color: C.primary }}
            >
              ↓
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 10,
                background: `${C.primary}10`,
                border: `1px solid ${C.primary}30`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${C.primary}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Brain size={16} color={C.primary} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.tp,
                    fontFamily: "Manrope",
                  }}
                >
                  3. Model Inference
                </div>
                <div
                  style={{ fontSize: 11, color: C.ts, fontFamily: "Manrope" }}
                >
                  Loads model.pkl · predicts ticket_price
                </div>
              </div>
            </div>
            <div
              style={{ textAlign: "center", fontSize: 18, color: C.primary }}
            >
              ↓
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 10,
                background: `${C.purple}10`,
                border: `1px solid ${C.purple}30`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${C.purple}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LineChart size={16} color={C.purple} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.tp,
                    fontFamily: "Manrope",
                  }}
                >
                  4. JSON Response
                </div>
                <div
                  style={{ fontSize: 11, color: C.ts, fontFamily: "Manrope" }}
                >
                  Price, demand index, fare band → UI visualization
                </div>
              </div>
            </div>
          </div>
        </Cd>
        <div>
          <Cd style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.primaryLight,
                fontFamily: "Manrope",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              docker-compose.yml
            </div>
            <CB>
              services:{"\n"}
              {"  "}
              <span style={{ color: C.secondary }}>backend:</span>
              {"\n"}
              {"    "}build:{"\n"}
              {"      "}dockerfile: Dockerfile.backend{"\n"}
              {"    "}ports: [<span style={{ color: C.suc }}>"8000:8000"</span>]
              {"\n"}
              {"\n"}
              {"  "}
              <span style={{ color: C.secondary }}>streamlit:</span>
              {"\n"}
              {"    "}build:{"\n"}
              {"      "}dockerfile: Dockerfile.streamlit{"\n"}
              {"    "}ports: [<span style={{ color: C.suc }}>"8501:8501"</span>]
              {"\n"}
              {"    "}depends_on: [backend]
            </CB>
          </Cd>
          <Cd>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.primaryLight,
                fontFamily: "Manrope",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Tech Stack
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: C.primary,
                  fontFamily: "Manrope",
                  marginBottom: 5,
                }}
              >
                BACKEND
              </div>
              <div>
                <Bg label="FastAPI" color={C.tertiary} />
                <Bg label="Pydantic" color={C.tertiary} />
                <Bg label="Uvicorn" color={C.tertiary} />
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: C.primary,
                  fontFamily: "Manrope",
                  marginBottom: 5,
                  marginTop: 8,
                }}
              >
                ML
              </div>
              <div>
                <Bg label="Scikit-learn" color={C.primary} />
                <Bg label="XGBoost" color={C.primary} />
                <Bg label="SHAP" color={C.primary} />
                <Bg label="MLflow" color={C.primary} />
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: C.primary,
                  fontFamily: "Manrope",
                  marginBottom: 5,
                  marginTop: 8,
                }}
              >
                FRONTEND & INFRA
              </div>
              <div>
                <Bg label="Streamlit" color={C.secondary} />
                <Bg label="Plotly" color={C.secondary} />
                <Bg label="Docker" color={C.secondary} />
                <Bg label="Compose" color={C.secondary} />
              </div>
            </div>
          </Cd>
        </div>
      </div>
    </ContentSlide>
  ),

  // 18. STREAMLIT DEMO
  () => (
    <ContentSlide>
      <Glow s="300px" t="20%" l="75%" c={C.tertiary} />
      <Tg text="Interactive Demo" color={C.tertiary} />
      <Ti>Streamlit UI for Stakeholders</Ti>
      <Sb>
        A no-code interface for commercial teams to test predictions, explore
        scenarios, and validate the model — without touching the API directly.
      </Sb>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 18,
        }}
      >
        <Cd glow>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.primaryLight,
              fontFamily: "Manrope",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            UI Features
          </div>
          {[
            {
              icon: Server,
              t: "API Settings",
              d: "Configurable FastAPI base URL, health check",
            },
            {
              icon: Sparkles,
              t: "Sample Scenarios",
              d: "Leisure Saver, Business Peak, Weekend Commuter presets",
            },
            {
              icon: BarChart3,
              t: "Input Form",
              d: "All 17 features exposed as inputs, dropdowns, selectors",
            },
            {
              icon: Zap,
              t: "Run Prediction",
              d: "Single click sends payload, returns price + insights",
            },
          ].map((it, i) => (
            <IR
              key={i}
              icon={it.icon}
              title={it.t}
              desc={it.d}
              color={i % 2 === 0 ? C.primary : C.secondary}
            />
          ))}
        </Cd>
        <Cd>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.suc,
              fontFamily: "Manrope",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Example Result
          </div>
          <div
            style={{
              padding: 14,
              borderRadius: 10,
              background: `${C.suc}08`,
              border: `1px solid ${C.suc}25`,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: C.suc,
                fontFamily: "Manrope",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              ✓ Prediction completed successfully
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                gap: 10,
              }}
            >
              <div>
                <div
                  style={{ fontSize: 10, color: C.tm, fontFamily: "Manrope" }}
                >
                  Predicted Price
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.tp,
                    fontFamily: "Space Grotesk",
                  }}
                >
                  £37.30
                </div>
              </div>
              <div>
                <div
                  style={{ fontSize: 10, color: C.tm, fontFamily: "Manrope" }}
                >
                  Demand Index
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.tp,
                    fontFamily: "Space Grotesk",
                  }}
                >
                  0.92
                </div>
              </div>
              <div>
                <div
                  style={{ fontSize: 10, color: C.tm, fontFamily: "Manrope" }}
                >
                  Days Ahead
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.tp,
                    fontFamily: "Space Grotesk",
                  }}
                >
                  21
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: C.ts,
              fontFamily: "Manrope",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: C.tp }}>Three result views:</strong>
            <br />
            <span style={{ color: C.tertiary }}>•</span> Insight View — visual
            with fare band & comparison chart
            <br />
            <span style={{ color: C.secondary }}>•</span> API Response — raw
            JSON for debugging
            <br />
            <span style={{ color: C.primary }}>•</span> cURL — exportable
            command for API testing
          </div>
        </Cd>
      </div>
    </ContentSlide>
  ),

  // 19. SECTION 08
  SI({
    number: "08",
    title: "Deployment Costs",
    subtitle:
      "Production infrastructure costs for the containerized stack — AWS, Azure, and GCP compared.",
    icon: Cloud,
    color: C.primary,
  }),

  // 20. COSTS
  () => (
    <ContentSlide>
      <Glow s="300px" t="20%" l="75%" c={C.primary} />
      <Tg text="Infrastructure" />
      <Ti>AWS vs Azure vs GCP — Monthly Estimates</Ti>
      <Sb>
        Cost projections for running the two-container stack (FastAPI +
        Streamlit) on CPU-only inference, 24/7 availability, low-to-moderate
        traffic.
      </Sb>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {[
          {
            name: "AWS",
            color: C.primary,
            items: [
              { l: "ECS Fargate (2 tasks, 0.5vCPU)", v: "$42-60" },
              { l: "Application Load Balancer", v: "$18-22" },
              { l: "ECR (image storage)", v: "$1-3" },
              { l: "S3 (model/artifacts)", v: "$1-3" },
              { l: "CloudWatch Logs & Metrics", v: "$8-12" },
              { l: "Data Transfer (~20GB)", v: "$2-4" },
            ],
            total: "$72-104/mo",
            pros: [
              "Mature container platform",
              "Rich ML ecosystem (SageMaker)",
              "Fargate Spot saves 70%",
            ],
            cons: [
              "40% Fargate premium over EC2",
              "Complex IAM configuration",
              "Egress fees compound",
            ],
          },
          {
            name: "Azure",
            color: C.secondary,
            items: [
              { l: "Container Apps (2 replicas)", v: "$38-55" },
              { l: "Application Gateway", v: "$20-25" },
              { l: "ACR (container registry)", v: "$5" },
              { l: "Blob Storage", v: "$1-3" },
              { l: "Azure Monitor + App Insights", v: "$6-10" },
              { l: "Data Transfer", v: "$2-4" },
            ],
            total: "$72-102/mo",
            pros: [
              "Container Apps scales to zero",
              "Hybrid Benefit for enterprise",
              "Native AD integration",
            ],
            cons: [
              "SKU complexity overhead",
              "Fewer GPU options",
              "Less intuitive console",
            ],
          },
          {
            name: "GCP",
            color: C.tertiary,
            items: [
              { l: "Cloud Run (2 services)", v: "$20-40" },
              { l: "Cloud Load Balancing", v: "$18-22" },
              { l: "Artifact Registry", v: "$1-3" },
              { l: "Cloud Storage", v: "$1-2" },
              { l: "Cloud Monitoring & Logs", v: "$0-8" },
              { l: "Data Transfer", v: "$1-3" },
            ],
            total: "$41-78/mo",
            pros: [
              "Cloud Run pay-per-request",
              "Auto sustained-use discounts",
              "Cleanest container UX",
            ],
            cons: [
              "Smaller enterprise adoption",
              "Fewer regions",
              "Limited proprietary services",
            ],
          },
        ].map((p, i) => (
          <Cd key={i} glow style={{ padding: "18px" }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: p.color,
                fontFamily: "Space Grotesk",
                marginBottom: 12,
              }}
            >
              {p.name}
            </div>
            {p.items.map((it, j) => (
              <div
                key={j}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom:
                    j < p.items.length - 1 ? `1px solid ${C.cbr}` : "none",
                  gap: 8,
                }}
              >
                <span
                  style={{ fontSize: 10.5, color: C.ts, fontFamily: "Manrope" }}
                >
                  {it.l}
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    color: p.color,
                    fontWeight: 600,
                    fontFamily: "JetBrains Mono",
                    whiteSpace: "nowrap",
                  }}
                >
                  {it.v}
                </span>
              </div>
            ))}
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: `${p.color}15`,
                textAlign: "center",
                border: `1px solid ${p.color}30`,
              }}
            >
              <span
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  fontFamily: "Space Grotesk",
                  color: p.color,
                }}
              >
                {p.total}
              </span>
              <div
                style={{ fontSize: 9.5, color: C.tm, fontFamily: "Manrope" }}
              >
                Estimated Monthly
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: C.suc,
                  marginBottom: 4,
                  letterSpacing: 0.5,
                }}
              >
                PROS
              </div>
              {p.pros.map((x, j) => (
                <div
                  key={j}
                  style={{
                    fontSize: 10,
                    color: C.ts,
                    display: "flex",
                    gap: 5,
                    marginBottom: 3,
                  }}
                >
                  <span style={{ color: C.suc }}>✓</span> {x}
                </div>
              ))}
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: C.dng,
                  marginTop: 8,
                  marginBottom: 4,
                  letterSpacing: 0.5,
                }}
              >
                CONS
              </div>
              {p.cons.map((x, j) => (
                <div
                  key={j}
                  style={{
                    fontSize: 10,
                    color: C.ts,
                    display: "flex",
                    gap: 5,
                    marginBottom: 3,
                  }}
                >
                  <span style={{ color: C.dng }}>✗</span> {x}
                </div>
              ))}
            </div>
          </Cd>
        ))}
      </div>
      <Cd
        style={{ background: `${C.primary}08`, borderColor: `${C.primary}25` }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={16} color={C.primary} />
          <span style={{ fontSize: 12.5, color: C.tp, fontFamily: "Manrope" }}>
            <strong>Recommendation:</strong>{" "}
            <span style={{ color: C.tertiary, fontWeight: 700 }}>
              GCP Cloud Run
            </span>{" "}
            offers the lowest cost (~$41-78/mo) with scale-to-zero for bursty
            traffic. For enterprise integration choose{" "}
            <span style={{ color: C.secondary, fontWeight: 700 }}>
              Azure Container Apps
            </span>
            . For ML ecosystem depth, go{" "}
            <span style={{ color: C.primary, fontWeight: 700 }}>
              AWS Fargate + SageMaker
            </span>
            .
          </span>
        </div>
      </Cd>
    </ContentSlide>
  ),

  // 21. BUDGET BREAKDOWN
  () => (
    <ContentSlide>
      <Glow s="300px" t="20%" l="75%" c={C.tertiary} />
      <Tg text="Total Implementation Budget" color={C.tertiary} />
      <Ti>Full Project Cost Breakdown</Ti>
      <Sb>
        Beyond cloud infrastructure, the total cost of deploying this solution
        end-to-end across twelve months.
      </Sb>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 14,
        }}
      >
        <Cd glow>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.primaryLight,
              fontFamily: "Manrope",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            One-Time Costs
          </div>
          {[
            {
              l: "Data engineering & ETL pipeline setup",
              v: "£3,500 - £6,000",
            },
            { l: "Model development & SHAP analysis", v: "£2,500 - £4,500" },
            { l: "FastAPI + Streamlit development", v: "£2,000 - £3,500" },
            { l: "Docker containerization & CI/CD", v: "£1,500 - £2,500" },
            { l: "Security audit & penetration testing", v: "£1,000 - £2,000" },
            { l: "Stakeholder training & documentation", v: "£800 - £1,500" },
          ].map((it, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "7px 0",
                borderBottom: i < 5 ? `1px solid ${C.cbr}` : "none",
                gap: 8,
              }}
            >
              <span
                style={{ fontSize: 11.5, color: C.ts, fontFamily: "Manrope" }}
              >
                {it.l}
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  color: C.primary,
                  fontWeight: 600,
                  fontFamily: "JetBrains Mono",
                  whiteSpace: "nowrap",
                }}
              >
                {it.v}
              </span>
            </div>
          ))}
          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: `${C.primary}15`,
              border: `1px solid ${C.primary}30`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10, color: C.tm, fontFamily: "Manrope" }}>
              ONE-TIME TOTAL
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: C.primary,
                fontFamily: "Space Grotesk",
              }}
            >
              £11,300 - £20,000
            </div>
          </div>
        </Cd>
        <div>
          <Cd style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.secondary,
                fontFamily: "Manrope",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Recurring Monthly Costs
            </div>
            {[
              { l: "Cloud infrastructure (GCP recommended)", v: "£35 - £65" },
              { l: "Monitoring & observability tools", v: "£25 - £50" },
              { l: "Model retraining compute (monthly)", v: "£30 - £80" },
              { l: "Data storage & backup", v: "£10 - £25" },
            ].map((it, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: i < 3 ? `1px solid ${C.cbr}` : "none",
                  gap: 8,
                }}
              >
                <span
                  style={{ fontSize: 11, color: C.ts, fontFamily: "Manrope" }}
                >
                  {it.l}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: C.secondary,
                    fontWeight: 600,
                    fontFamily: "JetBrains Mono",
                    whiteSpace: "nowrap",
                  }}
                >
                  {it.v}
                </span>
              </div>
            ))}
            <div
              style={{
                marginTop: 8,
                padding: "8px 12px",
                borderRadius: 8,
                background: `${C.secondary}15`,
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: C.secondary,
                  fontFamily: "Space Grotesk",
                }}
              >
                £100 - £220/mo
              </span>
            </div>
          </Cd>
          <Cd
            style={{
              background: `${C.tertiary}08`,
              borderColor: `${C.tertiary}30`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.tertiary,
                fontFamily: "Manrope",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Year 1 Total Investment
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: C.tertiary,
                fontFamily: "Space Grotesk",
              }}
            >
              £12,500 - £22,640
            </div>
            <div
              style={{
                fontSize: 11,
                color: C.ts,
                fontFamily: "Manrope",
                marginTop: 4,
              }}
            >
              One-time + 12 months recurring
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: C.tm,
                fontFamily: "Manrope",
                marginTop: 8,
                fontStyle: "italic",
              }}
            >
              ROI projection: payback in 3-6 months at typical rail operator
              scale via incremental yield gains
            </div>
          </Cd>
        </div>
      </div>
    </ContentSlide>
  ),

  // 22. ROADMAP
  () => (
    <ContentSlide>
      <Glow s="280px" t="30%" l="80%" c={C.primary} d={1} />
      <Tg text="Roadmap" />
      <Ti>Three-Phase Rollout</Ti>
      <Sb>
        From proof-of-concept validation to full production across the network —
        twelve-month trajectory.
      </Sb>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
          marginBottom: 16,
        }}
      >
        {[
          {
            p: "Phase 1",
            t: "Validation",
            tl: "Month 1-2",
            c: C.primary,
            items: [
              "Validate predictions against held-out historical data",
              "A/B test vs rule-based pricing on one route",
              "Refine features with commercial team",
              "Stakeholder sign-off & approval",
            ],
          },
          {
            p: "Phase 2",
            t: "Integration",
            tl: "Month 3-5",
            c: C.secondary,
            items: [
              "Connect API to booking system",
              "Implement data drift monitoring",
              "Automated retraining pipelines",
              "Internal dashboards for leadership",
            ],
          },
          {
            p: "Phase 3",
            t: "Scale",
            tl: "Month 6-12",
            c: C.tertiary,
            items: [
              "Full production across all routes",
              "Real-time scoring at scale",
              "Cross-sell & upgrade recommendations",
              "Measure realized revenue uplift",
            ],
          },
        ].map((ph, i) => (
          <Cd key={i} glow>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: ph.c,
                fontFamily: "Space Grotesk",
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 4,
              }}
            >
              {ph.p}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: C.tp,
                fontFamily: "Space Grotesk",
                marginBottom: 4,
              }}
            >
              {ph.t}
            </div>
            <div
              style={{
                fontSize: 11,
                color: C.tm,
                fontFamily: "Manrope",
                marginBottom: 14,
              }}
            >
              {ph.tl}
            </div>
            {ph.items.map((it, j) => (
              <div
                key={j}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  marginBottom: 9,
                }}
              >
                <div
                  style={{
                    minWidth: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: ph.c,
                    marginTop: 7,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: C.ts,
                    fontFamily: "Manrope",
                    lineHeight: 1.5,
                  }}
                >
                  {it}
                </span>
              </div>
            ))}
          </Cd>
        ))}
      </div>
      <Cd
        style={{ background: `${C.primary}08`, borderColor: `${C.primary}25` }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ArrowRight size={18} color={C.primary} />
          <span style={{ fontSize: 13, color: C.tp, fontFamily: "Manrope" }}>
            <strong>Long-term vision:</strong> evolve into a revenue
            intelligence platform — unifying demand forecasting, inventory
            optimization, and customer lifetime value into a single decision
            engine.
          </span>
        </div>
      </Cd>
    </ContentSlide>
  ),

  // 23. THANK YOU
  () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
        textAlign: "center",
        position: "relative",
        width: "100%",
      }}
    >
      <Glow s="450px" t="-80px" l="50%" c={C.primary} />
      <Glow s="300px" t="60%" l="10%" c={C.secondary} d={2} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 26px",
            background: `linear-gradient(135deg,${C.primary},${C.primaryLight})`,
            boxShadow: `0 0 50px ${C.primary}50`,
          }}
        >
          <Train size={32} color={C.wh} />
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 48px)",
            fontWeight: 800,
            fontFamily: "Space Grotesk",
            marginBottom: 16,
            background: `linear-gradient(135deg,${C.wh} 0%,${C.primaryLight} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -1,
          }}
        >
          Thank You
        </h1>
        <p
          style={{
            fontSize: "clamp(14px, 1.3vw, 17px)",
            color: C.ts,
            fontFamily: "Manrope",
            maxWidth: 520,
            margin: "0 auto 32px",
            lineHeight: 1.6,
          }}
        >
          Ready to turn rail data into revenue.
          <br />
          Let's discuss next steps.
        </p>
        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "VoyageRail Ltd.", icon: Train },
            {
              label: "github.com/michizler/voyage-rails-analytics",
              icon: GitBranch,
            },
            { label: "Proof of Concept — 2026", icon: Activity },
          ].map((it, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "10px 20px",
                borderRadius: 12,
                background: C.cb,
                border: `1px solid ${C.cbr}`,
              }}
            >
              <it.icon size={15} color={C.primaryLight} />
              <span
                style={{ fontSize: 12.5, color: C.ts, fontFamily: "Manrope" }}
              >
                {it.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
];

export default function Presentation() {
  const [cur, setCur] = useState(0);
  const total = slides.length;
  const goN = useCallback(
    () => setCur((s) => Math.min(s + 1, total - 1)),
    [total],
  );
  const goP = useCallback(() => setCur((s) => Math.max(s - 1, 0)), []);
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goN();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goP();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goN, goP]);
  const S = slides[cur];

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: `linear-gradient(170deg,${C.bg1} 0%,${C.bg3} 50%,${C.bg2} 100%)`,
        fontFamily: "Manrope,sans-serif",
        color: C.tp,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes pg { 0% { opacity: .3; transform: scale(1) } 100% { opacity: .65; transform: scale(1.1) } }
        @keyframes fi { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        ::selection { background: ${C.primary}40 }
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; padding: 0; }
      `}</style>

      {/* Slide area: centered both horizontally and vertically within viewport */}
      <div
        key={cur}
        style={{
          width: "100%",
          flex: 1,
          minHeight: "calc(100vh - 90px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(20px, 4vw, 60px)",
          animation: "fi 0.35s ease",
          position: "relative",
        }}
      >
        <Grid />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <S />
        </div>
      </div>

      {/* Navigation bar - sticky at the bottom of viewport */}
      <div
        style={{
          position: "sticky",
          bottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "12px 26px",
          background: "rgba(10,22,40,0.9)",
          backdropFilter: "blur(14px)",
          borderRadius: 16,
          border: `1px solid ${C.cbr}`,
          marginBottom: 16,
          zIndex: 100,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "90vw",
        }}
      >
        <button
          onClick={goP}
          disabled={cur === 0}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "none",
            cursor: cur === 0 ? "default" : "pointer",
            background: cur === 0 ? C.slate2 + "40" : C.primary + "25",
            color: cur === 0 ? C.tm : C.primaryLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <div
          style={{
            display: "flex",
            gap: 5,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 400,
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCur(i)}
              style={{
                width: i === cur ? 24 : 7,
                height: 7,
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: i === cur ? C.primary : C.slate2,
                padding: 0,
              }}
            />
          ))}
        </div>
        <button
          onClick={goN}
          disabled={cur === total - 1}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "none",
            cursor: cur === total - 1 ? "default" : "pointer",
            background: cur === total - 1 ? C.slate2 + "40" : C.primary + "25",
            color: cur === total - 1 ? C.tm : C.primaryLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronRight size={18} />
        </button>
        <span
          style={{
            fontSize: 11.5,
            color: C.tm,
            fontFamily: "Space Grotesk",
            fontWeight: 500,
          }}
        >
          {cur + 1} / {total}
        </span>
      </div>
    </div>
  );
}
