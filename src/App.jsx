import { useMemo, useState } from 'react'
import './App.css'

const STOP_TYPES = ['loading', 'unloading', 'customs', 'ferry', 'border', 'parking', 'fuel', 'document pickup', 'document dropoff', 'other']
const navItems = ['Live Board', 'Dispatch', 'Fleet', 'Drivers', 'Orders', 'Alerts']

const initialOrders = [{ id: 'ORD-1042', customer: 'Nordic Fresh', status: 'In Transit', vehicle: 'TR-204', driver: 'Liam Torres', routeStops: [{ type: 'loading', location: 'Hamburg Terminal A', datetime: '2026-05-16T07:30', notes: 'Load chilled pallets dock 3', driverTask: 'Confirm seal number before departure', completed: true }, { type: 'border', location: 'DE/NL Border Checkpoint', datetime: '2026-05-16T10:00', notes: 'Carry printed cargo manifest', driverTask: 'Present customs pre-clearance code', completed: false }] }]
const kpis = [{ label: 'Active', value: 42 }, { label: 'On Time', value: '96.8%' }, { label: 'Open Orders', value: 18 }, { label: 'Idle Units', value: 8 }, { label: 'Drivers Online', value: 34 }]
const fleetRows = [
  { unit: 'TR-204', driver: 'Liam Torres', status: 'In Transit', eta: '12:40', speed: '67 km/h', temp: '3.2°C' },
  { unit: 'TR-108', driver: 'Mia Zhang', status: 'Loading', eta: '14:10', speed: '0 km/h', temp: '5.1°C' },
  { unit: 'TR-331', driver: 'Noah Patel', status: 'Border', eta: '15:55', speed: '12 km/h', temp: '4.0°C' },
  { unit: 'TR-119', driver: 'Sara Ali', status: 'Transit', eta: '13:05', speed: '72 km/h', temp: '2.8°C' },
  { unit: 'TR-442', driver: 'Viktor Ivanov', status: 'Parking', eta: '16:20', speed: '0 km/h', temp: '6.0°C' },
]

const Sidebar = () => <aside className="sidebar"><h1>DispatchOS</h1><nav>{navItems.map((n) => <button key={n} type="button" className={n === 'Live Board' ? 'active' : ''}>{n}</button>)}</nav></aside>
const KpiBar = () => <div className="kpi-bar">{kpis.map((k) => <div className="kpi-badge" key={k.label}><span>{k.label}</span><strong>{k.value}</strong></div>)}</div>

function App() {
  const [orders, setOrders] = useState(initialOrders)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ customer: '', vehicle: '', driver: '', routeStops: [{ type: 'loading', location: '', datetime: '', notes: '', driverTask: '', completed: false }] })
  const selected = orders[0]
  const totalStops = useMemo(() => orders.reduce((sum, o) => sum + o.routeStops.length, 0), [orders])

  const updateStop = (index, field, value) => setForm((prev) => ({ ...prev, routeStops: prev.routeStops.map((s, i) => (i === index ? { ...s, [field]: value } : s)) }))
  const addStop = () => setForm((prev) => ({ ...prev, routeStops: [...prev.routeStops, { type: 'other', location: '', datetime: '', notes: '', driverTask: '', completed: false }] }))
  const submitOrder = (event) => {
    event.preventDefault()
    setOrders((prev) => [{ id: `ORD-${1000 + prev.length + 1}`, customer: form.customer, vehicle: form.vehicle, driver: form.driver, status: 'Planned', routeStops: form.routeStops }, ...prev])
    setShowModal(false)
  }

  return <div className="layout"><Sidebar /><main>
    <header className="topbar"><div className="title">Dispatcher Workstation</div><KpiBar /><button className="primary" type="button" onClick={() => setShowModal(true)}>+ Order</button></header>

    <section className="ops-grid">
      <article className="panel map-panel"><div className="panel-head"><h2>Live Map</h2><small>{totalStops} stops tracked</small></div><div className="map-workspace">Real-time map viewport<br />routes • assets • traffic • geofences</div></article>

      <article className="panel fleet-panel"><div className="panel-head"><h2>Fleet Monitoring</h2><small>dense live board</small></div><table className="dense"><thead><tr><th>Unit</th><th>Driver</th><th>Status</th><th>ETA</th><th>Speed</th><th>Temp</th></tr></thead><tbody>{fleetRows.map((r) => <tr key={r.unit}><td>{r.unit}</td><td>{r.driver}</td><td>{r.status}</td><td>{r.eta}</td><td>{r.speed}</td><td>{r.temp}</td></tr>)}</tbody></table></article>

      <article className="panel selected-panel"><div className="panel-head"><h2>Selected Transport</h2></div><p><strong>{selected.vehicle}</strong> • {selected.driver}</p><ul>{selected.routeStops.map((s, i) => <li key={`${s.location}-${i}`}><b>{s.type}</b><span>{s.location}</span><span>{s.completed ? '✓ completed' : '• pending'}</span></li>)}</ul></article>

      <article className="panel hours-panel"><div className="panel-head"><h2>Driver Hours</h2></div><div className="hours"><p><span>Liam Torres</span><strong>8:20 / 11:00</strong></p><p><span>Mia Zhang</span><strong>6:45 / 11:00</strong></p><p><span>Noah Patel</span><strong>9:10 / 11:00</strong></p><p><span>Sara Ali</span><strong>7:35 / 11:00</strong></p></div></article>
    </section>

    <section className="panel orders"><div className="panel-head"><h2>Orders</h2><small>bottom board</small></div><table className="dense"><thead><tr><th>ID</th><th>Customer</th><th>Status</th><th>Vehicle</th><th>Driver</th><th>Stops</th></tr></thead><tbody>{orders.map((o) => <tr key={o.id}><td>{o.id}</td><td>{o.customer}</td><td>{o.status}</td><td>{o.vehicle}</td><td>{o.driver}</td><td>{o.routeStops.length}</td></tr>)}</tbody></table></section>
  </main>

  {showModal && <div className="modal-backdrop"><form className="modal" onSubmit={submitOrder}><h2>Create Order</h2><div className="input-grid"><input placeholder="Customer" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required /><input placeholder="Vehicle" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required /><input placeholder="Driver" value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} required /></div><h3>Multi-stop Route</h3>{form.routeStops.map((stop, index) => <section key={index} className="stop-card"><select value={stop.type} onChange={(e) => updateStop(index, 'type', e.target.value)}>{STOP_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select><input placeholder="Location" value={stop.location} onChange={(e) => updateStop(index, 'location', e.target.value)} required /><input type="datetime-local" value={stop.datetime} onChange={(e) => updateStop(index, 'datetime', e.target.value)} required /><input placeholder="Notes" value={stop.notes} onChange={(e) => updateStop(index, 'notes', e.target.value)} /><input placeholder="Driver task" value={stop.driverTask} onChange={(e) => updateStop(index, 'driverTask', e.target.value)} /><label><input type="checkbox" checked={stop.completed} onChange={(e) => updateStop(index, 'completed', e.target.checked)} />Completed</label></section>)}<div className="actions"><button type="button" onClick={addStop}>Add Stop</button><button type="button" onClick={() => setShowModal(false)}>Cancel</button><button className="primary" type="submit">Save</button></div></form></div>}
  </div>
}

export default App
