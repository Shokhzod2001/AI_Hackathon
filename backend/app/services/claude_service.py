import json
import asyncio
from anthropic import AsyncAnthropic, APIConnectionError, RateLimitError, APIStatusError
from app.config import settings

_client: AsyncAnthropic | None = None

SYSTEM_PROMPT = """Sen O'zbekistondagi narkotik monitoring tizimining AI tahlilchisisang.
Faqat JSON formatida javob ber. Hech qanday izoh yozma. JSON tashqarisida hech narsa yozma."""

USER_TEMPLATE = """MATN: {text}
PLATFORMA: {platform}

Quyidagi JSON formatida qaytardir:
{{"risk_score": 0-100, "verdict": "XAVFSIZ|SHUBHALI|XAVFLI|KRITIK", "category": "narkotik|qurol|boshqa|xavfsiz", "language": "uzbek|russian|mixed", "threat_type": "sotish|reklama|tarqatish|yo\\'q", "explanation": "2-3 jumlali O\\'zbek tilidagi tushuntirish", "recommended_action": "bloklash|tekshirish|arxivlash|yo\\'q"}}"""


def get_client() -> AsyncAnthropic:
    global _client
    if _client is None:
        _client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client


async def analyze_text(text: str, platform: str) -> dict | None:
    if not settings.anthropic_api_key:
        return None

    prompt = USER_TEMPLATE.format(text=text[:2000], platform=platform)

    for attempt in range(2):
        try:
            response = await asyncio.wait_for(
                get_client().messages.create(
                    model=settings.claude_model,
                    max_tokens=settings.claude_max_tokens,
                    system=SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": prompt}],
                ),
                timeout=settings.claude_timeout,
            )
            raw = response.content[0].text.strip()
            raw = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(raw)
        except RateLimitError:
            if attempt == 0:
                await asyncio.sleep(60)
        except (APIConnectionError, APIStatusError, asyncio.TimeoutError):
            break
        except (json.JSONDecodeError, IndexError, KeyError):
            break
    return None
