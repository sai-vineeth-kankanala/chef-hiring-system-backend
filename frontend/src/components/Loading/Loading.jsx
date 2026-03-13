import React from "react";
import "./Loading.css";
import Navbar from "../Navbar/Navbar";

const Loading = () => {
  return (
    <>
      <Navbar />

      <h1 class="loading-h1">Cooking in progress</h1>
      <div id="cooking">
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div id="area">
          <div id="sides">
            <div id="pan"></div>
            <div id="handle"></div>
          </div>
          <div id="pancake">
            <div id="pastry"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;
