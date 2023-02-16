import React, { CSSProperties, useState } from 'react'
import { AxiosResponse, AxiosError } from "axios";
import Cookies from 'js-cookie'
import axios from "../../axios";
import '../Login.css'
import { useNavigate } from 'react-router';

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isGood, setIsGood] = useState(false);
  const [isVisible, setIsVisible] = useState<string>("hidden");
  const navigate = useNavigate();

  var handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios
      .post("/auth/login", {
        username: username,
        password: password,
      })
      .then((res : AxiosResponse) => {
        Cookies.set("access_token", res.data.access_token, { expires: 1 });
        setUsername("");
        setPassword("");
        setIsGood(true);
        navigate("/");
      })
      .catch((err : AxiosError) => {
        if (err.response) {
          setIsGood(false);
        }
      });
    setIsVisible("visible");
  };

  return (
    <div>
      <form id="form-login" method="post" onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          type="text"
          name="name"
          id="name"
          required
        />
        <input
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          name="password"
          id="password"
          required
        />
        {isGood ? (
          <p
            className="text-green"
            style={
              {
                visibility: isVisible,
                color: "green",
              } as CSSProperties
            }
          >
            Success, try to connect!
          </p>
        ) : (
          <p
            className="text-red"
            style={
              {
                visibility: isVisible,
                color: "red",
              } as CSSProperties
            }
          >
            Failure! Try again.
          </p>
        )}
        <button form="form-login">Sign Up</button>
      </form>
    </div>
  );
}

export default LoginForm;
