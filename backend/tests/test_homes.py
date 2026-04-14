import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import create_test_user_and_token

@pytest.mark.asyncio
async def test_create_home(ac: AsyncClient, db_session: AsyncSession):
    user, token = await create_test_user_and_token(db_session, "111")
    
    response = await ac.post(
        "/api/v1/homes",
        json={"name": "My Home", "address": "123 Test St"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "My Home"
    assert data["address"] == "123 Test St"
    assert data["invite_code"].startswith("RAKSHA-")
    assert str(data["created_by"]) == str(user.id)
    
@pytest.mark.asyncio
async def test_get_home_membership_check(ac: AsyncClient, db_session: AsyncSession):
    u1, t1 = await create_test_user_and_token(db_session, "222")
    u2, t2 = await create_test_user_and_token(db_session, "333")
    
    # u1 creates home
    res = await ac.post("/api/v1/homes", json={"name": "Home"}, headers={"Authorization": f"Bearer {t1}"})
    home_id = res.json()["id"]
    
    # u1 can get it
    res1 = await ac.get(f"/api/v1/homes/{home_id}", headers={"Authorization": f"Bearer {t1}"})
    assert res1.status_code == 200
    assert len(res1.json()["members"]) == 1
    assert res1.json()["members"][0]["role"] == "owner"
    
    # u2 cannot get it (403)
    res2 = await ac.get(f"/api/v1/homes/{home_id}", headers={"Authorization": f"Bearer {t2}"})
    assert res2.status_code == 403

@pytest.mark.asyncio
async def test_update_home_owner_only(ac: AsyncClient, db_session: AsyncSession):
    u1, t1 = await create_test_user_and_token(db_session, "444")
    u2, t2 = await create_test_user_and_token(db_session, "555")
    
    res = await ac.post("/api/v1/homes", json={"name": "Home"}, headers={"Authorization": f"Bearer {t1}"})
    home_id = res.json()["id"]
    invite_code = res.json()["invite_code"]
    
    # u2 joins
    join_res = await ac.post("/api/v1/homes/join", json={"invite_code": invite_code}, headers={"Authorization": f"Bearer {t2}"})
    assert join_res.status_code == 200
    
    # u2 tries to update (caretaker) -> 403
    res_up2 = await ac.patch(f"/api/v1/homes/{home_id}", json={"name": "Hacked"}, headers={"Authorization": f"Bearer {t2}"})
    assert res_up2.status_code == 403
    
    # u1 tries to update (owner) -> 200
    res_up1 = await ac.patch(f"/api/v1/homes/{home_id}", json={"name": "Updated"}, headers={"Authorization": f"Bearer {t1}"})
    assert res_up1.status_code == 200
    assert res_up1.json()["name"] == "Updated"

@pytest.mark.asyncio
async def test_regenerate_invite_code(ac: AsyncClient, db_session: AsyncSession):
    u1, t1 = await create_test_user_and_token(db_session, "666")
    res = await ac.post("/api/v1/homes", json={"name": "Home"}, headers={"Authorization": f"Bearer {t1}"})
    home_id = res.json()["id"]
    old_code = res.json()["invite_code"]
    
    regen_res = await ac.post(f"/api/v1/homes/{home_id}/invite", headers={"Authorization": f"Bearer {t1}"})
    assert regen_res.status_code == 200
    new_code = regen_res.json()["invite_code"]
    
    assert old_code != new_code
    assert new_code.startswith("RAKSHA-")
