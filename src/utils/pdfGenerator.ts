/**
 * Utility to generate a high-fidelity, beautifully styled print-ready PDF certificate
 * of the user's monthly ecological contribution.
 */
export interface ReportData {
  userName: string;
  userAvatar: string;
  totalSavedCo2: number;
  treesPlanted: number;
  greenPoints: number;
  level: number;
  rankName: string;
  achievements: string[];
}

export function generatePdfReport(data: ReportData) {
  // Generate a unique certification ID
  const dateStr = new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const hash = Math.floor(100000 + Math.random() * 900000);
  const certId = `ESG-BANK-${hash}-${new Date().getFullYear()}`;

  // Equivalent calculations
  const flightHours = (data.totalSavedCo2 * 0.12).toFixed(1); // approx CO2 equivalent per hour of commercial flight
  const carKm = (data.totalSavedCo2 * 8.3).toFixed(0); // approx km driven in standard petrol car

  // Build achievements HTML list
  const achievementsListHtml = data.achievements.length > 0
    ? data.achievements.map(ach => `
        <div class="achievement-item">
          <span class="achievement-icon">🏆</span>
          <span class="achievement-text">${ach}</span>
        </div>
      `).join('')
    : `
        <div class="achievement-item">
          <span class="achievement-icon">🌱</span>
          <span class="achievement-text">Первые шаги к углеродной нейтральности</span>
        </div>
      `;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>Сертификат климатической ответственности - ${data.userName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,600;0,800;0,900;1,400&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=JetBrains+Mono:wght@400;700&display=swap');
        
        @page {
          size: A4 portrait;
          margin: 0;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Montserrat', sans-serif;
          background-color: #fafbfc;
          color: #1e293b;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .cert-container {
          width: 210mm;
          height: 297mm;
          box-sizing: border-box;
          padding: 20mm;
          position: relative;
          background-color: #ffffff;
          overflow: hidden;
          display: flex;
          flex-col: column;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid #e2e8f0;
        }

        /* Decorative Border */
        .border-outer {
          position: absolute;
          top: 10mm;
          left: 10mm;
          right: 10mm;
          bottom: 10mm;
          border: 2px solid #10b981;
          pointer-events: none;
        }

        .border-inner {
          position: absolute;
          top: 12mm;
          left: 12mm;
          right: 12mm;
          bottom: 12mm;
          border: 1px solid #34d399;
          opacity: 0.5;
          pointer-events: none;
        }

        /* Corners */
        .corner {
          position: absolute;
          width: 15px;
          height: 15px;
          border: 3px solid #059669;
          pointer-events: none;
        }
        .corner-tl { top: 9mm; left: 9mm; border-right: none; border-bottom: none; }
        .corner-tr { top: 9mm; right: 9mm; border-left: none; border-bottom: none; }
        .corner-bl { bottom: 9mm; left: 9mm; border-right: none; border-top: none; }
        .corner-br { bottom: 9mm; right: 9mm; border-left: none; border-top: none; }

        /* Header Style */
        .header {
          text-align: center;
          margin-top: 5mm;
        }

        .bank-logo {
          font-weight: 900;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: #065f46;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .bank-sub {
          font-size: 8px;
          font-weight: 800;
          color: #10b981;
          text-transform: uppercase;
          letter-spacing: 5px;
        }

        .cert-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin-top: 10mm;
          margin-bottom: 2mm;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .cert-subtitle {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 4px;
        }

        /* Main Content */
        .content {
          text-align: center;
          margin-top: 5mm;
          margin-bottom: 5mm;
        }

        .presented-to {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 3mm;
        }

        .user-profile {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 5mm;
        }

        .user-avatar {
          font-size: 36px;
          line-height: 1;
        }

        .user-name {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 800;
          color: #065f46;
          border-bottom: 2px solid #a7f3d0;
          padding-bottom: 4px;
          display: inline-block;
        }

        .cert-text {
          font-size: 12.5px;
          line-height: 1.7;
          color: #334155;
          max-width: 155mm;
          margin: 0 auto;
          font-weight: 500;
        }

        .cert-text strong {
          color: #0f172a;
          font-weight: 600;
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin: 10mm auto;
          max-width: 165mm;
        }

        .metric-card {
          background-color: #f0fdf4;
          border: 1px solid #d1fae5;
          border-radius: 16px;
          padding: 12px;
          text-align: center;
        }

        .metric-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 22px;
          font-weight: 900;
          color: #065f46;
          margin-bottom: 4px;
        }

        .metric-lbl {
          font-size: 9px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Equivalents Box */
        .equivalents-container {
          background-color: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 20px;
          padding: 15px;
          max-width: 155mm;
          margin: 0 auto 8mm auto;
          text-align: left;
        }

        .eq-title {
          font-size: 9px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
          text-align: center;
        }

        .eq-row {
          display: flex;
          justify-content: space-around;
          align-items: center;
        }

        .eq-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
        }

        .eq-icon {
          font-size: 18px;
        }

        /* Achievements Section */
        .achievements-box {
          max-width: 155mm;
          margin: 0 auto;
          text-align: left;
        }

        .ach-title {
          font-size: 9px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 4px;
        }

        .achievements-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .achievement-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #fafbfc;
          border: 1px solid #f1f5f9;
          border-radius: 10px;
          padding: 6px 10px;
        }

        .achievement-icon {
          font-size: 12px;
        }

        .achievement-text {
          font-size: 10px;
          font-weight: 600;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Footer Stamp / Signatures */
        .footer-cert {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          max-width: 165mm;
          margin: 5mm auto 0 auto;
          padding-bottom: 5mm;
        }

        .verification {
          text-align: left;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px;
          color: #94a3b8;
          line-height: 1.5;
        }

        .verification strong {
          color: #64748b;
        }

        .seal-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gold-seal {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 2px dashed #059669;
          background-color: #ecfdf5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-shadow: 0 0 0 4px #fff, 0 0 0 5px #059669;
        }

        .seal-text {
          font-size: 6px;
          font-weight: 800;
          color: #065f46;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          line-height: 1.2;
        }

        .seal-emoji {
          font-size: 16px;
          margin-bottom: 1px;
        }

        .signature-container {
          text-align: right;
          width: 140px;
        }

        .signature-line {
          border-bottom: 1px solid #94a3b8;
          height: 35px;
          margin-bottom: 4px;
          position: relative;
        }

        .handwritten-sig {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 16px;
          color: #047857;
          position: absolute;
          bottom: 2px;
          right: 20px;
          font-weight: 600;
          opacity: 0.85;
          letter-spacing: 1px;
        }

        .sig-label {
          font-size: 8px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .sig-title {
          font-size: 7px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          margin-top: 1px;
        }
      </style>
    </head>
    <body>
      <div class="cert-container">
        <!-- Borders -->
        <div class="border-outer"></div>
        <div class="border-inner"></div>
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>

        <!-- Header -->
        <div class="header">
          <div class="bank-logo">
            🌿 СОЗНАТЕЛЬНЫЙ БАНК
          </div>
          <div class="bank-sub">
            ESG ВЕРИФИЦИРОВАННЫЙ БАНКИНГ
          </div>
          <div class="cert-title">Экологический Отчёт</div>
          <div class="cert-subtitle">Климатическая ответственность за ${dateStr}</div>
        </div>

        <!-- Content Body -->
        <div class="content">
          <div class="presented-to">Сформирован на имя:</div>
          <div class="user-profile">
            <span class="user-avatar">${data.userAvatar}</span>
            <span class="user-name">${data.userName}</span>
          </div>

          <p class="cert-text">
            Настоящий сертификат подтверждает, что в рамках осознанной финансовой активности
            пользователь достиг ранга <strong>"${data.rankName}" (Уровень ${data.level})</strong>. 
            Благодаря использованию эко-функций онлайн-банка Сознательного Банка, 
            был зафиксирован вклад в снижение антропогенного воздействия на биосферу Земли.
          </p>

          <!-- Core Metrics -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-val">-${data.totalSavedCo2.toFixed(1)} кг</div>
              <div class="metric-lbl">Сэкономлено CO₂</div>
            </div>
            <div class="metric-card">
              <div class="metric-val">🌳 ${data.treesPlanted} шт.</div>
              <div class="metric-lbl">Деревьев посажено</div>
            </div>
            <div class="metric-card">
              <div class="metric-val">🍃 ${data.greenPoints}</div>
              <div class="metric-lbl">Баланс Green Points</div>
            </div>
          </div>

          <!-- Equivalents Box -->
          <div class="equivalents-container">
            <div class="eq-title">Эквиваленты климатического влияния</div>
            <div class="eq-row">
              <div class="eq-item">
                <span class="eq-icon">✈️</span>
                <span><strong>${flightHours} ч.</strong> полета самолета сэкономлено</span>
              </div>
              <div class="eq-item">
                <span class="eq-icon">🚗</span>
                <span><strong>${carKm} км</strong> автопробега компенсировано</span>
              </div>
            </div>
          </div>

          <!-- Achievements Box -->
          <div class="achievements-box">
            <div class="ach-title">Зафиксированные эко-достижения</div>
            <div class="achievements-list">
              ${achievementsListHtml}
            </div>
          </div>
        </div>

        <!-- Footer Seal & Signatures -->
        <div class="footer-cert">
          <div class="verification">
            ID СЕРТИФИКАТА: <strong>${certId}</strong><br>
            ВЕРИФИКАЦИЯ: <strong>Блокчейн ConsciousChain</strong><br>
            ДАТА ВЫПУСКА: <strong>${new Date().toLocaleDateString('ru-RU')}</strong>
          </div>

          <!-- Seal -->
          <div class="seal-container">
            <div class="gold-seal">
              <span class="seal-emoji">🌍</span>
              <span class="seal-text">ESG Verified</span>
              <span class="seal-text" style="font-weight:400; font-size:4.5px; opacity:0.8; margin-top:2px;">Conscious Bank</span>
            </div>
          </div>

          <!-- Signature -->
          <div class="signature-container">
            <div class="signature-line">
              <span class="handwritten-sig">E. Vlasov</span>
            </div>
            <div class="sig-label">Е. Власов</div>
            <div class="sig-title">Директор Департамента Устойчивого Развития</div>
          </div>
        </div>

      </div>

      <!-- Trigger Print immediately after load -->
      <script>
        window.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => {
            window.print();
          }, 600);
        });
      </script>
    </body>
    </html>
  `;

  // Open a print window and write document
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    alert('Не удалось открыть окно печати. Пожалуйста, разрешите всплывающие окна для генерации PDF-отчёта.');
  }
}
