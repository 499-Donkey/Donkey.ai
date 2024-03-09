import React, { useEffect, useRef } from 'react';
import '../styles/upload.css';

const Upload: React.FC = () => {
    const fileInputsContainerRef = useRef<HTMLDivElement | null>(null);

    const UploadSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const fileInputs = fileInputsContainerRef.current?.querySelectorAll('.fileInput');
        const formData = new FormData();

        fileInputs?.forEach((fileInput) => {
            if (fileInput instanceof HTMLInputElement) {
                const files = fileInput.files;
                if (files && files.length > 0) {
                    formData.append('file', files[0]);
                }
            }
        });

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const jsonResponse = await response.json();
            const transcriptDiv = document.getElementById('transcript');
            if (transcriptDiv) {
                transcriptDiv.innerHTML = `<pre>${JSON.stringify(jsonResponse, null, 2)}</pre>`;
            }
            return jsonResponse;
        } catch (error:any) {
            console.error('Authentication error:', error);
        }
    };

    const AddFileInputClick = () => {
        const newContainer = document.createElement('div');
        newContainer.classList.add('fileContainer');

        const newFileInput = document.createElement('input');
        newFileInput.type = 'file';
        newFileInput.classList.add('fileInput');
        newFileInput.accept = 'video/*, audio/*';

        newContainer.appendChild(newFileInput);
        fileInputsContainerRef.current?.appendChild(newContainer);
    };

    return (
        <div className="upload-container">
            <h1>Upload page</h1>
            <h1>Convert Video/Audio to Text</h1>
            <form id="uploadForm" encType="multipart/form-data" onSubmit={UploadSubmit}>
                <div id="fileInputsContainer" className="fileInputsContainer" ref={fileInputsContainerRef}>
                    <div className="fileContainer">
                        <input type="file" className="fileInput" accept="video/*, audio/*" required />
                    </div>
                </div>
                <button type="button" id="addFileInput" onClick={AddFileInputClick}>Add Another</button>
                <button type="submit">Upload</button>
            </form>
            <div id="transcript"></div>
        </div>
    );
};

export default Upload;
