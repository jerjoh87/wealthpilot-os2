# Changelog

## 2026-05-13
- Fixed SnapTrade and SmartCredit connect actions so they call backend endpoints instead of relying on broken placeholder alerts.
- Added backend integration routes for SnapTrade and SmartCredit with graceful env-var-aware responses.
- Documented integration/AI/reminder environment variables and fallback behavior when variables are missing.
- Added migration for 2FA and reminder preferences persistence.
