from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import win32com.client
import win32gui
import asyncio
from typing import List, Dict
import logging
import os

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

class ExplorerMonitor:
    def __init__(self):
        self.shell = win32com.client.Dispatch("Shell.Application")

    def get_files_in_folder(self, folder) -> List[Dict]:
        """Get list of files in the folder"""
        try:
            files = []
            for item in folder.Items():
                try:
                    files.append({
                        "name": item.Name,
                        "type": item.Type,
                        "is_folder": item.IsFolder,
                        "size": item.Size if not item.IsFolder else None
                    })
                except Exception as e:
                    logger.debug(f"Error processing item: {e}")
                    continue
            return files
        except Exception as e:
            logger.debug(f"Error listing files: {e}")
            return []

    def get_window_info(self, window) -> Dict:
        """Safely extract window information"""
        try:
            # Check if it's actually a File Explorer window
            if not hasattr(window, 'Name') or window.Name != "File Explorer":
                return None

            # Get window handle
            hwnd = getattr(window, 'HWND', None)
            if not hwnd:
                return None

            # Safely get document and folder
            try:
                document = window.Document
                if not document:
                    return None

                folder = document.Folder
                if not folder:
                    return None

                path = folder.Self.Path if folder.Self else None
                # Get title from either Document or the window title
                title = getattr(document, 'Title', None)
                if not title:
                    # Fallback to getting window title directly
                    title = win32gui.GetWindowText(hwnd)

                # Get files in the folder
                files = self.get_files_in_folder(folder)

            except Exception as e:
                logger.debug(f"Error getting window details: {e}")
                return None

            return {
                "window_id": hwnd,
                "path": path,
                "title": title or "File Explorer",
                "is_active": self.is_window_active(hwnd),
                "files": files
            }
        except Exception as e:
            logger.debug(f"Error processing window: {e}")
            return None

    def get_explorer_paths(self) -> List[Dict]:
        explorer_windows = []
        try:
            windows = self.shell.Windows()
            for window in windows:
                window_info = self.get_window_info(window)
                if window_info:
                    explorer_windows.append(window_info)
        except Exception as e:
            logger.error(f"Error getting Explorer windows: {e}")
        
        return explorer_windows

    def is_window_active(self, hwnd) -> bool:
        try:
            return hwnd == win32gui.GetForegroundWindow()
        except Exception as e:
            logger.debug(f"Error checking active window: {e}")
            return False

# Initialize the monitor
explorer_monitor = ExplorerMonitor()

@app.get("/explorer-paths")
async def get_current_paths():
    """Endpoint to get all Explorer window paths"""
    paths = explorer_monitor.get_explorer_paths()
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
    import uvicorn
    logger.info("Starting Explorer Monitor server...")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")