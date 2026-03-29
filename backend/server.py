from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost:5432/myMemoriesDB')

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()
api_router = APIRouter(prefix="/api")

SECRET_PASSWORD = "vampire2024"
ACCESS_TOKEN = "memory_vault_session_token"


# Database Models
class GalleryImageDB(Base):
    __tablename__ = "gallery"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    image_data = Column(Text, nullable=False)
    caption = Column(String, default="")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AchievementDB(Base):
    __tablename__ = "achievements"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    image_data = Column(Text, nullable=True)
    date = Column(String, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ToDoDB(Base):
    __tablename__ = "todos"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    task = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class TributeImageDB(Base):
    __tablename__ = "tribute"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    image_data = Column(Text, nullable=False)
    caption = Column(String, default="")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class SettingsDB(Base):
    __tablename__ = "settings"
    
    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)


# Create tables
Base.metadata.create_all(bind=engine)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Pydantic Models
class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    theme: Optional[str] = None


class GalleryImage(BaseModel):
    id: str
    image_data: str
    caption: Optional[str] = ""
    timestamp: datetime


class GalleryImageCreate(BaseModel):
    image_data: str
    caption: Optional[str] = ""


class Achievement(BaseModel):
    id: str
    title: str
    description: str
    image_data: Optional[str] = None
    date: str
    timestamp: datetime


class AchievementCreate(BaseModel):
    title: str
    description: str
    image_data: Optional[str] = None
    date: str


class ToDo(BaseModel):
    id: str
    task: str
    completed: bool = False
    timestamp: datetime


class ToDoCreate(BaseModel):
    task: str


class ToDoUpdate(BaseModel):
    completed: bool


class TributeImage(BaseModel):
    id: str
    image_data: str
    caption: Optional[str] = ""
    timestamp: datetime


class TributeImageCreate(BaseModel):
    image_data: str
    caption: Optional[str] = ""


class ThemeUpdate(BaseModel):
    theme: str


# Routes
@api_router.post("/auth/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    if request.password == SECRET_PASSWORD:
        settings = db.query(SettingsDB).filter(SettingsDB.key == "theme").first()
        theme = settings.value if settings else "dark"
        return LoginResponse(success=True, token=ACCESS_TOKEN, theme=theme)
    raise HTTPException(status_code=401, detail="Invalid password")


@api_router.get("/auth/verify")
def verify_token(token: str):
    if token == ACCESS_TOKEN:
        return {"valid": True}
    raise HTTPException(status_code=401, detail="Invalid token")


@api_router.get("/gallery", response_model=List[GalleryImage])
def get_gallery(db: Session = Depends(get_db)):
    images = db.query(GalleryImageDB).order_by(GalleryImageDB.timestamp.desc()).all()
    return [GalleryImage(
        id=img.id,
        image_data=img.image_data,
        caption=img.caption,
        timestamp=img.timestamp
    ) for img in images]


@api_router.post("/gallery", response_model=GalleryImage)
def create_gallery_image(image: GalleryImageCreate, db: Session = Depends(get_db)):
    db_image = GalleryImageDB(
        id=str(uuid.uuid4()),
        image_data=image.image_data,
        caption=image.caption,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return GalleryImage(
        id=db_image.id,
        image_data=db_image.image_data,
        caption=db_image.caption,
        timestamp=db_image.timestamp
    )


@api_router.delete("/gallery/{image_id}")
def delete_gallery_image(image_id: str, db: Session = Depends(get_db)):
    image = db.query(GalleryImageDB).filter(GalleryImageDB.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    db.delete(image)
    db.commit()
    return {"success": True}


@api_router.get("/achievements", response_model=List[Achievement])
def get_achievements(db: Session = Depends(get_db)):
    achievements = db.query(AchievementDB).order_by(AchievementDB.timestamp.desc()).all()
    return [Achievement(
        id=a.id,
        title=a.title,
        description=a.description,
        image_data=a.image_data,
        date=a.date,
        timestamp=a.timestamp
    ) for a in achievements]


@api_router.post("/achievements", response_model=Achievement)
def create_achievement(achievement: AchievementCreate, db: Session = Depends(get_db)):
    db_achievement = AchievementDB(
        id=str(uuid.uuid4()),
        title=achievement.title,
        description=achievement.description,
        image_data=achievement.image_data,
        date=achievement.date,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(db_achievement)
    db.commit()
    db.refresh(db_achievement)
    return Achievement(
        id=db_achievement.id,
        title=db_achievement.title,
        description=db_achievement.description,
        image_data=db_achievement.image_data,
        date=db_achievement.date,
        timestamp=db_achievement.timestamp
    )


@api_router.delete("/achievements/{achievement_id}")
def delete_achievement(achievement_id: str, db: Session = Depends(get_db)):
    achievement = db.query(AchievementDB).filter(AchievementDB.id == achievement_id).first()
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    db.delete(achievement)
    db.commit()
    return {"success": True}


@api_router.get("/todos", response_model=List[ToDo])
def get_todos(db: Session = Depends(get_db)):
    todos = db.query(ToDoDB).order_by(ToDoDB.timestamp.desc()).all()
    return [ToDo(
        id=t.id,
        task=t.task,
        completed=t.completed,
        timestamp=t.timestamp
    ) for t in todos]


@api_router.post("/todos", response_model=ToDo)
def create_todo(todo: ToDoCreate, db: Session = Depends(get_db)):
    db_todo = ToDoDB(
        id=str(uuid.uuid4()),
        task=todo.task,
        completed=False,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return ToDo(
        id=db_todo.id,
        task=db_todo.task,
        completed=db_todo.completed,
        timestamp=db_todo.timestamp
    )


@api_router.patch("/todos/{todo_id}", response_model=ToDo)
def update_todo(todo_id: str, update: ToDoUpdate, db: Session = Depends(get_db)):
    todo = db.query(ToDoDB).filter(ToDoDB.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo.completed = update.completed
    db.commit()
    db.refresh(todo)
    return ToDo(
        id=todo.id,
        task=todo.task,
        completed=todo.completed,
        timestamp=todo.timestamp
    )


@api_router.delete("/todos/{todo_id}")
def delete_todo(todo_id: str, db: Session = Depends(get_db)):
    todo = db.query(ToDoDB).filter(ToDoDB.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
    return {"success": True}


@api_router.get("/tribute", response_model=List[TributeImage])
def get_tribute_images(db: Session = Depends(get_db)):
    images = db.query(TributeImageDB).order_by(TributeImageDB.timestamp.desc()).all()
    return [TributeImage(
        id=img.id,
        image_data=img.image_data,
        caption=img.caption,
        timestamp=img.timestamp
    ) for img in images]


@api_router.post("/tribute", response_model=TributeImage)
def create_tribute_image(image: TributeImageCreate, db: Session = Depends(get_db)):
    db_image = TributeImageDB(
        id=str(uuid.uuid4()),
        image_data=image.image_data,
        caption=image.caption,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return TributeImage(
        id=db_image.id,
        image_data=db_image.image_data,
        caption=db_image.caption,
        timestamp=db_image.timestamp
    )


@api_router.delete("/tribute/{image_id}")
def delete_tribute_image(image_id: str, db: Session = Depends(get_db)):
    image = db.query(TributeImageDB).filter(TributeImageDB.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    db.delete(image)
    db.commit()
    return {"success": True}


@api_router.get("/settings/theme")
def get_theme(db: Session = Depends(get_db)):
    settings = db.query(SettingsDB).filter(SettingsDB.key == "theme").first()
    return {"theme": settings.value if settings else "dark"}


@api_router.put("/settings/theme")
def update_theme(theme_update: ThemeUpdate, db: Session = Depends(get_db)):
    settings = db.query(SettingsDB).filter(SettingsDB.key == "theme").first()
    if settings:
        settings.value = theme_update.theme
    else:
        settings = SettingsDB(key="theme", value=theme_update.theme)
        db.add(settings)
    db.commit()
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
