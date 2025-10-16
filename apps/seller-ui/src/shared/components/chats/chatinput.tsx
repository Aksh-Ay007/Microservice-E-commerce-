import { PickerProps } from "emoji-picker-react";
import { ImageIcon, Send, Smile } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import Input from "../../../../../../packages/components/input";

const EmojiPicker = dynamic(
  () =>
    import("emoji-picker-react").then(
      (mod) => mod.default as React.FC<PickerProps>
    ),
  { ssr: false }
);

const ChatInput = ({
  onSendMessage,
  message,
  setMessage,
}: {
  onSendMessage: (e: any) => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [showEmoji, setShowEmoji] = useState(false);

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("uploading image:", file.name);
    }
  };

  return (
    <form
      onSubmit={onSendMessage}
      className="border-t border-gray-800 bg-gray-900 px-5 py-4 flex items-center gap-3 relative"
    >
      {/* Image Upload */}
      <label className="cursor-pointer p-2.5 hover:bg-gray-800 rounded-lg transition-all group">
        <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          hidden
        />
      </label>

      {/* Emoji Picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowEmoji((prev) => !prev)}
          className="p-2.5 hover:bg-gray-800 rounded-lg transition-all group"
        >
          <Smile className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
        </button>
        {showEmoji && (
          <div className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-lg overflow-hidden">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 border border-gray-700 rounded-lg text-sm px-5 py-3
             focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
             transition-all placeholder:text-gray-500 text-white bg-gray-800"
      />

      {/* Send Button */}
      <button
        type="submit"
        className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        disabled={!message.trim()}
      >
        <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </form>
  );
};

export default ChatInput;
