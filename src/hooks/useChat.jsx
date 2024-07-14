import { createContext, useContext, useEffect, useState } from "react";

// Define audio and transcript file names
const filePrefixes = {
  "1.setUp": {
    audio: "1.setUp.wav",
    transcript: "1.setUp.json",
  },
  "2.missions": {
    audio: "2.missions.wav",
    transcript: "2.missions.json",
  },
  "3.offers": {
    audio: "3.offers.wav",
    transcript: "3.offers.json",
  },
  "4.milestone": {
    audio: "4.milestone.wav",
    transcript: "4.milestone.json",
  },
  "5.trends": {
    audio: "5.trends.wav",
    transcript: "5.trends.json",
  },
  "6.future": {
    audio: "6.future.wav",
    transcript: "6.future.json",
  },
  "7.sorry": {
    audio: "7.sorry.wav",
    transcript: "7.sorry.json",
  },
};

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [message, setMessage] = useState(null);

  // Fetch base64 encoded audio file
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

  // Fetch JSON transcript
  const fetchJson = async (url) => {
    const response = await fetch(url);
    return response.json();
  };

  // Process user chat message
  const chat = async (userMessage) => {
    setLoading(true);

    let filePrefix = "7.sorry"; // Default to "7.sorry" if no matching prefix found

    if (userMessage && userMessage.trim() !== "") {
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
      }
    }

    const fileName = filePrefixes[filePrefix];
    const audioUrl = `./audios/${fileName.audio}`;
    const transcriptUrl = `./audios/${fileName.transcript}`;

    const message = {
      text: filePrefix === "7.sorry" ? "Sorry, I couldn't understand that." : `Playing audio for ${filePrefix.replace(/\d\./, '').replace(/\./g, ' ')}`,
      audio: await getBase64(audioUrl),
      lipsync: await fetchJson(transcriptUrl),
      facialExpression: "smile",
      animation: "Idle",
    };

    setMessages((prevMessages) => [...prevMessages, message]);
    setLoading(false);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  const onMessagePlayed = () => {
    setMessages((prevMessages) => prevMessages.slice(1));
  };

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
