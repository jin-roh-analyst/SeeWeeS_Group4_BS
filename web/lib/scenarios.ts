import {
  AlertTriangle,
  CloudLightning,
  type LucideIcon,
  PackagePlus,
  Snowflake,
  Truck
} from "lucide-react";

export type ScenarioKind = "weather" | "resource" | "demand";

export type MetricSet = {
  onTimeRate: number;
  slaRiskUnits: number;
  penaltyScore: number;
  tempTruckUtilization: number;
  excludedRows: number;
};

export type AllocationRow = {
  day: "Day0" | "Day1";
  corridor: string;
  drivers: number;
  standardTrucks: number;
  tempTrucks: number;
  risk: "Low" | "Moderate" | "High" | "Critical";
};

export type AgentStep = {
  name: string;
  status: "complete" | "rerun" | "approved";
  detail: string;
};

export type Scenario = {
  id: string;
  name: string;
  kind: ScenarioKind;
  icon: LucideIcon;
  disruptionType: string;
  summary: string;
  baseline: MetricSet;
  disrupted: MetricSet;
  allocation: AllocationRow[];
  agentTimeline: AgentStep[];
  judgeFindings: string[];
  contingencyPlan: string[];
};

export const scenarios: Scenario[] = [
  {
    id: "weather-i95",
    name: "I-95 Weather Escalation",
    kind: "weather",
    icon: CloudLightning,
    disruptionType: "Severe weather on Boston corridor",
    summary:
      "A Day0 storm raises Boston corridor risk to 3. The first planner draft misses the escalation requirement, so JudgeAgent forces a rerun before the report is released.",
    baseline: {
      onTimeRate: 94,
      slaRiskUnits: 3,
      penaltyScore: 280,
      tempTruckUtilization: 72,
      excludedRows: 5
    },
    disrupted: {
      onTimeRate: 82,
      slaRiskUnits: 9,
      penaltyScore: 1040,
      tempTruckUtilization: 88,
      excludedRows: 5
    },
    allocation: [
      { day: "Day0", corridor: "C1_I95_NJ_BOS", drivers: 4, standardTrucks: 2, tempTrucks: 2, risk: "Critical" },
      { day: "Day0", corridor: "C2_NJ_PHL", drivers: 2, standardTrucks: 2, tempTrucks: 0, risk: "Low" },
      { day: "Day1", corridor: "C1_I95_NJ_BOS", drivers: 3, standardTrucks: 1, tempTrucks: 1, risk: "Moderate" },
      { day: "Day1", corridor: "C2_NJ_PHL", drivers: 3, standardTrucks: 3, tempTrucks: 1, risk: "Low" }
    ],
    agentTimeline: [
      { name: "ContextAgent", status: "complete", detail: "Loaded SLA, risk score, cold-chain, and escalation rules." },
      { name: "ScenarioAgent", status: "complete", detail: "Applied storm disruption to C1 Day0 waypoints." },
      { name: "PlannerAgent", status: "rerun", detail: "Initial plan failed to escalate risk score 3." },
      { name: "JudgeAgent", status: "approved", detail: "Approved rerun with 40 percent buffer and escalation note." },
      { name: "ReportAgent", status: "complete", detail: "Published leadership summary with residual SLA exposure." }
    ],
    judgeFindings: [
      "Risk score 3 requires 40 percent buffer plus escalation.",
      "Tier 1 Boston units must be prioritized before standard specialty volume.",
      "Report must state residual SLA risk after the rerun."
    ],
    contingencyPlan: [
      "Escalate C1 Day0 to operations leadership and hospital receiving teams.",
      "Reserve both Day0 temperature-controlled trucks for Boston cold-chain Tier 1 units.",
      "Move flexible Philadelphia standard specialty volume to later dispatch windows.",
      "Monitor Providence and New Haven waypoint risk before final release."
    ]
  },
  {
    id: "reefer-shortage",
    name: "Cold-Chain Truck Shortage",
    kind: "resource",
    icon: Snowflake,
    disruptionType: "One reefer truck unavailable",
    summary:
      "A temperature-controlled truck goes offline. The dashboard shows cold-chain pressure, revised allocation, and the lowest-penalty plan across both corridors.",
    baseline: {
      onTimeRate: 94,
      slaRiskUnits: 3,
      penaltyScore: 280,
      tempTruckUtilization: 72,
      excludedRows: 5
    },
    disrupted: {
      onTimeRate: 86,
      slaRiskUnits: 7,
      penaltyScore: 820,
      tempTruckUtilization: 100,
      excludedRows: 5
    },
    allocation: [
      { day: "Day0", corridor: "C1_I95_NJ_BOS", drivers: 3, standardTrucks: 1, tempTrucks: 1, risk: "High" },
      { day: "Day0", corridor: "C2_NJ_PHL", drivers: 3, standardTrucks: 3, tempTrucks: 0, risk: "Moderate" },
      { day: "Day1", corridor: "C1_I95_NJ_BOS", drivers: 3, standardTrucks: 2, tempTrucks: 1, risk: "Moderate" },
      { day: "Day1", corridor: "C2_NJ_PHL", drivers: 3, standardTrucks: 2, tempTrucks: 0, risk: "Moderate" }
    ],
    agentTimeline: [
      { name: "OpsDataAgent", status: "complete", detail: "Separated cold-chain and room-temp units by corridor." },
      { name: "ScenarioAgent", status: "complete", detail: "Reduced temp-controlled availability from 2 to 1." },
      { name: "PlannerAgent", status: "complete", detail: "Minimized penalty by protecting Tier 1 cold-chain shipments." },
      { name: "JudgeAgent", status: "approved", detail: "No cold-chain shipment assigned to standard-only equipment." },
      { name: "ReportAgent", status: "complete", detail: "Summarized backlog and mitigation plan for leadership." }
    ],
    judgeFindings: [
      "Cold-chain units cannot be placed on standard trucks.",
      "Penalty model favors Tier 1 cold-chain preservation before non-SLA delays.",
      "Remaining backlog must be disclosed by corridor and day."
    ],
    contingencyPlan: [
      "Protect Boston Tier 1 cold-chain demand with the remaining reefer truck.",
      "Delay non-SLA or Tier 2 cold-chain volume where hospital window allows.",
      "Use standard trucks for room-temperature Philadelphia volume to avoid unused capacity.",
      "Request backup reefer capacity from third-party carrier before Day1 cutoff."
    ]
  },
  {
    id: "demand-spike",
    name: "Tier 1 Demand Spike",
    kind: "demand",
    icon: PackagePlus,
    disruptionType: "20 percent demand increase",
    summary:
      "Demand rises across the 48-hour window with extra Tier 1 pressure. The dashboard compares baseline and disrupted performance and shows how the planner reallocates scarce capacity.",
    baseline: {
      onTimeRate: 94,
      slaRiskUnits: 3,
      penaltyScore: 280,
      tempTruckUtilization: 72,
      excludedRows: 5
    },
    disrupted: {
      onTimeRate: 79,
      slaRiskUnits: 12,
      penaltyScore: 1380,
      tempTruckUtilization: 96,
      excludedRows: 6
    },
    allocation: [
      { day: "Day0", corridor: "C1_I95_NJ_BOS", drivers: 4, standardTrucks: 2, tempTrucks: 2, risk: "High" },
      { day: "Day0", corridor: "C2_NJ_PHL", drivers: 2, standardTrucks: 2, tempTrucks: 0, risk: "Moderate" },
      { day: "Day1", corridor: "C1_I95_NJ_BOS", drivers: 4, standardTrucks: 2, tempTrucks: 1, risk: "High" },
      { day: "Day1", corridor: "C2_NJ_PHL", drivers: 2, standardTrucks: 2, tempTrucks: 1, risk: "Moderate" }
    ],
    agentTimeline: [
      { name: "OpsDataAgent", status: "complete", detail: "Computed baseline corridor and Day0/Day1 demand mix." },
      { name: "ScenarioAgent", status: "complete", detail: "Applied 20 percent unit growth with Tier 1 weighting." },
      { name: "StakeholderSim", status: "complete", detail: "Modeled hospital priority pressure for life-critical items." },
      { name: "PlannerAgent", status: "rerun", detail: "First plan overused shared drivers on Day1." },
      { name: "JudgeAgent", status: "approved", detail: "Approved rerun after driver counts were corrected." }
    ],
    judgeFindings: [
      "Day1 driver allocation exceeded the available pool in the first plan.",
      "Tier 1 impacted units are the tie-breaker after total penalty score.",
      "Data-quality exclusions increased by one generated demand row and must be reported."
    ],
    contingencyPlan: [
      "Prioritize Tier 1 cold-chain shipments on Boston and split remaining capacity by penalty impact.",
      "Backlog Tier 2 room-temperature shipments with lowest SLA exposure.",
      "Ask hospital stakeholders to confirm substitution flexibility for endocrine cold-chain items.",
      "Use JudgeAgent output as the final report gate before executive release."
    ]
  }
];

export const scenarioIcons = {
  weather: CloudLightning,
  resource: Truck,
  demand: AlertTriangle
};
