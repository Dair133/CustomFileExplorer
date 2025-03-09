from concurrent.futures import ThreadPoolExecutor
import json
import os
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

@app.get("/get-script-list")
def get_script_list(type : str):
    # Path to script list should be included in json request'
    # Possible user wants python, bash, javascript, etc
    # hence this should return any type
    jsonFilePath = os.path.join("scriptLogic", "pythonReaderScripts.json")
    try:
        with open(jsonFilePath, 'r') as f:
            scripts = json.load(f)

        return scripts
    except Exception as e:
        print("Exception when attempting to get script list:", e)

        # Parse script names and type and description here an return to frontend
        
# FUNCTION WHICH PERFORMS A SCRIPT WHICH ANALYSES CONTENT OF FILES
# THIS SCRIPT SHOULD HAVE MODES WHICH ARE PASSED FROM THE FRONTEND
# WE WOULD HAVE 'PERFORM THIS SCRIPT ONLY ON FIELS IN TH ECURRENT FOLDER'
# AND 'PERFORM THIS SCRIPT ON ALL FILES IN ALL SUBFOLDERS'
# MARK MANUALLY THE FILES WHOSE CONTENT YOU WISH TO ANALYSE
# MODE SHOULD BE PASSED FROM THE FRONTEND
# all scripts that are called using this function will come under 'content analysis' scripts
# i.e. they will NOT edit the structure of the files, they will ONLY read/write content inside files
# (possible divide reading and writing content scripts into 2 seperate groups?
# maybe this function sohuld onyl be called for scripts which read underlying content?)


if __name__ == "__main__":
    logger.info("Starting Explorer Monitor server...")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
