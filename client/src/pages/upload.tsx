import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "../styles/upload.css";
import { getChatResponse } from "../network/chats_api";
import { FiTrash2, FiDownload } from "react-icons/fi";
import { Message } from "../models/message";
import extractDonkeyPic from '../assets/extract_donkey.png';

const PreQuestions = [
  {
    id: 1,
    question: "Could you provide a brief summary of the main points discussed?",
  },
  {
    id: 2,
    question:
      "What are the key takeaways or lessons learned from the audio/video?",
  },
  {
    id: 3,
    question:
      "Can you outline the major themes or topics covered in the audio/video?",
  },
  {
    id: 4,
    question:
      "What is the central message or argument presented in the audio/video?",
  },
];

const Upload: React.FC = () => {
  const chatHistoryRef = useRef<HTMLDivElement | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<
    { question: string; response: any }[]
  >([]);
  const [filesList, setFilesList] = useState<File[]>([]);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [preQuestions] = useState(PreQuestions);
  const [mode, setMode] = useState<string>("chat");

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [videoReady, setVideoReady] = useState<boolean>(false);

  const [userEnter, setUserEnter] = useState<string>("");
  const [userEnterState, setUserEnterState] = useState<{
    messages: Message[];
    history: [string, string][];
  }>({
    messages: [
      {
        message: "Hi, how can I help you today?",
        type: "apiMessage",
      },
    ],
    history: [],
  });
  const { messages, history } = userEnterState;
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    setInitialization();
  }, []);

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFilesList((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const removeFileFromList = (file: File) => {
    setFilesList(filesList.filter((f) => f !== file));
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
      console.error("Chat error:", error);
    }
  };

  const UploadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (filesList.length === 0) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();

    filesList.forEach((file) => {
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

      const resultContainer = document.querySelector(".result-container");
      if (resultContainer) {
        resultContainer.scrollIntoView({ behavior: "smooth" });
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
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  const handlePreQuestionClick = (question: string) => {
    setUserQuestion(question);
  };

  const handleExtractSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const question = userEnter.trim();

    setUserEnterState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: "userMessage",
          message: question,
        },
      ],
    }));

    try {
      console.log("extract function called");
      const response = await fetch("/api/upload/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: 'video/mp4;charset=UTF-8'
        },
        body: JSON.stringify({ userEnter, history }),
      });

      console.log('fetch called');
      setVideoUrl(null);

      await Getvideo();
      console.log('New Video URL:', videoUrl); 

      const data = await response.json();

      setUserEnterState((state) => ({
        ...state,
        messages: [
          ...state.messages,
          {
            type: "apiMessage",
            message: data.text,
            sourceDocs: data.sourceDocuments,
          },
        ],
        history: [...state.history, [question, data.text]],
      }));

    } catch (error) {
      console.error("Extract error:", error);
    }
  };

  const handleTimelineSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Start Time:", startTime, "End Time:", endTime);
    
    try {
      const response = await fetch("/api/upload/timeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startTime, endTime }),
      });

      console.log('Timeline fetch called');
      setVideoUrl(null);
      await Getvideo();
      console.log('New Video URL:', videoUrl); 

    } catch (error) {
      console.error("Error generating video:", error);
    }
  };


  const Getvideo = async () => {
    const v_response = await fetch('/api/upload/video');
    console.log('video fetch called: ' + v_response);
    if (v_response.ok) {
      const videoBlob = await v_response.blob();
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
    } else {
      console.error("Failed to fetch video:", v_response.statusText);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-submit">
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <p>
            Drag and drop your files here, or click to browse and select files
          </p>
        </div>
        <ul className="file-list">
          {filesList.map((file, index) => (
            <li key={index} className="file-card">
              <div className="file-info">{file.name}</div>
              <button
                onClick={() => removeFileFromList(file)}
                className="removeButton"
              >
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
            <button
              className="button"
              onClick={() => setShowTranscript(!showTranscript)}
            >
              {showTranscript ? "Hide" : "View"}
            </button>
            <button
              className="button"
              onClick={() => handleDownloadFile(transcript, "transcript.txt")}
            >
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
            <button
              className="button"
              onClick={() => setShowAnalysis(!showAnalysis)}
            >
              {showAnalysis ? "Hide" : "View"}
            </button>
            <button
              className="button"
              onClick={() => handleDownloadFile(analysis, "analysis.txt")}
            >
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

      <div className="mode-selector">
        <button
          onClick={() => handleModeChange("chat")}
          className={mode === "chat" ? "active" : ""}
        >
          Chat Now
        </button>
        <button
          onClick={() => handleModeChange("extract")}
          className={mode === "extract" ? "active" : ""}
        >
          Extract Clip
        </button>
      </div>

      {mode === "chat" ? (
        <div className="chatbox">
          <div className="chat-history" ref={chatHistoryRef}>
            <div className="chat-history-box">
              {chatHistory.length === 0 ? (
                <div className="pre-questions-container">
                  <h4 className="pre-questions-title">What To Ask</h4>
                  {preQuestions.map((preQuestion) => (
                    <div
                      key={preQuestion.id}
                      className="chat-history-pre-question"
                      onClick={() =>
                        handlePreQuestionClick(preQuestion.question)
                      }
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

          <form onSubmit={handleChatSubmit} style={{ position: "relative" }}>
            <input
              type="text"
              name="question"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Enter your question"
              required
              style={{ paddingRight: "150px" }}
            />
            <button
              type="submit"
              style={{ position: "absolute", top: 0, right: 0 }}
            >
              Submit
            </button>
          </form>
        </div>
      ) : (
        <div className="extractbox">
          
          <form onSubmit={handleExtractSubmit} style={{ position: "relative" }}>
            <input
              type="text"
              value={userEnter}
              onChange={(e) => setUserEnter(e.target.value)}
              placeholder="Enter what you want to extract"
              required
              style={{ paddingRight: "150px" }}
            />
            <button
              type="submit"
              style={{ position: "absolute", top: 0, right: 0 }}
            >
              Submit
            </button>
          </form>


          <form onSubmit={handleTimelineSubmit} style={{ position: "relative" }}>
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="Enter start time (e.g., 00:00:00)"
              required
              style={{ width: '48%', marginRight: '1%' }}
            />
            <input
              type="text"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="Enter end time (e.g., 00:05:00)"
              required
              style={{ width: '48%' }}
            />
            <button
              type="submit"
              style={{ position: "relative", top: 0, right: 0 }}
            >
              Submit
            </button>
          </form>

          

          <div className="video-show">
            {videoUrl && (
              <div className="video-container">
                <video controls>
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>



        </div>
      )}
    </div>
  );
};

export default Upload;
