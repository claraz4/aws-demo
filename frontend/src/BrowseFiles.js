import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function BrowseFiles() {
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
                        <p onClick={() => deleteFile(obj.name)}>{obj.name}</p>
                    )
                }));
            } catch (error) {
                console.log(error);
            }
        }

        getAllFiles();
    }, [triggerEffect])


    return (
        <div>  
            <p>All Files:</p> 
            <div>
                {files}
            </div>
        </div>
    )
}