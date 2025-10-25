import { io } from "socket.io-client";

const URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : "https://backend-fashion-r76p.onrender.com";


export const socket = io(URL, {
  transports: ["websocket"],
});
