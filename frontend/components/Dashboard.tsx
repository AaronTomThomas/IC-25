import React, { useState } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer, LineLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl/maplibre";
import axios from "axios";
import BoroughDeploymentView from "./BoroughDeploymentView";
import { CSSTransition, TransitionGroup } from "react-transition-group";

interface Message {
  id: string;
  lat: number;
  lng: number;
  crime: string;
  severity: number;
}

const MessageBox = ({ messages }: { messages: Message[] }) => {
  return (
    <>
      <div
        style={{
          background: "rgba(50, 50, 50, 0.9)",
          padding: "20px",
          width: "100%",
          colour: "#fff",
          borderRadius: "12px",
          marginTop: "20px",
          height: "100px",
          maxHeight: "100px",
          overflowY: "auto",
          scrollbarWidth: "none", // For Firefox
          msOverflowStyle: "none", // For Internet Explorer and Edge
        }}
      >
        <h4>Messages</h4>
        <TransitionGroup
          component="ul"
          style={{
            listStyleType: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {messages.map((message, index) => (
            <CSSTransition key={index} timeout={500} classNames="fade">
              <li
                style={{
                  marginBottom: "10px",
                  background: message.severity === 0 ? "red" : "#007bff",
                  padding: "10px",
                  borderRadius: "5px",
                  colour: "#fff",
                }}
              >
                {message.crime} - {new Date(message.id).toLocaleString()}
              </li>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
      <style jsx>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        div::-webkit-scrollbar {
          display: none;
        }
        /* Animation for message fade in/out */
        .fade-enter {
          opacity: 0;
          transform: translateY(20px);
        }
        .fade-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 500ms, transform 500ms;
        }
        .fade-exit {
          opacity: 1;
          transform: translateY(0);
        }
        .fade-exit-active {
          opacity: 0;
          transform: translateY(-20px);
          transition: opacity 500ms, transform 500ms;
        }
      `}</style>
    </>
  );
};

const Dashboard = ({
  pings,
  handleAddPing,
  handleBoroughChange,
  selectedBorough,
  boroughs,
  selectedTime,
  setSelectedTime,
  handlePredictionResponse,
  handlePredict,
  addMessage,
  deployments, 
}) => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [crimeType, setCrimeType] = useState("");

  return (
    <>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        background: "rgba(30, 30, 30, 0.9)",
        padding: "20px",
        color: "#fff",
        position: "absolute",
        height: "20%",
        bottom: "10%",
        width: "80%",
        left: "2.5%",
        borderRadius: "12px",
      }}
    >
      
      <div style={{ flex: 1, marginRight: "50px" }}>
        <h3>Dashboard</h3>
        
        <label style={{ display: "flex", margin: "1rem 0", width: "100%" }}>
          Select Time of Day: {selectedTime}:00
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={selectedTime}
            onChange={(e) => setSelectedTime(parseInt(e.target.value, 10))}
            style={{ width: "100%" }}
          />
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
          <button
            onClick={handleAddPing}
            style={{
              padding: "10px 20px",
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              transition: "background 0.3s ease",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#0056b3")}
            onMouseOut={(e) => (e.currentTarget.style.background = "red")}
          >
            Ping Map
          </button>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
              color: "#ccc",
            }}
          >
            Borough:
            <select
              onChange={handleBoroughChange}
              value={selectedBorough || ""}
              style={{
                marginLeft: "10px",
                padding: "5px",
                borderRadius: "5px",
                border: "1px solid #555",
                background: "#333",
                color: "#fff",
              }}
            >
              <option value="">All</option>
              {Object.keys(boroughs).map((borough) => (
                <option key={borough} value={borough}>
                  {borough}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <MessageBox messages={pings} />
      <BoroughDeploymentView deployments={deployments} />
    </div></>
  );
};

export { Dashboard };