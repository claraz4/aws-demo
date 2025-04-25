import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function BrowseFiles({ triggerGetFiles }) {
    const [files, setFiles] = useState([]);
    const [triggerEffect, setTriggerEffect] = useState(false);

    useEffect(() => {
        const deleteFile = async (key) => {
            try {
                await axios.delete(`http://localhost:5000/api/files/${key}`);
                setTriggerEffect(prev => !prev);
            } catch (error) {
                console.log(error);
            }
        }

        const getAllFiles = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/files");
                const files = response.data.files

                setFiles(files.map(obj => {
                    return (
                        <div className="file--row">
                            <p>{obj.name}</p>
                            <span className="material-symbols-outlined" onClick={() => deleteFile(obj.name)}>
                                delete
                            </span>
                        </div>
                    )
                }));
            } catch (error) {
                console.log(error);
            }
        }

        getAllFiles();
    }, [triggerEffect, triggerGetFiles])


    return (
        <div className="browse-files--container">  
            <h1>All Files:</h1> 
            <div className="files--container">
                {files}
            </div>
        </div>
    )
}