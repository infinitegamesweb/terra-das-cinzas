"""Generate a raster game asset with Cloudflare Workers AI FLUX.2 Klein.

Requires CLOUDFLARE_API_TOKEN in the process environment and requests installed.
The token is never read from source code or printed.
"""
from __future__ import annotations

import argparse
import base64
import json
import os
from pathlib import Path

import requests


DEFAULT_ACCOUNT_ID = "8da2fcd3d4233ed35f03b7a020a5131e"
DEFAULT_MODEL = "@cf/black-forest-labs/flux-2-klein-9b"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prompt", required=True, help="Visual prompt for the asset")
    parser.add_argument("--output", required=True, type=Path, help="Output PNG path")
    parser.add_argument("--reference", action="append", type=Path, default=[], help="Reference image; repeat up to four times")
    parser.add_argument("--width", type=int, default=1024)
    parser.add_argument("--height", type=int, default=1024)
    parser.add_argument("--account-id", default=os.getenv("CLOUDFLARE_ACCOUNT_ID", DEFAULT_ACCOUNT_ID))
    parser.add_argument("--model", default=DEFAULT_MODEL)
    args = parser.parse_args()

    token = os.getenv("CLOUDFLARE_API_TOKEN")
    if not token:
        raise SystemExit("Set CLOUDFLARE_API_TOKEN in the environment before running this tool.")
    if len(args.reference) > 4:
        raise SystemExit("FLUX.2 Klein supports up to four reference images.")

    files: list[tuple[str, tuple]] = [
        ("prompt", (None, args.prompt)),
        ("width", (None, str(args.width))),
        ("height", (None, str(args.height))),
    ]
    opened = []
    try:
        for index, path in enumerate(args.reference):
            handle = path.open("rb")
            opened.append(handle)
            files.append((f"input_image_{index}", (path.name, handle, "image/png")))

        url = f"https://api.cloudflare.com/client/v4/accounts/{args.account_id}/ai/run/{args.model}"
        response = requests.post(
            url,
            headers={"Authorization": f"Bearer {token}"},
            files=files,
            timeout=240,
        )
    finally:
        for handle in opened:
            handle.close()

    if not response.ok:
        detail = response.text[:1200]
        raise SystemExit(f"Cloudflare AI request failed ({response.status_code}): {detail}")

    content_type = response.headers.get("content-type", "")
    if content_type.startswith("image/"):
        image_bytes = response.content
    else:
        try:
            payload = response.json()
            encoded = payload.get("result", {}).get("image")
            if not encoded:
                raise ValueError("Response did not contain result.image")
            image_bytes = base64.b64decode(encoded)
        except (ValueError, json.JSONDecodeError) as exc:
            raise SystemExit(f"Unexpected Cloudflare AI response: {response.text[:1200]}") from exc

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(image_bytes)
    print(f"Saved generated image: {args.output} ({len(image_bytes)} bytes)")


if __name__ == "__main__":
    main()
