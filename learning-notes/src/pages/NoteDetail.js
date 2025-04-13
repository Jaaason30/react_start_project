import React from "react";
import { useParams, Link } from "react-router-dom";
import notes from "../data";

const NoteDetail = () => {
  const { id } = useParams();
  const note = notes.find((n) => n.id === parseInt(id));

  if (!note) return <p>未找到该笔记</p>;

  return (
    <div>
      <h2>{note.title}</h2>
      <p>{note.content}</p>
      <Link to="/">← 返回首页</Link>
    </div>
  );
};

export default NoteDetail;
