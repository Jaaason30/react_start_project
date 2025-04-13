import React from "react";
import { Link } from "react-router-dom";

const NoteItem = ({ note }) => {
  return (
    <li>
      <Link to={`/note/${note.id}`}>{note.title}</Link>
    </li>
  );
};

export default NoteItem;
