import { createContext, useContext, useEffect, useState } from "react";

const audioFiles = {
  "1.setUp": "../../public/audios/1.setUp.wav",
  "2.missions": "../../public/audios/2.missions.wav",
  "3.offers": "../../public/audios/3.offers.wav",
  "4.milestone": "../../public/audios/4.milestone.wav",
  "5.trends": "../../public/audios/5.trends.wav",
  "6.future": "../../public/audios/6.future.wav",
  "7.sorry": "../../public/audios/7.sorry.wav",
};

const jsonTranscripts = {
  "1.setUp": "../../public/audios/1.setUp.json",
  "2.missions": "../../public/audios/2.missions.json",
  "3.offers": "../../public/audios/3.offers.json",
  "4.milestone": "../../public/audios/4.milestone.json",
  "5.trends": "../../public/audios/5.trends.json",
  "6.future": "../../public/audios/6.future.json",
  "7.sorry": "../../public/audios/7.sorry.json",
};

const getBase64 = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const fetchJson = async (url) => {
  const response = await fetch(url);
  return response.json();
};

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const chat = async (userMessage) => {
    setLoading(true);

    let filePrefix;
    if (!userMessage || userMessage.trim() === "") {
      filePrefix = "7.sorry";
    } else {
      const messageLowerCase = userMessage.toLowerCase();
      if (messageLowerCase.includes("setup") || messageLowerCase.includes("set up")) {
        filePrefix = "1.setUp";
      } else if (messageLowerCase.includes("mission") || messageLowerCase.includes("vision")) {
        filePrefix = "2.missions";
      } else if (messageLowerCase.includes("types of courses") || messageLowerCase.includes("offer")) {
        filePrefix = "3.offers";
      } else if (messageLowerCase.includes("milestone") || messageLowerCase.includes("milestones")) {
        filePrefix = "4.milestone";
      } else if (messageLowerCase.includes("current") || messageLowerCase.includes("trends") || messageLowerCase.includes("adult learning")) {
        filePrefix = "5.trends";
      } else if (messageLowerCase.includes("looking forward") || messageLowerCase.includes("future")) {
        filePrefix = "6.future";
      } else {
        filePrefix = "7.sorry";
      }
    }

    const message = {
      text: filePrefix === "7.sorry" ? "Sorry, I couldn't understand that." : `Playing audio for ${filePrefix.replace(/\d\./, '').replace(/\./g, ' ')}`,
      audio: await getBase64(audioFiles[filePrefix]),
      lipsync: await fetchJson(jsonTranscripts[filePrefix]),
      facialExpression: "smile",
      animation: "Idle",
    };

    setMessages((messages) => [...messages, message]);
    setLoading(false);
  };

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
