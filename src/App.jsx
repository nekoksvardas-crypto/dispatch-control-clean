import { useMemo, useState } from 'react'
import './App.css'

const STOP_TYPES = [
  'loading',
  'unloading',
  'customs',
  'ferry',
  'border',
  'parking',
  'fuel',
  'document pickup',
  'document dropoff',
  'other',
]

const navItems = ['Dashboard', 'Dispatch', 'Fleet', 'Drivers', 'Orders', 'Reports']

const initialOrders = [
  {
    id: 'ORD-1042',
    customer: 'Nordic Fresh',
    status: 'In Transit',
    vehicle: 'TR-204',
    driver: 'Liam Torres',
    routeStops: [
      {
        type: 'loading',
        location: 'Hamburg Terminal A',
        datetime: '2026-05-16T07:30',
        notes: 'Load chilled pallets dock 3',
        driverTask: 'Confirm seal number before departure',
        completed: true,
      },
      {
        type: 'border',
        location: 'DE/NL Border Checkpoint',
        datetime: '2026-05-16T10:00',
        notes: 'Carry printed cargo manifest',
        driverTask: 'Present customs pre-clearance code',
        completed: false,
      },
    ],
  },
]

const kpis = [
  { label: 'Active Transports', value: 42, detail: '+5 vs yesterday' },
  { label: 'On-Time Rate', value: '96.8%', detail: '+0.9%' },
  { label: 'Open Orders', value: 18, detail: '3 urgent' },
  { label: 'Fleet Availability', value: '84%', detail: '8 vehicles idle' },
]

const fleetRows = [
  { unit: 'TR-204', driver: 'Liam Torres', status: 'In Transit', eta: '12:40', temp: '3.2°C' },
  { unit: 'TR-108', driver: 'Mia Zhang', status: 'Loading', eta: '14:10', temp: '5.1°C' },
  { unit: 'TR-331', driver: 'Noah Patel', status: 'Border', eta: '15:55', temp: '4.0°C' },
]

function Sidebar() {
  return (
    <aside className="sidebar card">
      <h1>DispatchOS</h1>
      <nav>
        {navItems.map((item) => (
          <button key={item} type="button" className={item === 'Dashboard' ? 'active' : ''}>
            {item}
          </button>
        ))}
      </nav>
    </aside>
  )
}

function KpiCards() {
  return <section className="kpi-grid">{kpis.map((k) => <article className="card kpi" key={k.label}><p>{k.label}</p><h3>{k.value}</h3><small>{k.detail}</small></article>)}</section>
}

function OrdersTable({ orders }) {
  return (
    <section className="card">
      <h2>Orders</h2>
      <table>
        <thead><tr><th>ID</th><th>Customer</th><th>Status</th><th>Vehicle</th><th>Driver</th><th>Stops</th></tr></thead>
        <tbody>
          {orders.map((o) => <tr key={o.id}><td>{o.id}</td><td>{o.customer}</td><td>{o.status}</td><td>{o.vehicle}</td><td>{o.driver}</td><td>{o.routeStops.length}</td></tr>)}
        </tbody>
      </table>
    </section>
  )
}

function App() {
  const [orders, setOrders] = useState(initialOrders)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    customer: '',
    vehicle: '',
    driver: '',
    routeStops: [{ type: 'loading', location: '', datetime: '', notes: '', driverTask: '', completed: false }],
  })

  const selected = orders[0]
  const totalStops = useMemo(() => orders.reduce((sum, o) => sum + o.routeStops.length, 0), [orders])

  const updateStop = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      routeStops: prev.routeStops.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop)),
    }))
  }

  const addStop = () => {
    setForm((prev) => ({
      ...prev,
      routeStops: [...prev.routeStops, { type: 'other', location: '', datetime: '', notes: '', driverTask: '', completed: false }],
    }))
  }

  const submitOrder = (event) => {
    event.preventDefault()
    const nextOrder = {
      id: `ORD-${1000 + orders.length + 1}`,
      customer: form.customer,
      vehicle: form.vehicle,
      driver: form.driver,
      status: 'Planned',
      routeStops: form.routeStops,
    }
    setOrders((prev) => [nextOrder, ...prev])
    setShowModal(false)
  }

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <header className="topbar">
          <div><h2>Transport Dispatch Dashboard</h2><p>Live operations, routes and fleet utilization in one place.</p></div>
          <button className="primary" type="button" onClick={() => setShowModal(true)}>Create Order</button>
        </header>
        <KpiCards />
        <section className="main-grid">
          <article className="card map"><h2>Live Map</h2><p>{totalStops} scheduled stops tracked.</p><div className="map-view">Map stream placeholder<br />Vehicle markers • traffic • geofences</div></article>
          <article className="card"><h2>Fleet Monitoring</h2><table><thead><tr><th>Unit</th><th>Driver</th><th>Status</th><th>ETA</th><th>Cargo Temp</th></tr></thead><tbody>{fleetRows.map((r) => <tr key={r.unit}><td>{r.unit}</td><td>{r.driver}</td><td>{r.status}</td><td>{r.eta}</td><td>{r.temp}</td></tr>)}</tbody></table></article>
          <article className="card"><h2>Selected Transport</h2><p><strong>{selected.vehicle}</strong> • {selected.driver}</p><ul>{selected.routeStops.map((s, i) => <li key={`${s.location}-${i}`}>{s.type} — {s.location} ({s.completed ? 'Completed' : 'Pending'})</li>)}</ul></article>
          <article className="card"><h2>Driver Hours</h2><p>Liam Torres: 8h 20m / 11h max</p><p>Mia Zhang: 6h 45m / 11h max</p><p>Noah Patel: 9h 10m / 11h max</p></article>
        </section>
        <OrdersTable orders={orders} />
      </main>

      {showModal && (
        <div className="modal-backdrop">
          <form className="modal card" onSubmit={submitOrder}>
            <h2>Create Order</h2>
            <div className="input-grid">
              <input placeholder="Customer" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required />
              <input placeholder="Vehicle" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required />
              <input placeholder="Driver" value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} required />
            </div>
            <h3>Multi-stop Route</h3>
            {form.routeStops.map((stop, index) => (
              <section key={index} className="stop-card">
                <select value={stop.type} onChange={(e) => updateStop(index, 'type', e.target.value)}>{STOP_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select>
                <input placeholder="Location" value={stop.location} onChange={(e) => updateStop(index, 'location', e.target.value)} required />
                <input type="datetime-local" value={stop.datetime} onChange={(e) => updateStop(index, 'datetime', e.target.value)} required />
                <input placeholder="Notes" value={stop.notes} onChange={(e) => updateStop(index, 'notes', e.target.value)} />
                <input placeholder="Driver task" value={stop.driverTask} onChange={(e) => updateStop(index, 'driverTask', e.target.value)} />
                <label><input type="checkbox" checked={stop.completed} onChange={(e) => updateStop(index, 'completed', e.target.checked)} /> Completed</label>
              </section>
            ))}
            <div className="actions">
              <button type="button" onClick={addStop}>Add Stop</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary" type="submit">Save Order</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
