"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type Incident = {
  id: string;
  type: string;
  location: string;
  severity: 1 | 2 | 3 | 4 | 5;
  status: "Assessing" | "Active" | "Resolved";
  time: string;
  description: string;
};

type MockContextType = {
  incidents: Incident[];
  addIncident: (incident: Incident) => void;
  updateIncidentStatus: (id: string, status: Incident["status"]) => void;
  triggerSimulation: () => void;
};

const MockContext = createContext<MockContextType | undefined>(undefined);

const initialIncidents: Incident[] = [
  {
    id: "INC-001",
    type: "Fire Alarm",
    location: "Kitchen - Floor 1",
    severity: 5,
    status: "Active",
    time: "10:02 AM",
    description: "Smoke detected in main kitchen area.",
  },
  {
    id: "INC-002",
    type: "Medical Emergency",
    location: "Room 412 - Floor 4",
    severity: 4,
    status: "Assessing",
    time: "10:15 AM",
    description: "Guest reported feeling dizzy and short of breath.",
  },
];

export const MockProvider = ({ children }: { children: React.ReactNode }) => {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);

  const addIncident = (incident: Incident) => {
    setIncidents((prev) => [incident, ...prev]);
  };

  const updateIncidentStatus = (id: string, status: Incident["status"]) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status } : inc))
    );
  };

  const triggerSimulation = () => {
    const newIncident: Incident = {
      id: `INC-SIM-${Math.floor(Math.random() * 1000)}`,
      type: "Security Breach",
      location: `Lobby - Floor 1`,
      severity: 5,
      status: "Active",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: "Unauthorized access detected at the main entrance.",
    };
    addIncident(newIncident);
  };

  return (
    <MockContext.Provider value={{ incidents, addIncident, updateIncidentStatus, triggerSimulation }}>
      {children}
    </MockContext.Provider>
  );
};

export const useMockData = () => {
  const context = useContext(MockContext);
  if (!context) {
    throw new Error("useMockData must be used within a MockProvider");
  }
  return context;
};
