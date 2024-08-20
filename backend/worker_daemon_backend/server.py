import logging
from typing import Annotated, Literal, Optional
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, TypeAdapter
from fastapi.middleware.cors import CORSMiddleware
from config import MainConfig
from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response, WebSocket, WebSocketException
import tomllib
import os
from pathlib import Path
import watchfiles
import starlette.status
app = FastAPI()
logger = logging.getLogger('uvicorn.error')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAIN_CONFIG = MainConfig()

# read version from pyproject.toml
with open("pyproject.toml", "rb") as f:
    pyproject = tomllib.load(f)
    VERSION = pyproject["tool"]["poetry"]["version"]


@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/version")
def read_version():
    return {"version": VERSION}


class FileInfo(BaseModel):
    path: str
    is_dir: bool
    size: int
    mtime: float

def validated_path(path: Optional[Path] = None):
    full_path = Path(MAIN_CONFIG.root_dir) / path if path else MAIN_CONFIG.root_dir

    #if not full_path.is_relative_to(MAIN_CONFIG.root_dir):
    #    raise HTTPException(status_code=400, detail="Invalid path")
    #if not os.path.exists(full_path):
    #    raise HTTPException(status_code=404, detail="File or directory not found")

    return full_path


@app.get("/fs/summary/")
@app.get("/fs/summary/{path}")
async def fs_summary(full_path: Annotated[Path, Depends(validated_path)], return_hidden: bool = False, recursive: bool = True) -> list[FileInfo]:
    root_path = Path(MAIN_CONFIG.root_dir) / full_path
    
    root_path = Path(str(root_path).replace('|||', '/'))
    
    # if not a subpath of root_dir, raise HTTPException
    if not root_path.is_relative_to(MAIN_CONFIG.root_dir):
        raise HTTPException(status_code=400, detail="Invalid path")
    
    def get_file_info(file_path: Path) -> FileInfo:
        stat = file_path.stat()
        return FileInfo(
            path=str(file_path.relative_to(MAIN_CONFIG.root_dir)),
            is_dir=file_path.is_dir(),
            size=stat.st_size,
            mtime=int(stat.st_mtime)
        )

    def scan_directory(directory: Path) -> list[FileInfo]:
        results = []
        try:
            for entry in os.scandir(directory):
                if not return_hidden and entry.name.startswith('.'):
                    continue
                file_path = Path(entry.path)
                results.append(get_file_info(file_path))
                if recursive and entry.is_dir():
                    results.extend(scan_directory(file_path))
        except PermissionError:
            return []
        return results

    try:
        return scan_directory(root_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File or directory not found")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Permission denied")

@app.get("/fs/read_file/{path}")
async def fs_read_file(full_path: Annotated[Path, Depends(validated_path)], req: Request) -> PlainTextResponse:
    full_path = Path(str(full_path).replace('|||', '/'))
    
    if not full_path.is_file():
        raise HTTPException(status_code=404, detail="Path is not file")

    try:
        # Attempt to read files as binary and decode to string
        with open(full_path, "r" if full_path.suffix == ".json" else "rb") as file:
            file_content = file.read()
            print(type(file_content))
            # Trying to decode as utf-8, ignoring errors in case file is not strictly valid text
            if isinstance(file_content, bytes):
                decoded_content = file_content.decode('utf-8', errors='replace')
                response = Response(content=decoded_content, media_type="text/plain")
                
                return response

            return str(file_content)

    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=f"Unable to process file as text: {str(e)}")

class FileEvent(BaseModel):
    path: str
    mtime: float | None
    size: int | None
    status: Literal['created'] | Literal['modified'] | Literal['deleted']
    
@app.websocket("/fs/update_stream/")
@app.websocket("/fs/update_stream/{path}")
async def fs_updates(ws: WebSocket, path: Optional[Path] = None, recursive: bool = True):
    await ws.accept()
    
    # here we check by ourselves cuz we'll need to throw a websocket exception instead of an httpexception
    full_path = Path(MAIN_CONFIG.root_dir) / path if path else MAIN_CONFIG.root_dir
    if not full_path.is_relative_to(MAIN_CONFIG.root_dir):
        raise WebSocketException(code=starlette.status.WS_1008_POLICY_VIOLATION, reason="Path invalid")
    if not os.path.exists(full_path):
        raise WebSocketException(code=starlette.status.WS_1008_POLICY_VIOLATION, reason="Path not found")
    try:
        watch = watchfiles.awatch(full_path, recursive=recursive, ignore_permission_denied=True)
    
        async for changes in watch:
            events: list[FileEvent] = [] 
            for change, changed_path in changes:
                status = 'created' if change == watchfiles.Change.added else 'modified' if change == watchfiles.Change.modified else 'deleted'
                
                # this is race conditiony, but if the file is createad or modified we look up its mtime and size
                if status == "deleted":
                    mtime = None
                    size = None
                else:
                    # look up size and mtime
                    stat = os.stat(changed_path)
                    mtime = stat.st_mtime
                    size = stat.st_size
                
                events.append(FileEvent(
                    path=changed_path,
                    mtime=mtime,
                    size=size,
                    status=status
                ))
            print(events)
            # response = 
            await ws.send_text(TypeAdapter(list[FileEvent]).dump_json(events).decode("utf-8"))
    except Exception as e:
        # print(e)
        raise WebSocketException(code=starlette.status.WS_1008_POLICY_VIOLATION, reason="Error in fs_updates")
