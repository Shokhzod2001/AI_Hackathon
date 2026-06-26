import pytest


@pytest.mark.asyncio
async def test_list_keywords_empty(client, auth_headers):
    resp = await client.get("/api/v1/keywords", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_create_keyword(client, auth_headers):
    resp = await client.post(
        "/api/v1/keywords",
        json={"word": "testso'z", "risk_level": "high"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["word"] == "testso'z"
    assert data["risk_level"] == "high"


@pytest.mark.asyncio
async def test_create_keyword_invalid_level(client, auth_headers):
    resp = await client.post(
        "/api/v1/keywords",
        json={"word": "test", "risk_level": "invalid"},
        headers=auth_headers,
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_delete_keyword(client, auth_headers):
    create_resp = await client.post(
        "/api/v1/keywords",
        json={"word": "o'chiriladi", "risk_level": "low"},
        headers=auth_headers,
    )
    keyword_id = create_resp.json()["id"]
    del_resp = await client.delete(f"/api/v1/keywords/{keyword_id}", headers=auth_headers)
    assert del_resp.status_code == 204


@pytest.mark.asyncio
async def test_bulk_create_keywords(client, auth_headers):
    resp = await client.post(
        "/api/v1/keywords/bulk",
        json={"keywords": [
            {"word": "bulk1", "risk_level": "high"},
            {"word": "bulk2", "risk_level": "mid"},
        ]},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert len(resp.json()) == 2
