"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  CloudLightning,
  GitBranch,
  Map,
  PackagePlus,
  RefreshCcw,
  ShieldCheck,
  Snowflake,
  Truck,
  Zap
} from "lucide-react";
import { scenarios, type MetricSet, type Scenario } from "../lib/scenarios";

const metricLabels: Array<{ key: keyof MetricSet; label: string; suffix: string; max: number }> = [
  { key: "onTimeRate", label: "On-time rate", suffix: "%", max: 100 },
  { key: "slaRiskUnits", label: "SLA risk units", suffix: "", max: 16 },
  { key: "penaltyScore", label: "Penalty score", suffix: "", max: 1600 },
  { key: "tempTruckUtilization", label: "Temp-truck utilization", suffix: "%", max: 100 }
];

function formatValue(value: number, suffix: string) {
  return `${value.toLocaleString()}${suffix}`;
}

function riskClass(kind: Scenario["kind"]) {
  return kind === "weather" ? "weather" : kind === "resource" ? "resource" : "demand";
}

function statusIcon(status: string) {
  if (status === "approved") return <ShieldCheck size={17} />;
  if (status === "rerun") return <RefreshCcw size={17} />;
  return <CheckCircle2 size={17} />;
}

const corridorDetails = {
  boston: {
    code: "C1_I95_NJ_BOS",
    label: "Boston",
    fullName: "I-95 to Boston hospitals"
  },
  philly: {
    code: "C2_NJ_PHL",
    label: "Philadelphia",
    fullName: "NJ to Philadelphia hospitals"
  }
};

export default function Home() {
  const [selectedId, setSelectedId] = useState(scenarios[0].id);
  const scenario = useMemo(
    () => scenarios.find((item) => item.id === selectedId) ?? scenarios[0],
    [selectedId]
  );
  const Icon = scenario.icon;
  const judgeScore = Math.max(12, 100 - Math.round((scenario.disrupted.penaltyScore / 1600) * 54));
  const corridorMode =
    scenario.kind === "weather" ? "weather" : scenario.kind === "resource" ? "resource" : "demand";
  const corridorPressure = // Retained for future detailed corridor views.
    scenario.kind === "weather"
      ? {
          boston: "Risk 3 weather escalation",
          philly: "Low spillover risk"
        }
      : scenario.kind === "resource"
        ? {
            boston: "Reefer capacity constrained",
            philly: "Standard capacity protected"
          }
        : {
            boston: "Tier 1 volume pressure",
            philly: "Demand surge monitored"
          };
  const RouteIcon =
    scenario.kind === "weather" ? CloudLightning : scenario.kind === "resource" ? Snowflake : PackagePlus;
  const bostonActive = scenario.kind === "weather" || scenario.kind === "resource" || scenario.kind === "demand";
  const phillyActive = scenario.kind === "resource" || scenario.kind === "demand";

  return (
    <main className="app-shell">
      <div className="dashboard">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <Activity size={25} strokeWidth={2.6} />
            </div>
            <div>
              <p className="eyebrow">SeeWeeS Specialty</p>
              <h1>Scenario Command Center</h1>
            </div>
          </div>
          <div className="top-actions">
            <span className="pill"><GitBranch size={16} /> What-if simulator</span>
            <span className="pill"><ClipboardCheck size={16} /> JudgeAgent fallback</span>
            <span className="pill"><Map size={16} /> 48-hour dispatch</span>
          </div>
        </header>

        <div className="layout-grid">
          <div className="main-column">
            <section className="panel hero-panel" aria-labelledby="context-title">
              <div className="hero-copy">
                <p className="eyebrow">Challenge context</p>
                <h2 id="context-title">Explaining how SeeWeeS agents handle disruption before leadership sees the report.</h2>
                <p>
                  The prototype demonstrates two core focuses: a simulator that changes operational conditions and a fallback loop that lets JudgeAgent reject unsafe or non-compliant plans before the final report is published.
                </p>
                <div className="focus-row">
                  <span className="focus-chip"><Zap size={17} /> Baseline vs disrupted KPIs</span>
                  <span className="focus-chip"><Truck size={17} /> Corridor resource allocation</span>
                  <span className="focus-chip"><ShieldCheck size={17} /> Audit-gated recommendations</span>
                </div>
              </div>
              <div
                className={`corridor-map ${corridorMode}`}
                aria-label={`48-hour network from Newark DC to ${corridorDetails.boston.fullName} and ${corridorDetails.philly.fullName}. ${corridorPressure.boston}; ${corridorPressure.philly}.`}
              >
                <div className="corridor-title">
                  <span>48h network</span>
                </div>
                <div className="mini-network">
                  <div className="route-node origin" title="Newark NJ distribution center">
                    <span className="node-icon"><Map size={19} /></span>
                    <strong>Newark DC</strong>
                  </div>

                  <div className={`route-path path-boston ${bostonActive ? "active" : ""}`} aria-hidden="true" />
                  <div className={`route-path path-philly ${phillyActive ? "active" : ""}`} aria-hidden="true" />

                  <div
                    className={`route-node destination boston ${bostonActive ? "active" : ""}`}
                    title={`${corridorDetails.boston.code}: ${corridorPressure.boston}`}
                  >
                    <span className="scenario-badge"><RouteIcon size={18} /></span>
                    <strong>{corridorDetails.boston.label}</strong>
                  </div>

                  <div
                    className={`route-node destination philly ${phillyActive ? "active" : ""}`}
                    title={`${corridorDetails.philly.code}: ${corridorPressure.philly}`}
                  >
                    <span className="scenario-badge"><RouteIcon size={18} /></span>
                    <strong>{corridorDetails.philly.label}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel pad" aria-labelledby="scenario-title">
              <div className="section-head">
                <div>
                  <h2 id="scenario-title">Disruption Scenarios</h2>
                  <p>Select a scenario to update KPIs, agent states, and contingency actions.</p>
                </div>
                <span className={`tag ${riskClass(scenario.kind)}`}>{scenario.disruptionType}</span>
              </div>
              <div className="scenario-grid">
                {scenarios.map((item) => {
                  const ScenarioIcon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`scenario-button ${item.id === selectedId ? "active" : ""}`}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <div className="scenario-top">
                        <ScenarioIcon size={24} />
                        <span className={`tag ${riskClass(item.kind)}`}>{item.kind}</span>
                      </div>
                      <h3>{item.name}</h3>
                      <p>{item.summary}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="kpi-grid" aria-label="Key performance indicators">
              <div className="kpi">
                <div className="kpi-label"><Icon size={15} /> Disruption type</div>
                <div className="kpi-value">{scenario.kind}</div>
                <div className="kpi-sub">{scenario.disruptionType}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label"><CheckCircle2 size={15} /> Baseline performance</div>
                <div className="kpi-value">{scenario.baseline.onTimeRate}%</div>
                <div className="kpi-sub">{scenario.baseline.slaRiskUnits} units at SLA risk before disruption</div>
              </div>
              <div className="kpi">
                <div className="kpi-label"><AlertTriangle size={15} /> Disrupted performance</div>
                <div className="kpi-value">{scenario.disrupted.onTimeRate}%</div>
                <div className="kpi-sub">{scenario.disrupted.slaRiskUnits} units at SLA risk after disruption</div>
              </div>
              <div className="kpi">
                <div className="kpi-label"><ShieldCheck size={15} /> JudgeAgent result</div>
                <div className="kpi-value">{scenario.agentTimeline.some((item) => item.status === "rerun") ? "Rerun" : "Clear"}</div>
                <div className="kpi-sub">Final plan approved after rule validation</div>
              </div>
            </section>

            <section className="panel pad" aria-labelledby="metrics-title">
              <div className="section-head">
                <div>
                  <h2 id="metrics-title">Baseline vs Disrupted Run</h2>
                  <p>Metrics are mocked for the prototype but shaped for future LangGraph JSON output.</p>
                </div>
              </div>
              <div className="comparison-grid">
                <div>
                  {metricLabels.map((metric) => (
                    <div className="metric-row" key={`base-${metric.key}`}>
                      <div className="metric-head">
                        <span>{metric.label}</span>
                        <span>{formatValue(scenario.baseline[metric.key], metric.suffix)}</span>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${Math.min(100, (scenario.baseline[metric.key] / metric.max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  {metricLabels.map((metric) => (
                    <div className="metric-row" key={`disrupted-${metric.key}`}>
                      <div className="metric-head">
                        <span>{metric.label}</span>
                        <span>{formatValue(scenario.disrupted[metric.key], metric.suffix)}</span>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill disrupted"
                          style={{ width: `${Math.min(100, (scenario.disrupted[metric.key] / metric.max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="panel pad" aria-labelledby="allocation-title">
              <div className="section-head">
                <div>
                  <h2 id="allocation-title">Recommended 48-hour Allocation</h2>
                  <p>PlannerAgent allocation after disruption context and JudgeAgent validation.</p>
                </div>
              </div>
              <div className="table-wrap">
                <table className="allocation-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Corridor</th>
                      <th>Drivers</th>
                      <th>Standard trucks</th>
                      <th>Temp trucks</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenario.allocation.map((row) => (
                      <tr key={`${row.day}-${row.corridor}`}>
                        <td>{row.day}</td>
                        <td>{row.corridor}</td>
                        <td>{row.drivers}</td>
                        <td>{row.standardTrucks}</td>
                        <td>{row.tempTrucks}</td>
                        <td><span className={`tag ${row.risk === "Critical" ? "demand" : row.risk === "High" ? "resource" : "ok"}`}>{row.risk}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="side-column">
            <section className="panel pad" aria-labelledby="summary-title">
              <div className="section-head">
                <div>
                  <h2 id="summary-title">Scenario Brief</h2>
                  <p>What the demo is proving.</p>
                </div>
                <ArrowUpRight size={20} />
              </div>
              <p className="scenario-summary">
                <strong>{scenario.name}:</strong> {scenario.summary}
              </p>
            </section>

            <section className="panel pad" aria-labelledby="confidence-title">
              <div className="section-head">
                <div>
                  <h2 id="confidence-title">Plan Confidence</h2>
                  <p>After fallback checks and mitigation.</p>
                </div>
              </div>
              <div className="gauge">
                <div className="gauge-ring" style={{ "--gauge": `${judgeScore}%` } as React.CSSProperties}>
                  <div className="gauge-value">
                    <strong>{judgeScore}%</strong>
                    <span>audit ready</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel pad" aria-labelledby="timeline-title">
              <div className="section-head">
                <div>
                  <h2 id="timeline-title">Agent Run State</h2>
                  <p>Baseline, disruption, fallback, and report flow.</p>
                </div>
              </div>
              <div className="agent-list">
                {scenario.agentTimeline.map((step) => (
                  <div className="agent-step" key={step.name}>
                    <div className={`step-icon ${step.status === "rerun" ? "warning" : "done"}`}>
                      {statusIcon(step.status)}
                    </div>
                    <div>
                      <h3>{step.name}</h3>
                      <p>{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel pad" aria-labelledby="judge-title">
              <div className="section-head">
                <div>
                  <h2 id="judge-title">JudgeAgent Findings</h2>
                  <p>Rules that protect the final report.</p>
                </div>
              </div>
              <div className="judge-box">
                <h3>Validation notes</h3>
                <ul>
                  {scenario.judgeFindings.map((finding) => (
                    <li key={finding}>{finding}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="panel pad" aria-labelledby="plan-title">
              <div className="section-head">
                <div>
                  <h2 id="plan-title">Best Contingency Plan</h2>
                  <p>Executive-ready recommendation.</p>
                </div>
              </div>
              <ul className="plan-list">
                {scenario.contingencyPlan.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
