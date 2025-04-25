import React, { useState } from 'react';
import UploadFile from './UploadFile';
import BrowseFiles from './BrowseFiles';

export default function App() {
    const [triggerGetFiles, setTriggerGetFiles] = useState(false);

    return (
        <div className="app-container">
            <UploadFile 
                setTriggerGetFiles={setTriggerGetFiles}
            />
            <div className="divider"></div>
            <BrowseFiles 
                triggerGetFiles={triggerGetFiles}
            />
        </div>
    )
}