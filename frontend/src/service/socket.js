import { io } from "socket.io-client";

const URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : "https://backend-fashion-r76p.onrender.com";

// Tạo socket với autoConnect: false để kiểm soát khi nào kết nối
export const socket = io(URL, {
  // polling trước để bypass Render cold-start, upgrade lên websocket sau
  transports: ["polling", "websocket"],
  autoConnect: false,
});

// Hàm kết nối/tái kết nối khi user đăng nhập
export const connectSocket = (userId) => {
  if (socket.connected) return;
  if (userId) {
    socket.io.opts.query = { userId };
  }
  socket.connect();
};

// Hàm ngắt kết nối khi user đăng xuất
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
