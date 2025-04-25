import React, { useRef, useState } from 'react';
import axios from 'axios';

export default function UploadFile({ setTriggerGetFiles }) {
    const button = useRef();
    const [currentFile, setCurrentFile] = useState();

    function handleFileUpload(event) {
        const file = event.target.files[0];
        setCurrentFile(file);
    }

    async function uploadFile() {
        const formData = new FormData();
        formData.append('file', currentFile);

        // Upload to AWS
        try {
            await axios.post('http://localhost:5000/api/upload', formData);
            setTriggerGetFiles(prev => !prev);
            setCurrentFile();
        } catch (error) {
            console.log(error);
        }
    }

    function handleChooseFile() {
        if (button) {
            button.current.click()
        }
    }
    
    return (
        <div className="upload-file--container">
            <h1>Choose a file: </h1>
            <input
                ref={button}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
            />
            {currentFile && 
                <div className="file-info--container">
                    <div className="file-info-row">
                        <h6>Name:</h6> 
                        <p>{currentFile.name}</p>    
                    </div>
                    <div className="file-info-row">
                        <h6>Type:</h6> 
                        <p>{currentFile.type}</p>    
                    </div>
                    <div className="file-info-row">
                        <h6>Last Modified:</h6> 
                        <p>{new Date(currentFile.lastModifiedDate).toLocaleDateString()}</p>    
                    </div> 
                </div>
            }
            {
                currentFile ?
                <button
                    onClick={uploadFile}
                >Upload File</button>
                :
                <button
                    onClick={handleChooseFile}
                >Choose File</button>
            }
        </div>
    )
}