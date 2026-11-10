import { defineRailway, github, preserve, project, service } from "railway/iac";
// This repository manages only its own resources in the environment. Other
// repositories export their own partial name.
// See https://docs.railway.com/infrastructure-as-code#multi-repo-projects
export const partial = "haqvaani";
export default defineRailway(() => {
  const haqvaani = service("haqvaani", {
    source: github("sanjayofficial-glitch/haqvaani", { branch: "main", checkSuites: false }),
    build: { buildEnvironment: "V3", builder: "RAILPACK" },
    start: "uvicorn haqvaani.api:app --host 0.0.0.0 --port ${PORT:-8000}",
    healthcheck: "/api/health",
    replicas: { "iad": 1 },
    env: { GNANI_API_KEY: preserve(), GNANI_STT_WSS_URL: preserve(), GNANI_TTS_SSE_URL: preserve() },
  });

  return project("resilient-wholeness", {
    variables: { managed: true },
    resources: [haqvaani],
  });
});
