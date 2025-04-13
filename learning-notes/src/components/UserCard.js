import React from "react";

const UserCard = ({ user }) => {
  return (
    <div style={styles.card}>
      <img src={user.avatar} alt={user.name} style={styles.avatar} />
      <h3>{user.name}</h3>
      <p>{user.bio}</p>
    </div>
  );
};

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    backgroundColor: "#fff",
    width: "300px",
    margin: "0 auto",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "10px",
  },
};

export default UserCard;
