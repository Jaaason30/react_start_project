import React, { useEffect, useState, useRef } from "react";

const CountdownTimer = () => {
  const [inputSeconds, setInputSeconds] = useState(60);
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [running, seconds]);

  const handleStart = () => {
    setSeconds(inputSeconds);
    setRunning(true);
  };

  const handlePauseResume = () => {
    if (seconds === 0) {
      setSeconds(inputSeconds); // 重新开始
    }
    setRunning((prev) => !prev);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>⏱️ 倒计时</h3>

      <div style={styles.timeDisplay}>
        {seconds}s
      </div>

      <div style={styles.controls}>
        <input
          type="number"
          min="1"
          value={inputSeconds}
          onChange={(e) => setInputSeconds(Number(e.target.value))}
          disabled={running}
          style={styles.input}
        />
        <button
          onClick={handleStart}
          disabled={running}
          style={styles.button}
        >
          设置并开始
        </button>
        <button
          onClick={handlePauseResume}
          disabled={seconds === 0}
          style={{ ...styles.button, backgroundColor: "#f0ad4e" }}
        >
          {running ? "暂停" : "继续"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    width: "260px",
    textAlign: "center",
    backgroundColor: "#fafafa",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },
  title: {
    margin: "0 0 10px 0",
    fontSize: "18px"
  },
  timeDisplay: {
    fontSize: "36px",
    marginBottom: "10px",
    fontWeight: "bold",
    color: "#333"
  },
  controls: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  input: {
    padding: "5px 10px",
    fontSize: "16px",
    textAlign: "center"
  },
  button: {
    padding: "6px 10px",
    fontSize: "16px",
    backgroundColor: "#5cb85c",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  }
};

export default CountdownTimer;
