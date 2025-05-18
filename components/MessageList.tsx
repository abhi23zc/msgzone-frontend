"use client";
import React, { useEffect, useState } from "react";
import { Avatar, Divider, List, Skeleton } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import { useWhatsapp } from "@/context/WhatsappContext";

const MessageList: React.FC = () => {
  const { loading, getAllMessages, allMessages } = useWhatsapp();
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const loadMoreData = () => {
    if (loading) {
      return;
    }
  };

  //  Implement better logic for this 
  useEffect(() => {
    if (allMessages.length > 0) {
      // Remove duplicates by _id and keep only the first occurrence
      const uniqueMessages = allMessages.reduce<typeof allMessages>((acc, current) => {
        const exists = acc.find((item) => item._id === current._id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Sort unique messages by creation date
      const sortedMessages = [...uniqueMessages].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setData(sortedMessages);
    }
  }, [allMessages]);

  useEffect(() => {
    getAllMessages();
  }, []);

  useEffect(() => {
    loadMoreData();
  }, []);

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
        dataLength={data.length}
        next={loadMoreData}
        hasMore={data.length < 50}
        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List
          dataSource={data}
          renderItem={(item) => (
            <List.Item key={item._id}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor:
                        item.sendFrom === "business" ? "#87d068" : "#1890ff",
                    }}
                  >
                    {item.sendFrom[0].toUpperCase()}
                  </Avatar>
                }
                title={`From: ${item.sendFrom} To: ${item.sendTo}`}
                description={
                  <>
                    <div>{item.text}</div>
                    <small>{new Date(item.createdAt).toLocaleString()}</small>
                  </>
                }
              />
              <div
                style={{
                  padding: "0 8px",
                  color: item.status === "delivered" ? "#87d068" : "#666",
                }}
              >
                {item.status}
              </div>
            </List.Item>
          )}
        />
      </InfiniteScroll>
    </div>
  );
};

export default MessageList;
