from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
import secrets


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

SECRET_PASSWORD = os.getenv("VAULT_PASSWORD" "12345678")
ACCESS_TOKEN = "memory_vault_session_token"


class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    theme: Optional[str] = None


class GalleryImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_data: str
    caption: Optional[str] = ""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GalleryImageCreate(BaseModel):
    image_data: str
    caption: Optional[str] = ""


class Achievement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image_data: Optional[str] = None
    date: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AchievementCreate(BaseModel):
    title: str
    description: str
    image_data: Optional[str] = None
    date: str


class ToDo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task: str
    completed: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ToDoCreate(BaseModel):
    task: str


class ToDoUpdate(BaseModel):
    completed: bool


class TributeImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_data: str
    caption: Optional[str] = ""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TributeImageCreate(BaseModel):
    image_data: str
    caption: Optional[str] = ""


class ThemeUpdate(BaseModel):
    theme: str


@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    if request.password == SECRET_PASSWORD:
        settings = await db.settings.find_one({"key": "theme"}, {"_id": 0})
        theme = settings.get("value", "dark") if settings else "dark"
        return LoginResponse(success=True, token=ACCESS_TOKEN, theme=theme)
    raise HTTPException(status_code=401, detail="Invalid password")


@api_router.get("/auth/verify")
async def verify_token(token: str):
    if token == ACCESS_TOKEN:
        return {"valid": True}
    raise HTTPException(status_code=401, detail="Invalid token")


@api_router.get("/gallery", response_model=List[GalleryImage])
async def get_gallery():
    images = await db.gallery.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for img in images:
        if isinstance(img['timestamp'], str):
            img['timestamp'] = datetime.fromisoformat(img['timestamp'])
    return images


@api_router.post("/gallery", response_model=GalleryImage)
async def create_gallery_image(image: GalleryImageCreate):
    gallery_obj = GalleryImage(**image.model_dump())
    doc = gallery_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.gallery.insert_one(doc)
    return gallery_obj


@api_router.delete("/gallery/{image_id}")
async def delete_gallery_image(image_id: str):
    result = await db.gallery.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"success": True}


@api_router.get("/achievements", response_model=List[Achievement])
async def get_achievements():
    achievements = await db.achievements.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for achievement in achievements:
        if isinstance(achievement['timestamp'], str):
            achievement['timestamp'] = datetime.fromisoformat(achievement['timestamp'])
    return achievements


@api_router.post("/achievements", response_model=Achievement)
async def create_achievement(achievement: AchievementCreate):
    achievement_obj = Achievement(**achievement.model_dump())
    doc = achievement_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.achievements.insert_one(doc)
    return achievement_obj


@api_router.delete("/achievements/{achievement_id}")
async def delete_achievement(achievement_id: str):
    result = await db.achievements.delete_one({"id": achievement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Achievement not found")
    return {"success": True}


@api_router.get("/todos", response_model=List[ToDo])
async def get_todos():
    todos = await db.todos.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for todo in todos:
        if isinstance(todo['timestamp'], str):
            todo['timestamp'] = datetime.fromisoformat(todo['timestamp'])
    return todos


@api_router.post("/todos", response_model=ToDo)
async def create_todo(todo: ToDoCreate):
    todo_obj = ToDo(**todo.model_dump())
    doc = todo_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.todos.insert_one(doc)
    return todo_obj


@api_router.patch("/todos/{todo_id}", response_model=ToDo)
async def update_todo(todo_id: str, update: ToDoUpdate):
    result = await db.todos.find_one_and_update(
        {"id": todo_id},
        {"$set": {"completed": update.completed}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Todo not found")
    result.pop('_id', None)
    if isinstance(result['timestamp'], str):
        result['timestamp'] = datetime.fromisoformat(result['timestamp'])
    return ToDo(**result)


@api_router.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str):
    result = await db.todos.delete_one({"id": todo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"success": True}


@api_router.get("/tribute", response_model=List[TributeImage])
async def get_tribute_images():
    images = await db.tribute.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for img in images:
        if isinstance(img['timestamp'], str):
            img['timestamp'] = datetime.fromisoformat(img['timestamp'])
    return images


@api_router.post("/tribute", response_model=TributeImage)
async def create_tribute_image(image: TributeImageCreate):
    tribute_obj = TributeImage(**image.model_dump())
    doc = tribute_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.tribute.insert_one(doc)
    return tribute_obj


@api_router.delete("/tribute/{image_id}")
async def delete_tribute_image(image_id: str):
    result = await db.tribute.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"success": True}


@api_router.get("/settings/theme")
async def get_theme():
    settings = await db.settings.find_one({"key": "theme"}, {"_id": 0})
    return {"theme": settings.get("value", "dark") if settings else "dark"}


@api_router.put("/settings/theme")
async def update_theme(theme_update: ThemeUpdate):
    await db.settings.update_one(
        {"key": "theme"},
        {"$set": {"value": theme_update.theme}},
        upsert=True
    )
    return {"theme": theme_update.theme}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()