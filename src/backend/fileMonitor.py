from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import win32com.client
import win32gui
import asyncio
from typing import List, Dict
import logging
import pythoncom

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
        pass

    def get_files_in_folder(self, folder, depth=0) -> List[Dict]:
        """Recursively get a list of files and subfolders from the given folder, up to a depth of 5."""
        if depth > 3:
            return []

        try:
            items = []
            for item in folder.Items():
                try:
                    item_info = {
                        "name": item.Name,
                        "type": item.Type,
                        "isFolder": item.IsFolder,
                        "size": item.Size
                    }
                    if item.IsFolder:
                        try:
                            subfolder = item.GetFolder()
                            if subfolder:
                                item_info["subfolder"] = self.get_files_in_folder(subfolder, depth + 1)
                        except Exception as ex:
                            logger.debug(f"Error retrieving subfolder for {item.Name}: {ex}")
                    items.append(item_info)
                except Exception as e:
                    logger.debug(f"Error processing item: {e}")
                    continue
            return items
        except Exception as e:
            logger.debug(f"Error listing files: {e}")
            return []

    def get_window_info(self, window) -> Dict:
        """Extract information from a single Explorer window."""
        try:
            if not hasattr(window, 'Name') or window.Name != "File Explorer":
                return None

            hwnd = getattr(window, 'HWND', None)
            if not hwnd:
                return None

            try:
                document = window.Document
                if not document:
                    return None

                folder = document.Folder
                if not folder:
                    return None

                path = folder.Self.Path if folder.Self else None
                title = getattr(document, 'Title', None)
                if not title:
                    title = win32gui.GetWindowText(hwnd)
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
        pythoncom.CoInitializeEx(pythoncom.COINIT_APARTMENTTHREADED)
        try:
            shell = win32com.client.Dispatch("Shell.Application")
            explorer_windows = []
            try:
                windows = shell.Windows()
                for window in windows:
                    window_info = self.get_window_info(window)
                    if window_info:
                        explorer_windows.append(window_info)
            except Exception as e:
                logger.error(f"Error getting Explorer windows: {e}")
            return explorer_windows
        finally:
            pythoncom.CoUninitialize()

    def is_window_active(self, hwnd) -> bool:
        try:
            return hwnd == win32gui.GetForegroundWindow()
        except Exception as e:
            logger.debug(f"Error checking active window: {e}")
            return False

explorer_monitor = ExplorerMonitor()
executor = ThreadPoolExecutor(max_workers=1)

@app.get("/explorer-paths")
async def get_current_paths():
    loop = asyncio.get_running_loop()
    paths = await loop.run_in_executor(executor, explorer_monitor.get_explorer_paths)
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
