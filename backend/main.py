from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()


@app.get("/", response_class=HTMLResponse)
def home():
    return """
<!DOCTYPE html>
<html>
<head><title>Home</title></head>
<body>
  <h1>Welcome</h1>
  <p>Hello from FastAPI.</p>
</body>
</html>
"""


@app.get("/secure", response_class=HTMLResponse)
def secure():
    return """
<!DOCTYPE html>
<html>
<head><title>Secure Area</title></head>
<body>
  <h1>Secure area</h1>
</body>
</html>
"""


@app.get("/flags/{country}")
def flags(country: str):
    return {"message": f"Flag for {country}"}


@app.get("/flags-d1/{country}")
def flags_d1(country: str):
    return {"message": f"Flag for {country}"}
