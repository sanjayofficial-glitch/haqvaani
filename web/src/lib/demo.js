/* HQ.DEMO equivalent — the honest synthetic fixtures for demo mode.
   Mirrors haqvaani/voice_clients.py + statutory.py::_self_test() exactly
   (₹3,200 · 18 Oct · UPI P2P · RBI/2019-20/67 · SR-DB-884120).
   In demo mode nothing pretends to be a real bank, transcript or docket.  */

export const DEMO = {
  transcript:
    "Bhaiya 18 Oct ko 3,200 UPI kiya tha, paisa kat gaya par pahuncha nahi — UTR 629188340112",

  intake: {
    utr: "629188340112",
    amount_inr: 3200,
    txn_date: "2026-10-18",
    dispute_type: "upi_p2p",
    bank_name: "DemoBank Support",
    language: "hi-IN",
    confidence: 0.97,
  },

  /* mirrors haqvaani/statutory.py self-test (T+1 case) */
  entitlement: {
    circular_ref: "RBI/2019-20/67 (DPSS.CO.PD No.629/02.01.014/2019-20)",
    protection_note: "Suo motu compensation ₹100/day beyond T+1",
    tat_date: "2026-10-19",
    days_overdue: 6,
    claim_inr: 3200,
    penalty_inr: 600,
    total_inr: 3800,
    eligible_for_rbi_cms: false,
    rbi_filing_deadline: null,
  },

  /* unauthorised (zero-liability) synthetic constants */
  unauthorised: {
    circular_ref: "DBR.No.Leg.BC.78/09.07.005/2017-18",
    protection_note: "Zero Customer Liability (report within 3 working days)",
    tat_date: "2026-10-21",
    days_overdue: 0,
    claim_inr: 3200,
    penalty_inr: 0,
    total_inr: 3200,
    eligible_for_rbi_cms: false,
    rbi_filing_deadline: "2027-02-22",
    shadow_credit_due_date: "2026-11-06",
  },

  ivr:
    "Thank you for calling DemoBank. Your complaint is registered under SR-DB-884120.",

  call: {
    transcript:
      "Thank you for calling DemoBank. Your complaint is registered under SR-DB-884120.",
    docket_id: "SR-DB-884120",
    docket_candidate: "SR-DB-884120",
    verbatim_verified: true,
    brush_off_type: "other",
    suggested_script_en:
      '"Under RBI/2019-20/67, the applicable timeline has passed. Please register my complaint and provide the service request number."',
    suggested_script_hi:
      '"आरबीआई/2019-20/67 के तहत, लागू समय-सीमा गुज़र चुकी है। कृपया मेरी शिकायत दर्ज करें और सर्विस रिक्वेस्ट नंबर दें।"',
  },

  draft: {
    bank_complaint_text:
      "Subject: Failed UPI transaction — refund + statutory compensation under RBI/2019-20/67\n\nI am Ramesh. On 2026-10-18 I attempted a payment of ₹3,200 via UPI. My account was debited but the beneficiary was not credited (UTR: 629188340112).\n\nUnder RBI/2019-20/67 (DPSS.CO.PD No.629/02.01.014/2019-20), the statutory turnaround time was 2026-10-19 (T+1). As of today, 6 day(s) have elapsed beyond TAT, so I am entitled to ₹600 compensation (₹100/day) in addition to the refund of ₹3,200. Total claim: ₹3,800.\n\nI request that you reverse the failed debit and credit the statutory compensation — both suo motu, as mandated by RBI. Please register this grievance and provide a Service Request / docket number for tracking.\n\nThank you.\nRamesh\nPhone: +91-90000-00000",
    whatsapp_draft:
      "Dear DemoBank Support, I am Ramesh. UPI payment of ₹3,200 on 2026-10-18 was debited but not credited (UTR: 629188340112). Under RBI/2019-20/67, please reverse ₹3,200 and pay ₹600 compensation (₹100/day beyond TAT). Log SR/docket ID and share it.",
    email_draft:
      "To: complaints@demobanksupport.in\nSubject: Refund + ₹100/day compensation — failed UPI (UTR: 629188340112)\n\n(as in bank complaint draft)",
    evidence_checklist: [
      "UPI transaction reference (UTR) — screenshot from payment app",
      "Bank statement / passbook entry showing the debit",
      "Beneficiary confirmation (if P2P) — friend/vendor screenshot",
      "This complaint letter with the date of lodging",
      "Bank's acknowledgment / SR / docket ID once provided",
    ],
  },

  hindiDrafts: {
    bank_complaint_text:
      "विषय: विफल UPI लेन-देन — धनवापसी + RBI/2019-20/67 के तहत सांविधिक क्षतिपूर्ति\n\nमैं Ramesh हूँ। 2026-10-18 को मैंने UPI से ₹3,200 का भुगतान किया था। मेरे खाते से राशि कट गई पर लाभार्थी को नहीं पहुँची (UTR: 629188340112)।\n\nRBI/2019-20/67 (DPSS.CO.PD No.629/02.01.014/2019-20) के तहत सांविधिक समय-सीमा 2026-10-19 (T+1) थी। आज तक 6 दिन की देरी हो चुकी है, इसलिए मैं ₹600 (₹100/दिन) क्षतिपूर्ति का अधिकारी हूँ, साथ में ₹3,200 की वापसी। कुल दावा: ₹3,800।\n\nमैं अनुरोध करता हूँ कि विफल डेबिट उलट दी जाए और सांविधिक क्षतिपूर्ति जोड़ी जाए — दोनों RBI के निर्देशानुसार suo motu। कृपया शिकायत दर्ज करें और सर्विस रिक्वेस्ट / डॉकेट नंबर दें।\n\nधन्यवाद।\nRamesh\nफ़ोन: +91-90000-00000",
    whatsapp_draft:
      "प्रिय DemoBank Support, मैं Ramesh हूँ। 2026-10-18 को ₹3,200 का UPI भुगतान डेबिट हुआ पर क्रेडिट नहीं हुआ (UTR: 629188340112)। RBI/2019-20/67 के तहत कृपया ₹3,200 वापस करें और ₹600 क्षतिपूर्ति (₹100/दिन) दें। SR/डॉकेट आईडी दर्ज कर साझा करें।",
    email_draft:
      "To: complaints@demobanksupport.in\nविषय: धनवापसी + ₹100/दिन क्षतिपूर्ति — विफल UPI (UTR: 629188340112)\n\n(बैंक शिकायत ड्राफ्ट के अनुसार)",
    evidence_checklist: [
      "UPI लेन-देन संदर्भ (UTR) — भुगतान एप का स्क्रीनशॉट",
      "बैंक स्टेटमेंट / पासबुक प्रविष्टि जो डेबिट दिखाती है",
      "लाभार्थी की पुष्टि (P2P हो तो) — मित्र/विक्रेता स्क्रीनशॉट",
      "यह शिकायत पत्र शिकायत की तारीख के साथ",
      "बैंक का स्वीकृति / SR / डॉकेट आईडी मिलने पर",
    ],
  },
};

export const BRUSH_LABELS = {
  wait_7_to_10_days:      { en: "Wait 7–10 days (brush-off)",        hi: "7–10 दिन बाद आइए (टाल रहे हैं)",      kind: "warn" },
  tell_me_utr:            { en: "Bank asks UTR again",               hi: "बैंक ने UTR फिर माँगा",               kind: "warn" },
  request_kyc_otp:        { en: "Agent asks OTP — never share",      hi: "एजेंट ने OTP माँगा — कभी न दें",      kind: "bad" },
  escalate_after_30_days: { en: "Come back after 30 days",           hi: "30 दिन बाद आइए",                     kind: "warn" },
  other:                  { en: "Other brash reply",                 hi: "अन्य टाल",                            kind: "warn" },
};

/* exact verbatim AI-disclosure text (RULES.md) */
export const AI_DISCLOSURE = "This is an AI assistant assisting you.";
