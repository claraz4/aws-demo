import React, { useRef, useState } from 'react';
import axios from 'axios';

export default function UploadFile() {
    const button = useRef();
    const [currentFile, setCurrentFile] = useState();

    async function handleFileUpload(event) {
        const file = event.target.files[0];
        setCurrentFile(file);

        const formData = new FormData();
        formData.append('file', file);

        // Upload to AWS
        try {
            await axios.post('http://localhost:5000/api/upload', formData)
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
        <div>
            <p>Choose a file: </p>
            <input
                ref={button}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
            />
            <button
                onClick={handleChooseFile}
            >Choose File</button>

            {currentFile && 
                <div>
                    <p>Name: {currentFile.name}</p>    
                    <p>Type: {currentFile.type}</p>    
                    <p>Last Modified: {new Date(currentFile.lastModifiedDate).toLocaleDateString()}</p>    
                </div>
            }
        </div>
    )
}