"use client";

import { Input, Tag, Tooltip, Upload } from "antd";
import { CloseOutlined, InboxOutlined, PhoneOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useState } from "react";
import { UploadIcon } from "lucide-react";

interface Props {
  value?: string[];
  onChange?: (val: string[]) => void;
  messageContent?: string;
}

const MAX_VISIBLE_TAGS = 3;

export default function PhoneUploaderInput({ value = [], onChange, messageContent = "" }: Props) {
  const numbers = value;
  const [inputValue, setInputValue] = useState("");

  const triggerChange = (newTags: string[]) => {
    onChange?.(newTags);
  };

  const addNumber = (num: string) => {
    const trimmed = num.trim();
    if (/^\d+$/.test(trimmed)) {
      triggerChange([...numbers, trimmed]);
    }
  };

  const handleInputConfirm = (e: any) => {
    const inputVal = e.target.value.trim();
    if (!inputVal) return;
    addNumber(inputVal);
    setInputValue("")
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text");
    const parts = pasteData.split(/[\s,]+/);
    const validNumbers = parts.filter((p) => /^\d+$/.test(p));
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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split(".").pop()?.toLowerCase();
    if (fileType === "xlsx" || fileType === "xls") {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const extracted: string[] = [];
      jsonData.forEach((row: any) => {
        row.forEach((cell: any) => {
          const match = `${cell}`.match(/\d{10,}/g);
          if (match) extracted.push(...match);
        });
      });

      triggerChange([...numbers, ...extracted]);
    } else if (fileType === "txt") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const matches = content.match(/\d{10,}/g) || [];
        triggerChange([...numbers, ...matches]);
      };
      reader.readAsText(file);
    }
  };

  const visibleTags = numbers.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = numbers.length - MAX_VISIBLE_TAGS;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputConfirm}
          onPaste={handlePaste}
          placeholder="Enter or paste WhatsApp numbers..."
          prefix={<PhoneOutlined className="text-gray-400" />}
          className="h-10 text-base"
        />
        
        <Upload
          accept=".xlsx,.xls,.txt"
          showUploadList={false}
          beforeUpload={(file) => {
            handleFile({ target: { files: [file] } } as any);
            return false;
          }}
          className="flex-1"
        >
          <div className="p-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer transition-all ">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                <UploadIcon className="text-blue-500 w-5 h-5" />
              </div>
              <span className="text-gray-700 font-medium group-hover:text-blue-600">Upload Contacts</span>
            </div>
          </div>
        </Upload>
      </div>

      {numbers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
          {visibleTags.map((num, index) => (
            <Tag
              key={index + "-" + num + Math.random()}
              closable
              closeIcon={<CloseOutlined />}
              onClose={() => removeNumber(index)}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-700 border-blue-200"
            >
              {num}
            </Tag>
          ))}
          {hiddenCount > 0 && (
            <Tooltip title={numbers.slice(MAX_VISIBLE_TAGS).join(",")}>
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
