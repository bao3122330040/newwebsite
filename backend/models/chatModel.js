// chatModel.js
// Model for chat message data structure

class Chat {
  constructor(id, userId, message, timestamp) {
    this.id = id;
    this.userId = userId;
    this.message = message;
    this.timestamp = timestamp;
  }
}

module.exports = Chat;
