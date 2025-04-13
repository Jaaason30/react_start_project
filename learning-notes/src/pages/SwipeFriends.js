import React, { useState } from "react";
import UserCard from "../components/UserCard";
import { useNavigate } from "react-router-dom";

const mockUsers = [
  {
    id: 1,
    name: "Alice",
    bio: "热爱旅行和猫咪",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 2,
    name: "Bob",
    bio: "健身达人 & 咖啡控",
    avatar: "https://randomuser.me/api/portraits/men/35.jpg",
  },
  {
    id: 3,
    name: "Carol",
    bio: "科技女神 & 美食家",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: 4,
    name: "David",
    bio: "爱看纪录片，喜欢滑雪",
    avatar: "https://randomuser.me/api/portraits/men/64.jpg",
  },
  {
    id: 5,
    name: "Eva",
    bio: "甜品控，擅长钢琴",
    avatar: "https://randomuser.me/api/portraits/women/23.jpg",
  },
  {
    id: 6,
    name: "Frank",
    bio: "历史迷 + 摄影师",
    avatar: "https://randomuser.me/api/portraits/men/78.jpg",
  },
  {
    id: 7,
    name: "Grace",
    bio: "UI 设计师，喜欢画画",
    avatar: "https://randomuser.me/api/portraits/women/15.jpg",
  },
  {
    id: 8,
    name: "Henry",
    bio: "程序员，喜爱冒险游戏",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    id: 9,
    name: "Irene",
    bio: "瑜伽教练和健康饮食爱好者",
    avatar: "https://randomuser.me/api/portraits/women/35.jpg",
  },
  {
    id: 10,
    name: "Jack",
    bio: "篮球粉 + 电影收藏家",
    avatar: "https://randomuser.me/api/portraits/men/52.jpg",
  },
];

const SwipeFriends = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(mockUsers);
  const [swiped, setSwiped] = useState([]);

  const currentUser = users[0];

  const handleSwipe = (user, action) => {
    setSwiped((prev) => [...prev, { ...user, status: action }]);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  return (
    <div style={styles.container}>
      <h2>👥 交友配对</h2>

      {currentUser ? (
        <>
          <UserCard user={currentUser} />

          <div style={styles.buttons}>
            <button onClick={() => handleSwipe(currentUser, "跳过 👋")} style={styles.skip}>
              跳过
            </button>
            <button onClick={() => handleSwipe(currentUser, "喜欢 ❤️")} style={styles.like}>
              喜欢
            </button>
          </div>

          <button onClick={() => navigate("/")} style={styles.back}>
            返回首页
          </button>
        </>
      ) : (
        <p>🎉 没有更多用户啦！</p>
      )}

      <div style={styles.dbSection}>
        <h3>📦 模拟数据库状态</h3>
        {swiped.length === 0 ? (
          <p>暂无记录</p>
        ) : (
          <ul>
            {swiped.map((user) => (
              <li key={user.id}>
                {user.name} — <strong>{user.status}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "400px",
    margin: "0 auto",
    textAlign: "center",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "15px",
    marginBottom: "25px",
  },
  like: {
    padding: "8px 16px",
    backgroundColor: "#ff4d4d",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  skip: {
    padding: "8px 16px",
    backgroundColor: "#ccc",
    color: "black",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  dbSection: {
    marginTop: "30px",
    textAlign: "left",
  },
  back: {
    marginTop: "10px",
    padding: "8px 12px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default SwipeFriends;
