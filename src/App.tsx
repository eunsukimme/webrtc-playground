import { useEffect, useRef, useState } from "react";

async function openMediaDevices(constraints: MediaStreamConstraints) {
  return await navigator.mediaDevices.getUserMedia(constraints);
}

// Fetch an array of devices of a certain type
async function getConnectedDevices(type: MediaDeviceKind) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === type);
}

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameras, setCameras] = useState<{ label: string; value: string }[]>(
    []
  );

  // Updates the select element with the provided set of cameras
  function updateCameraList(cameras: MediaDeviceInfo[]) {
    setCameras(
      cameras.map((camera) => ({
        label: camera.label,
        value: camera.deviceId,
      }))
    );
  }

  // devicechange event handler
  async function handleChangeCamera() {
    const newCameraList = await getConnectedDevices("videoinput");
    updateCameraList(newCameraList);
  }

  useEffect(() => {
    (async () => {
      try {
        const stream = await openMediaDevices({
          video: { width: 640, height: 480 },
          audio: true,
        });
        console.log("Got MediaStream:", stream);
        console.log("MediaStream.getTracks()", stream.getTracks());
        console.log(
          "Audio MediaStreamTrack.getSetting()",
          stream.getAudioTracks()[0].getSettings()
        );
        console.log(
          "Video MediaStreamTrack.getSetting()",
          stream.getVideoTracks()[0].getSettings()
        );
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    })();
  }, []);

  useEffect(() => {
    handleChangeCamera();

    // Listen for changes to media devices and update the list accordingly
    navigator.mediaDevices.addEventListener("devicechange", handleChangeCamera);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleChangeCamera
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Set up an asynchronous communication channel that will be
    // used during the peer connection setup
    const signalingChannel = new WebSocket("ws://localhost:4000");

    // Connection opened
    signalingChannel.addEventListener("open", function (event) {
      console.log(event);
    });

    // Listen for messages
    signalingChannel.addEventListener("message", function (event) {
      console.log("Message from server ", event.data);
    });
  }, []);

  return (
    <div>
      <h1>Web RTC Test</h1>
      <video ref={videoRef} autoPlay playsInline controls={false} />
      <ul>
        {cameras.map((camera) => (
          <li key={camera.value}>{camera.label}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
