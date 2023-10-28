// NOTE: xu li manual
import logo from "./logo.svg";
import "./App.css";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";

function App() {
  const [users, setUsers] = useState(null);
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
        setIsLastCallSuccess(true)
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleGetListUser = () => {
    axios
      .get("http://localhost:8000/users", {
        headers: {
          Authorization: localStorage.getItem("accessToken"),
        },
      })
      .then((res) => {
        setUsers(res.data);
        setIsLastCallSuccess(true)
      })
      .catch((err) => {
        setIsLastCallSuccess(false)
        setUsers(null)
        alert(err);
      });
  };

  return (
    <div className="App">
      <button onClick={handleLogin}>Login</button>
      <div
        style={{ wordBreak: "break-word", color: isLastCallSuccess ? 'green' : 'red' }}
      >{`Current AccessToken ${localStorage.getItem("accessToken")}`}</div>
      <div>================================================</div>
      <button onClick={handleGetListUser}>Get List User</button>
      <div>{users && users.map((user) => <p>{user.username}</p>)}</div>
    </div>
  );
}

export default App;
