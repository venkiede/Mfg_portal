"""
Response schemas for API consistency.
Import from here for use across routers.
"""

from .common import ApiResponse, ErrorDetail
from .project_tracking import ProjectTrackingItem, ProjectTrackingListResponse
from .production import ProductionItem, ProductionListResponse
from .supply_chain import SupplyChainItem, SupplyChainListResponse
from .after_sales import AfterSalesItem, AfterSalesListResponse
from .collaboration import CollaborationItem, CollaborationListResponse
from .quality import QualityItem, QualityListResponse

__all__ = [
    "ApiResponse",
    "ErrorDetail",
    "ProjectTrackingItem",
    "ProjectTrackingListResponse",
    "ProductionItem",
    "ProductionListResponse",
    "SupplyChainItem",
    "SupplyChainListResponse",
    "AfterSalesItem",
    "AfterSalesListResponse",
    "CollaborationItem",
    "CollaborationListResponse",
    "QualityItem",
    "QualityListResponse",
]
