"""Email sending via Brevo HTTP API (OTP, etc.)."""
import logging
from email.message import EmailMessage

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailSendError(Exception):
    """Raised when sending an email fails."""


BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


async def send_email(
    *,
    to: str,
    subject: str,
    body_text: str,
    body_html: str | None = None,
) -> None:
    """Send an email via Brevo HTTP API. No-op if API key is not configured."""
    if not settings.BREVO_API_KEY:
        logger.warning("Brevo API key not configured, skipping email to %s", to)
        return

    # Build payload
    payload: dict = {
        "sender": {
            "name": settings.EMAIL_FROM_NAME,
            "email": settings.EMAIL_FROM,
        },
        "to": [{"email": to}],
        "subject": subject,
        "textContent": body_text,
    }
    if body_html:
        payload["htmlContent"] = body_html

    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=settings.BREVO_REQUEST_TIMEOUT) as client:
            resp = await client.post(BREVO_API_URL, headers=headers, json=payload)
    except httpx.RequestError as e:
        logger.exception("Network error while sending email to %s via Brevo: %s", to, e)
        raise EmailSendError(f"Network error sending email to {to}") from e

    if resp.status_code >= 400:
        logger.error(
            "Brevo API error %s while sending email to %s: %s",
            resp.status_code,
            to,
            resp.text,
        )
        raise EmailSendError(
            f"Brevo API error {resp.status_code} while sending email to {to}"
        )

    logger.info("Email sent to %s via Brevo API (subject: %s)", to, subject)


async def send_otp_email(to: str, code: str) -> None:
    """Send OTP verification code email."""
    subject = "Votre code de vérification Schola"
    body_text = f"""Bonjour,

Votre code de vérification Schola est : {code}

Ce code expire dans 10 minutes. Ne le partagez avec personne.

— L'équipe Schola
"""
    body_html = f"""
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 480px;">
  <p>Bonjour,</p>
  <p>Votre code de vérification Schola est : <strong style="font-size: 1.2em; letter-spacing: 0.1em;">{code}</strong></p>
  <p>Ce code expire dans 10 minutes. Ne le partagez avec personne.</p>
  <p>— L'équipe Schola</p>
</body>
</html>
"""
    await send_email(to=to, subject=subject, body_text=body_text, body_html=body_html.strip())
