// This function runs only on the server side
"use client";
import SessionContainer from "@/containers/session-container";
export default function Home() {
  return (
    <div>
      <SessionContainer />
    </div>
  );
}
