from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import win32com.client
import win32gui
import asyncio
from typing import List, Dict
import logging
import pythoncom
import uvicorn

# Custom Files
from fileMonitoring import FileMonitoringClass

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
fileMonitoringObject = FileMonitoringClass()
executor = ThreadPoolExecutor(1)


@app.get("/explorer-paths")
async def get_current_paths():
    loop = asyncio.get_running_loop()
    paths = await loop.run_in_executor(executor, fileMonitoringObject.get_explorer_paths)
    active_window = next(
    (window for window in paths if window["is_active"]),
    None
    )
    logger.debug(f"Found {len(paths)} Explorer windows")
    return {
    "windows": paths,
    "active_window": active_window
    }

if __name__ == "__main__":
    logger.info("Starting Explorer Monitor server...")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
