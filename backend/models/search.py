from pydantic import BaseModel

class SearchResult(BaseModel):
    type: str # 'project', 'document', 'issue', 'part'
    id: str
    title: str
    description: str
