import poIcon from "./assets/po.png";
import qaIcon from "./assets/qa.png";
import developerIcon from "./assets/developer.png";
import finalIcon from "./assets/final.png";
import defaultIcon from "./assets/default.png";
export const getChatMessageClass = (agentType) => {
    switch (agentType) {
      case "PO":
        return "chat-message-right";
      case "QA":
        return "chat-message-left";
      case "developer":
        return "chat-message-center";
      case "Final Prioritization":
        return "chat-message-final";
      default:
        return "";
    }
  };

 export const handleSuccessResponse = () => {
    // Check if browser supports speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(' Chat Generating Successfully');
      window.speechSynthesis.speak(utterance);
    } else {
      console.log('Text-to-speech not supported.');
    }
  };

  export const addKeyToResponse = (responseData) => {
    if (!Array.isArray(responseData)) {
      return []; // Return an empty array if response data is not an array
    }
    return responseData.map((item, index) => ({
      ...item,
      key: index, // Assigning index as the key
    }));
  };

  export const getAgentImage = (agentType) => {
    switch (agentType) {
      case "PO":
        return poIcon;
      case "QA":
        return qaIcon;
      case "developer":
        return developerIcon;
      case "Final Prioritization":
        return finalIcon;
      default:
        return defaultIcon;
    }
  };
  