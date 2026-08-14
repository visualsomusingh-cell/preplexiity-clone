const formatChatHistoryAsString = (history) => {
  return history.map((message) => `${message._getType()}: ${message.content}`).join("\n");
};

export default formatChatHistoryAsString;