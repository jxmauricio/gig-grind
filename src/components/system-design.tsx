"use-client";
import React, { useEffect } from "react";
import Message from "./message";
type Props = {
  dataChannel: RTCDataChannel | null;
  startSession: () => void;
  isSessionActive: boolean;
  aiResponse: string | null;
  sessionReady: boolean;
  chatLog: string[];
};
export function SystemDesign({
  dataChannel,
  startSession,
  isSessionActive,
  aiResponse,
  sessionReady,
  chatLog,
}: Props) {
  useEffect(() => {
    const responseCreate = {
      type: "response.create",
      response: {
        modalities: ["text", "audio"],
        instructions:
          "You are interviewing a Software Engineer for a system design interview. Simulate a system design interview.",
      },
    };

    if (sessionReady) {
      dataChannel!.send(JSON.stringify(responseCreate));
    }
  }, [sessionReady]);
  return (
    <div className="border-green-600 border rounded">
      <button
        className="text-blue-600 border rounded border-blue-600 "
        onClick={startSession}
      >
        Start System Design Interview
      </button>
      <ul className="space-y-12 grid grid-cols-1 border-indigo-600">
        {chatLog.map((item, index) => (
          <Message key={index} message={item} />
        ))}
      </ul>
    </div>
  );
}
