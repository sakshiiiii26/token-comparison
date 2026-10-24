from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class NotificationCreate(BaseModel):
    organization_id: str
    employee_id: str
    employee_name: str
    platform: str
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NotificationResponse(NotificationCreate):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
