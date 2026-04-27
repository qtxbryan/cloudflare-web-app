from pydantic import BaseModel


class CountryResult(BaseModel):
    code: str
    name: str
