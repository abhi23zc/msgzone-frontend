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
        height: 400,
        overflow: "auto",
        padding: "0 16px",
        background: "white",
      }}
    >
      <InfiniteScroll
        dataLength={displayedMessages.length}
        next={loadMoreData}
        hasMore={displayedMessages.length < uniqueSortedMessages.length}
        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List
          dataSource={displayedMessages}
          renderItem={(item) => (
            item && (
              <List.Item key={item._id}>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        backgroundColor:
                          item.sendFrom === "business" ? "#87d068" : "#1890ff",
                      }}
                    >
                      {item.sendFrom && item.sendFrom[0] ? item.sendFrom[0].toUpperCase() : '?'}
                    </Avatar>
                  }
                  title={`From: ${item.sendFrom || 'Unknown'} To: ${item.sendTo || 'Unknown'}`}
                  description={
                    <>
                      <div>
                        {Array.isArray(item?.text?.split(' ')) && 
                         item.text.split(' ').length > 30
                          ? item.text.split(' ').slice(0, 30).join(' ') + '...'
                          : item.text}
                      </div>
                      <small>{new Date(item.createdAt).toLocaleString()}</small>
                    </>
                  }
                />
                <div
                  style={{
                    padding: "0 8px",
                    color: item.status === "delivered" ? "#87d068" : "#FF0000",
                  }}
                >
                  {item.status}
                </div>
              </List.Item>
            )
          )}
        />
      </InfiniteScroll>
    </div>
  );
};

export default MessageList;
