import React, { useEffect, useState, useRef } from "react";

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [running]);

  const toggleRunning = () => {
    setRunning(prev => !prev);
  };

  return (
    <div>
      <p>⏱️ 已学习：{seconds} 秒</p>
      <button onClick={toggleRunning}>
        {running ? "暂停" : "继续"}
      </button>
    </div>
  );
};

export default Timer;
