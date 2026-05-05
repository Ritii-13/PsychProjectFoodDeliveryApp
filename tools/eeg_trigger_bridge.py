from __future__ import annotations

import argparse
import csv
import json
import sys
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


def debug(msg: str) -> None:
    """Print a timestamped debug message and flush immediately."""
    ts = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"[DEBUG {ts}] {msg}", flush=True)


def normalize_csv_value(value) -> str:
    return str(value or "").replace(",", ";").replace("\r", " ").replace("\n", " ")


def load_trigger_map(trigger_map_path: Path) -> dict[str, int]:
    debug(f"Loading trigger map from: {trigger_map_path}")
    with trigger_map_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    trigger_map = {str(name): int(code) for name, code in data.items()}
    debug(f"Loaded {len(trigger_map)} triggers: {list(trigger_map.keys())}")
    return trigger_map


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

        debug(f"Initialising TriggerOutput: requested_mode={mode}, port_address={hex(parallel_port_address)}")

        if mode == "dry-run":
            debug("Running in DRY-RUN mode — no parallel port output")
            return

        try:
            debug("Attempting to import psychopy.parallel ...")
            from psychopy import parallel

            debug(f"PsychoPy imported OK — opening parallel port at {hex(parallel_port_address)}")
            self.port = parallel.ParallelPort(address=parallel_port_address)
            self.mode = "parallel"
            debug("Parallel port opened successfully")
        except Exception as error:  # pragma: no cover - hardware/psychopy dependent
            self.init_error = str(error)
            debug(f"!! Parallel port init FAILED: {error}")
            if mode == "parallel":
                raise
            debug("Falling back to dry-run mode")
            self.mode = "dry-run"

    def send(self, code: int) -> dict[str, str | int]:
        debug(f"TriggerOutput.send() called — code={code}, mode={self.mode}")
        if self.mode == "parallel":  # pragma: no cover - hardware dependent
            debug(f"  -> Writing {code} to parallel port ...")
            self.port.setData(code)
            time.sleep(0.01)
            debug(f"  -> Resetting parallel port to 0")
            self.port.setData(0)
            debug(f"  -> Parallel port write complete")
        else:
            debug(f"  -> DRY-RUN: would have sent code {code} to parallel port")

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
        # Re-enable HTTP request logging for debugging
        debug(f"HTTP {self.command} {self.path} — {format % args}")

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
        debug(f"<-- GET {self.path} from {self.client_address}")
        if self.path != "/health":
            debug(f"  -> 404 Not Found")
            self._write_json(404, {"ok": False, "error": "not found"})
            return

        debug(f"  -> Health check OK (mode={self.server.output.mode})")
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
        debug(f"<-- POST {self.path} from {self.client_address}")
        if self.path != "/trigger":
            debug(f"  -> 404 Not Found (path={self.path})")
            self._write_json(404, {"ok": False, "error": "not found"})
            return

        payload = {}
        event_name = ""
        received_at = now_iso()

        try:
            payload = self._read_json()
            debug(f"  -> Received payload: {json.dumps(payload, default=str)}")
            event_name = str(payload.get("eventName", "")).strip()
            if not event_name:
                debug("  -> ERROR: eventName is empty or missing")
                self._write_json(400, {"ok": False, "error": "eventName is required"})
                return

            if event_name not in self.server.trigger_map:
                debug(f"  -> ERROR: eventName '{event_name}' NOT in trigger map")
                debug(f"     Known events: {list(self.server.trigger_map.keys())}")
                self._write_json(400, {"ok": False, "error": "eventName is not in the trigger map"})
                return

            code = self.server.trigger_map[event_name]
            debug(f"  -> Mapped '{event_name}' -> code {code}")
            debug(f"  -> Sending trigger code {code} via TriggerOutput ...")
            result = self.server.output.send(code)
            debug(f"  -> Trigger sent OK (mode={result['mode']})")
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
            debug(f"  -> Logged to CSV. Responding 202 Accepted.")

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
            debug(f"  -> Response sent to client")
        except Exception as error:  # pragma: no cover - exercised only on unexpected failure
            debug(f"  -> !! EXCEPTION in do_POST: {type(error).__name__}: {error}")
            import traceback
            debug(f"  -> Traceback:\n{traceback.format_exc()}")
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
    print("="*60, flush=True)
    print("  EEG TRIGGER BRIDGE — DEBUG MODE", flush=True)
    print("="*60, flush=True)
    debug(f"Python version: {sys.version}")
    debug(f"Arguments: host={args.host}, port={args.port}, mode={args.mode}")
    debug(f"           parallel_port_address={args.parallel_port_address}")
    debug(f"           trigger_map={args.trigger_map}")
    debug(f"           log_path={args.log_path}")

    trigger_map = load_trigger_map(args.trigger_map)
    output = TriggerOutput(args.mode, parse_parallel_port_address(args.parallel_port_address))

    debug(f"Final output mode: {output.mode}")
    if output.init_error:
        debug(f"!! Init error (non-fatal): {output.init_error}")

    server = TriggerBridgeServer(
        (args.host, args.port),
        trigger_map=trigger_map,
        output=output,
        log_path=args.log_path,
        trigger_map_path=args.trigger_map,
    )

    print("\n" + "="*60, flush=True)
    print(
        f"  LISTENING on http://{args.host}:{args.port}\n"
        f"  Mode: {output.mode}\n"
        f"  Parallel port: {hex(output.parallel_port_address)}\n"
        f"  Waiting for triggers from the Node.js server ...",
        flush=True
    )
    print("="*60 + "\n", flush=True)
    debug("Server is ready. Any incoming requests will be logged below.")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        debug("Received KeyboardInterrupt — shutting down.")
        server.shutdown()
        debug("Server shut down cleanly.")


if __name__ == "__main__":
    main()
