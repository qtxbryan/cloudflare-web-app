from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from routers import countries, health

app = FastAPI(title="Cloudflare Demo", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET"])

app.include_router(health.router)
app.include_router(countries.router, prefix="/api")

_landing_html = (Path(__file__).parent / "templates" / "landing.html").read_text()


@app.get("/", response_class=HTMLResponse)
def home():
    return _landing_html
