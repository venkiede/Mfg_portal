"""Common response schemas used across the API."""

from typing import Any, Optional
from pydantic import BaseModel


class ErrorDetail(BaseModel):
    """Standard error detail for 4xx/5xx responses."""

    detail: str
    code: Optional[str] = None


class ApiResponse(BaseModel):
    """Generic API response wrapper for success messages."""

    message: str
    data: Optional[Any] = None
