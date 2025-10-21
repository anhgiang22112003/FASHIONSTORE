import { io } from "socket.io-client"

// ⚙️ URL backend socket (ví dụ http://localhost:3000)
export const socket = io("http://localhost:4000", {
  transports: ["websocket"],
})
