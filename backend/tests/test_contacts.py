import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import create_test_user_and_token

@pytest.mark.asyncio
async def test_create_and_list_contacts(ac: AsyncClient, db_session: AsyncSession):
    u1, t1 = await create_test_user_and_token(db_session, "1231231234")
    
    # Create home
    res = await ac.post("/api/v1/homes", json={"name": "C-Home"}, headers={"Authorization": f"Bearer {t1}"})
    home_id = res.json()["id"]
    
    # Create Contact
    contact_data = {"name": "Alice Contact", "phone": "9998887777", "relationship": "Daughter"}
    res_c1 = await ac.post(f"/api/v1/homes/{home_id}/contacts", json=contact_data, headers={"Authorization": f"Bearer {t1}"})
    assert res_c1.status_code == 200
    assert res_c1.json()["name"] == "Alice Contact"
    assert "id" in res_c1.json()
    
    # List Contacts
    list_res = await ac.get(f"/api/v1/homes/{home_id}/contacts", headers={"Authorization": f"Bearer {t1}"})
    assert len(list_res.json()["contacts"]) == 1

@pytest.mark.asyncio
async def test_update_and_delete_contacts(ac: AsyncClient, db_session: AsyncSession):
    u1, t1 = await create_test_user_and_token(db_session, "2342342345")
    res = await ac.post("/api/v1/homes", json={"name": "Home Update"}, headers={"Authorization": f"Bearer {t1}"})
    home_id = res.json()["id"]
    
    res_c1 = await ac.post(
        f"/api/v1/homes/{home_id}/contacts", 
        json={"name": "Bob", "phone": "5551234", "relationship": "Son"}, 
        headers={"Authorization": f"Bearer {t1}"}
    )
    contact_id = res_c1.json()["id"]
    
    # Update via PATCH
    patch_res = await ac.patch(
        f"/api/v1/homes/{home_id}/contacts/{contact_id}", 
        json={"phone": "5559999"}, 
        headers={"Authorization": f"Bearer {t1}"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["phone"] == "5559999"
    assert patch_res.json()["name"] == "Bob"
    
    # Delete
    del_res = await ac.delete(f"/api/v1/homes/{home_id}/contacts/{contact_id}", headers={"Authorization": f"Bearer {t1}"})
    assert del_res.status_code == 200
    
    list_res = await ac.get(f"/api/v1/homes/{home_id}/contacts", headers={"Authorization": f"Bearer {t1}"})
    assert len(list_res.json()["contacts"]) == 0
