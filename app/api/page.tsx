"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "antd";
import toast from "react-hot-toast";


const ApiDocPage = () => {

    const {user} = useAuth()
  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans w-full">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          📘 API Documentation - Send WhatsApp Message
        </h1>
        {/* API Key Generation Section */}
        <section className="mb-6">
          <div className="flex gap-2 mb-2 items-center">
            <h2 className="text-xl font-semibold text-gray-700">
              🔑 Generate API Key
            </h2>
            <Button
              color="purple"
              variant="solid"
              size="middle"
              className="ml-2"
              type="primary"
              onClick={() => {
                // Generate a random API key

                const tokenValue = user?.data?.user?.token;
                if(!tokenValue) return 
                else{

                    navigator.clipboard.writeText(tokenValue);
                    toast.success("Copied to clipboard!")
                }

                // Update UI with new API key
                const keyElement = document.getElementById("apiKey");
                if (keyElement) {
                  keyElement.textContent = tokenValue;
                }
              }}
            >
              Generate
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-sm text-gray-600 mb-2">Your API Key:</p>
              <div className="flex items-center gap-2">
                <code id="apiKey" className="font-mono text-sm text-gray-800 break-all">
                  No API key generated yet
                </code>
                <button
                  onClick={() => {
                    const keyElement = document.getElementById("apiKey");
                    if (keyElement) {
                      navigator.clipboard.writeText(
                        keyElement.textContent || ""
                      );
                    }
                  }}
                  className="text-blue-500 hover:text-blue-600"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Endpoint */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            📌 Endpoint
          </h2>
          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm text-gray-800">
            POST http://localhost:8080/api/v1/wp/sendSingle
          </div>
        </section>

        {/* Headers */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            🧾 Headers
          </h2>
          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm text-gray-800">
            Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ96151
          </div>
        </section>

        {/* Request Body */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            📦 Request Body (JSON)
          </h2>
          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm text-gray-800 whitespace-pre">
            {`{
  "number": "911234567890",
  "message": "Hello from MSG Zone",
  "deviceId": "business"
}`}
          </div>
        </section>

        {/* Example cURL */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            🧪 Example cURL
          </h2>
          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm text-gray-800 whitespace-pre overflow-x-auto">
            {`curl -X POST http://localhost:8080/api/v1/wp/sendSingle \\
  -H "Authorization: Bearer eyJhbGciOi..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "number": "916389055071",
    "message": "Hello from ZRF!",
    "deviceId": "business"
}'`}
          </div>
        </section>

        {/* Success Response */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            ✅ Success Response
          </h2>
          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm text-gray-800 whitespace-pre">
            {`{
  "status": "success",
  "message": "Message sent successfully!"
}`}
          </div>
        </section>

        {/* Error Response */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            ❌ Error Response
          </h2>
          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm text-gray-800 whitespace-pre">
            {`{
  "status": "error",
  "message": "Invalid token or missing field"
}`}
          </div>
        </section>

        <footer className="text-center text-gray-500 mt-8 text-sm">
          🔐 Make sure your token is valid. Use a valid deviceId like{" "}
          <strong>"business"</strong>.
        </footer>
      </div>
    </div>
  );
};

export default ApiDocPage;
