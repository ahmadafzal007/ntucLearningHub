import { useRef, useState } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, cameraZoomed, setCameraZoomed } = useChat();
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const sendMessage = () => {
    chat(input.current.value);
    input.current.value = "";
  };

  const startListening = () => {
    if (!recognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onstart = () => {
        console.log("Voice recognition started. Try speaking into the microphone.");
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        console.log(`Result received: ${speechResult}`);
        sendMessage(speechResult);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error(`Error occurred in recognition: ${event.error}`);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        console.log("Voice recognition ended.");
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
      recognitionInstance.start();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full placeholder:text-gray-800 p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Type a message..."
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 px-10 font-semibold uppercase rounded-md"
          >
            Send
          </button>
          <button
            onClick={startListening}
            className={`pointer-events-auto bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-md ${isListening ? "listening" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v9m0 0a3 3 0 006 0m-6 0a3 3 0 01-6 0m6 0V21m-6-3h12"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};
