"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;

    if (!email) {
      alert('Please Enter Email');
      return;
    } else if (!password) {
      alert('Please Enter Password');
      return;
    }

    try {
      const url = "http://localhost:8080/auth/login";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginInfo),
      });

      const result = await response.json();
      const { success, message, jwtToken, name, error } = result;

      if (success) {
        alert(message);
        localStorage.setItem('jwtToken',jwtToken);
        localStorage.setItem('loggedInUser',name);

        window.location.href = "/geospatial-app";
        // Use the router to navigate
      } else if (error) {
        const details = error?.details[0].message;
        alert(details);
      } else if (!success) {
        alert(message);
      }
    } catch (err) {
      console.log(err, "Error Occurred");
    }
  };
  useEffect(() => {
    // This useEffect makes sure nothing unexpected happens on the client side
  }, []);

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h2>Welcome, User!</h2>
      <p>Please log in</p>
      <input 
        type="email" 
        name="email" 
        placeholder="Please Enter Your Email" 
        onChange={handleChange} 
        value={loginInfo.email} 
        required 
      />
      <input 
        type="password" 
        name="password" 
        placeholder="Password" 
        onChange={handleChange} 
        value={loginInfo.password} 
        required 
      />
      <input type="submit" value="Log In" />
      <div className="links">
        <Link href="/Register">
          Register
        </Link>
      </div>
    </form>
  );
}
