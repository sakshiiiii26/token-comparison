import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { modelsAPI } from '../services/api';
import { Image, Film, Mic, Calculator, X, Loader } from 'lucide-react';

export default function MediaCostEstimator({ onClose }) {
  const { formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('image'); // 'image' or 'reel'

  // Image states
  const [imageCount, setImageCount] = useState(1);
  const [imageModel, setImageModel] = useState('nano_banana_2');
  const [imageResolution, setImageResolution] = useState('1K (1024x1024)');

  // Reel states
  const [videoDuration, setVideoDuration] = useState(15);
  const [scriptLength, setScriptLength] = useState(200);
  const [videoQuality, setVideoQuality] = useState('720p');

  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await modelsAPI.getMediaRates();
        setRates(res);
      } catch (err) {
        console.error("Failed to load media rates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  // Calculations
  const calculateImageCost = () => {
    if (!rates || !rates.image) return { cost: 0, tokens: 0 };
    const modelData = rates.image[imageModel];
    if (!modelData) return { cost: 0, tokens: 0 };
    
    const resData = modelData.resolutions[imageResolution] || Object.values(modelData.resolutions)[0];
    if (!resData) return { cost: 0, tokens: 0 };

    return {
      cost: resData.cost * imageCount,
      tokens: resData.tokens * imageCount
    };
  };

  const calculateReelCost = () => {
    if (!rates) return { video: 0, audio: 0, total: 0 };
    const vCost = (rates.video[videoQuality] || rates.video['720p']) * videoDuration;
    const aCost = rates.audio * scriptLength;
    return { video: vCost, audio: aCost, total: vCost + aCost };
  };

  const currentImageData = calculateImageCost();
  const currentImageCost = currentImageData.cost;
  const currentImageTokens = currentImageData.tokens;
  const currentReelCost = calculateReelCost();

  const role = localStorage.getItem('user_role') || 'super_admin';
  const isSuperAdmin = role === 'super_admin';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', position: 'relative' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          <Calculator color="var(--primary)" /> Media Cost Estimator
        </h2>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <Loader size={32} className="spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
            <p>Fetching real-time API rates...</p>
          </div>
        ) : rates ? (
          <>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
          <button 
            className={`btn ${activeTab === 'image' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            onClick={() => setActiveTab('image')}
          >
            <Image size={18} /> Image Generation
          </button>
          <button 
            className={`btn ${activeTab === 'reel' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            onClick={() => setActiveTab('reel')}
          >
            <Film size={18} /> Reel Generation
          </button>
        </div>

        {activeTab === 'image' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Number of Images ({imageCount})</label>
              <input type="range" min="1" max="10" value={imageCount} onChange={(e) => setImageCount(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="label">Model Variant</label>
                <select className="input" value={imageModel} onChange={(e) => {
                  setImageModel(e.target.value);
                  const firstRes = Object.keys(rates?.image?.[e.target.value]?.resolutions || {})[0];
                  if (firstRes) setImageResolution(firstRes);
                }}>
                  {rates?.image && Object.entries(rates.image).map(([key, data]) => (
                    <option key={key} value={key}>{data.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="label">Resolution</label>
                <select className="input" value={imageResolution} onChange={(e) => setImageResolution(e.target.value)}>
                  {rates?.image?.[imageModel]?.resolutions && Object.keys(rates.image[imageModel].resolutions).map((res) => (
                    <option key={res} value={res}>{res}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Estimated Cost</div>
              {isSuperAdmin ? (
                <>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
                    {formatCurrency(currentImageCost, 4)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    ≈ {currentImageTokens.toLocaleString()} Platform Tokens
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
                  {currentImageTokens.toLocaleString()} Tokens
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reel' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Video Duration ({videoDuration} seconds)</label>
              <input type="range" min="5" max="60" step="5" value={videoDuration} onChange={(e) => setVideoDuration(Number(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div className="form-group">
              <label className="label">Voiceover Script Length ({scriptLength} characters)</label>
              <input type="range" min="0" max="1000" step="50" value={scriptLength} onChange={(e) => setScriptLength(Number(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div className="form-group">
              <label className="label">Video Quality</label>
              <select className="input" value={videoQuality} onChange={(e) => setVideoQuality(e.target.value)}>
                <option value="720p">720p (Standard)</option>
                <option value="1080p">1080p (FHD)</option>
                <option value="4k">4K (Ultra HD)</option>
              </select>
            </div>

            <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}><Film size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Video Generation</span>
                <span style={{ color: 'var(--text-main)' }}>
                  {isSuperAdmin ? formatCurrency(currentReelCost.video, 4) : `${Math.round(currentReelCost.video * 100000).toLocaleString()} Tokens`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}><Mic size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Voiceover Generation</span>
                <span style={{ color: 'var(--text-main)' }}>
                  {isSuperAdmin ? formatCurrency(currentReelCost.audio, 4) : `${Math.round(currentReelCost.audio * 100000).toLocaleString()} Tokens`}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Estimated Cost</div>
                {isSuperAdmin ? (
                  <>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
                      {formatCurrency(currentReelCost.total, 4)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      ≈ {Math.round(currentReelCost.total * 100000).toLocaleString()} Platform Tokens
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
                    {Math.round(currentReelCost.total * 100000).toLocaleString()} Tokens
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--error)', padding: '2rem' }}>Failed to load rates.</div>
        )}
      </div>
    </div>
  );
}
