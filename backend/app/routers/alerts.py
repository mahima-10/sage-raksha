from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.schemas.alert import AlertResponse, ActiveAlertsResponse, ResolveAlertRequest, PaginatedAlertHistoryResponse
from app.database import get_db
from app.dependencies import get_current_user_id, get_home_membership
from app.models.alert import Alert
from app.models.home_member import HomeMember

router = APIRouter()

@router.get("/{home_id}/alerts", response_model=ActiveAlertsResponse)
async def list_active_alerts(
    home_id: UUID, 
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Alert).where(
            Alert.home_id == home_id,
            Alert.state != 'resolved'
        ).order_by(Alert.triggered_at.desc())
    )
    alerts = list(res.scalars().all())
    return ActiveAlertsResponse(alerts=alerts)

@router.get("/{home_id}/alerts/history", response_model=PaginatedAlertHistoryResponse)
async def get_alert_history(
    home_id: UUID,
    alert_type: Optional[str] = Query(None),
    outcome: Optional[str] = Query(None),
    cursor: Optional[datetime] = Query(None, description="ISO-8601 triggered_at timestamp boundary"),
    limit: int = Query(20, ge=1, le=100),
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    # Total count query
    count_stmt = select(func.count()).select_from(Alert).where(
        Alert.home_id == home_id,
        Alert.state == 'resolved'
    )
    if alert_type:
        count_stmt = count_stmt.where(Alert.alert_type == alert_type)
    if outcome:
        count_stmt = count_stmt.where(Alert.outcome == outcome)
        
    count_res = await db.execute(count_stmt)
    total_count = count_res.scalar() or 0

    # Content query
    stmt = select(Alert).where(
        Alert.home_id == home_id,
        Alert.state == 'resolved'
    )
    if alert_type:
        stmt = stmt.where(Alert.alert_type == alert_type)
    if outcome:
        stmt = stmt.where(Alert.outcome == outcome)
    if cursor:
        stmt = stmt.where(Alert.triggered_at < cursor)
        
    stmt = stmt.order_by(Alert.triggered_at.desc()).limit(limit + 1)
    res = await db.execute(stmt)
    alerts = list(res.scalars().all())
    
    has_more = len(alerts) > limit
    items = alerts[:limit]
    
    next_cursor = None
    if has_more:
        next_cursor = items[-1].triggered_at.isoformat()
        
    return PaginatedAlertHistoryResponse(
        items=items,
        next_cursor=next_cursor,
        has_more=has_more,
        total_count=total_count
    )


@router.get("/{home_id}/alerts/{alert_id}", response_model=AlertResponse)
async def get_alert(
    home_id: UUID, 
    alert_id: UUID, 
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Alert).where(Alert.id == alert_id, Alert.home_id == home_id))
    alert = res.scalars().first()
    
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return alert

@router.post("/{home_id}/alerts/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    home_id: UUID, 
    alert_id: UUID, 
    user_id: UUID = Depends(get_current_user_id),
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Alert).where(Alert.id == alert_id, Alert.home_id == home_id))
    alert = res.scalars().first()
    
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
        
    if alert.state in ("resolved", "acknowledged"):
        return alert

    alert.state = "acknowledged"
    alert.acknowledged_at = datetime.now(timezone.utc)
    alert.acknowledged_by = user_id
    
    await db.commit()
    await db.refresh(alert)
    return alert

@router.post("/{home_id}/alerts/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    home_id: UUID, 
    alert_id: UUID, 
    data: ResolveAlertRequest,
    user_id: UUID = Depends(get_current_user_id),
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Alert).where(Alert.id == alert_id, Alert.home_id == home_id))
    alert = res.scalars().first()
    
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
        
    if alert.state == "resolved":
        return alert

    alert.state = "resolved"
    alert.resolved_at = datetime.now(timezone.utc)
    alert.resolved_by = user_id
    alert.outcome = data.outcome
    if data.notes:
        alert.notes = data.notes
        
    await db.commit()
    await db.refresh(alert)
    return alert
