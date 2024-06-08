import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import "./ChatStyle.css";
import { RQicon } from "./mysvg";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { SearchOutlined, CaretRightOutlined } from "@ant-design/icons";
import FullPageLoader from "./FullPageLoader";
import { columns, finalOutputColumns, wsjfColumns } from "./columns"; // Import the necessary columns
import TextArea from "antd/es/input/TextArea";
const { Panel } = Collapse;
import {Button,Form,Input,Layout,Space,Table,notification,Select,Collapse} from "antd";
import { addKeyToResponse, getAgentImage, getChatMessageClass, handleSuccessResponse } from "./utilityFunctions";

const WS_URL = "ws://localhost:8000/api/ws-chat";

function App() {
  const [loading, setLoading] = useState(false);
  const [displayChatBox, setDisplayChatBox] = useState(false);
  const [ws, setWs] = useState(null);
  const [name, setName] = useState("The proposed system is designed to streamline research processes by offering a suite of advanced features. It enables users to generate research-specific questions, interact through a React-based user interface, and choose between ChatGPT 3.5 or 4 for language modeling. The system supports API integration, adheres to specific inclusion and exclusion criteria for literature review, and facilitates paper summarization and data extraction. It also allows for both qualitative and quantitative analysis, directly addresses research queries, and aids in the production of key research documentation such as abstracts, introductions, and LaTeX summaries. This comprehensive tool aims to enhance research efficiency and output quality through its multifunctional capabilities.");
  const [num_stories, setNoOfRequirments] = useState(10);
  const [selectType, setSelectType] = useState("file");
  const [prioritizationTechnique, setPrioritizationTechnique] = useState("100_Dollar");
  const [selectModel, setSelectModel] = useState("gpt-3.5-turbo");
  const [result1, setResult1] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [finalTableData, setFinalTableData] = useState([]);
  const [finalPrioritizationType, setFinalPrioritizationType] = useState("");
  const chatContainerRef = useRef(null);
  const [messageQueue, setMessageQueue] = useState([]);
  const [isDisplayingMessage, setIsDisplayingMessage] = useState(false);
  const [responses, setResponses] = useState({
    PO: [],
    QA: [],
    developer: [],
    "Final Prioritization": []
  });
  const textAreaRefs = useRef({});
  const handleModel = (value) => {
    setSelectModel(value);
  };
  const handleLanguage = (value) => {
    setPrioritizationTechnique(value);
  };
  const [messageSequence, setMessageSequence] = useState([]);
  const [totalMessageData, setTotalMessageData] = useState("")
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
          setMessageQueue((prevQueue) => [...prevQueue, { agentType: data.agentType, message: data.message }]);
          setTotalMessageData((prvMessage)=> prvMessage + " " + data?.message)
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

  const displayMessage = (agentType, message) => {
    return new Promise(async (resolve) => {
      // Split the message into chunks of 10 words or less
      // console.log("message:", agentType, ":",message)
      const words = message.split(' ');
      let currentMessage = '';
      let directionRow = true; // Initial direction, you can set it based on your requirement
      // console.log("words:", words)
      // Concatenate words into chunks of 10 or less words
      for (let i = 0; i < words.length; i++) {
        currentMessage += (currentMessage ? ' ' : '') + words[i];
        if ((i + 1) % 2 === 0 || i === words.length - 1) { // Adjust the number for how many words you want to show at a time
          await new Promise(resolve => setTimeout(resolve, 100)); // Adjust the delay as needed
          setMessageSequence(prevMessageSequence => {
            let newMessageSequence = [...prevMessageSequence];
            const lastMessageIndex = newMessageSequence.length - 1;
  
            // Check if the last message is from the same agent type
            if (lastMessageIndex >= 0 && newMessageSequence[lastMessageIndex].agentType === agentType) {
              // Merge current message with the last message
              newMessageSequence[lastMessageIndex].message +=  " " + currentMessage;
            } else {
              // Add new message
              let flexdirection = directionRow ? "row" : "row-reverse";
              newMessageSequence.push({ agentType, message: currentMessage, rowDirection: flexdirection });
              directionRow = !directionRow; // Toggle direction for the next new message
            }
            return newMessageSequence;
          });
          currentMessage = ''; // Reset currentMessage after adding to sequence
        }
      }
      resolve(); // Resolve the promise when the message is fully displayed
    });
  };
  useEffect(() => {
    const recentAgentType = messageSequence[messageSequence.length - 1]?.agentType;
    if (recentAgentType && textAreaRefs.current[recentAgentType]) {
      const textArea = textAreaRefs.current[recentAgentType];
      textArea.focus();
      textArea.scrollTop = textArea.scrollHeight; 
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      chatContainerRef.current.focus();
    }
  }, [messageSequence]);

  useEffect(()=>{
    console.log("total messages:", totalMessageData)
  },[totalMessageData])
  useEffect(() => {
    const processMessageQueue = async () => {
      if (messageQueue.length > 0 && !isDisplayingMessage) {
        setIsDisplayingMessage(true);
        const nextMessage = messageQueue[0];
        await displayMessage(nextMessage.agentType, nextMessage.message);
        setMessageQueue((prevQueue) => prevQueue.slice(1));
        if(nextMessage.agentType === "Final Prioritization"){
          setTimeout(()=>{
            setIsDisplayingMessage(false);
            setTimeout(()=>{
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            chatContainerRef.current.focus();
            },[200])
          },[1000])
        }else{
          setIsDisplayingMessage(false);
        }

      }
    };
    processMessageQueue();
  }, [messageQueue, isDisplayingMessage]);

  const handleGenerateStories = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        "http://127.0.0.1:8000/api/generate-user-stories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            objective: name, // Ensure 'name' has a valid string value
            num_stories: num_stories, // Ensure 'num_stories' has a valid number value
          }),
        }
      );
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
  const sendInput = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      // console.log("technique:", prioritizationTechnique);
      ws.send(JSON.stringify({ 
        stories: result1, 
        prioritization_type: prioritizationTechnique 
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessageSequence([])
    setTotalMessageData("")
    setDisplayChatBox(true);
    setLoading(true);
    sendInput();
    handleSuccessResponse();
  };

  const renderChatMessages = () => {
    // Create a mapping of agent types to their messages
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
  
    return (
      <>
        <div
          className="chat-container"
          ref={chatContainerRef}
          style={{
            margin: '0 auto',
            padding: '20px 15px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            className="chat-messages-row"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            {Object.entries(agentMessages).map(([agentType, messages]) => (
              <div key={agentType} id={agentType} className="chat-box" style={{ flexDirection: 'column', display: 'flex', width: '33%' }}>
                <div className="chat-message" style={{ flexDirection: "column", alignItems: "center" }}>
                  <div className="profile">
                    <img src={getAgentImage(agentType)} alt={agentType} />
                  </div>
                  <div>
                    {agentType}
                  </div>
                </div>
                <div className={`message-content ${getChatMessageClass(agentType)}`}>
                  <TextArea
                    ref={(el) => (textAreaRefs.current[agentType] = el)}
                    className="message-content"
                    value={messages.join('\n')} // Concatenate messages with a newline separator
                    autoSize={{ minRows: 2 }}
                    readOnly
                  />
                </div>
              </div>
            ))}
          </div>
  
          {messageSequence.map((entry, index) => {
            const { agentType, message } = entry;
            if (agentType !== "Final Prioritization") {
              return null;
            }
            return (
              <div key={agentType} className="chat-box" style={{ flexDirection: 'column', display: 'flex', width: '100%' }}>
                <div className="chat-message" style={{ flexDirection: "column", alignItems: "center" }}>
                  <div className="profile">
                    <img src={getAgentImage(agentType)} alt={agentType} />
                  </div>
                  <div>
                    {agentType}
                  </div>
                </div>
                <div className={`message-content ${getChatMessageClass(agentType)}`}>
                  <TextArea
                  ref={(el) => (textAreaRefs.current[agentType] = el)}
                    key={index}
                    className="message-content"
                    value={message}
                    autoSize={{ minRows: 2 }}
                    readOnly
                  />
                </div>
              </div>
            );
          })}
  
          {!isDisplayingMessage && finalTableData.length > 0 && (
            <div className="final-table-container" style={{ marginTop: '20px', width: '100%' }}>
              <h2>Final Prioritized Stories</h2>
              <Table
                dataSource={finalTableData}
                columns={finalPrioritizationType === "WSJF" ? wsjfColumns : finalOutputColumns} // Use appropriate columns based on prioritization type
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
               <div style={{
                    display: "flex",
                    widows: "78vw",
                    gap: "10px",
                    marginBottom: "6px",
                  }}>
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
                  <div style={{
                        paddingBottom: 10,
                      }}>
                    <h5 style={{ marginTop: "8px" }}> Select Type:</h5>
                    <div  style={{
                          marginTop: "-10px",
                        }}>
                      <input
                        type="checkbox"
                        checked={selectType === "input"}
                        onChange={() => setSelectType("input")}
                        style={{ marginRight: "10px",cursor:'pointer'}}
                        id="input"
                      />
                      <label htmlFor="input" style={{cursor:'pointer'}}>Input Content</label>
                    </div>
                    <br />
                    <div   style={{
                          marginTop: "-15px",
                        }}>
                      <input
                        type="checkbox"
                        checked={selectType === "file"}
                        onChange={() => setSelectType("file")}
                        style={{ marginRight: "10px", cursor:'pointer' }}
                        id="file"
                      />
                      <label htmlFor="file" style={{cursor:'pointer'}}>File Upload</label>
                    </div>
                  </div>
                </div>
                {selectType === "input" && (
                  <div  style={{
                    width: "91vw",
                    border: "1px solid #ccc",
                    paddingLeft: 15,
                    paddingRight: 15,
                    marginBottom: 5,
                    borderRadius: "10px",
                  }}>
                    <div>
                      <h5>
                        Hello, Enter your idea for generating user stories.
                      </h5>
                    </div>
                    <div
                      
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
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ color: "black" }}
                            autoSize={{ minRows: 2 }}
                          />
                        </Form.Item>
                        <Form.Item
                          label="No. of User Stories"
                          style={{ flex: 1, marginRight: "5px" }}
                        >
                          <Input
                            placeholder="Number of User Stories"
                            min={1}
                            max={15}
                            value={num_stories}
                            onChange={(e) => setNoOfRequirments(e.target.value)}
                            type="number"
                          />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: "-4px" }}>
                          <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleGenerateStories}
                          >
                            Search
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>
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
                {result1.length > 0 && (
                  <div
                    style={{ display: "flex", alignItems: "center", width: "91vw", border: "1px solid #ccc", padding: 10, borderRadius: "10px",marginBottom: 5}}
                  >
                    <Space direction="vertical" style={{ width: "100%", padding: "10px 0px" }} >
                      <Table
                        scroll={{x: 1200, y: 500,}}
                        style={{ width: "100%" }}
                        dataSource={result1}
                        columns={columns}
                        pagination={false}
                      />
                    </Space>
                  </div>
                )}

                {result1.length > 0 && (
                  <div
                  style={{
                    width: "100%",
                    border: "1px solid #ccc",
                    padding: 10,
                    borderRadius: "10px",
                  }}
                >
                  <Form layout="vertical" style={{width: "100%", display: "flex", justifyContent: "end",}}>
                    <Form.Item label="Prioritization Technique">
                      <Select
                        placeholder="Select Technique"
                        optionFilterProp="children"
                        onChange={handleLanguage}
                        value={prioritizationTechnique}
                        options={[
                          // {
                          //   value: "AHP",
                          //   label: "AHP",
                          // },
                          {
                            value: "100_Dollar",
                            label: "100 Dollar",
                          },
                          {
                            value: "WSJF",
                            label: "WSJF",
                          },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item label="Model" style={{ marginLeft: "10px", marginRight: "10px" }}>
                      <Select
                        placeholder="Select Model"
                        optionFilterProp="children"
                        onChange={handleModel}
                        value={selectModel}
                        defaultValue="gpt-3.5"
                        options={[
                          {
                            value: "gpt-3.5-turbo",
                            label: "gpt-3.5",
                          },
                          // {
                          //   value: "gpt-4",
                          //   label: "gpt-4",
                          // },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item style={{ display:'flex', alignItems:"end"}}>
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
                 <div style={{ width: "91vw" }}>
                 {responses && <div style={{ paddingTop:'10px' }}>
                  {renderChatMessages()}
                  </div>}
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