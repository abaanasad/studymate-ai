"use client";

import { useState } from "react";
import {
  PanelLeft,
  Plus,
  MessageSquare,
  GraduationCap,
  User,
} from "lucide-react";

type SidebarProps = {
  chats: {
    id: string;
    title: string;
  }[];
  currentChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
};

export default function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-72"
      } bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-zinc-800">
        {!collapsed && (
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-white">
              <GraduationCap size={24} />
              StudyMate AI
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              Your AI Study Assistant
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 hover:bg-zinc-800 transition"
        >
          <PanelLeft size={22} color="white" />
        </button>
      </div>

      {/* New Chat */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          {!collapsed && "New Chat"}
        </button>
      </div>

      {/* Chats */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-4">
          <p className="mb-3 text-xs uppercase tracking-wider text-zinc-500">
            Recent Chats
          </p>

          <div className="space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full rounded-lg p-3 text-left transition flex items-center gap-3 ${
                  currentChatId === chat.id
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                <MessageSquare size={18} />
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-zinc-800 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-zinc-800 transition">
          <User size={20} color="white" />

          {!collapsed && (
            <div className="text-left">
              <p className="font-medium text-white">
                Abaan
              </p>

              <p className="text-xs text-zinc-400">
                StudyMate AI v1.0
              </p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}