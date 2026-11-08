"""Entry point: `python -m haqvaani` starts the whole app.

Serves the frontend + API at http://127.0.0.1:8000 (docs/experience_concept.md,
docs/legal_matrix.md). Use `make run-api` or run.bat as equivalent starters.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("haqvaani.api:app", host="127.0.0.1", port=8000)
