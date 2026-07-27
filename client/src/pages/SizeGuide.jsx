import React, { useState } from 'react';
import SEO from '../components/SEO';

const SizeGuide = () => {
  const [activeTab, setActiveTab] = useState('kurtis');

  return (
    <div>
      <SEO
        title="Size & Fit Guide"
        description="Check size measurements and fitting guides for Kurtis, Lehengas, and Blouses at Navari."
      />
      <div className="policy-page-header text-center">
        <div className="container">
          <span className="badge bg-crimson text-white px-3 py-2 mb-2 rounded-pill fw-semibold">
            HELP & INFO
          </span>
          <h1 className="h2 fw-bold text-dark mb-2">Navari Size & Fit Guide</h1>
          <p className="text-muted small mb-0">Find your perfect size across Kurtis, Lehengas, Sarees & Blouses</p>
        </div>
      </div>

      <div className="py-5 bg-light">
        <div className="container" style={{ maxWidth: '960px' }}>
          
          {/* TAB BUTTONS */}
          <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
            {[
              { id: 'kurtis', label: 'Kurtis & Anarkali Suits' },
              { id: 'lehengas', label: 'Lehengas & Skirts' },
              { id: 'blouses', label: 'Stitched Blouses' },
              { id: 'sarees', label: 'Sarees & Drapes' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`btn ${activeTab === tab.id ? 'btn-hero-primary' : 'btn-outline-dark bg-white'} px-4 py-2`}
                style={{ borderRadius: '25px', fontSize: '0.9rem' }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="policy-card">
            
            {activeTab === 'kurtis' && (
              <div>
                <h3 className="h5 fw-bold text-dark mb-3">Kurtis, Anarkalis & Suit Sets Size Chart (Inches)</h3>
                <p className="text-muted small mb-4">Measurements refer to body dimensions, not garment dimensions.</p>
                <div className="table-responsive">
                  <table className="table table-striped table-bordered text-center align-middle small">
                    <thead className="table-dark">
                      <tr>
                        <th>Size Tag</th>
                        <th>Bust (in)</th>
                        <th>Waist (in)</th>
                        <th>Hip (in)</th>
                        <th>Kurti Length (in)</th>
                        <th>Shoulder (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td><strong>XS (34)</strong></td><td>34"</td><td>28"</td><td>37"</td><td>44"</td><td>14"</td></tr>
                      <tr><td><strong>S (36)</strong></td><td>36"</td><td>30"</td><td>39"</td><td>45"</td><td>14.5"</td></tr>
                      <tr><td><strong>M (38)</strong></td><td>38"</td><td>32"</td><td>41"</td><td>45"</td><td>15"</td></tr>
                      <tr><td><strong>L (40)</strong></td><td>40"</td><td>34"</td><td>43"</td><td>46"</td><td>15.5"</td></tr>
                      <tr><td><strong>XL (42)</strong></td><td>42"</td><td>36"</td><td>45"</td><td>46"</td><td>16"</td></tr>
                      <tr><td><strong>XXL (44)</strong></td><td>44"</td><td>38"</td><td>47"</td><td>47"</td><td>16.5"</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'lehengas' && (
              <div>
                <h3 className="h5 fw-bold text-dark mb-3">Lehenga & Ghagra Skirt Size Chart (Inches)</h3>
                <p className="text-muted small mb-4">All semi-stitched lehengas come with 4-meter flare and adjustable drawstring waist band.</p>
                <div className="table-responsive">
                  <table className="table table-striped table-bordered text-center align-middle small">
                    <thead className="table-dark">
                      <tr>
                        <th>Size Tag</th>
                        <th>Waist Range (in)</th>
                        <th>Length (in)</th>
                        <th>Choli Bust (in)</th>
                        <th>Dupatta Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td><strong>Small</strong></td><td>26" - 28"</td><td>42"</td><td>34" - 36"</td><td>2.5 Meters</td></tr>
                      <tr><td><strong>Medium</strong></td><td>30" - 32"</td><td>42"</td><td>38" - 40"</td><td>2.5 Meters</td></tr>
                      <tr><td><strong>Large</strong></td><td>34" - 36"</td><td>43"</td><td>42" - 44"</td><td>2.5 Meters</td></tr>
                      <tr><td><strong>Free Size (Unstitched)</strong></td><td>Up to 44"</td><td>Up to 44"</td><td>Up to 44"</td><td>2.5 Meters</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'blouses' && (
              <div>
                <h3 className="h5 fw-bold text-dark mb-3">Padded & Stitched Blouse Chart (Inches)</h3>
                <p className="text-muted small mb-4">All Navari readymade blouses feature 2-inch inner margin seam for easy custom resizing.</p>
                <div className="table-responsive">
                  <table className="table table-striped table-bordered text-center align-middle small">
                    <thead className="table-dark">
                      <tr>
                        <th>Size Tag</th>
                        <th>Bust Size</th>
                        <th>Underbust (Waist)</th>
                        <th>Blouse Length</th>
                        <th>Margin Inside</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td><strong>34 (S)</strong></td><td>34"</td><td>28" - 29"</td><td>14"</td><td>+2 Inches</td></tr>
                      <tr><td><strong>36 (M)</strong></td><td>36"</td><td>30" - 31"</td><td>14.5"</td><td>+2 Inches</td></tr>
                      <tr><td><strong>38 (L)</strong></td><td>38"</td><td>32" - 33"</td><td>15"</td><td>+2 Inches</td></tr>
                      <tr><td><strong>40 (XL)</strong></td><td>40"</td><td>34" - 35"</td><td>15.5"</td><td>+2 Inches</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'sarees' && (
              <div>
                <h3 className="h5 fw-bold text-dark mb-3">Saree Dimensions & Blouse Piece Specifications</h3>
                <p className="text-muted small mb-4">Standard dimensions for all authentic handloom sarees.</p>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded border">
                      <h5 className="h6 fw-bold text-crimson mb-2">Saree Body Length</h5>
                      <p className="small text-muted mb-0">5.5 Meters (6.0 Yards) standard length suitable for all drapery styles and heights up to 6 feet.</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded border">
                      <h5 className="h6 fw-bold text-crimson mb-2">Blouse Piece Attachment</h5>
                      <p className="small text-muted mb-0">0.8 Meter (80 cm) unstitched running blouse piece included with matching zari/brocade borders.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HOW TO MEASURE */}
            <div className="mt-5 pt-4 border-top">
              <h4 className="h6 fw-bold text-dark mb-3">💡 How to Measure Yourself Accurately</h4>
              <div className="row g-3 text-muted small">
                <div className="col-md-4">
                  <strong>Bust:</strong> Measure around the fullest part of your chest holding the tape snug but not tight.
                </div>
                <div className="col-md-4">
                  <strong>Waist:</strong> Measure around your natural waistline, usually 2 inches above your navel.
                </div>
                <div className="col-md-4">
                  <strong>Hips:</strong> Stand with feet together and measure around the widest part of your hips.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
