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
      className="border-t border-slate-200 bg-white px-5 py-4 flex items-center gap-3 relative shadow-lg"
    >
      {/* Image Upload */}
      <label className="cursor-pointer p-2.5 hover:bg-indigo-50 rounded-xl transition-all group">
        <ImageIcon className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
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
          className="p-2.5 hover:bg-indigo-50 rounded-xl transition-all group"
        >
          <Smile className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
        </button>
        {showEmoji && (
          <div className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-xl overflow-hidden">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>

      {/* Message Input */}
      {/* Message Input */}
      <Input
        type="text"
        value={message}
        onChange={(e: any) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 border-2 border-slate-200 rounded-2xl text-sm px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-900"
      />

      {/* Send Button */}
      <button
        type="submit"
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 disabled:opacity-50 disabled:cursor-not-allowed group"
        disabled={!message.trim()}
      >
        <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </form>
  );
};

export default ChatInput;
