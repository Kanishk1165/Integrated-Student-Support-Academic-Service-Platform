import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { analyticsAPI } from "../../services/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

const COLORS = ["#4f8ef7","#f5a623","#27ae60","#e74c3c","#7c5cbf","#1abc9c","#e67e22"];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Analytics() {
  const [overview, setOverview]     = useState({});
  const [byCategory, setByCategory] = useState([]);
  const [monthly, setMonthly]       = useState([]);
  const [respTime, setRespTime]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getOverview(),
      analyticsAPI.getByCategory(),
      analyticsAPI.getMonthly(),
      analyticsAPI.getResponseTime(),
    ]).then(([oRes, cRes, mRes, rRes]) => {
      setOverview(oRes.data.data);
      setByCategory(cRes.data.data.map(d => ({ name: d._id, value: d.count })));
      setMonthly(mRes.data.data.map(d => ({ name: MONTHS[d._id.month - 1], count: d.count })));
      setRespTime(rRes.data.data.map(d => ({ name: d._id, avgHours: Math.round(d.avgHours * 10) / 10, count: d.count })));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const resolutionRate = overview.total
    ? Math.round(((overview.resolved || 0) / overview.total) * 100)
    : 0;

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Analytics</h1>
        <p style={{ color: "#aaa", fontSize: 14, marginTop: 4 }}>Performance metrics and query trends</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>Loading analytics...</div>
      ) : (
        <>
          {/* KPI Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Resolution Rate",    value: `${resolutionRate}%`, icon: "🎯", color: "#27ae60" },
              { label: "Total Queries",      value: overview.total || 0,  icon: "📋", color: "#4f8ef7" },
              { label: "Avg Response Time",  value: respTime.length ? `${Math.round(respTime.reduce((a,b) => a + b.avgHours, 0) / respTime.length)}h` : "—", icon: "⏱️", color: "#f5a623" },
              { label: "Active Students",    value: overview.totalStudents || 0, icon: "👥", color: "#7c5cbf" },
            ].map(s => (
              <div key={s.label} style={{ background: "#fff", borderRadius: 13, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>{s.icon} {s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Queries by Category - Pie */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Queries by Category</h3>
              {byCategory.length === 0 ? (
                <div style={{ textAlign: "center", color: "#ccc", padding: 40 }}>No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={byCategory} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Monthly trend - Bar */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Monthly Query Trend</h3>
              {monthly.length === 0 ? (
                <div style={{ textAlign: "center", color: "#ccc", padding: 40 }}>No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} />
                    <YAxis fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Queries" fill="#4f8ef7" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Response Time by Category */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Avg. Resolution Time by Category (hours)</h3>
            {respTime.length === 0 ? (
              <div style={{ textAlign: "center", color: "#ccc", padding: 40 }}>No resolved queries yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={respTime} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} width={80} />
                  <Tooltip formatter={(v) => [`${v}h`, "Avg. Time"]} />
                  <Bar dataKey="avgHours" fill="#27ae60" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
