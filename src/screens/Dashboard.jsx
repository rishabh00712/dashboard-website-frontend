import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDCL7E3J7PXYlOVkAZuee9AWKdcmcqpdLs",
  authDomain: "esp32-iot-project-75fdf.firebaseapp.com",
  databaseURL: "https://esp32-iot-project-75fdf-default-rtdb.firebaseio.com",
  projectId: "esp32-iot-project-75fdf",
  storageBucket: "esp32-iot-project-75fdf.firebasestorage.app",
  messagingSenderId: "977259537662",
  appId: "1:977259537662:web:767238c95db10f90a7f1af"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function RealtimeDashboard() {
  const [deviceIds, setDeviceIds] = useState([]);
  const [deviceData, setDeviceData] = useState({});
  const [selectedDevice, setSelectedDevice] = useState('');

  useEffect(() => {
    const iotRef = ref(db, 'iot');
    onValue(iotRef, (snapshot) => {
      const devices = snapshot.val();
      if (!devices) return;

      const ids = Object.keys(devices);
      setDeviceIds(ids);
      setSelectedDevice((current) => current || ids[0] || '');

      const updatedData = {};
      ids.forEach((id) => {
        const logs = devices[id]?.logs || {};
        const chartData = Object.values(logs).map((entry) => {
          const { timestamp, ...rest } = entry;
          return {
            timestamp,
            time: new Date(timestamp).toLocaleTimeString(),      // X-axis
            fullTime: new Date(timestamp).toLocaleString(),      // Tooltip
            ...rest
          };
        });

        chartData.sort((a, b) => a.timestamp - b.timestamp);
        updatedData[id] = chartData.slice(-30);
      });
      setDeviceData(updatedData);
    });
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center w-full">🌡️ ESP32 Live Sensor Dashboard</h1>
        {selectedDevice && deviceData[selectedDevice]?.length > 0 && (
          <span className="text-gray-600 text-sm absolute right-6">
            Last Updated: {new Date(deviceData[selectedDevice].at(-1).timestamp).toLocaleString()}
          </span>
        )}
      </div>

      {/* Device Selector */}
      <div className="mb-6 flex justify-center">
        <select
          className="border border-gray-300 rounded-lg px-4 py-2"
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
        >
          {deviceIds.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>

      {selectedDevice && deviceData[selectedDevice] && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
            {selectedDevice} - Live Chart
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={deviceData[selectedDevice]} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(label, payload) => {
                  if (payload?.[0]?.payload?.fullTime) {
                    return payload[0].payload.fullTime;
                  }
                  return label;
                }}
                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#dddddd" }}
                labelStyle={{ color: "#666" }}
                cursor={{ stroke: "#ccc", strokeWidth: 1 }}
              />
              <Legend />
              {Object.keys(deviceData[selectedDevice]?.[0] || {})
                .filter((key) => key !== 'time' && key !== 'timestamp' && key !== 'fullTime')
                .map((key, idx) => (
                  <Line
                    key={key}
                    type="liner"
                    dataKey={key}
                    stroke={['#FF6B6B', '#4ECDC4', '#1E90FF', '#FFA500', '#8A2BE2'][idx % 5]}
                    strokeWidth={3}
                    dot={true} // shows lines & dots for visibility
                    name={key.charAt(0).toUpperCase() + key.slice(1)}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default RealtimeDashboard;
