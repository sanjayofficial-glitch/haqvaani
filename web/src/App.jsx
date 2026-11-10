/* RouteRoot — hash-route dispatch. "/" renders the scroll-story landing; the
   eleven case screens render inside AppShell (their step comes from the
   SCREENS intent table). Voice screens are DPDP consent-gated: without
   consent they hard-redirect to #/consent?next=<path> — never a modal.
   Unknown paths fall back to the landing (robust for anchor accidents).     */

import { useEffect } from "react";
import { useRoute, navigate, SCREENS } from "./lib/router.js";
import { useCaseState, consentGranted } from "./lib/state.jsx";
import Landing from "./landing/Landing.jsx";
import { AppShell } from "./components/AppShell.jsx";

import StartCase from "./screens/StartCase.jsx";
import Consent from "./screens/Consent.jsx";
import VoiceIntake from "./screens/VoiceIntake.jsx";
import FactReview from "./screens/FactReview.jsx";
import RightsCheck from "./screens/RightsCheck.jsx";
import ComplaintBuilder from "./screens/ComplaintBuilder.jsx";
import CallPrep from "./screens/CallPrep.jsx";
import AssistedCall from "./screens/AssistedCall.jsx";
import DocketCapture from "./screens/DocketCapture.jsx";
import PostCall from "./screens/PostCall.jsx";
import Dossier from "./screens/Dossier.jsx";
import StudioHub from "./studio/StudioHub.jsx";

const SCREEN_MAP = {
  "/start-case": StartCase,
  "/consent": Consent,
  "/voice-intake": VoiceIntake,
  "/fact-review": FactReview,
  "/rights-check": RightsCheck,
  "/complaint-builder": ComplaintBuilder,
  "/call-prep": CallPrep,
  "/assisted-call": AssistedCall,
  "/docket-capture": DocketCapture,
  "/post-call": PostCall,
  "/dossier": Dossier,
  "/studio": StudioHub,
};

export default function App() {
  const { path } = useRoute();
  const state = useCaseState();

  /* honest document titles per screen (landing sets its own) */
  useEffect(() => {
    const def = SCREENS[path];
    if (def) document.title = "हक़-वाणी · HaqVaani — " + def.title;
  }, [path]);

  /* fresh screen → top of page */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  /* consent gate: scroll positions never bypass the DPDP record */
  useEffect(() => {
    const def = SCREENS[path];
    if (def && def.consent && !consentGranted(state)) {
      navigate("#/consent?next=" + path.replace(/^\//, ""), { replace: true });
    }
  }, [path, state.consent]);

  const def = SCREENS[path];
  if (!def) return <Landing />;

  /* while the gate redirects stays silent (avoids flashing the gated screen) */
  if (def.consent && !consentGranted(state)) return null;

  const Screen = SCREEN_MAP[path];
  return (
    <AppShell title={def.title} step={def.step} rail={def.rail !== false}>
      <Screen />
    </AppShell>
  );
}
