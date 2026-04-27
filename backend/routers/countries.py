from fastapi import APIRouter, Query

from data.sea_countries import SEA_COUNTRIES
from schemas.country import CountryResult

router = APIRouter()


@router.get("/countries", response_model=list[CountryResult])
def search_countries(q: str = Query(default="")):
    term = q.strip().lower()
    return [
        CountryResult(code=code, name=name)
        for code, name in SEA_COUNTRIES.items()
        if not term or term in name.lower() or term in code.lower()
    ]
