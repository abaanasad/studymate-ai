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
  onNewChat: () => void;
};

export default function Sidebar({ onNewChat }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-72"
      } bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-300`}
    >
      <div className="flex items-center justify-between p-5 border-b border-zinc-800">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <GraduationCap size={24} />
              StudyMate AI
            </h1>

            <p className="text-zinc-400 text-sm mt-1">
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

      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          {!collapsed && "New Chat"}
        </button>
      </div>

      {!collapsed && (
        <div className="px-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
            Recent Chats
          </p>

          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 rounded-lg bg-zinc-900 p-3 text-left text-white hover:bg-zinc-800 transition">
              <MessageSquare size={18} />
              Physics Notes
            </button>

            <button className="w-full flex items-center gap-3 rounded-lg bg-zinc-900 p-3 text-left text-white hover:bg-zinc-800 transition">
              <MessageSquare size={18} />
              Programming
            </button>

            <button className="w-full flex items-center gap-3 rounded-lg bg-zinc-900 p-3 text-left text-white hover:bg-zinc-800 transition">
              <MessageSquare size={18} />
              Mathematics
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto p-4 border-t border-zinc-800">
        <button className="w-full flex items-center gap-3 rounded-xl p-3 hover:bg-zinc-800 transition">
          <User size={20} color="white" />

          {!collapsed && (
            <div className="text-left">
              <p className="text-white font-medium">Abaan</p>

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