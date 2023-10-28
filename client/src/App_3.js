// NOTE: xu li dung axios instance co config interceptor de refresh token va retry voi truong hop co nhieu request cung 1 luc
import logo from "./logo.svg";
import "./App.css";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import axiosInstance from "./axiosInstance";

function App() {
  const [users, setUsers] = useState(null);
  const [posts, setPosts] = useState(null);
  const [isLastCallSuccess, setIsLastCallSuccess] = useState(true);

  const handleLogin = () => {
    axios
      .post(`http://localhost:8000/login`, {
        username: "user1",
        password: "password1",
      })
      .then(function (response) {
        const { accessToken, refreshToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setIsLastCallSuccess(true);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleGetListUserAndPost = () => {
    // Promise.all([axiosInstance.get("/users"), axiosInstance.get("/posts")])
    //   .then(([res1, res2]) => {
    //     console.log("🚀 ~ file: App_3.js:34 ~ .then ~ res1:", res1)
    //     setUsers(res1.data);
    //     setPosts(res2.data);
    //     setIsLastCallSuccess(true);
    //   })
    //   .catch((err) => {
    //     setIsLastCallSuccess(false);
    //     setUsers(null);
    //     setPosts(null);
    //     alert(err);
    //   });
    axiosInstance
    .get("/posts")
    .then((res) => {
      setPosts(res.data);
      setIsLastCallSuccess(true);
    })
    .catch((err) => {
      setIsLastCallSuccess(false);
      setPosts(null);
      alert(err);
    });

    axiosInstance
      .get("/users")
      .then((res) => {
        setUsers(res.data);
        setIsLastCallSuccess(true);
      })
      .catch((err) => {
        setIsLastCallSuccess(false);
        setUsers(null);
        alert(err);
      });

  };

  return (
    <div className="App">
      <button onClick={handleLogin}>Login</button>
      <div
        style={{
          wordBreak: "break-word",
          color: isLastCallSuccess ? "green" : "red",
        }}
      >{`Current AccessToken ${localStorage.getItem("accessToken")}`}</div>
      <div>================================================</div>
      <button onClick={handleGetListUserAndPost}>Get List User & Posts</button>
      <div>{users && users.map((user) => <p>{user.username}</p>)}</div>
      <div>{posts && posts.map((post) => <p>{post.title}</p>)}</div>
    </div>
  );
}

export default App;
