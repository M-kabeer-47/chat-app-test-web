"use client";
import io from "socket.io-client";
import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import axios from "axios";

const ChatComponent = () => {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<
    { senderId: string; message: string }[]
  >([]);
  const [recipientId, setRecipientId] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [port, setPort] = useState<string>(); // Default to 8001
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Socket Connection
  useEffect(() => {
    // Ensure port is set and valid
    
      // Create socket connection
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

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    
  }, []); // Dependency on port ensures reconnection if port changes

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
        alert("setting message to empty");
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
    } else if (socket && messageInput.trim() && recipientId) {
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
          setIsOnline(true);
          let savedMessages = localStorage.getItem("offlineMessages");
          if (savedMessages) {
            savedMessages = JSON.parse(savedMessages);
            if (Array.isArray(savedMessages)) {
              savedMessages.forEach((msg) => {
                sendMessage({ senderId: msg.senderId, message: msg.message });
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
      <input
        placeholder="Port"
        value={port}
        onChange={(e) => setPort(e.target.value)}
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
          <div key={index}>
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
