from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.auth import router as auth_router

app = FastAPI(
    title="AssetFlow API",
    description="Backend API for Odoo Hackathon 2026 - AssetFlow System",
    version="1.0.0"
)

# Enable CORS so the HTML/JS frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the authentication routers
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "service": "AssetFlow Backend API",
        "documentation_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    # Start server locally on port 8000 with auto-reload enabled
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
