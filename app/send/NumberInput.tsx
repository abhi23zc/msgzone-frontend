"use client";
import { useState } from "react";
import { Input, Tag, Tooltip } from "antd";
import { CloseOutlined } from "@ant-design/icons";

const MAX_VISIBLE_TAGS = 3;

export default function PhoneTagInput({ value = [], onChange }: any) {
  const [inputValue, setInputValue] = useState("");

  const triggerChange = (newTags: string[]) => {
    if (onChange) {
      onChange(newTags);
    }
  };

  const addNumber = (num: string) => {
    const trimmed = num.trim();
    if (/^\d+$/.test(trimmed)) {
      const updated = [...value, trimmed]; // allow duplicates
      triggerChange(updated);
    }
  };

  const handleInputConfirm = () => {
    if (!inputValue.trim()) return;
    addNumber(inputValue);
    setInputValue("");
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text");
    const parts = pasteData.split(/[\s,]+/);
    const validNumbers = parts.filter((p) => /^\d+$/.test(p));
    if (validNumbers.length) {
      triggerChange([...value, ...validNumbers]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleInputConfirm();
    }
  };

  const removeNumber = (indexToRemove: number) => {
    const newValues = value.filter(
      (_: string, idx: number) => idx !== indexToRemove
    );
    triggerChange(newValues);
  };

  const visibleTags = value.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = value.length - MAX_VISIBLE_TAGS;

  return (
    <>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleInputConfirm}
        onPaste={handlePaste}
        placeholder="Enter or paste WhatsApp numbers..."
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {visibleTags.map((num: string, index: number) => (
          <Tag
            key={index + "-" + num + Math.random()}
            closable
            closeIcon={<CloseOutlined />}
            onClose={() => removeNumber(index)}
          >
            {num}
          </Tag>
        ))}

        {hiddenCount > 0 && (
          <Tooltip title={value.slice(MAX_VISIBLE_TAGS).join(",")}>
            <Tag>+{hiddenCount}</Tag>
          </Tooltip>
        )}
      </div>
    </>
  );
}
