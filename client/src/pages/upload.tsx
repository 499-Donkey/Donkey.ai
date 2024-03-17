import React, { useEffect, useRef, useState } from "react";
import "../styles/upload.css";
import { getChatResponse } from "../network/chats_api";
import Accordion from "react-bootstrap/esm/Accordion";
import { FaTrashCan } from "react-icons/fa6";
import { createRoot } from 'react-dom/client';

const Upload: React.FC = () => {
  const fileInputsContainerRef = useRef<HTMLDivElement | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ question: string, response: any }[]>([]);

  useEffect(() => {
    setInitialization();
  }, []);

  const handleChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await getChatResponse(userQuestion);
      setChatHistory([...chatHistory, { question: userQuestion, response }]);
      setUserQuestion("");
      chatHistoryRef.current?.scrollTo(0, chatHistoryRef.current?.scrollHeight);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  const UploadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const fileInputs = fileInputsContainerRef.current?.querySelectorAll(".fileInput");
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
  
    const removeButton = document.createElement("button");
    removeButton.classList.add("removeButton");
    removeButton.onclick = () => {
      newContainer.remove();
    };
  
    const trashIcon = <FaTrashCan />;
    const root = createRoot(removeButton!);
    root.render(trashIcon);

    newContainer.appendChild(newFileInput);
    newContainer.appendChild(removeButton);

  
    fileInputsContainerRef.current?.appendChild(newContainer);
  };
  
  
  const setInitialization = () => {
    setTranscript("nothing inside right now, please upload a video/audio file");
    setAnalysis("nothing inside right now, please upload a video/audio file");
  };
  
  

  return (
    <div className="upload-container">
      <h1>Upload page</h1>
      <h1>Convert Video/Audio to Text</h1>

      <form className="FileInputForm"
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

        <div className="button-container">
          <button className="anotherButton" type="button" onClick={AddFileInputClick}>
            Add Another
        </button>
          <button className="button" type="submit">
            Upload
        </button>
        </div>
      </form>

      <div className="result-container">
        <div className="transcript">
          {transcript && (
            <div>
              <Accordion>
                <Accordion.Item eventKey="0">
                  <Accordion.Header><h2>Transcript</h2></Accordion.Header>
                  <Accordion.Body>
                    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                      {transcript}
                    </pre>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          )}
        </div>

        <div className="analysis">
          {analysis && (
            <div>
              <Accordion>
                <Accordion.Item eventKey="0">
                  <Accordion.Header><h2>Analysis</h2></Accordion.Header>
                  <Accordion.Body>
                    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                      {analysis}
                    </pre>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          )}
        </div>
      </div>

      <div className="chat-history" ref={chatHistoryRef}>
        <div className="chat-history-box">
          {chatHistory.map((item, index) => (
            <div key={index}>
              <div className="chat-history-item"> <h5>You: </h5>{item.question}</div>
              <div className="chat-history-item"> <h5>Donkey: </h5>{item.response.answer}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="chatbox">
        <form onSubmit={handleChatSubmit} style={{ position: 'relative' }}>
          <input
            type="text"
            name="question"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="Enter your question"
            required
            style={{ paddingRight: '60px' }}
          />
          <button type="submit" style={{ position: 'absolute', top: 0, right: 0 }}>Submit</button>
        </form>
      </div>

    </div>
  );
};
export default Upload;
