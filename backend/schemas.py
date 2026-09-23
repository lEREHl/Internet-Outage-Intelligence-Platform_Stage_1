from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class MeasurementCreate(BaseModel):
    target: str = Field(..., description="Target website URL (e.g. https://www.google.com)")
    response_time_ms: Optional[float] = Field(None, description="Response latency in milliseconds")
    status_code: Optional[int] = Field(None, description="HTTP status code (e.g. 200, 404)")
    success: bool = Field(..., description="True if request succeeded")
    error_message: Optional[str] = Field(None, description="Error details if probe failed")

class MeasurementResponse(MeasurementCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
