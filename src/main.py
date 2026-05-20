from __future__ import annotations
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()  # must be before importing graph/agents
from tracing import init_langsmith_tracing
init_langsmith_tracing()  # must be before importing graph/agents
from graph import build_graph


def save_report_outputs(report_html: str, output_dir: str = "outputs/reports") -> tuple[Path, Path]:
    reports_dir = Path(output_dir)
    reports_dir.mkdir(parents=True, exist_ok=True)

    latest_path = reports_dir / "latest_report.html"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    timestamped_path = reports_dir / f"report_{timestamp}.html"

    latest_path.write_text(report_html, encoding="utf-8")
    timestamped_path.write_text(report_html, encoding="utf-8")

    return latest_path, timestamped_path


if __name__ == "__main__":
 
    app = build_graph()

    state = {
        "pdf_path": "data/SeeWeeS Specialty distribution.pdf",
        "csv_path": "data/Incoming_shipment_02_08.csv",
    }

    final = app.invoke(state)

    report_html = final.get("report_html", "")
    latest_path, timestamped_path = save_report_outputs(report_html)

    print("\n=== REPORT FILES ===\n")
    print(f"Latest: {latest_path}")
    print(f"Snapshot: {timestamped_path}")

    print("\n=== REPORT (first 2000 chars) ===\n")
    print(report_html[:2000])
