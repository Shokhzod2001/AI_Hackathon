import pytest
from unittest.mock import patch


@pytest.mark.asyncio
async def test_create_scan_local_fallback(client, auth_headers):
    with patch("app.services.claude_service.analyze_text", return_value=None):
        resp = await client.post(
            "/api/v1/scans",
            json={"content_text": "Tur bor etkazib beraman zakladka usulida", "platform": "telegram"},
            headers=auth_headers,
        )
    assert resp.status_code == 201
    data = resp.json()
    assert data["risk_score"] > 0
    assert data["platform"] == "telegram"
    assert data["verdict"] in ("XAVFSIZ", "SHUBHALI", "XAVFLI", "KRITIK")


@pytest.mark.asyncio
async def test_create_scan_with_ai(client, auth_headers):
    mock_ai = {
        "risk_score": 95, "verdict": "KRITIK", "category": "narkotik",
        "language": "uzbek", "threat_type": "sotish",
        "explanation": "Bu matn narkotik sotishga ishora qiladi.",
        "recommended_action": "bloklash",
    }
    with patch("app.services.claude_service.analyze_text", return_value=mock_ai):
        resp = await client.post(
            "/api/v1/scans",
            json={"content_text": "Tur bor zakladka", "platform": "telegram"},
            headers=auth_headers,
        )
    assert resp.status_code == 201
    assert resp.json()["verdict"] == "KRITIK"
    assert resp.json()["risk_score"] == 95


@pytest.mark.asyncio
async def test_list_scans_empty(client, auth_headers):
    resp = await client.get("/api/v1/scans", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_dashboard_stats(client, auth_headers):
    resp = await client.get("/api/v1/scans/stats/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_detected" in data


@pytest.mark.asyncio
async def test_risk_calc_high():
    from app.services.keyword_service import detect_keywords, calc_risk_score, DEFAULT_KEYWORDS
    text = "Tur bor zakladka usulida etkazib beraman"
    found = detect_keywords(text, DEFAULT_KEYWORDS)
    score = calc_risk_score(found, text)
    assert score >= 55


@pytest.mark.asyncio
async def test_risk_calc_low():
    from app.services.keyword_service import detect_keywords, calc_risk_score, DEFAULT_KEYWORDS
    text = "Bugun ob-havo yaxshi edi"
    found = detect_keywords(text, DEFAULT_KEYWORDS)
    score = calc_risk_score(found, text)
    assert score < 40
