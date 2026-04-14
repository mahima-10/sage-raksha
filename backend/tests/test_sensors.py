import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import create_test_user_and_token

@pytest.mark.asyncio
async def test_create_sensor(ac: AsyncClient, db_session: AsyncSession):
    u1, t1 = await create_test_user_and_token(db_session, "123")
    
    # Create home
    res = await ac.post("/api/v1/homes", json={"name": "H"}, headers={"Authorization": f"Bearer {t1}"})
    home_id = res.json()["id"]
    
    res_sensor = await ac.post(
        f"/api/v1/homes/{home_id}/sensors",
        json={"hardware_id": "esp32-abc", "label": "Living Room"},
        headers={"Authorization": f"Bearer {t1}"}
    )
    assert res_sensor.status_code == 200
    data = res_sensor.json()
    assert data["hardware_id"] == "esp32-abc"
    assert data["label"] == "Living Room"
    assert data["status"] == "offline"
    assert "api_key" in data
    assert len(data["api_key"]) > 0

@pytest.mark.asyncio
async def test_create_sensor_duplicate(ac: AsyncClient, db_session: AsyncSession):
    u1, t1 = await create_test_user_and_token(db_session, "234")
    res = await ac.post("/api/v1/homes", json={"name": "H"}, headers={"Authorization": f"Bearer {t1}"})
    home_id = res.json()["id"]
    
    res_s1 = await ac.post(f"/api/v1/homes/{home_id}/sensors", json={"hardware_id": "duplicate1", "label": "Room1"}, headers={"Authorization": f"Bearer {t1}"})
    assert res_s1.status_code == 200
    
    res_s2 = await ac.post(f"/api/v1/homes/{home_id}/sensors", json={"hardware_id": "duplicate1", "label": "Room2"}, headers={"Authorization": f"Bearer {t1}"})
    assert res_s2.status_code == 400

@pytest.mark.asyncio
async def test_get_sensor_listing_and_detail(ac: AsyncClient, db_session: AsyncSession):
    u1, t1 = await create_test_user_and_token(db_session, "345")
    res = await ac.post("/api/v1/homes", json={"name": "H"}, headers={"Authorization": f"Bearer {t1}"})
    home_id = res.json()["id"]
    
    s_res = await ac.post(f"/api/v1/homes/{home_id}/sensors", json={"hardware_id": "esp32-listing", "label": "Room M"}, headers={"Authorization": f"Bearer {t1}"})
    sensor_id = s_res.json()["id"]
    
    # List
    list_res = await ac.get(f"/api/v1/homes/{home_id}/sensors", headers={"Authorization": f"Bearer {t1}"})
    assert list_res.status_code == 200
    assert len(list_res.json()["sensors"]) == 1
    
    # Detail
    detail_res = await ac.get(f"/api/v1/homes/{home_id}/sensors/{sensor_id}", headers={"Authorization": f"Bearer {t1}"})
    assert detail_res.status_code == 200
    assert detail_res.json()["recent_alerts"] == []
    assert detail_res.json()["active_alert_count"] == 0
    # No api_key on GET
    assert "api_key" not in detail_res.json() or detail_res.json()["api_key"] is None

@pytest.mark.asyncio
async def test_patch_and_delete_sensor(ac: AsyncClient, db_session: AsyncSession):
    u1, t1 = await create_test_user_and_token(db_session, "456")
    res = await ac.post("/api/v1/homes", json={"name": "H"}, headers={"Authorization": f"Bearer {t1}"})
    home_id = res.json()["id"]
    
    s_res = await ac.post(f"/api/v1/homes/{home_id}/sensors", json={"hardware_id": "esp32-todelete", "label": "Room"}, headers={"Authorization": f"Bearer {t1}"})
    sensor_id = s_res.json()["id"]
    
    # Patch
    patch_res = await ac.patch(f"/api/v1/homes/{home_id}/sensors/{sensor_id}", json={"label": "New Room"}, headers={"Authorization": f"Bearer {t1}"})
    assert patch_res.status_code == 200
    assert patch_res.json()["label"] == "New Room"
    
    # Delete test
    del_res = await ac.delete(f"/api/v1/homes/{home_id}/sensors/{sensor_id}", headers={"Authorization": f"Bearer {t1}"})
    assert del_res.status_code == 200
    
    list_res = await ac.get(f"/api/v1/homes/{home_id}/sensors", headers={"Authorization": f"Bearer {t1}"})
    assert len(list_res.json()["sensors"]) == 0
