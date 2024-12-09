"use client";
import io from "socket.io-client";
import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";


const ChatComponent = () => {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<
    { senderId: string; message: string,status:string }[]
  >([]);
  const [recipientId, setRecipientId] = useState("");
  const [messageInput, setMessageInput] = useState("");
  
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const connectSocket = () => {
    const newSocket = io("https://chat-app-test-pydh.onrender.com", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    // Debug connection events
    
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("connection-confirmed", (data) => {
      console.log("Connection confirmed:", data);
    });

    newSocket.on("registration-confirmed", (data) => {
      console.log("Registration confirmed:", data);
    });

    // Listen for private messages
    newSocket.on("private-message", (messageData) => {
      console.log("Received private message:", messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    // Error handling
    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);
    return newSocket;
  }
  // Socket Connection
  useEffect(() => {
      // Create socket connection
      const newSocket = connectSocket();
      
      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    
  }, []); 

  // Register User
  const register = () => {
    if (socket && currentUserId) {
      console.log("Registering user:", currentUserId);
      socket.emit("register", currentUserId);
    }
  };

  function checkInternetConnection() {
    return new Promise((resolve) => {
      fetch("https://www.google.com", {
        mode: "no-cors",
      })
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });
  }

  // Send Message
  const sendMessage = async (message: {
    senderId: string;
    message: string;
  }) => {
    
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      alert("You are offline");
      setIsOnline(false);
      let savedMessages = localStorage.getItem("offlineMessages");

      if (savedMessages) {
        savedMessages = JSON.parse(savedMessages);
        if (Array.isArray(savedMessages)) {
          savedMessages.push({
            senderId: currentUserId,
            message: messageInput,
          });
          localStorage.setItem(
            "offlineMessages",
            JSON.stringify(savedMessages)
          );
        }
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            senderId: currentUserId,
            message: messageInput,
            status: "offline",
          },
        ]);
  
      } else {
        localStorage.setItem(
          "offlineMessages",
          JSON.stringify([
            {
              senderId: currentUserId,
              message: messageInput,
            },
          ])
        );
      }
      setMessageInput("");
    } else if (socket && recipientId) {
      console.log("Sending message:", {
        senderId: currentUserId,
        recipientId,
        message: messageInput,
      });
      try {
        socket.emit("send-private-message", {
          senderId: currentUserId,
          recipientId,
          message: messageInput,
          

        });
      } catch (e) {
        alert("User is offline");
      }

      // Optimistically add message to UI
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          senderId: currentUserId,
          message: messageInput,
          status: "sent",
        },
      ]);

      setMessageInput("");
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (!isOnline) {
        let connectionStatus = await checkInternetConnection();
        if (connectionStatus) {
          connectSocket();
          setIsOnline(true);
          let savedMessages = localStorage.getItem("offlineMessages");
          if (savedMessages) {
            savedMessages = JSON.parse(savedMessages);
            if (Array.isArray(savedMessages)) {
              savedMessages.forEach((msg) => {
                alert("sending messages")
                sendMessage({ senderId: msg.senderId, message: msg.message });
              
                setMessages((prevMessages) =>
                  prevMessages.map((m) =>
                    m.senderId === msg.senderId && m.message === msg.message
                      ? { ...m, status: "sent" }
                      : m
                  )
                );
              });
              
              localStorage.removeItem("offlineMessages");
            } 
          }
        }
        else {
          setTimeout(checkConnection, 5000);  
        }  
      }
    };
    checkConnection();
  }, [isOnline]);

  return (
    <div>
      <input
        placeholder="Recipient ID"
        value={recipientId}
        onChange={(e) => setRecipientId(e.target.value)}
      />
      <input
        placeholder="Your ID"
        value={currentUserId}
        onChange={(e) => setCurrentUserId(e.target.value)}
      />
      

      <button onClick={register}>Register</button>
      <button
        onClick={() => {
          let savedMessages = localStorage.getItem("offlineMessages");
          if (savedMessages) {
            alert("Messages: " + savedMessages);
          }
        }}
      >
        Get offline messages
      </button>

      <div>
        {messages.map((msg, index) => (
          <div key={index} style={msg.status === "offline" ? {borderBottom:"1px solid red"} : 
          {} }>
            {msg.senderId}: {msg.message}
          </div>
        ))}
      </div>

      <input
        placeholder="Type a message"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
      />
      <button
        onClick={() => {
          sendMessage({ senderId: currentUserId, message: messageInput });
        }}
      >
        Send
      </button>
    </div>
  );
};

export default ChatComponent;
