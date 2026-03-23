import { useState, useRef } from 'react'
import './App.css'

// Use the Render URL if deployed, otherwise fallback to local development
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const LOCATIONS = [
  "dlf phase 1", "dlf phase 2", "dlf phase 3", "dlf phase 4", "dlf phase 5",
  "golf course road", "greenwood city", "iffco chowk", "nirvana country",
  "palam vihar", "sector 1", "sector 3", "sector 4", "sector 5", "sector 6",
  "sector 7", "sector 8", "sector 9", "sector 10", "sector 11", "sector 12",
  "sector 13", "sector 14", "sector 15", "sector 17", "sector 21", "sector 22",
  "sector 23", "sector 26", "sector 27", "sector 28", "sector 31", "sector 33",
  "sector 36", "sector 37", "sector 38", "sector 39", "sector 40", "sector 41",
  "sector 42", "sector 45", "sector 46", "sector 47", "sector 48", "sector 49",
  "sector 50", "sector 51", "sector 52", "sector 54", "sector 55", "sector 56",
  "sector 57", "sector 60", "sector 61", "sector 63", "sector 65", "sector 66",
  "sector 67", "sector 69", "sector 70", "sector 72", "sector 73", "sector 76",
  "sector 81", "sector 82", "sector 83", "sector 86", "sector 89", "sector 91",
  "sector 92", "sector 93", "sector 103", "sector 104", "sector 105", "sector 106",
  "sector 108", "sector 109", "sector 110", "sector 111", "sector 112",
  "sohna road", "sushant lok", "sushant lok phase 1", "sushant lok phase 2",
  "sushant lok phase 3", "other"
]

const FACINGS = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West", "Unknown"]

const SOCIETIES = [
  "independent", "vipul tatvam villa", "international city by sobha phase 2",
  "emaar mgf marbella", "international city by sobha phase 1",
  "unitech uniworld resorts", "unitech espace", "dlf city plots phase 2",
  "dlf city plots", "bptp visionnaire", "uppal southend",
  "sushant lok 1 builder floors", "ansals palam vihar", "eldeco mansionz", "other"
]

const FURNISH_OPTIONS = ["Unfurnished", "Semi-furnished", "Furnished"]

const AGE_OPTIONS = ["Within 6 months", "0 to 1 Year Old", "1 to 5 Year Old", "5 to 10 Year Old", "10+ Year Old"]

const INITIAL_FORM = {
  location: '',
  area: '',
  bedrooms: '',
  bathrooms: '',
  balconies: '0',
  floor_num: '',
  furnish_level: '',
  age_possession: '',
  facing: 'Unknown',
  society: 'independent',
  servant_room: false,
  pooja_room: false,
  study_room: false,
  store_room: false,
  metro: false,
  near_hospital: false,
  near_school: false,
  near_mall: false,
  near_bank: false,
}

function formatPrice(price) {
  if (price < 1) {
    return `₹${(price * 100).toFixed(2)} Lac`
  }
  return `₹${price.toFixed(2)} Cr`
}

// Icons as inline SVGs
function HouseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function AreaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 3v18" />
    </svg>
  )
}

function BedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16M22 4v16M2 12h20M2 8h20v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8z" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6,9 12,15 18,9" />
    </svg>
  )
}


function App() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1)
  const resultRef = useRef(null)

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleBool = (field) => {
    setForm(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const payload = {
      ...form,
      area: parseFloat(form.area),
      bedrooms: parseInt(form.bedrooms),
      bathrooms: parseInt(form.bathrooms),
      balconies: parseInt(form.balconies),
      floor_num: parseFloat(form.floor_num),
    }

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail?.[0]?.msg || errData.detail || 'Prediction failed')
      }

      const data = await res.json()
      setResult(data)
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm(INITIAL_FORM)
    setResult(null)
    setError(null)
    setStep(1)
  }

  const canProceedStep1 = form.location && form.area && form.bedrooms && form.bathrooms && form.floor_num
  const canProceedStep2 = form.furnish_level && form.age_possession

  return (
    <div className="app-container">
      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <div className="nav-logo">
              <HouseIcon />
            </div>
            <span className="nav-title">GurgaonEstimate</span>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Predict House Prices
            <span className="hero-highlight"> in Gurgaon</span>
          </h1>
          <p className="hero-subtitle">
            Get instant property valuations using our custom Ensemble model
            trained on real Gurgaon real estate data.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">88+</span>
              <span className="stat-label">Locations</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">42</span>
              <span className="stat-label">Features</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">Ensemble</span>
              <span className="stat-label">Model</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== STEP INDICATORS ===== */}
      <div className="steps-container">
        <div className="steps-bar">
          {[
            { num: 1, label: 'Property Details' },
            { num: 2, label: 'Specifications' },
            { num: 3, label: 'Amenities & Extras' },
          ].map(({ num, label }) => (
            <button
              key={num}
              className={`step-item ${step === num ? 'active' : ''} ${step > num ? 'completed' : ''}`}
              onClick={() => setStep(num)}
            >
              <div className="step-circle">
                {step > num ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                ) : num}
              </div>
              <span className="step-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== FORM ===== */}
      <main className="main-content">
        <form onSubmit={handleSubmit} className="prediction-form">

          {/* STEP 1: Property Details */}
          {step === 1 && (
            <div className="form-step fade-in">
              <div className="step-header">
                <h2>Property Details</h2>
                <p>Tell us about the property's basic information</p>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="location">
                    <MapPinIcon /> Location
                  </label>
                  <div className="select-wrapper">
                    <select
                      id="location"
                      value={form.location}
                      onChange={e => updateField('location', e.target.value)}
                      required
                    >
                      <option value="">Select location...</option>
                      {LOCATIONS.map(loc => (
                        <option key={loc} value={loc}>{loc.replace(/\b\w/g, c => c.toUpperCase())}</option>
                      ))}
                    </select>
                    <ChevronDown />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="area">
                    <AreaIcon /> Area (sq.ft)
                  </label>
                  <input
                    id="area"
                    type="number"
                    placeholder="e.g. 1500"
                    value={form.area}
                    onChange={e => updateField('area', e.target.value)}
                    min="101"
                    max="49999"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="floor_num">Floor Number</label>
                  <input
                    id="floor_num"
                    type="number"
                    placeholder="e.g. 5"
                    value={form.floor_num}
                    onChange={e => updateField('floor_num', e.target.value)}
                    min="0"
                    max="50"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bedrooms">
                    <BedIcon /> Bedrooms
                  </label>
                  <div className="counter-group">
                    <button type="button" className="counter-btn" onClick={() => updateField('bedrooms', Math.max(1, (parseInt(form.bedrooms) || 1) - 1).toString())}>−</button>
                    <input
                      id="bedrooms"
                      type="number"
                      value={form.bedrooms}
                      onChange={e => updateField('bedrooms', e.target.value)}
                      min="1"
                      max="10"
                      required
                      className="counter-input"
                    />
                    <button type="button" className="counter-btn" onClick={() => updateField('bedrooms', Math.min(10, (parseInt(form.bedrooms) || 0) + 1).toString())}>+</button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bathrooms">Bathrooms</label>
                  <div className="counter-group">
                    <button type="button" className="counter-btn" onClick={() => updateField('bathrooms', Math.max(1, (parseInt(form.bathrooms) || 1) - 1).toString())}>−</button>
                    <input
                      id="bathrooms"
                      type="number"
                      value={form.bathrooms}
                      onChange={e => updateField('bathrooms', e.target.value)}
                      min="1"
                      max="10"
                      required
                      className="counter-input"
                    />
                    <button type="button" className="counter-btn" onClick={() => updateField('bathrooms', Math.min(10, (parseInt(form.bathrooms) || 0) + 1).toString())}>+</button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="balconies">Balconies</label>
                  <div className="counter-group">
                    <button type="button" className="counter-btn" onClick={() => updateField('balconies', Math.max(0, (parseInt(form.balconies) || 0) - 1).toString())}>−</button>
                    <input
                      id="balconies"
                      type="number"
                      value={form.balconies}
                      onChange={e => updateField('balconies', e.target.value)}
                      min="0"
                      max="5"
                      className="counter-input"
                    />
                    <button type="button" className="counter-btn" onClick={() => updateField('balconies', Math.min(5, (parseInt(form.balconies) || 0) + 1).toString())}>+</button>
                  </div>
                </div>
              </div>

              <div className="step-actions">
                <div />
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                >
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Specifications */}
          {step === 2 && (
            <div className="form-step fade-in">
              <div className="step-header">
                <h2>Property Specifications</h2>
                <p>Furnishing, age, facing and society details</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Furnishing Level</label>
                  <div className="radio-cards">
                    {FURNISH_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        className={`radio-card ${form.furnish_level === opt ? 'selected' : ''}`}
                        onClick={() => updateField('furnish_level', opt)}
                      >
                        <span className="radio-card-icon">
                          {opt === 'Unfurnished' ? '🏗️' : opt === 'Semi-furnished' ? '🪑' : '🛋️'}
                        </span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Property Age</label>
                  <div className="radio-cards vertical">
                    {AGE_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        className={`radio-card horizontal ${form.age_possession === opt ? 'selected' : ''}`}
                        onClick={() => updateField('age_possession', opt)}
                      >
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="facing">Facing Direction</label>
                  <div className="select-wrapper">
                    <select
                      id="facing"
                      value={form.facing}
                      onChange={e => updateField('facing', e.target.value)}
                    >
                      {FACINGS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <ChevronDown />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="society">Society / Builder</label>
                  <div className="select-wrapper">
                    <select
                      id="society"
                      value={form.society}
                      onChange={e => updateField('society', e.target.value)}
                    >
                      {SOCIETIES.map(s => (
                        <option key={s} value={s}>{s.replace(/\b\w/g, c => c.toUpperCase())}</option>
                      ))}
                    </select>
                    <ChevronDown />
                  </div>
                </div>
              </div>

              <div className="step-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!canProceedStep2}
                  onClick={() => setStep(3)}
                >
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Amenities & Extra Rooms */}
          {step === 3 && (
            <div className="form-step fade-in">
              <div className="step-header">
                <h2>Amenities & Extra Rooms</h2>
                <p>Select additional features and nearby facilities</p>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Extra Rooms</label>
                  <div className="checkbox-grid">
                    {[
                      { key: 'servant_room', label: 'Servant Room', icon: '🧹' },
                      { key: 'pooja_room', label: 'Pooja Room', icon: '🪔' },
                      { key: 'study_room', label: 'Study Room', icon: '📚' },
                      { key: 'store_room', label: 'Store Room', icon: '📦' },
                    ].map(({ key, label, icon }) => (
                      <button
                        key={key}
                        type="button"
                        className={`checkbox-card ${form[key] ? 'checked' : ''}`}
                        onClick={() => toggleBool(key)}
                      >
                        <span className="checkbox-icon">{icon}</span>
                        <span className="checkbox-label">{label}</span>
                        <div className={`checkbox-indicator ${form[key] ? 'on' : ''}`}>
                          {form[key] && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20,6 9,17 4,12" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Nearby Facilities</label>
                  <div className="checkbox-grid">
                    {[
                      { key: 'metro', label: 'Metro Station', icon: '🚇' },
                      { key: 'near_hospital', label: 'Hospital', icon: '🏥' },
                      { key: 'near_school', label: 'School', icon: '🏫' },
                      { key: 'near_mall', label: 'Shopping Mall', icon: '🏬' },
                      { key: 'near_bank', label: 'Bank', icon: '🏦' },
                    ].map(({ key, label, icon }) => (
                      <button
                        key={key}
                        type="button"
                        className={`checkbox-card ${form[key] ? 'checked' : ''}`}
                        onClick={() => toggleBool(key)}
                      >
                        <span className="checkbox-icon">{icon}</span>
                        <span className="checkbox-label">{label}</span>
                        <div className={`checkbox-indicator ${form[key] ? 'on' : ''}`}>
                          {form[key] && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20,6 9,17 4,12" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="step-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-predict"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <SparkleIcon />
                      Predict Price
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* ===== ERROR ===== */}
        {error && (
          <div className="error-card fade-in">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ===== RESULT ===== */}
        {result && (
          <div className="result-section fade-in" ref={resultRef}>
            <div className="result-card">
              <div className="result-glow" />
              <div className="result-header">
                <span className="result-tag">Estimated Price</span>
                <h2 className="result-price">{formatPrice(result.predicted_price)}</h2>
                <p className="result-subtitle">Data-driven estimate based on 42 property features</p>
              </div>

              <div className="result-details">
                <div className="detail-item">
                  <span className="detail-icon"><MapPinIcon /></span>
                  <div>
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{result.location.replace(/\b\w/g, c => c.toUpperCase())}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon"><AreaIcon /></span>
                  <div>
                    <span className="detail-label">Area</span>
                    <span className="detail-value">{result.area.toLocaleString()} sq.ft</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon"><BedIcon /></span>
                  <div>
                    <span className="detail-label">Bedrooms</span>
                    <span className="detail-value">{result.bedrooms} BHK</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🪑</span>
                  <div>
                    <span className="detail-label">Furnishing</span>
                    <span className="detail-value">{result.furnish_level}</span>
                  </div>
                </div>
              </div>

              <button type="button" className="btn btn-secondary full-width" onClick={handleReset}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23,4 23,10 17,10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Start New Prediction
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <p>Built with ❤️ using Custom Ensemble &amp; React &bull; Gurgaon Real Estate Data</p>
      </footer>
    </div>
  )
}

export default App
