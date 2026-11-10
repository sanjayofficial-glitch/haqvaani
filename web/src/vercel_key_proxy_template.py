"""
Vercel key-proxy template for HaqVaani (Round-2 live wiring).

PURPOSE
-------
Keep the Gnani API key out of the browser bundle. The React SPA calls the
app's own `/api/*` path; a serverless function (or edge handler) re-emits
those requests to Gnani with the `X-API-Key-ID` header injected from a
secret, then relays the response back to the SPA.

This file is a TEMPLATE only. Copy the pattern into your Vercel project's
`api/` or `pages/api/` layout; do not commit a real key.

ENV (set in Vercel Secrets, never in code):
    GNANI_API_KEY        — the Gnani API key (X-API-Key-ID value)
    GNANI_STT_WSS_URL    — optional override for the WSS STT endpoint
    GNANI_TTS_SSE_URL    — optional override for the SSE TTS endpoint
    GNANI_LLM_URL        — optional override for the Evon chat endpoint

WHY NOT CALL GNANI DIRECTLY FROM THE BROWSER
--------------------------------------------
- The key would be exposed to every visitor and to the public JS bundle.
- CORS/cookie/HttpOnly constraints make a browser→Gnani path fragile.
- Rate limits (429) and credential rotation are easier to manage server-side.

WHEN TO USE THIS
----------------
Use this when `GNANI_API_KEY` is available and you want the SPA to hit the
live Gnani path without exposing the key. When the key is absent the app
already runs in honest synthetic-demo mode (no change needed here).

SECURITY NOTES
--------------
- The proxy forwards ONLY the routes the app actually uses: /api/stt,
  /api/tts, /api/llm (or whatever the app's api.py serves). Do not open a
  generic Gnani proxy to the whole internet.
- Validate that the incoming request is from your own SPA (same-origin,
  hardcoded allowed origin list, or deployment-scoped auth) before injecting
  the key.
- Log request ids and latencies for operational visibility; never log the
  key or the transcribed audio payload.
"""

from __future__ import annotations

import json
import logging
import os
from http.server import BaseHTTPRIRequestHandler, HTTPServer
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

logger = logging.getLogger("haqvaani.vercel_proxy_template")

# These are TEMPLATE placeholders — fill from Vercel Secrets at runtime.
GNANI_API_KEY = os.getenv("GNANI_API_KEY", "")
GNANI_STT_WSS_URL = os.getenv("GNANI_STT_WSS_URL", "wss://api.vachana.ai/stt/v3/stream")
GNANI_TTS_SSE_URL = os.getenv("GNANI_TTS_SSE_URL", "https://api.vachana.ai/api/v1/tts/sse")
GNANI_LLM_URL = os.getenv("GNANI_LLM_URL", "https://api.vachana.ai/api/v1/llm/chat")

# Routes the proxy is willing to forward (whitelist — do not widen blindly).
ALLOWED_FORWARD_PREFIXES = ("/api/",)


def _forward(body: bytes | None, headers: dict[str, str], method: str, target: str) -> bytes:
    """Re-emit `request` to `target` with the Gnani auth header injected.

    This is a synchronous illustration of the pattern; a production Vercel
    function would use the runtime's fetch/HTTP client and return the exact
    status + headers + body the SPA expects.
    """
    if not GNANI_API_KEY:
        raise RuntimeError("GNANI_API_KEY not configured in this deployment")

    req = Request(
        target,
        data=body,
        headers={
            "X-API-Key-ID": GNANI_API_KEY,
            "Content-Type": headers.get("content-type", "application/json"),
            "Accept": headers.get("accept", "application/json"),
        },
        method=method,
    )
    try:
        with urlopen(req, timeout=40) as resp:
            return resp.read()
    except HTTPError as exc:
        body_bytes = exc.read() if hasattr(exc, "read") else b""
        raise RuntimeError(f"Gnani proxy HTTP {exc.code}: {body_bytes.decode('utf-8', 'replace')[:200]}") from exc
    except URLError as exc:
        raise RuntimeError(f"Gnani proxy connection error: {exc.reason}") from exc


class HaqVaaniProxyHandler(BaseHTTPRIRequestHandler):
    """Template request handler — forward app /api/* calls to Gnani.

    In a real deployment this would be a Vercel Serverless Function or Edge
    handler. This illustration keeps the contract honest:
      - it only forwards paths the app uses
      - it injects X-API-Key-ID from a secret, never from the request
      - it relays status + body back to the SPA
    """

    def do_POST(self) -> None:  # noqa: N802
        path = self.path.split("?")[0]
        if not path.startswith(ALLOWED_FORWARD_PREFIXES):
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'{"detail":"not forwarded"}\n')
            return

        length = self.headers.get("Content-Length")
        body = self.rfile.read(int(length)) if length else b""

        target = self._target_for(path)
        try:
            response = _forward(body, dict(self.headers), "POST", target)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(response)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Gnani proxy failed for %s: %s", path, exc)
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"detail": str(exc)}).encode("utf-8") + b"\n")

    def _target_for(self, path: str) -> str:
        """Map the app's /api/* path to the corresponding Gnani endpoint.

        Adjust this mapping to match whatever your app's api.py exposes.
        """
        if path.startswith("/api/stt"):
            # STT is WSS in the real client; this template shows the REST
            # forwarding pattern. Pick one integration path and commit to it.
            return GNANI_STT_WSS_URL
        if path.startswith("/api/tts"):
            return GNANI_TTS_SSE_URL
        if path.startswith("/api/llm"):
            return GNANI_LLM_URL
        return GNANI_LLM_URL


def main() -> None:  # pragma: no cover — template illustration only
    logging.basicConfig(level=logging.INFO)
    if not GNANI_API_KEY:
        logger.warning(
            "GNANI_API_KEY is empty — this proxy cannot forward live calls. "
            "Set it in deployment secrets; the app already runs in demo mode without it."
        )
    server = HTTPServer(("127.0.0.1", 9999), HaqVaaniProxyHandler)
    logger.info("template proxy listening on 127.0.0.1:9999 ( illustration only )")
    try:
        server.serve_forever()
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
