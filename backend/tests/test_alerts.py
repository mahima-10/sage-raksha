import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
import uuid
from tests.conftest import create_test_user_and_token
from app.models.alert import Alert
from app.models.sensor import Sensor

@pytest.mark.asyncio
async def test_alerts_flow(ac: AsyncClient, db_session: AsyncSession):
    u1, t1 = await create_test_user_and_token(db_session, "1231112222")
    
    # 1. Create Home
    res_h = await ac.post("/api/v1/homes", json={"name": "A-Home"}, headers={"Authorization": f"Bearer {t1}"})
    home_id = res_h.json()["id"]
    
    # 2. Create Sensor natively (bypass endpoint to seed hash correctly for alerts check or use endpoint)
    res_s = await ac.post(f"/api/v1/homes/{home_id}/sensors", json={"hardware_id": "esp32-alert", "label": "SRoom"}, headers={"Authorization": f"Bearer {t1}"})
    sensor_id = res_s.json()["id"]
    
    # 3. Seed an active alert manually in db for testing (bypass device endpoint for now)
    new_alert = Alert(
        id=uuid.uuid4(),
        sensor_id=uuid.UUID(sensor_id),
        home_id=uuid.UUID(home_id),
        alert_type="fall",
        state="active",
        triggered_at=datetime.now(timezone.utc)
    )
    db_session.add(new_alert)
    await db_session.commit()
    await db_session.refresh(new_alert)
    alert_id = str(new_alert.id)
    
    # 4. GET /homes/{home_id}/alerts
    act_res = await ac.get(f"/api/v1/homes/{home_id}/alerts", headers={"Authorization": f"Bearer {t1}"})
    assert act_res.status_code == 200
    assert len(act_res.json()["alerts"]) == 1
    assert act_res.json()["alerts"][0]["state"] == "active"
    
    # 5. GET /homes/{home_id}/alerts/{alert_id}
    det_res = await ac.get(f"/api/v1/homes/{home_id}/alerts/{alert_id}", headers={"Authorization": f"Bearer {t1}"})
    assert det_res.status_code == 200
    assert det_res.json()["alert_type"] == "fall"
    
    # 6. POST Acknowledge
    ack_res = await ac.post(f"/api/v1/homes/{home_id}/alerts/{alert_id}/acknowledge", headers={"Authorization": f"Bearer {t1}"})
    assert ack_res.status_code == 200
    assert ack_res.json()["state"] == "acknowledged"
    assert ack_res.json()["acknowledged_by"] == str(u1.id)
    
    # 7. POST Resolve
    res_res = await ac.post(f"/api/v1/homes/{home_id}/alerts/{alert_id}/resolve", json={"outcome": "real_fall", "notes": "Tested"}, headers={"Authorization": f"Bearer {t1}"})
    assert res_res.status_code == 200
    assert res_res.json()["state"] == "resolved"
    assert res_res.json()["outcome"] == "real_fall"
    
    # 8. Active alerts should now be 0
    act_res2 = await ac.get(f"/api/v1/homes/{home_id}/alerts", headers={"Authorization": f"Bearer {t1}"})
    assert len(act_res2.json()["alerts"]) == 0
    
    # 9. GET /homes/{home_id}/alerts/history (pagination check)
    hist_res = await ac.get(f"/api/v1/homes/{home_id}/alerts/history", headers={"Authorization": f"Bearer {t1}"})
    assert hist_res.status_code == 200
    assert len(hist_res.json()["items"]) == 1
    assert hist_res.json()["items"][0]["state"] == "resolved"
    assert hist_res.json()["total_count"] == 1
    assert hist_res.json()["has_more"] is False
