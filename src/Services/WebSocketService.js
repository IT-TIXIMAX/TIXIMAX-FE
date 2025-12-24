// src/Services/WebSocketService.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.subscribers = new Map();
    this.isConnected = false;
  }

  connect() {
    this.stompClient = new Client({
      webSocketFactory: () => {
        return new SockJS("https://tiximax.net/ws");
      },

      debug: function (str) {
        console.log("STOMP:", str);
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    return new Promise((resolve, reject) => {
      this.stompClient.onConnect = (frame) => {
        console.log("✅ WebSocket Connected:", frame);
        this.isConnected = true;
        resolve(frame);
      };

      this.stompClient.onStompError = (frame) => {
        console.error("❌ STOMP Error:", frame.headers["message"]);
        console.error("Detail:", frame.body);
        this.isConnected = false;
        reject(frame);
      };

      this.stompClient.onDisconnect = () => {
        console.log("⚠️ WebSocket Disconnected");
        this.isConnected = false;
      };

      this.stompClient.onWebSocketClose = () => {
        console.log("🔄 WebSocket Closed, reconnecting...");
        this.isConnected = false;
      };

      this.stompClient.onWebSocketError = (error) => {
        console.error("❌ WebSocket Error:", error);
        this.isConnected = false;
      };

      this.stompClient.activate();
    });
  }

  subscribe(topic, callback) {
    if (!this.stompClient || !this.isConnected) {
      console.error("❌ WebSocket chưa kết nối");
      return null;
    }

    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log("📩 Received message:", data);
        callback(data);
      } catch (error) {
        console.error("❌ Lỗi parse message:", error);
        console.log("Message body:", message.body);
      }
    });

    this.subscribers.set(topic, subscription);
    console.log("📡 Subscribed to:", topic);
    return subscription;
  }

  unsubscribe(topic) {
    const subscription = this.subscribers.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscribers.delete(topic);
      console.log("🔕 Unsubscribed from:", topic);
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.isConnected = false;
      console.log("👋 WebSocket Disconnected");
    }
  }

  send(destination, body) {
    if (this.stompClient && this.isConnected) {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(body),
      });
      console.log("📤 Sent to:", destination);
    } else {
      console.error("❌ Không thể gửi: WebSocket chưa kết nối");
    }
  }

  getConnectionState() {
    return this.isConnected;
  }
}

export default new WebSocketService();
