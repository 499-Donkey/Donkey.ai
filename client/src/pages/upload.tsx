import React, { useEffect, useRef, useState } from "react";
import "../styles/upload.css";
import { getChatResponse } from "../network/chats_api";

const Upload: React.FC = () => {
  const fileInputsContainerRef = useRef<HTMLDivElement | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ question: string, response: any }[]>([]);
  

  const handleChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await getChatResponse(userQuestion);
      setChatHistory([...chatHistory, { question: userQuestion, response }]);
      setUserQuestion("");
    }
    catch (error){
      console.error('Chat error:', error);
    }
  };

  const UploadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const fileInputs =
      fileInputsContainerRef.current?.querySelectorAll(".fileInput");
    const formData = new FormData();

    fileInputs?.forEach((fileInput) => {
      if (fileInput instanceof HTMLInputElement) {
        const files = fileInput.files;
        if (files && files.length > 0) {
          formData.append("file", files[0]);
        }
      }
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const jsonResponse = await response.json();
      setTranscript(jsonResponse.transcript);
      setAnalysis(jsonResponse.analysis);
    } catch (error: any) {
      console.error("Authentication error:", error);
    }
  };

  const AddFileInputClick = () => {
    const newContainer = document.createElement("div");
    newContainer.classList.add("fileContainer");

    const newFileInput = document.createElement("input");
    newFileInput.type = "file";
    newFileInput.classList.add("fileInput");
    newFileInput.accept = "video/*, audio/*";

    newContainer.appendChild(newFileInput);
    fileInputsContainerRef.current?.appendChild(newContainer);
  };

  return (
    <div className="upload-container">
      <h1>Upload page</h1>
      <h1>Convert Video/Audio to Text</h1>
      <form
        id="uploadForm"
        encType="multipart/form-data"
        onSubmit={UploadSubmit}
      >
        <div
          id="fileInputsContainer"
          className="fileInputsContainer"
          ref={fileInputsContainerRef}
        >
          <div className="fileContainer">
            <input
              type="file"
              className="fileInput"
              accept="video/*, audio/*"
              required
            />
          </div>
        </div>
        <button type="button" id="addFileInput" onClick={AddFileInputClick}>
          Add Another
        </button>
        <button type="submit">Upload</button>
      </form>

      <div className="result-container">
        <div className="transcript">
          {transcript && (
            <div>
              <h2>Transcript</h2>
              <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                {transcript}
              </pre>
            </div>
          )}
        </div>
        <div className="analysis">
          {analysis && (
            <div>
              <h2>Analysis</h2>
              <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                {analysis}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="chat-history">
        {chatHistory.map((item, index) => (
          <div key={index} className="chat-history-item">
            <>You:</>
            <div className="chat-question">{item.question}</div>
            <>Donkey:</>
            <div className="chat-response">{item.response.answer}</div>
          </div>
        ))}
      </div>

      <div className="chatbox">
        <form onSubmit={handleChatSubmit}>
          <input
            type="text"
            name="question"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="Enter your question"
            required
          />


          <button type="submit">submit</button>
        </form>

      </div>
    </div>
  );
};

export default Upload;
