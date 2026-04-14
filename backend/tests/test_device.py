import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import create_test_user_and_token

@pytest.mark.asyncio
async def test_device_heartbeat_and_alert(ac: AsyncClient, db_session: AsyncSession):
    u1, t1 = await create_test_user_and_token(db_session, "4445556666")
    
    # Create home
    res_h = await ac.post("/api/v1/homes", json={"name": "D-Home"}, headers={"Authorization": f"Bearer {t1}"})
    home_id = res_h.json()["id"]
    
    # Register sensor -> retrieve api key
    hardware_id = "test-sensor-400"
    res_s = await ac.post(f"/api/v1/homes/{home_id}/sensors", json={"hardware_id": hardware_id, "label": "LR"}, headers={"Authorization": f"Bearer {t1}"})
    sensor_id = res_s.json()["id"]
    api_key = res_s.json()["api_key"]
    
    # 1. Test POST /device/heartbeat without API key -> 422/401 
    hb_fail = await ac.post("/api/v1/device/heartbeat", json={"hardware_id": hardware_id, "signal_strength": 80})
    assert hb_fail.status_code in [401, 422]  # Headers missing

    hb_fail2 = await ac.post("/api/v1/device/heartbeat", json={"hardware_id": hardware_id, "signal_strength": 80}, headers={"x-api-key": "invalid_key"})
    assert hb_fail2.status_code == 401

    # POST heartbeat valid
    hb_valid = await ac.post("/api/v1/device/heartbeat", json={"hardware_id": hardware_id, "signal_strength": 85}, headers={"x-api-key": api_key})
    assert hb_valid.status_code == 200
    assert hb_valid.json()["ok"] is True
    
    # Re-verify sensor status via GET endpoint
    res_s_get = await ac.get(f"/api/v1/homes/{home_id}/sensors/{sensor_id}", headers={"Authorization": f"Bearer {t1}"})
    assert res_s_get.json()["status"] == "online"
    assert res_s_get.json()["last_heartbeat"] is not None
    
    # 2. Test POST /device/alerts
    alert_res = await ac.post(
        "/api/v1/device/alerts",
        json={"hardware_id": hardware_id, "alert_type": "fall", "triggered_at": "2024-01-01T12:00:00Z"},
        headers={"x-api-key": api_key}
    )
    assert alert_res.status_code == 200
    assert alert_res.json()["ok"] is True
    assert "alert_id" in alert_res.json()
    
    # Re-verify alerts native route
    act_res = await ac.get(f"/api/v1/homes/{home_id}/alerts", headers={"Authorization": f"Bearer {t1}"})
    assert len(act_res.json()["alerts"]) == 1
    assert act_res.json()["alerts"][0]["alert_type"] == "fall"
