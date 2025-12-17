"use client";

import { useEffect, useRef, useState } from "react";

export default function SerialConsole() {
  const [connected, setConnected] = useState(false);
  const [port, setPort] = useState<SerialPort | null>(null);
  const [baud, setBaud] = useState(9600);
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [output]);

  const connectSerial = async () => {
    try {
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: baud });

      setPort(selectedPort);
      setConnected(true);
      setOutput((prev) => [...prev, "✔ Đã kết nối Arduino"]);

      const decoder = new TextDecoder();
      const reader = selectedPort.readable!.getReader();
      readerRef.current = reader;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          const text = decoder.decode(value);
          const lines = text.split("\n").map((x) => x.trim());
          setOutput((prev) => [...prev, ...lines]);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setOutput((prev) => [...prev, "❌ Lỗi: " + message]);
    }
  };

  const sendData = async () => {
    if (!port || !input) return;

    const writer = port.writable!.getWriter();
    await writer.write(new TextEncoder().encode(input + "\n"));
    writer.releaseLock();

    setOutput((prev) => [...prev, `> ${input}`]);
    setInput("");
  };

  const disconnect = async () => {
    if (!port) return;

    setOutput((prev) => [...prev, "⚠ Đang ngắt kết nối..."]);

    const reader = readerRef.current;
    if (reader) {
      try {
        await reader.cancel();
      } catch {}
      try {
        reader.releaseLock();
      } catch {}
    }
    readerRef.current = null;

    try {
      await port.close();
      setConnected(false);
      setPort(null);
      setOutput((prev) => [...prev, "✔ Đã ngắt kết nối"]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setOutput((prev) => [...prev, "❌ Lỗi khi ngắt kết nối: " + message]);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Arduino Serial Console</h1>

      {/* Control area */}
      <div className="flex items-center gap-3 mb-4">
        <select
          className="border px-3 py-1 rounded"
          onChange={(e) => setBaud(Number(e.target.value))}
          value={baud}
        >
          <option value={9600}>9600</option>
          <option value={115200}>115200</option>
        </select>

        {!connected ? (
          <button
            onClick={connectSerial}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Kết nối
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Ngắt
          </button>
        )}
      </div>

      {/* Console */}
      <div
        ref={scrollRef}
        className="bg-black text-green-400 p-3 rounded h-80 overflow-auto font-mono text-sm"
      >
        {output.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>

      {/* Input for sending commands */}
      {connected && (
        <div className="flex mt-4 gap-2">
          <input
            className="border p-2 flex-1 rounded"
            placeholder="Gõ lệnh gửi xuống Arduino..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendData()}
          />
          <button
            onClick={sendData}
            className="px-4 bg-blue-600 text-white rounded"
          >
            Gửi
          </button>
        </div>
      )}
    </div>
  );
}
