import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from backend.routes.auth_routes import router as auth_router
from backend.routes.predict_routes import router as predict_router
from backend.routes.resume_routes import router as resume_router
from backend.routes.skills_routes import router as skills_router
from backend.routes.company_routes import router as company_router
from backend.routes.roadmap_routes import router as roadmap_router
from backend.routes.dashboard_routes import router as dashboard_router
from backend.config import settings

app = FastAPI(
    title="AI-Placement Copilot API",
    description="Backend API for placement readiness prediction, ATS resume parsing, skill gap analysis, company recommendation, and GenAI preparation roadmaps.",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for seamless dev connectivity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route modules
app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(resume_router)
app.include_router(skills_router)
app.include_router(company_router)
app.include_router(roadmap_router)
app.include_router(dashboard_router)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    formatted_errors = []
    for err in errors:
        loc = " -> ".join([str(x) for x in err.get("loc", [])])
        formatted_errors.append({
            "field": loc,
            "message": err.get("msg", "Invalid value"),
            "type": err.get("type", "value_error")
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation Error", "errors": formatted_errors}
    )

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "AI-Placement Copilot API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
