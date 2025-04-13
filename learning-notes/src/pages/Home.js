import React from "react";
import notes from "../data";
import NoteItem from "../components/NoteItem";
import { useNavigate } from "react-router-dom";
import CountdownTimer from "../components/CountdownTimer";// ✅ 引入计时器

const Home = () => {
  const navigate = useNavigate();  
  return (
    <div>
      <h1> 我的学习笔记</h1>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <strong>计时器：</strong>
        <CountdownTimer />
        <button onClick={() => navigate("/swipe")} style={styles.matchBtn}>
        💘 开始配对
      </button>
      </div>
      <ul>
        {notes.map((note) => (
          <NoteItem key={note.id} note={note} />
        ))}
      </ul>
    </div>
  );
};
const styles = {
    container: {
      padding: "20px",
      maxWidth: "600px",
      margin: "0 auto",
      textAlign: "center",
    },
    matchBtn: {
      marginTop: "30px",
      padding: "12px 24px",
      fontSize: "18px",
      backgroundColor: "#ff69b4",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
  };
export default Home;
