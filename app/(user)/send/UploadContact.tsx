"use client";

import { Input, Tag, Tooltip } from "antd";
import { CloseOutlined, PhoneOutlined } from "@ant-design/icons";
import { useState } from "react";

export interface ContactRow {
  number: string;
  [key: string]: string;
}

interface Props {
  value?: string[];
  onChange?: (val: string[]) => void;
  messageContent?: string;
  onContactsLoaded?: (data: { headers: string[]; contacts: ContactRow[] }) => void;
}

const MAX_VISIBLE_TAGS = 3;

export default function PhoneUploaderInput({ value = [], onChange, messageContent = "", onContactsLoaded }: Props) {
  const numbers = value;
  const [inputValue, setInputValue] = useState("");

  const triggerChange = (newTags: string[]) => {
    onChange?.(newTags);
  };

  const addNumber = (num: string) => {
    const trimmed = num.trim().replace(/[()\s.-]/g, "");
    if (/^\+?\d{7,15}$/.test(trimmed)) {
      triggerChange([...numbers, trimmed]);
    }
  };

  const handleInputConfirm = (e: any) => {
    const inputVal = e.target.value.trim();
    if (!inputVal) return;
    addNumber(inputVal);
    setInputValue("");
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text");
    const parts = pasteData.split(/[\s,]+/);
    const validNumbers = parts.filter((p) => /^\+?\d{7,15}$/.test(p));
    if (validNumbers.length) {
      triggerChange([...numbers, ...validNumbers]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleInputConfirm(e);
    }
  };

  const removeNumber = (indexToRemove: number) => {
    const newValues = numbers.filter((_, idx) => idx !== indexToRemove);
    triggerChange(newValues);
  };

  const visibleTags = numbers.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = numbers.length - MAX_VISIBLE_TAGS;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 min-w-0">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputConfirm}
          onPaste={handlePaste}
          placeholder="Enter or paste WhatsApp numbers..."
          prefix={<PhoneOutlined className="text-gray-400" />}
          className="h-10 text-base min-w-0 w-full"
        />
      </div>

      {numbers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
          {visibleTags.map((num, index) => (
            <Tag
              key={index + "-" + num}
              closable
              closeIcon={<CloseOutlined />}
              onClose={() => removeNumber(index)}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-700 border-blue-200"
            >
              {num}
            </Tag>
          ))}
          {hiddenCount > 0 && (
            <Tooltip title={numbers.slice(MAX_VISIBLE_TAGS).join(", ")}>
              <Tag className="px-3 py-1 text-sm bg-gray-50 text-gray-700 border-gray-200">
                +{hiddenCount} more
              </Tag>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}
