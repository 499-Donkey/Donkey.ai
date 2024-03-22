import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDropzone } from 'react-dropzone';
import "../styles/upload.css";
import { getChatResponse } from "../network/chats_api";
import { FiTrash2, FiDownload } from 'react-icons/fi';

const PreQuestions = [
  {
    id: 1,
    question: "Could you provide a brief summary of the main points discussed?",
  },
  {
    id: 2,
    question: "What are the key takeaways or lessons learned from the audio/video?",
  },
  {
    id: 3,
    question: "Can you outline the major themes or topics covered in the audio/video?",
  },
  {
    id: 4,
    question: "What is the central message or argument presented in the audio/video?",
  },
];


const Upload: React.FC = () => {
  const chatHistoryRef = useRef<HTMLDivElement | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ question: string, response: any }[]>([]);
  const [filesList, setFilesList] = useState<File[]>([]);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [preQuestions, setPreQuestions] = useState(PreQuestions);

  useEffect(() => {
    setInitialization();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFilesList(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const removeFileFromList = (file: File) => {
    setFilesList(filesList.filter(f => f !== file));
  };

  const handleChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await getChatResponse(userQuestion);
      setChatHistory([...chatHistory, { question: userQuestion, response }]);
      setUserQuestion("");
      chatHistoryRef.current?.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: "smooth",
      });
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  const UploadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (filesList.length === 0) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();

    filesList.forEach(file => {
      formData.append("file", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const jsonResponse = await response.json();
      setTranscript(jsonResponse.transcript);
      setAnalysis(jsonResponse.analysis);

      const resultContainer = document.querySelector('.result-container');
      if (resultContainer) {
        resultContainer.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
    }
  };

  const setInitialization = () => {
    setTranscript("Nothing inside right now, please upload a video/audio file");
    setAnalysis("Nothing inside right now, please upload a video/audio file");
  };

  const handleDownloadFile = (content: string | null, fileName: string) => {
    if (content) {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  const handlePreQuestionClick = (question: string) => {
    setUserQuestion(question);
  };
  
  return (
    <div className="upload-container">
      <div className="upload-submit">
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <p>Drag and drop your files here, or click to browse and select files</p>
        </div>
        <ul className="file-list">
          {filesList.map((file, index) => (
            <li key={index} className="file-card">
              <div className="file-info">
                {file.name}
              </div>
              <button onClick={() => removeFileFromList(file)} className="removeButton">
                <FiTrash2 />
              </button>
            </li>
          ))}
        </ul>
        <button className="button" type="button" onClick={UploadSubmit}>
          Upload
        </button>
      </div>

      <div className="result-container">
        <div className="transcript">
          <div className="title-container">
            <h2>Transcript</h2>
            <button className="button" onClick={() => setShowTranscript(!showTranscript)}>
              {showTranscript ? "Hide" : "View"}
            </button>
            <button className="button" onClick={() => handleDownloadFile(transcript, 'transcript.txt')}>
              Download
              <FiDownload />
            </button>
          </div>
          
          {showTranscript && (
            <div>
              <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                {transcript}
              </pre>
            </div>
          )}
        </div>

        <div className="analysis">
          <div className="title-container">
            <h2>Analysis</h2>
            <button className="button" onClick={() => setShowAnalysis(!showAnalysis)}>
              {showAnalysis ? "Hide" : "View"}
            </button>
            <button className="button" onClick={() => handleDownloadFile(analysis, 'analysis.txt')}>
              Download
              <FiDownload />
            </button>
          </div>
          
          {showAnalysis && (
            <div>
              <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                {analysis}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="chat-history" ref={chatHistoryRef}>
        <div className="chat-history-box">
          {chatHistory.length === 0 ? (
            <div className="pre-questions-container">
              <h4 className="pre-questions-title">What To Ask</h4>
              {preQuestions.map((preQuestion) => (
                <div
                  key={preQuestion.id}
                  className="chat-history-pre-question"
                  onClick={() => handlePreQuestionClick(preQuestion.question)}
                >
                  {preQuestion.question}
                </div>
              ))}
            </div>
          ) : (
            chatHistory.map((item, index) => (
              <div key={index}>
                <div className="chat-history-user">
                  <h6>You </h6>
                  {item.question}
                </div>
                <div className="chat-history-donkey">
                  <h6>Donkey </h6>
                  {item.response.answer}
                </div>
              </div>
            ))
          )}
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
            style={{ paddingRight: '150px' }}
          />
          <button type="submit" style={{ position: 'absolute', top: 0, right: 0 }}>Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
