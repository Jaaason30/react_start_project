// src/contexts/GroupChatContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

export interface GroupChat {
  club: string;
  members: string[];
}

interface GCContext {
  groupChats: GroupChat[];
  addToGroupChat: (club: string, newMembers: string[]) => void;
}

export const GroupChatContext = createContext<GCContext>({
  groupChats: [],
  addToGroupChat: () => {}
});

export function GroupChatProvider({ children }: { children: ReactNode }) {
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);

  const addToGroupChat = (club: string, newMembers: string[]) => {
    setGroupChats(prev => {
      const existing = prev.find(g => g.club === club);
      if (existing) {
        // 更新已有群
        const updatedMembers = Array.from(new Set([...existing.members, ...newMembers]));
        return prev.map(g => g.club === club ? { ...g, members: updatedMembers } : g);
      } else {
        // 新建群
        return [...prev, { club, members: newMembers }];
      }
    });
  };

  return (
    <GroupChatContext.Provider value={{ groupChats, addToGroupChat }}>
      {children}
    </GroupChatContext.Provider>
  );
}
