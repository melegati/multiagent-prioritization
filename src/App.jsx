import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import "./ChatStyle.css";
import { RQicon } from "./mysvg";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { SearchOutlined, CaretRightOutlined } from "@ant-design/icons";
import FullPageLoader from "./FullPageLoader";
import {
  columns,
  finalOutputColumns,
  wsjfColumns,
  moscowColumns,
  kanoColumns,
  ahpColumns,
  frameworkColumns,
} from "./columns"; // Import the necessary columns
import TextArea from "antd/es/input/TextArea";
const { Panel } = Collapse;
import {
  Button,
  Form,
  Input,
  Layout,
  Space,
  Table,
  notification,
  Select,
  Collapse,
} from "antd";
import {
  addKeyToResponse,
  getAgentImage,
  getChatMessageClass,
  handleSuccessResponse,
  labelOptions,
} from "./utilityFunctions";

const WS_URL = "ws://localhost:8000/api/ws-chat";

function App() {
  const [loading, setLoading] = useState(false);
  const [displayChatBox, setDisplayChatBox] = useState(false);
  const [ws, setWs] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [name, setName] = useState(
    "The proposed system is designed to streamline research processes by offering a suite of advanced features. It enables users to generate research-specific questions, interact through a React-based user interface, and choose between ChatGPT 3.5 or 4 for language modeling. The system supports API integration, adheres to specific inclusion and exclusion criteria for literature review, and facilitates paper summarization and data extraction. It also allows for both qualitative and quantitative analysis, directly addresses research queries, and aids in the production of key research documentation such as abstracts, introductions, and LaTeX summaries. This comprehensive tool aims to enhance research efficiency and output quality through its multifunctional capabilities."
  );
  const [textBox, setTextBox] = useState({
    vision:
      "For postal workers who need an efficient and accurate way to manage deliveries, the Mobile Delivery Application is a smartphone-enabled tool that streamlines the entire delivery process from Preparation to Delivery and Accounting. Unlike traditional manual methods, the application allows users to quickly log in, scan and organize delivery items, and assign statuses in real time, all while maintaining accurate records. This reduces errors, saves time, and provides a seamless workflow, ultimately enabling postal workers to focus on delivering excellent service with improved accountability and productivity.",
    mvp: "The Mobile Delivery Application is a tool that helps postal workers to prepare, deliver, and account for their deliveries. It has three main phases: Preparation, Delivery, and Accounting. In the Preparation phase, the user logs in by scanning their user barcode and adding their tour or delivery area number. The user also tags their card to the device. The user then goes to the Preparation menu and scans the items to be delivered. The items are displayed in a list with different colors according to their type and delivery option. The user can also see the additional information for each item, such as the delivery address, the recipient’s name, and the special labels that indicate the delivery conditions. The user can also use the quick links to perform different actions on the items, such as: Removing: The user can delete an item from the list if it is not needed or not available. Status: The user can assign a delivery obstacle status to an item, such as “Company closed” or “Refused to accept”. The item is then removed from the list and the status is shown in the back end. Moving: The user can move an item to another list, such as a new or existing STOP list or a GAS list. A STOP list is a list of items that are delivered at the same stop, such as a building or a street. A GAS list is a list of items that are delivered to a GAS customer, such as a supermarket or a pharmacy. The user can also set the number of print copies for each list. GAS: The user can create a GAS list and scan the items that belong to it. The user can also choose a GAS customer from a list of predefined options. STOP: The user can create a STOP list and scan the items that belong to it. The user can also assign a STOP number to the list. The user can also print the delivery orders for each list or item by going to the Print menu and selecting the Print orders option. The user can then close the preparation phase by selecting the End Preparation option from the three-dot menu. The user is then asked to confirm the pop-up and is returned to the main menu. In the Delivery phase, the user delivers the items according to the lists and assigns the appropriate statuses to them. The user can also fill out the required fields and collect the signatures of the recipients. The user also connects a printer to the device and prints the receipts and notifications for the items that require them. The user can perform the following actions in this phase: Delivery-STOP: The user can select a list or an item and press the Delivery-STOP button to deliver it. The user can then assign a status to the item from the following options: Personal: The user delivers the item personally to the recipient and collects their signature. The user also fills out the mandatory Allgemein fields, such as the name and the gender of the recipient. The user also prints a receipt for the item if it has a special label, such as Cash on delivery or Postage due. Roommate: The user delivers the item to a roommate or a neighbor of the recipient and collects their signature. The user also fills out the mandatory fields, such as the name and the gender of the roommate or neighbor. The user also prints a receipt for the item if it has a special label, such as Cash on delivery or Postage due. Employee: The user delivers the item to an employee of the recipient and collects their signature. The user also fills out the mandatory fields, such as the name and the gender of the employee. The user also prints a receipt for the item if it has a special label, such as Cash on delivery or Postage due. Notified: The user notifies the recipient that the item is available for pickup at a post office or a deposit place. The user also selects a deposit place from a list of predefined options and fills out the mandatory fields, such as the storage period and the pickup date. The user also prints a notification for the item and attaches it to the item. Deposited: The user deposits the item at a safe place, such as a mailbox or a garage. The user also prints a notification for the item and attaches it to the item. Refused to accept: The user returns the item to the sender because the recipient refused to accept it. The user also fills out the mandatory fields, such as the reason for the refusal and the date of the refusal. Release: The user can select an item from a list and press the Release button to remove it from the list. The item is then moved to the Delivery list as a single item. Transfer: The user can select an item from the list and press the Transfer button to transfer it to another delivery option, such as a post office or a post partner. The user also fills out the mandatory fields, such as the name and the address of the post office or the post partner. Obstacle: The user can select an item from the list and press the Obstacle button to assign a delivery obstacle status to it, such as “Company closed” or “Refused to accept”. The item is then removed from the list and the status is shown in the back-end. The user can also print the receipts and notifications for the items that require them by connecting a printer to the device and holding it against the back of the device. The user can then confirm the pop-up and print the documents. The user can also start the delivery phase by pressing the Start Delivery button from the main menu and selecting the delivery vehicle type, such as PT-Postal vehicle or Car. Allgemein In the Accounting phase, the user accounts for the cash collected and the items deposited at the post office. The user can perform the following actions in this phase: Deposit: The user can go to the Deposit tab and scan the barcode of the item that is going to be deposited at a post office. The user also fills out the mandatory fields and signs. The user can also swipe left for the All tab and search for the post office that was chosen when assigning the Notified status to the item. Accounting: The user can go to the Accounting tab and fill out the amount of cash collected. The user can also generate a barcode by pressing the Generate barcode button and then the Next button. The user then scans the barcode and the item that is displayed on the screen. The user can also scan the Accounting barcode, which is a QR code that contains the relevant information, such as the user ID, the date, the time, and the amount of cash. End Delivery: The user can press the End Delivery button from the main menu and scan the barcode of the item that is displayed on the screen. The user then presses the Log out button and logs out. The accounting phase is then over.",
  });
  const [feedback, setFeedBack] = useState('')
  const [num_stories, setNoOfRequirments] = useState(10);
  const [selectType, setSelectType] = useState("file");
  const [type, setType] = useState("textbox");

  const [prioritizationTechnique, setPrioritizationTechnique] =
    useState("100_Dollar");
  const [selectModel, setSelectModel] = useState("gpt-4o-mini");
  const [frameWork, setFromWork] = useState("INVEST framework");
  const [result1, setResult1] = useState([]);
  const [frameWorkResult, setFrameWorkResult] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [visionFile, setVisionFile] = useState(null);
  const [mvpFile, setMvpFile] = useState(null);
  // const [fileInput, setFileInput] = useState({
  //   vision: null,
  //   mvp: null,
  // });
  const [finalTableData, setFinalTableData] = useState([]);
  const [finalPrioritizationType, setFinalPrioritizationType] = useState("");
  const chatContainerRef = useRef(null);
  const [messageQueue, setMessageQueue] = useState([]);
  const [isDisplayingMessage, setIsDisplayingMessage] = useState(false);
  const [responses, setResponses] = useState({
    PO: [],
    QA: [],
    developer: [],
    "Final Prioritization": [],
  });
  const textAreaRefs = useRef({});
  const handleModel = (value) => {
    setSelectModel(value);
  };
  const handleframe = (value) => {
    setFromWork(value);
  };
  const handleLanguage = (value) => {
    setPrioritizationTechnique(value);
  };
  const [messageSequence, setMessageSequence] = useState([]);
  const [totalMessageData, setTotalMessageData] = useState("");
  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket(WS_URL);
      const handleMessage = (event) => {
        console.log("event data:", event.data);
        const data = JSON.parse(event.data);

        if (data.agentType === "Final_output_into_table") {
          setFinalTableData(data.message);
          setFinalPrioritizationType(data.prioritization_type);
        }

        if (data.message.trim().length > 0) {
          setMessageQueue((prevQueue) => [
            ...prevQueue,
            { agentType: data.agentType, message: data.message },
          ]);
          setTotalMessageData((prvMessage) => prvMessage + " " + data?.message);
        }
        setLoading(false);
      };
      socket.onopen = () => {
        console.log("WebSocket connected");
        setLoading(false);
      };
      socket.onmessage = handleMessage;
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setLoading(false);
      };
      socket.onclose = (event) => {
        console.log("WebSocket disconnected", event);
        setLoading(false);
        // Try to reconnect after a delay
        setTimeout(() => {
          console.log("Attempting to reconnect...");
          connectWebSocket();
        }, 5000);
      };
      setWs(socket);
      return () => {
        socket.close();
        console.log("WebSocket closed");
      };
    };

    connectWebSocket();
  }, []);

  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(totalMessageData)
      .then(() => {
        notification.success({
          message: "Content Copied Successfully",
        });
      })
      .catch((err) => {
        alert("Failed to copy: ", err);
      });
  };

  const displayMessage = (agentType, message) => {
    return new Promise((resolve) => {
      let index = 0;
      const batchSize = 6; // Number of characters to display per interval

      const intervalId = setInterval(() => {
        if (index < message.length) {
          setMessageSequence((prevSequence) => {
            const lastMessageIndex = prevSequence.findIndex(
              (msg) => msg.agentType === agentType && !msg.completed
            );

            if (lastMessageIndex > -1) {
              // Update the existing message with more characters
              const updatedSequence = [...prevSequence];
              updatedSequence[lastMessageIndex] = {
                ...updatedSequence[lastMessageIndex],
                message: message.slice(0, index + batchSize),
              };
              return updatedSequence;
            } else {
              // Add a new message entry for the new message
              return [
                ...prevSequence,
                {
                  agentType,
                  message: message.slice(0, index + batchSize),
                  completed: false,
                },
              ];
            }
          });
          index += batchSize;
        } else {
          clearInterval(intervalId);
          setMessageSequence((prevSequence) => {
            const updatedSequence = [...prevSequence];
            const lastMessageIndex = updatedSequence.findIndex(
              (msg) => msg.agentType === agentType && !msg.completed
            );
            if (lastMessageIndex > -1) {
              updatedSequence[lastMessageIndex].completed = true; // Mark the message as completed
            }
            return updatedSequence;
          });
          resolve(); // Resolve the promise when the message is fully displayed
        }
      }, 10); // Adjust the interval duration as needed
    });
  };

  useEffect(() => {
    const recentAgentType =
      messageSequence[messageSequence.length - 1]?.agentType;
    if (recentAgentType && textAreaRefs.current[recentAgentType]) {
      const textArea = textAreaRefs.current[recentAgentType];
      textArea.focus();
      textArea.scrollTop = textArea.scrollHeight;
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      chatContainerRef.current.focus();
    }
  }, [messageSequence]);

  useEffect(() => {
    console.log("total messages:", totalMessageData);
  }, [totalMessageData]);
  useEffect(() => {
    const processMessageQueue = async () => {
      if (messageQueue.length > 0 && !isDisplayingMessage) {
        setIsDisplayingMessage(true);
        const nextMessage = messageQueue[0];
        await displayMessage(nextMessage.agentType, nextMessage.message);
        setMessageQueue((prevQueue) => prevQueue.slice(1));
        if (nextMessage.agentType === "Final Prioritization") {
          setTimeout(() => {
            setIsDisplayingMessage(false);
            setTimeout(() => {
              chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
              chatContainerRef.current.focus();
            }, [200]);
          }, [1000]);
        } else {
          setIsDisplayingMessage(false);
        }
      }
    };
    processMessageQueue();
  }, [messageQueue, isDisplayingMessage]);


  const handleMvpFileChange = (e) => {
    setMvpFile(e.target.files[0])
  };

  const handleVisionFileChange = (e) => {
    // console.log(e.target.files);
    
    setVisionFile(e.target.files[0])
  }

  const handleGenerateStoriesByFiles = async (e) => {
    e.preventDefault();
    console.log(visionFile);
    
    // Check if both vision and mvp files are provided
    
    
    try {
      setLoading(true);
  
      // Create a FormData object to handle file uploads
      const formData = new FormData();
      
      // Append vision and mvp files to FormData
      formData.append('vision_file', visionFile); // vision_file should match backend field
      formData.append('mvp_file', mvpFile); // mvp_file should match backend field
      
      // Append the selected model
      formData.append('model', selectModel); // 'model' should match the Form field in the backend
  
      const response = await fetch("/api/generate-user-stories-by-files", {
        method: "POST",
        body: formData,  // No need for headers as FormData will set the necessary headers automatically
      });
  
      if (!response.ok) {
        throw new Error("Failed to generate stories");
      }
  
      const message = await response.json();
      
      let dataResponse = message.stories_with_epics.map((i, index) => ({
        ...i,
        key: index,
      }));
  
      setResult1(dataResponse);
      console.log(dataResponse);
  
      setLoading(false);
      notification.success({
        message: "User stories generated",
      });
      
    } catch (error) {
      console.error("Error submitting data:", error);
      setLoading(false);
      notification.error({
        message: "Internal Server Error",
      });
    }
  };
  

  const handleGenerateStories = async (e) => {
    console.log('vision text: ',textBox.vision);
    console.log('mvp text:');

    console.log(textBox.mvp);

    
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("/api/generate-user-stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // objective: name, 
          vision: textBox.vision,
          mvp: textBox.mvp,
          model: selectModel,
        }),
      });
      if (!response.ok) {
        throw new Error("Response");
      }
      const message = await response.json();
      // console.log(message);
      let dataResponse = message.stories_with_epics.map((i, index) => ({
        ...i,
        key: index,
      }));
      setResult1(dataResponse);
      console.log(dataResponse);
      setLoading(false);
      notification.success({
        message: "User stories Generated",
      });
    } catch (error) {
      console.error("Error submitting data:", error);
      setLoading(false);
      notification.error({
        message: "Internal Server Error",
      });
    }
  };
  const handleFileUpload = async (file) => {
    // console.log(selectedFile);
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      const data = await response.json();
      // console.log(data);
      const responseDataWithKeys = addKeyToResponse(data.stories_with_epics);
      // console.log("Uploaded file data:", responseDataWithKeys); // Log the transformed data
      setResult1(responseDataWithKeys);
      setLoading(false);
      notification.success({
        message: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      setLoading(false);
      notification.error({
        message: "Error uploading file",
      });
    }
  };
  const handleFrameWork = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("/api/check-user-stories-quality", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          framework: frameWork, // Ensure 'name' has a valid string value
          stories: result1, // Ensure 'num_stories' has a valid number value
          model: selectModel,
        }),
      });
      if (!response.ok) {
        throw new Error("Response");
      }
      const message = await response.json();
      // console.log(message);
      let dataResponse = message.stories_with_epics.map((i, index) => ({
        ...i,
        key: index,
      }));
      setFrameWorkResult(dataResponse);
      console.log(dataResponse);
      setLoading(false);
      notification.success({
        message: "Framework User stories Generated",
      });
    } catch (error) {
      console.error("Error submitting data:", error);
      setLoading(false);
      notification.error({
        message: "Internal Server Error",
      });
    }
  };
  const sendInput = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      // console.log("technique:", prioritizationTechnique);
      ws.send(
        JSON.stringify({
          stories: result1,
          model: selectModel,
          prioritization_type: prioritizationTechnique,
          feedback: feedback
        })
      );
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessageSequence([]);
    setDisplayChatBox(true);
    setLoading(true);
    sendInput();
    setTotalMessageData("");
    handleSuccessResponse(prioritizationTechnique, selectModel);
    notification.success({
      message: "Successfully ",
    });
  };

  const renderChatMessages = () => {
    const agentMessages = messageSequence.reduce((acc, entry) => {
      const { agentType, message } = entry;
      if (agentType !== "Final Prioritization" && agentType !== "error") {
        if (!acc[agentType]) {
          acc[agentType] = [];
        }
        acc[agentType].push(message);
      }
      return acc;
    }, {});

    let finalMessage = messageSequence.reduce((acc, entry) => {
      const { agentType, message } = entry;
      if (agentType === "Final Prioritization") {
        if (!acc[agentType]) {
          acc[agentType] = [];
        }
        acc[agentType].push(message);
      }
      return acc;
    }, {});

    return (
      <>
        <div
          className="chat-container"
          ref={chatContainerRef}
          style={{
            margin: "0 auto",
            padding: "20px 15px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="chat-messages-row"
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {Object.entries(agentMessages).map(([agentType, messages]) => (
              <div
                key={agentType}
                id={agentType}
                className="chat-box"
                style={{
                  flexDirection: "column",
                  display: "flex",
                  width: "32.5%",
                }}
              >
                <div
                  className="chat-message"
                  style={{ flexDirection: "column", alignItems: "center" }}
                >
                  <div className="profile">
                    <img src={getAgentImage(agentType)} alt={agentType} />
                  </div>
                  <div>{agentType}</div>
                </div>
                <div
                  className={`message-content ${getChatMessageClass(
                    agentType
                  )}`}
                >
                  <TextArea
                    key={`${agentType}-textarea`}
                    ref={(el) => (textAreaRefs.current[agentType] = el)}
                    className="message-content"
                    value={messages.join("\n")}
                    autoSize={{ minRows: 2 }}
                    readOnly
                  />
                </div>
              </div>
            ))}
          </div>

          {Object.entries(finalMessage).map(([agentType, messages]) => (
            <div
              key={agentType}
              id={agentType}
              className="chat-box"
              style={{
                flexDirection: "column",
                display: "flex",
                width: "100%",
              }}
            >
              <div
                className="chat-message"
                style={{ flexDirection: "column", alignItems: "center" }}
              >
                <div className="profile">
                  <img src={getAgentImage(agentType)} alt={agentType} />
                </div>
                <div>{agentType}</div>
              </div>
              <div
                className={`message-content ${getChatMessageClass(agentType)}`}
              >
                <TextArea
                  key={`${agentType}-textarea`}
                  ref={(el) => (textAreaRefs.current[agentType] = el)}
                  className="message-content"
                  value={messages.join("\n")}
                  autoSize={{ minRows: 2 }}
                  readOnly
                />
              </div>
            </div>
          ))}

          {!isDisplayingMessage && finalTableData.length > 0 && (
            <div
              className="final-table-container"
              style={{ marginTop: "20px", width: "100%" }}
            >
              <button className="copy-button" onClick={handleCopyClick}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="icon-sm"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Copy
              </button>
              <h2>Final Prioritized Stories</h2>
              <Table
                dataSource={finalTableData}
                columns={
                  finalPrioritizationType === "WSJF"
                    ? wsjfColumns
                    : finalPrioritizationType === "MOSCOW"
                    ? moscowColumns
                    : finalPrioritizationType === "100_DOLLAR"
                    ? finalOutputColumns
                    : finalPrioritizationType === "KANO"
                    ? kanoColumns
                    : finalPrioritizationType === "AHP"
                    ? ahpColumns
                    : ""
                }
                pagination={false}
                scroll={{ x: 1200, y: 500 }}
              />
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <Layout>
      <Header style={{ backgroundColor: "#f3fff3" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginLeft: "0px",
          }}
        >
          <div>
            <RQicon width={"60px"} height={"60px"} />
          </div>
          <div style={{ fontSize: "20px", color: "black" }}>
            <strong>Multi-Agent GPT Prioritization Tool</strong>
          </div>
          <div></div>
        </div>
      </Header>
      <Layout>
        <Content>
          {loading && <FullPageLoader />}
          <div
            id="mainContainer"
            style={{
              lineHeight: "0px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflowY: "auto",
              height: "85vh",
              paddingBottom: "30px",
            }}
          >
            <Collapse
              expandIcon={({ isActive }) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} />
              )}
              accordion={false}
              defaultActiveKey={["1"]}
              style={{
                marginTop: "20px",
                marginBottom: "16px",
                width: "94vw",
              }}
            >
              <Panel
                header="Requirement Engineering Section"
                key="1"
                style={{}}
              >
                <div
                  style={{
                    display: "flex",
                    widows: "78vw",
                    gap: "10px",
                    marginBottom: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "20%",
                      border: "1px solid #ccc",
                      paddingLeft: 15,

                      // paddingBottom: 15,
                      borderRadius: "10px",
                      marginBottom: 5,
                    }}
                  >
                    <div
                      style={{
                        paddingBottom: 10,
                      }}
                    >
                      <h5 style={{ marginTop: "8px" }}> Select Type:</h5>
                      <div
                        style={{
                          marginTop: "-10px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectType === "input"}
                          onChange={() => setSelectType("input")}
                          style={{ marginRight: "10px", cursor: "pointer" }}
                          id="input"
                        />
                        <label htmlFor="input" style={{ cursor: "pointer" }}>
                          Input Content
                        </label>
                      </div>
                      <br />
                      <div
                        style={{
                          marginTop: "-15px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectType === "file"}
                          onChange={() => setSelectType("file")}
                          style={{ marginRight: "10px", cursor: "pointer" }}
                          id="file"
                        />
                        <label htmlFor="file" style={{ cursor: "pointer" }}>
                          User stories uplaod
                        </label>
                      </div>
                    </div>
                  </div>
                  {selectType === "input" && (
                    <div
                      style={{
                        width: "91vw",
                        border: "1px solid #ccc",
                        paddingLeft: 15,
                        paddingRight: 15,
                        marginBottom: 5,
                        borderRadius: "10px",
                      }}
                    >
                      <div>
                        <h5>
                          Hello, Enter your idea for generating user stories.
                        </h5>
                        <div
                          style={{
                            paddingBottom: 10,
                            display: "flex",
                          }}
                        >
                          {/* <h5 style={{ marginTop: "8px" }}> Select Type:</h5> */}
                          <div
                            style={{
                              marginRight: "10px",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={type === "textbox"}
                              onChange={() => setType("textbox")}
                              style={{ marginRight: "10px", cursor: "pointer" }}
                              id="textbox"
                            />
                            <label
                              htmlFor="textbox"
                              style={{ cursor: "pointer" }}
                            >
                              Textboxs
                            </label>
                          </div>
                          <br />
                          <div
                          // style={{
                          //   marginTop: "-15px",
                          // }}
                          >
                            <input
                              type="checkbox"
                              checked={type === "vision_file"}
                              onChange={() => setType("vision_file")}
                              style={{ marginRight: "10px", cursor: "pointer" }}
                              id="vision_file"
                            />
                            <label
                              htmlFor="vision_file"
                              style={{ cursor: "pointer" }}
                            >
                              Upload files
                            </label>
                          </div>
                        </div>
                      </div>
                      {type === "textbox" ? (
                        <div>
                          <Form
                            layout="vertical"
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Form.Item
                              label=" Vision Textbox"
                              style={{ flex: "1 1 70%", marginRight: "5px" }}
                            >
                              <TextArea
                                rows={2}
                                placeholder="Enter your objective"
                                value={textBox.vision}
                                onChange={(e) =>
                                  setTextBox({
                                    ...textBox,
                                    vision: e.target.value,
                                  })
                                }
                                style={{ color: "black" }}
                                autoSize={{ minRows: 2 }}
                              />
                            </Form.Item>
                            <Form.Item
                              label=" MVP Textbox"
                              style={{ flex: "1 1 70%", marginRight: "5px" }}
                            >
                              <TextArea
                                rows={13}
                                placeholder="Enter your objective"
                                value={textBox.mvp}
                                onChange={(e) => setName({...textBox, mvp:e.target.value})}
                                style={{ color: "black" }}
                                // autoSize={{ minRows: 2 }}
                              />
                            </Form.Item>
                            <Form.Item
                              label="Select Model"
                              style={{ flex: "18%", marginRight: "5px" }}
                            >
                              <Select
                                placeholder="Select Framework"
                                optionFilterProp="children"
                                onChange={handleModel}
                                value={selectModel}
                                defaultValue="gpt-4o-mini"
                                options={[
                                  {
                                    value: "gpt-4o-mini",
                                    label: "gpt-4o-mini",
                                  },
                                  {
                                    value: "gpt-4o",
                                    label: "gpt-4o",
                                  },
                                  {
                                    value: "llama3-70b-8192",
                                    label: "LLama3-70 Billion",
                                  },
                                  {
                                    value: "mixtral-8x7b-32768",
                                    label: "Mixtral-8x7b",
                                  },
                                ]}
                              />
                            </Form.Item>

                            <Form.Item style={{ marginTop: "30px" }}>
                              <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={handleGenerateStories}
                              >
                                Generate
                              </Button>
                            </Form.Item>
                          </Form>
                        </div>
                      ) : (
                        <div>
                          <Form
                            layout="vertical"
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Form.Item
                              label="Upload Vision File"
                              style={{ flex: "1 1 70%", marginRight: "5px" }}
                            >
                              <Input
                                type="file"
                                name="vision"
                                onChange={handleVisionFileChange}
                              />
                            </Form.Item>
                            <Form.Item
                              label="Upload File"
                              style={{ flex: "1 1 70%", marginRight: "5px" }}
                            >
                              <Input
                                type="file"
                                name="mvp"
                                onChange={handleMvpFileChange}
                              />
                            </Form.Item>
                            <Form.Item
                              label="Select Model"
                              style={{ flex: "18%", marginRight: "5px" }}
                            >
                              <Select
                                placeholder="Select Framework"
                                optionFilterProp="children"
                                onChange={handleModel}
                                value={selectModel}
                                defaultValue="gpt-4o-mini"
                                options={[
                                  {
                                    value: "gpt-4o-mini",
                                    label: "gpt-4o-mini",
                                  },
                                  {
                                    value: "gpt-4o",
                                    label: "gpt-4o",
                                  },
                                  {
                                    value: "llama3-70b-8192",
                                    label: "LLama3-70 Billion",
                                  },
                                  {
                                    value: "mixtral-8x7b-32768",
                                    label: "Mixtral-8x7b",
                                  },
                                ]}
                              />
                            </Form.Item>

                            <Form.Item style={{ marginTop: "30px" }}>
                              <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={handleGenerateStoriesByFiles}
                              >
                                Generate
                              </Button>
                            </Form.Item>
                          </Form>
                        </div>
                      )}
                    </div>
                  )}
                  {selectType === "file" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "81%",
                        border: "1px solid #ccc",
                        paddingRight: 15,
                        paddingLeft: 15,
                        marginBottom: 5,
                        borderRadius: "10px",
                      }}
                    >
                      <Form
                        layout="vertical"
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Form.Item
                          label="Upload File"
                          style={{ flex: 1, marginRight: "5px" }}
                        >
                          <Input
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                          />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: "-4px" }}>
                          <Button
                            type="primary"
                            onClick={() => {
                              handleFileUpload();
                            }}
                            disabled={selectedFile === null}
                          >
                            Upload
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>
                  )}
                </div>
                {result1.length > 0 && selectType === "file" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #ccc",
                      padding: 10,
                      borderRadius: "10px",
                      marginBottom: 10,
                    }}
                  >
                    <Form
                      layout="vertical"
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Form.Item
                        label="Objective"
                        style={{ flex: "1 1 70%", marginRight: "5px" }}
                      >
                        <TextArea
                          rows={2}
                          placeholder="Enter your objective"
                          value={fileContent}
                          onChange={(e) => setFileContent(e.target.value)}
                          style={{ color: "black" }}
                          autoSize={{ minRows: 2 }}
                        />
                      </Form.Item>
                    </Form>
                  </div>
                )}
                {result1.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #ccc",
                      padding: 10,
                      borderRadius: "10px",
                      marginBottom: 5,
                    }}
                  >
                    <Space
                      direction="vertical"
                      style={{ width: "100%", padding: "10px 0px" }}
                    >
                      <Table
                        scroll={{ x: 1200, y: 500 }}
                        style={{ width: "100%" }}
                        dataSource={result1}
                        columns={columns}
                        pagination={false}
                      />
                    </Space>
                  </div>
                )}
                {/* {result1.length > 0 &&(
                  <div
                  style={{
                    width: "100%",
                    border: "1px solid #ccc",
                    padding: 10,
                    margin: "10px 0px",
                    borderRadius: "10px",
                  }}
                >
                  <Form
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: 'center',
                      justifyContent: "end",
                    }}
                  >
                    <Form.Item
                      label=""
                      style={{ marginLeft: "10px", marginRight: "10px" , display: 'flex', alignItems:'end', alignSelf:'center' }}
                    >
                      <div style={{display: 'flex', alignItems:'center',}} >
                        <h5>Select Framework</h5>
                        <div style={{marginLeft:'10px'}}>
                      <Select
                        placeholder="Select Framework"
                        optionFilterProp="children"
                        onChange={handleframe}
                        value={frameWork}
                        defaultValue="INVEST framework"
                        options={[
                          {
                            value: "INVEST framework",
                            label: "INVEST framework",
                          },
                          {
                            value: "ISO/IEC/IEEE 29148-2011",
                            label: "ISO/IEC/IEEE 29148-2011"
                          }
                        ]}
                      />
                      </div>
                      </div>
                      

                    </Form.Item>
                    <Form.Item style={{marginRight: "10px"}}>
                      <div style={{display:"flex", alignItems:'center'}}>
                        <h5 style={{marginRight:'10px'}}>Select Model</h5>
                        <div>
                        <Select
                          placeholder="Select Model"
                          optionFilterProp="children"
                          onChange={handleModel}
                          value={selectModel}
                          defaultValue="gpt-3.5-turbo"
                          options={[
                            {
                              value: "gpt-3.5-turbo",
                              label: "GPT-3.5 Turbo",
                            },
                            {
                              value: "gpt-4o",
                              label: "GPT-4 Omni",
                            },
                            {
                              value: "llama3-70b-8192",
                              label: "LLama3-70 Billion",
                            },
                            {
                              value: "mixtral-8x7b-32768",
                              label: "Mixtral-8x7b",
                            },
                          ]}
                        />
                        </div>
                      </div>
                    
                    </Form.Item>
                    <Form.Item style={{ display: "flex", alignItems: "end" }}>
                      <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleFrameWork}
                        disabled={frameWork === null}
                      >
                        Check Compliance
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
                )} */}

                {/* {result1.length > 0 &&(
                  <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #ccc",
                    padding: 10,
                    borderRadius: "10px",
                    marginBottom: 5,
                  }}
                >
                  <Space
                    direction="vertical"
                    style={{ width: "100%", padding: "10px 0px" }}
                  >
                    <Table
                      scroll={{ x: 1200, y: 500 }}
                      style={{ width: "100%" }}
                      dataSource={frameWorkResult}
                      columns={frameworkColumns}
                      pagination={false}
                    />
                  </Space>
                </div>
                )} */}

                {result1.length > 0 && (
                  <div
                    style={{
                      width: "100%",
                      border: "1px solid #ccc",
                      padding: 10,
                      borderRadius: "10px",
                    }}
                  >
                    <Form
                      layout="vertical"
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems:'center',
                        justifyContent: "end",
                      }}
                    >
                      <Form.Item label="Feedback" style={{width:'63%', marginRight:'20px'}}>
                        <TextArea
                                rows={2}
                                placeholder="Enter your feedback"
                                value={feedback}
                                onChange={(e) => setFeedBack(e.target.value)}
                                style={{ color: "black" }}
                                // autoSize={{ minRows: 2 }}
                              />
                      </Form.Item>

                      <Form.Item label="Prioritization Technique">
                        <Select
                          placeholder="Select Technique"
                          optionFilterProp="children"
                          onChange={handleLanguage}
                          value={prioritizationTechnique}
                          options={labelOptions}
                        />
                      </Form.Item>
                      <Form.Item
                        label="Model"
                        style={{ marginLeft: "10px", marginRight: "10px" }}
                      >
                        <Select
                          placeholder="Select Model"
                          optionFilterProp="children"
                          onChange={handleModel}
                          value={selectModel}
                          defaultValue="gpt-4o-mini"
                          options={[
                            {
                              value: "gpt-4o-mini",
                              label: "GPT-4o mini",
                            },
                            {
                              value: "gpt-4o",
                              label: "GPT-4 Omni",
                            },
                            {
                              value: "llama3-70b-8192",
                              label: "LLama3-70 Billion",
                            },
                            {
                              value: "mixtral-8x7b-32768",
                              label: "Mixtral-8x7b",
                            },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item style={{ display: "flex", alignItems: "end", marginTop:'25px' }}>
                        <Button
                          type="primary"
                          icon={<SearchOutlined />}
                          onClick={handleSubmit}
                          disabled={prioritizationTechnique === null}
                        >
                          Generate
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                )}

                {displayChatBox && (
                  <div>
                    {responses && (
                      <div style={{ paddingTop: "10px" }}>
                        {renderChatMessages()}
                      </div>
                    )}
                  </div>
                )}
              </Panel>
            </Collapse>
          </div>
        </Content>
      </Layout>
      <Footer className="footerFixed">
        <div style={{ float: "right", lineHeight: 0 }}>
          <p>&copy; {new Date().getFullYear()} GPT LAB. All rights reserved.</p>
        </div>
      </Footer>
    </Layout>
  );
}
export default App;
