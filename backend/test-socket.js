import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
    extraHeaders: {
        Cookie: "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhN2Q2MjI2OTNkNjk3MGIxNGQxNDdjNyIsInJvbGUiOiJ0ZW5hbnQiLCJpYXQiOjE3ODY2MDIzNzAsImV4cCI6MTc4NjYwMzI3MH0.o973ipqQH1heBSBUnT8gFj4Hf9jW4J_CA17e9SUOG6I"
    }
});

socket.on("connect", () => {
    console.log("Socket connected:", socket.id);

    socket.emit(
        "joinConversation",
        "6a7d623393d6970b14d147cc"
    );
});

socket.on("conversationJoined", (data) => {
    console.log("Conversation joined:", data);

    socket.emit("sendMessage", {
        conversationId: "6a7d623393d6970b14d147cc",
        message: "Hello, this is a socket test!"
    });
});

socket.on("messageSent", (data) => {
    console.log("Message sent:", data);
});

socket.on("receiveMessage", (data) => {
    console.log("Message received:", data);
});

socket.on("conversationError", (error) => {
    console.log("Conversation error:", error);
});

socket.on("messageError", (error) => {
    console.log("Message error:", error);
});

socket.on("connect_error", (error) => {
    console.log("Socket connection error:", error.message);
});