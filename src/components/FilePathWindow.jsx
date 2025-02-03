// ExplorerWindow.jsx
import React from 'react';

const ExplorerWindow = ({ windowData, isActive, onClick }) => {
    return (
        <div className={`explorer-window ${isActive ? 'active' : ''}`} onClick={onClick}>
            <div className="window-header">
                <span className="window-icon">F</span>
                <span className="window-title">{windowData.title}</span>
                {isActive && <span className="active-badge">Active</span>}
            </div>
            <div className="window-path">{windowData.path}</div>
            <div>
                <ul>
                    <li>
                        {
                            windowData.files.map((element, index) => (
                                isActive && windowData.files.length > 0 ? <div key={index}>{element.name}</div> : null
                            ))
                        }
                        {
                            (isActive && windowData.files.length === 0 ? <div>No Files in this folder</div> : null)
                        }
                    </li>
                </ul>
            </div>
        </div >
    );
};

export default ExplorerWindow;