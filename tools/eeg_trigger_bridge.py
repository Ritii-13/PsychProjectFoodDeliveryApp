from __future__ import annotations

import argparse
import csv
import json
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_TRIGGER_MAP_PATH = ROOT_DIR / "config" / "eeg-trigger-map.json"
DEFAULT_LOG_PATH = ROOT_DIR / "backend" / "data" / "eeg-trigger-log.csv"
LOG_FIELDS = [
    "timestamp",
    "eventName",
    "code",
    "participantId",
    "experimentId",
    "source",
    "clientTimestamp",
    "serverTimestamp",
    "bridgeMode",
    "status",
    "error",
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_csv_value(value) -> str:
    return str(value or "").replace(",", ";").replace("\r", " ").replace("\n", " ")


def load_trigger_map(trigger_map_path: Path) -> dict[str, int]:
    with trigger_map_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    return {str(name): int(code) for name, code in data.items()}


def parse_parallel_port_address(value: str) -> int:
    return int(str(value), 0)


def ensure_log_file(log_path: Path) -> None:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    if log_path.exists() and log_path.stat().st_size > 0:
        return

    with log_path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=LOG_FIELDS)
        writer.writeheader()


def append_log(log_path: Path, row: dict[str, str]) -> None:
    ensure_log_file(log_path)

    normalized_row = {
        field: normalize_csv_value(row.get(field, ""))
        for field in LOG_FIELDS
    }

    with log_path.open("a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=LOG_FIELDS)
        writer.writerow(normalized_row)


class TriggerOutput:
    def __init__(self, mode: str, parallel_port_address: int):
        self.requested_mode = mode
        self.parallel_port_address = parallel_port_address
        self.mode = mode
        self.port = None
        self.init_error = None

        if mode == "dry-run":
            return

        try:
            from psychopy import parallel

            self.port = parallel.ParallelPort(address=parallel_port_address)
            self.mode = "parallel"
        except Exception as error:  # pragma: no cover - hardware/psychopy dependent
            self.init_error = str(error)
            if mode == "parallel":
                raise
            self.mode = "dry-run"

    def send(self, code: int) -> dict[str, str | int]:
        if self.mode == "parallel":  # pragma: no cover - hardware dependent
            self.port.setData(code)
            time.sleep(0.01)
            self.port.setData(0)

        return {
            "mode": self.mode,
            "holdMs": 10,
            "parallelPortAddress": hex(self.parallel_port_address),
        }


class TriggerBridgeServer(ThreadingHTTPServer):
    def __init__(
        self,
        server_address: tuple[str, int],
        trigger_map: dict[str, int],
        output: TriggerOutput,
        log_path: Path,
        trigger_map_path: Path,
    ):
        super().__init__(server_address, TriggerBridgeHandler)
        self.trigger_map = trigger_map
        self.output = output
        self.log_path = log_path
        self.trigger_map_path = trigger_map_path


class TriggerBridgeHandler(BaseHTTPRequestHandler):
    server: TriggerBridgeServer

    def log_message(self, format, *args):  # noqa: A003
        return

    def _write_json(self, status_code: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict:
        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length) if content_length else b"{}"
        return json.loads(raw_body.decode("utf-8") or "{}")

    def do_GET(self) -> None:  # noqa: N802
        if self.path != "/health":
            self._write_json(404, {"ok": False, "error": "not found"})
            return

        self._write_json(
            200,
            {
                "ok": True,
                "mode": self.server.output.mode,
                "parallelPortAddress": hex(self.server.output.parallel_port_address),
                "triggerMapPath": str(self.server.trigger_map_path),
                "logPath": str(self.server.log_path),
                "initError": self.server.output.init_error,
            },
        )

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/trigger":
            self._write_json(404, {"ok": False, "error": "not found"})
            return

        payload = {}
        event_name = ""
        received_at = now_iso()

        try:
            payload = self._read_json()
            event_name = str(payload.get("eventName", "")).strip()
            if not event_name:
                self._write_json(400, {"ok": False, "error": "eventName is required"})
                return

            if event_name not in self.server.trigger_map:
                self._write_json(400, {"ok": False, "error": "eventName is not in the trigger map"})
                return

            code = self.server.trigger_map[event_name]
            result = self.server.output.send(code)
            append_log(
                self.server.log_path,
                {
                    "timestamp": received_at,
                    "eventName": event_name,
                    "code": str(code),
                    "participantId": payload.get("participantId", ""),
                    "experimentId": payload.get("experimentId", ""),
                    "source": payload.get("source", ""),
                    "clientTimestamp": payload.get("clientTimestamp", ""),
                    "serverTimestamp": payload.get("serverTimestamp", ""),
                    "bridgeMode": result["mode"],
                    "status": "accepted",
                    "error": "",
                },
            )

            self._write_json(
                202,
                {
                    "ok": True,
                    "eventName": event_name,
                    "code": code,
                    "receivedAt": received_at,
                    "mode": result["mode"],
                    "holdMs": result["holdMs"],
                    "parallelPortAddress": result["parallelPortAddress"],
                },
            )
        except Exception as error:  # pragma: no cover - exercised only on unexpected failure
            append_log(
                self.server.log_path,
                {
                    "timestamp": received_at,
                    "eventName": event_name,
                    "code": "",
                    "participantId": payload.get("participantId", ""),
                    "experimentId": payload.get("experimentId", ""),
                    "source": payload.get("source", ""),
                    "clientTimestamp": payload.get("clientTimestamp", ""),
                    "serverTimestamp": payload.get("serverTimestamp", ""),
                    "bridgeMode": self.server.output.mode,
                    "status": "error",
                    "error": str(error),
                },
            )
            self._write_json(500, {"ok": False, "error": str(error)})


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="EEG trigger bridge for the delivery study.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument(
        "--mode",
        choices=["auto", "parallel", "dry-run"],
        default="auto",
        help="Use auto to try PsychoPy parallel first and fall back to dry-run logging.",
    )
    parser.add_argument(
        "--parallel-port-address",
        default="0x3EFC",
        help="Parallel port address in decimal or hex.",
    )
    parser.add_argument(
        "--trigger-map",
        type=Path,
        default=DEFAULT_TRIGGER_MAP_PATH,
        help="Path to the shared JSON trigger map.",
    )
    parser.add_argument(
        "--log-path",
        type=Path,
        default=DEFAULT_LOG_PATH,
        help="CSV log path for accepted trigger requests.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    trigger_map = load_trigger_map(args.trigger_map)
    output = TriggerOutput(args.mode, parse_parallel_port_address(args.parallel_port_address))
    server = TriggerBridgeServer(
        (args.host, args.port),
        trigger_map=trigger_map,
        output=output,
        log_path=args.log_path,
        trigger_map_path=args.trigger_map,
    )

    print(
        f"EEG trigger bridge listening on http://{args.host}:{args.port} "
        f"(mode={output.mode}, parallel_port={hex(output.parallel_port_address)})"
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
