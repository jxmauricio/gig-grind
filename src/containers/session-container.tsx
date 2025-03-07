"use client";
import { useEffect, useRef, useState } from "react";
import { SystemDesign } from "../components/system-design";
export default function SessionContainer() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  // const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const peerConnection = useRef<RTCPeerConnection>(null);
  const audioElement = useRef<HTMLAudioElement>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState<boolean>(false);
  const [realTimeResponse, setRealtimeResponse] = useState<string>("");
  const [deltaResponse, setDetltaResponse] = useState<string>("");
  const [chatLog, setChatLog] = useState<string[]>([
    "hello JOhn",
    "How are you feeling about your interview?",
    "thats good",
  ]);
  useEffect(() => {
    function handleEvent(e: MessageEvent) {
      const serverEvent = JSON.parse(e.data);
      console.log(serverEvent);
      if (serverEvent.type == "session.created") {
        setSessionReady(true);
      }
      if (serverEvent.type === "response.audio_transcript.delta") {
        if (serverEvent.delta) {
          console.log("REALTIME", realTimeResponse + serverEvent.delta);
          setRealtimeResponse(
            (prevResponse) => prevResponse + serverEvent.delta
          );
        }
      }
      if (serverEvent.type === "response.done") {
        //grabs the actual text being sent back from the open ai model
        console.log(
          "RESPONSE DONE",
          serverEvent.response?.output[0]?.content[0]?.transcript
        );
        const fullTranscript: string =
          serverEvent.response?.output[0]?.content[0]?.transcript;
        if (fullTranscript) {
          setChatLog((prevChatLog) => prevChatLog.concat([fullTranscript]));
        }
      }
    }
    dataChannel?.addEventListener("message", handleEvent);
  }, [dataChannel]);
  const getEphemeralToken = async () => {
    // Get an ephemeral key from server
    const tokenResponse = await fetch("/api/token");
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.client_secret.value;
    console.log(EPHEMERAL_KEY);
    return EPHEMERAL_KEY;
  };
  const startSession = async () => {
    // Create a peer connection
    const pc = new RTCPeerConnection();
    const ephemeralKey = await getEphemeralToken();
    // Set up to play remote audio from the model
    //WE need an audio element with autoplay = true so that we can play the stream locally
    audioElement.current = document.createElement("audio");
    audioElement.current.autoplay = true;
    pc.ontrack = (e) => (audioElement.current!.srcObject = e.streams[0]);

    // Add local audio track for microphone input in the browser
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    console.log("This is waht a media stream looks like", mediaStream);
    console.log("media stream tracks", mediaStream.getTracks());
    pc.addTrack(mediaStream.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    setDataChannel(dc);
    // Start the session using the Session Description Protocol (SDP)
    //create the sdp offer that describes hte local peers media and connection params
    const offer = await pc.createOffer();
    console.log(offer);
    //conifgures local per with sdp offer
    await pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview-2024-12-17";
    //the offer is then sent to the remote server
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        "Content-Type": "application/sdp",
      },
    });
    //after the offer is sent then an answer is given back
    const answer = {
      type: "answer",
      sdp: await sdpResponse.text(),
    } as RTCSessionDescriptionInit;
    //we then configure the lcoal peer with the remote peers SDPO
    await pc.setRemoteDescription(answer);

    peerConnection.current = pc;
    setIsSessionActive(true);
  };

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    const sesh = isSessionActive;
    console.log(sesh);
    setDataChannel(null);
    peerConnection.current = null;
    console.log("Session Stopped");
  }
  async function addPinnedQuestion() {
    var res = await fetch("/api/pin-question");
    console.log(res);
  }
  return (
    <div>
      <SystemDesign
        dataChannel={dataChannel}
        aiResponse={aiResponse}
        isSessionActive={isSessionActive}
        startSession={startSession}
        sessionReady={sessionReady}
        chatLog={chatLog}
      ></SystemDesign>
      <button
        className="text-red-600 border rounded border-red-600 px-2"
        onClick={stopSession}
      >
        Stop Session
      </button>
    </div>
  );
}
