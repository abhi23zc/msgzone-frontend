"use client";
import React, { useEffect, useState } from "react";
import { Avatar, Divider, List, Skeleton } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import { useWhatsapp } from "@/context/WhatsappContext";

const PAGE_SIZE = 10;

const MessageList: React.FC = () => {
  const { loading,getTodayMessages , todayMessages, getTodayMessagesCount, getAllMessagesCount} = useWhatsapp();
  const [uniqueSortedMessages, setUniqueSortedMessages] = useState<any[]>([]);
  const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  // Deduplicate and sort messages when allMessages change
  // useEffect(() => {
  //   if (Array.isArray(allMessages) && allMessages.length > 0) {
  //     const messageMap = new Map<string, any>();
  //     allMessages.forEach((msg) => {
  //       if (msg && msg._id && !messageMap.has(msg._id)) {
  //         messageMap.set(msg._id, msg);
  //       }
  //     });
  //     // Convert map back to array and sort by date descending
  //     const sortedMessages = Array.from(messageMap.values()).sort(
  //       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  //     );
  //     setUniqueSortedMessages(sortedMessages);
  //     setDisplayedMessages(sortedMessages.slice(0, PAGE_SIZE)); // initial page
  //     setPage(1);
  //   } else {
  //     setUniqueSortedMessages([]);
  //     setDisplayedMessages([]);
  //   }
  // }, [allMessages]);

  useEffect(() => {
    setDisplayedMessages(todayMessages)
  },[todayMessages])

  useEffect(() => {
    getTodayMessages()
    getTodayMessagesCount();
    getAllMessagesCount();
    
    
  }, []);

  const loadMoreData = () => {
    if (loading) return;

    const nextPage = page + 1;
    const nextMessages = uniqueSortedMessages.slice(0, nextPage * PAGE_SIZE);

    setDisplayedMessages(nextMessages);
    setPage(nextPage);
  };

  return (
    <div
      id="scrollableDiv"
      style={{
        height: 500,
        overflow: "auto",
        padding: "0 16px",
        background: "transparent",
      }}
      className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300 transition-all duration-300"
    >
      <InfiniteScroll
        dataLength={displayedMessages.length}
        next={loadMoreData}
        hasMore={displayedMessages.length < uniqueSortedMessages.length}
        loader={
          <div className="py-4 animate-fade-in">
            <Skeleton avatar paragraph={{ rows: 1 }} active />
          </div>
        }
        endMessage={
          <div className="py-4 text-center">
            <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span>No more messages to load</span>
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            </div>
          </div>
        }
        scrollableTarget="scrollableDiv"
      >
        <List
          dataSource={displayedMessages}
          renderItem={(item) => (
            item && (
              <List.Item 
                key={item._id} 
                className="hover:bg-white/50 backdrop-blur-sm transition-all duration-300 rounded-lg my-2 group"
              >
                <List.Item.Meta
                  avatar={
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                      <Avatar
                        style={{
                          backgroundColor: item.sendFrom === "business" ? "#10B981" : "#3B82F6",
                        }}
                        className="relative z-10 shadow-sm group-hover:shadow-md transition-all duration-300"
                      >
                        {item.sendFrom && item.sendFrom[0] ? item.sendFrom[0].toUpperCase() : '?'}
                      </Avatar>
                    </div>
                  }
                  title={
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                        {item.sendFrom || 'Unknown'} → {item.sendTo || 'Unknown'}
                      </span>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-300 ${
                        item.status === "delivered" 
                          ? "bg-green-100 text-green-700 group-hover:bg-green-200" 
                          : "bg-red-100 text-red-700 group-hover:bg-red-200"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  }
                  description={
                    <div className="mt-1">
                      <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">
                        {Array.isArray(item?.text?.split(' ')) && 
                         item.text.split(' ').length > 30
                          ? item.text.split(' ').slice(0, 30).join(' ') + '...'
                          : item.text}
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block group-hover:text-gray-500 transition-colors duration-300">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  }
                />
              </List.Item>
            )
          )}
        />
      </InfiniteScroll>
    </div>
  );
};

export default MessageList;
