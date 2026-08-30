/**
 * QRForge – Offline QR Generator + Scanner (FINAL + MOBILE APP UI)
 * 100% Local Processing. No APIs. No Tracking.
 */

// ==========================================
// 1. DOM Elements
// ==========================================
const dom = {
    form: document.getElementById('qr-form'),
    tabs: document.querySelectorAll('.type-tab'),
    generateBtn: document.getElementById('generate-btn'),
    qrContainer: document.getElementById('qr-canvas'),
    emptyState: document.getElementById('empty-state'),
    qrInfo: document.getElementById('qr-info'),
    infoType: document.getElementById('info-type'),
    infoSize: document.getElementById('info-size'),
    fgColor: document.getElementById('fg-color'),
    bgColor: document.getElementById('bg-color'),
    qrSize: document.getElementById('qr-size'),
    sizeLabel: document.getElementById('size-label'),
    errorCorrection: document.getElementById('error-correction'),
    dotStyle: document.getElementById('dot-style'),
    eyeStyle: document.getElementById('eye-style'),
    gradToggle: document.getElementById('grad-toggle'),
    gradColors: document.getElementById('grad-colors'),
    gradStart: document.getElementById('grad-start'),
    gradEnd: document.getElementById('grad-end'),
    fgHex: document.getElementById('fg-hex'),
    bgHex: document.getElementById('bg-hex'),
    gradStartHex: document.getElementById('grad-start-hex'),
    gradEndHex: document.getElementById('grad-end-hex'),
    uploadLogoBtn: document.getElementById('upload-logo-btn'),
    removeLogoBtn: document.getElementById('remove-logo-btn'),
    logoInput: document.getElementById('logo-input'),
    logoPreview: document.getElementById('logo-preview'),
    downloadPngBtn: document.getElementById('download-png-btn'),
    downloadSvgBtn: document.getElementById('download-svg-btn'),
    downloadPdfBtn: document.getElementById('download-pdf-btn'),
    copyImageBtn: document.getElementById('copy-image-btn'),
    copyDataBtn: document.getElementById('copy-data-btn'),
    favoriteBtn: document.getElementById('favorite-btn'),
    moreActionsBtn: document.getElementById('more-actions-btn'),
    actionButtons: document.querySelector('.right-panel .action-buttons'),
    resetBtn: document.getElementById('reset-btn'),
    openBatchBtn: document.getElementById('open-batch-btn'),
    historyList: document.getElementById('history-list'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
    favoritesList: document.getElementById('favorites-list'),
    themeToggle: document.getElementById('theme-toggle'),
    toastContainer: document.getElementById('toast-container'),
    // Scanner
    navTabs: document.querySelectorAll('.nav-tab'),
    generatorView: document.getElementById('generator-view'),
    scannerView: document.getElementById('scanner-view'),
    batchView: document.getElementById('batch-view'),
    scannerTabs: document.querySelectorAll('.scanner-tab'),
    cameraMode: document.getElementById('camera-mode'),
    uploadMode: document.getElementById('upload-mode'),
    scannerVideo: document.getElementById('scanner-video'),
    scannerCanvas: document.getElementById('scanner-canvas'),
    cameraStatus: document.getElementById('camera-status'),
    cameraSelect: document.getElementById('camera-select'),
    startCameraBtn: document.getElementById('start-camera-btn'),
    stopCameraBtn: document.getElementById('stop-camera-btn'),
    dropZone: document.getElementById('drop-zone'),
    chooseImageBtn: document.getElementById('choose-image-btn'),
    imageInput: document.getElementById('image-input'),
    uploadPreview: document.getElementById('upload-preview'),
    scanResultEmpty: document.getElementById('scan-result-empty'),
    scanResultCard: document.getElementById('scan-result-card'),
    resultType: document.getElementById('result-type'),
    resultContent: document.getElementById('result-content'),
    resultActions: document.getElementById('result-actions'),
    scanAgainBtn: document.getElementById('scan-again-btn'),
    // Batch
    batchInput: document.getElementById('batch-input'),
    batchType: document.getElementById('batch-type'),
    batchGenerateBtn: document.getElementById('batch-generate-btn'),
    batchGrid: document.getElementById('batch-grid'),
    batchPrintBtn: document.getElementById('batch-print-btn')
};

// ==========================================
// 2. App State
// ==========================================
const state = {
    currentType: 'text',
    qrData: '',
    history: JSON.parse(localStorage.getItem('qrforge_history')) || [],
    favorites: JSON.parse(localStorage.getItem('qrforge_favorites')) || [],
    debounceTimer: null,
    customTimer: null,
    logoDataUrl: null,
    logoImage: null,
    batchItems: [],
    scanner: {
        stream: null,
        animationFrame: null,
        lastScanTime: 0,
        lastScannedData: '',
        lastScanTimestamp: 0
    }
};

// ==========================================
// 3. QR Type Handling
// ==========================================
const formTemplates = {
    text: `<div class="form-group"><label for="input-text">Text</label><textarea id="input-text" placeholder="Enter any text…"></textarea></div>`,
    url: `<div class="form-group"><label for="input-url">Website URL</label><input type="text" id="input-url" placeholder="https://example.com"><span class="error-msg">Invalid URL</span></div>`,
    wifi: `
        <div class="form-group"><label for="wifi-ssid">Network Name (SSID)</label><input type="text" id="wifi-ssid" placeholder="MyWiFi"></div>
        <div class="form-group"><label for="wifi-pass">Password</label><input type="password" id="wifi-pass" placeholder="password123"></div>
        <div class="form-group"><label for="wifi-type">Security Type</label><select id="wifi-type"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">None</option></select></div>
        <div class="form-group checkbox-group"><input type="checkbox" id="wifi-hidden"><label for="wifi-hidden">Hidden Network</label></div>`,
    phone: `<div class="form-group"><label for="input-phone">Phone Number</label><input type="tel" id="input-phone" placeholder="+911234567890"><span class="error-msg">Invalid phone number</span></div>`,
    email: `
        <div class="form-group"><label for="email-addr">Email Address</label><input type="email" id="email-addr" placeholder="user@example.com"><span class="error-msg">Invalid email</span></div>
        <div class="form-group"><label for="email-subject">Subject</label><input type="text" id="email-subject" placeholder="Hello"></div>
        <div class="form-group"><label for="email-body">Message</label><textarea id="email-body" placeholder="Message"></textarea></div>`,
    sms: `
        <div class="form-group"><label for="sms-phone">Phone Number</label><input type="tel" id="sms-phone" placeholder="+911234567890"><span class="error-msg">Invalid phone number</span></div>
        <div class="form-group"><label for="sms-body">Message</label><textarea id="sms-body" placeholder="Hello"></textarea></div>`,
    contact: `
        <div class="form-group"><label for="contact-name">Full Name</label><input type="text" id="contact-name" placeholder="John Doe"></div>
        <div class="form-group"><label for="contact-phone">Phone Number</label><input type="tel" id="contact-phone" placeholder="+911234567890"></div>
        <div class="form-group"><label for="contact-email">Email</label><input type="email" id="contact-email" placeholder="john@example.com"></div>
        <div class="form-group"><label for="contact-company">Company</label><input type="text" id="contact-company" placeholder="Company Inc."></div>
        <div class="form-group"><label for="contact-website">Website</label><input type="text" id="contact-website" placeholder="https://example.com"></div>
        <div class="form-group"><label for="contact-address">Address</label><textarea id="contact-address" placeholder="123 Main St, City"></textarea></div>`,
    location: `
        <div class="form-group"><label for="loc-lat">Latitude</label><input type="text" id="loc-lat" placeholder="26.7509"><span class="error-msg">Invalid latitude (-90 to 90)</span></div>
        <div class="form-group"><label for="loc-lng">Longitude</label><input type="text" id="loc-lng" placeholder="94.2037"><span class="error-msg">Invalid longitude (-180 to 180)</span></div>`
};

function renderForm(type) {
    dom.form.innerHTML = formTemplates[type];
    attachInputListeners();
}

// ==========================================
// 4. Input Formatting
// ==========================================
function buildQRData() {
    const type = state.currentType;
    let data = '';
    try {
        switch (type) {
            case 'text':
                data = document.getElementById('input-text')?.value || '';
                break;
            case 'url': {
                let url = document.getElementById('input-url')?.value || '';
                if (url && !url.match(/^https?:\/\//i)) url = 'https://' + url;
                data = url;
                break;
            }
            case 'wifi': {
                const ssid = document.getElementById('wifi-ssid')?.value || '';
                const pass = document.getElementById('wifi-pass')?.value || '';
                const sec = document.getElementById('wifi-type')?.value || 'WPA';
                const hidden = document.getElementById('wifi-hidden')?.checked ? 'H:true;' : '';
                data = `WIFI:T:${sec};S:${ssid};P:${pass};${hidden};`;
                break;
            }
            case 'phone':
                data = `tel:${document.getElementById('input-phone')?.value || ''}`;
                break;
            case 'email': {
                const email = document.getElementById('email-addr')?.value || '';
                const sub = encodeURIComponent(document.getElementById('email-subject')?.value || '');
                const body = encodeURIComponent(document.getElementById('email-body')?.value || '');
                data = `mailto:${email}?subject=${sub}&body=${body}`;
                break;
            }
            case 'sms': {
                const smsPhone = document.getElementById('sms-phone')?.value || '';
                const smsBody = encodeURIComponent(document.getElementById('sms-body')?.value || '');
                data = `sms:${smsPhone}?body=${smsBody}`;
                break;
            }
            case 'contact': {
                const name = document.getElementById('contact-name')?.value || '';
                const cPhone = document.getElementById('contact-phone')?.value || '';
                const cEmail = document.getElementById('contact-email')?.value || '';
                const comp = document.getElementById('contact-company')?.value || '';
                const web = document.getElementById('contact-website')?.value || '';
                const addr = document.getElementById('contact-address')?.value || '';
                data = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${cPhone}\nEMAIL:${cEmail}\nORG:${comp}\nURL:${web}\nADR:;;${addr};;;\nEND:VCARD`;
                break;
            }
            case 'location': {
                const lat = document.getElementById('loc-lat')?.value || '';
                const lng = document.getElementById('loc-lng')?.value || '';
                data = `geo:${lat},${lng}`;
                break;
            }
        }
    } catch (e) {
        console.error("Data build error", e);
    }
    return data.trim();
}

// ==========================================
// 5. QR Generation
// ==========================================
function generateQR(silent = false) {
    const data = buildQRData();
    if (!data || data === 'tel:' || data === 'geo:,' || data === 'mailto:?subject=&body=') {
        if (!silent) showToast('Input is empty or invalid', 'error');
        return;
    }
    if (!validateInput()) return;

    state.qrData = data;
    const size = parseInt(dom.qrSize.value);
    const colorDark = dom.fgColor.value;
    const colorLight = dom.bgColor.value;
    const correctLevel = QRCode.CorrectLevel[dom.errorCorrection.value];

    dom.qrContainer.innerHTML = '';

    try {
        const wantStyled = dom.dotStyle.value !== 'square' || dom.eyeStyle.value !== 'square';
        const styledCanvas = wantStyled ? makeStyledQRCanvas(data, size) : null;
        if (wantStyled && !styledCanvas) showToast('Style not available, using classic.', 'error');

        if (styledCanvas) {
            dom.qrContainer.appendChild(styledCanvas);
        } else {
            new QRCode(dom.qrContainer, {
                text: data, width: size, height: size,
                colorDark: colorDark, colorLight: colorLight,
                correctLevel: correctLevel
            });
        }

        addQuietZone(!!styledCanvas);

        dom.emptyState.classList.add('hidden');
        dom.qrContainer.classList.remove('hidden');
        dom.qrInfo.classList.remove('hidden');
        dom.infoType.textContent = state.currentType.charAt(0).toUpperCase() + state.currentType.slice(1);
        dom.infoSize.textContent = `${size}x${size}`;

        enableActionButtons(true);
        if (!silent) {
            saveHistory(data, state.currentType);
            showToast('QR generated successfully');
        }
    } catch (err) {
        showToast('Failed to generate QR', 'error');
        console.error(err);
    }
}

function addQuietZone(alreadyStyled = false) {
    const originalCanvas = dom.qrContainer.querySelector('canvas');
    if (!originalCanvas || originalCanvas.width === 0) return;

    const margin = Math.max(12, Math.round(originalCanvas.width * 0.08));
    const padded = document.createElement('canvas');
    padded.width = originalCanvas.width + margin * 2;
    padded.height = originalCanvas.height + margin * 2;
    const ctx = padded.getContext('2d');
    ctx.fillStyle = dom.bgColor.value;
    ctx.fillRect(0, 0, padded.width, padded.height);
    ctx.drawImage(originalCanvas, margin, margin);

    if (!alreadyStyled && dom.gradToggle.checked) applyGradient(ctx, padded.width, padded.height);
    if (state.logoImage) drawLogoOnCanvas(ctx, padded.width);

    dom.qrContainer.innerHTML = '';
    dom.qrContainer.appendChild(padded);
}

// ==========================================
// 6. QR Customization
// ==========================================
dom.qrSize.addEventListener('input', (e) => {
    dom.sizeLabel.textContent = e.target.value;
});

// ==========================================
// 7. Download Functions
// ==========================================
function downloadPNG() {
    if (!state.qrData) return;
    const canvas = dom.qrContainer.querySelector('canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = `QRForge-${state.currentType}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Downloaded ✓');
    }
}

function downloadSVG() {
    showToast('SVG export not supported by this library. Use PNG instead.', 'error');
}

function downloadPDF() {
    if (!state.qrData) { showToast('Generate a QR first.', 'error'); return; }
    const canvas = dom.qrContainer.querySelector('canvas');
    if (!canvas) { showToast('No QR to export.', 'error'); return; }

    const w = window.open('', '_blank');
    if (!w) { showToast('Popup blocked. Allow popups for this site.', 'error'); return; }

    const dataUrl = canvas.toDataURL('image/png');
    const label = state.currentType.charAt(0).toUpperCase() + state.currentType.slice(1) + ' QR';
    const safeData = escapeHtml(state.qrData.length > 80 ? state.qrData.substring(0, 80) + '…' : state.qrData);

    w.document.write(`<!DOCTYPE html><html><head><title>QRForge – ${label}</title><style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #000; display: flex; flex-direction: column; align-items: center; min-height: 90vh; }
        h1 { font-size: 22px; margin-bottom: 6px; }
        .type { font-size: 13px; color: #666; margin-bottom: 24px; }
        img { max-width: 320px; width: 100%; height: auto; }
        .data { margin-top: 20px; font-size: 12px; color: #333; word-break: break-all;
                max-width: 400px; text-align: center; padding: 10px; border: 1px dashed #ccc; border-radius: 6px; }
        .footer { margin-top: auto; padding-top: 20px; font-size: 11px; color: #999; }
        @media print { body { padding: 20px; } }
    </style></head><body>
    <h1>QRForge</h1>
    <div class="type">${label}</div>
    <img src="${dataUrl}" alt="QR code">
    <div class="data"><strong>Data:</strong> ${safeData}</div>
    <div class="footer">Generated offline · ${new Date().toLocaleString()}</div>
    <script>window.onload = function () { window.focus(); setTimeout(function(){ window.print(); }, 250); };<\/script>
    </body></html>`);
    w.document.close();
    showToast('Print dialog opened – choose "Save as PDF".');
}

// ==========================================
// 8. Clipboard Functions
// ==========================================
async function copyQRImage() {
    if (!state.qrData) return;
    const canvas = dom.qrContainer.querySelector('canvas');
    if (!canvas) { showToast('No QR image to copy', 'error'); return; }
    try {
        canvas.toBlob(async (blob) => {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showToast('Copied ✓');
        });
    } catch (err) {
        showToast('Copy image not supported in this browser', 'error');
    }
}

function copyQRData() {
    if (!state.qrData) return;
    copyText(state.qrData);
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => showToast('Copied ✓'));
}

// ==========================================
// 9. History
// ==========================================
function saveHistory(data, type) {
    const entry = { id: Date.now(), data, type, date: new Date().toLocaleString() };
    state.history.unshift(entry);
    if (state.history.length > 10) state.history.pop();
    localStorage.setItem('qrforge_history', JSON.stringify(state.history));
    renderHistory();
}

function renderHistory() {
    dom.historyList.innerHTML = state.history.length === 0
        ? '<li class="empty-list">No history yet.</li>'
        : state.history.map(item => `
            <li class="list-item">
                <div>
                    <strong>${escapeHtml(item.type.toUpperCase())}</strong><br>
                    <small>${escapeHtml(prettyPreview(item.data))}</small><br>
                    <small style="opacity:0.6">${escapeHtml(item.date)}</small>
                </div>
                <div class="list-item-actions">
                    <button class="list-btn" data-action="copy" data-id="${item.id}" title="Copy">📋</button>
                    <button class="list-btn" data-action="regen" data-id="${item.id}" title="Regenerate">🔄</button>
                    <button class="list-btn" data-action="del" data-id="${item.id}" title="Delete">🗑️</button>
                </div>
            </li>
        `).join('');
}

function deleteHistoryItem(id) {
    state.history = state.history.filter(item => item.id !== id);
    localStorage.setItem('qrforge_history', JSON.stringify(state.history));
    renderHistory();
    showToast('History item deleted');
}

function clearHistory() {
    state.history = [];
    localStorage.setItem('qrforge_history', JSON.stringify(state.history));
    renderHistory();
    showToast('History cleared');
}

dom.historyList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const item = state.history.find(h => h.id === id);
    if (!item) return;
    if (btn.dataset.action === 'regen') regenerateFromHistory(item.data, item.type);
    else if (btn.dataset.action === 'copy') copyText(item.data);
    else deleteHistoryItem(id);
});

// ==========================================
// 10. Favorites
// ==========================================
function toggleFavorite() {
    if (!state.qrData) return;
    const exists = state.favorites.find(f => f.data === state.qrData);
    if (exists) {
        state.favorites = state.favorites.filter(f => f.data !== state.qrData);
        showToast('Removed from favorites');
    } else {
        state.favorites.push({ data: state.qrData, type: state.currentType, date: new Date().toLocaleString() });
        showToast('Saved to favorites ✓');
    }
    localStorage.setItem('qrforge_favorites', JSON.stringify(state.favorites));
    renderFavorites();
}

function renderFavorites() {
    dom.favoritesList.innerHTML = state.favorites.length === 0
        ? '<li class="empty-list">No favorites yet.</li>'
        : state.favorites.map((item, i) => `
            <li class="list-item">
                <div>
                    <strong>⭐ ${escapeHtml(item.type.toUpperCase())}</strong><br>
                    <small>${escapeHtml(prettyPreview(item.data))}</small>
                </div>
                <div class="list-item-actions">
                    <button class="list-btn" data-action="copy" data-index="${i}" title="Copy">📋</button>
                    <button class="list-btn" data-action="regen" data-index="${i}" title="Regenerate">🔄</button>
                    <button class="list-btn" data-action="rem" data-index="${i}" title="Remove">❌</button>
                </div>
            </li>
        `).join('');
}

dom.favoritesList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const i = Number(btn.dataset.index);
    const item = state.favorites[i];
    if (!item) return;
    if (btn.dataset.action === 'regen') {
        regenerateFromHistory(item.data, item.type);
    } else if (btn.dataset.action === 'copy') {
        copyText(item.data);
    } else {
        state.favorites.splice(i, 1);
        localStorage.setItem('qrforge_favorites', JSON.stringify(state.favorites));
        renderFavorites();
        showToast('Removed from favorites');
    }
});

// ==========================================
// 11. Theme
// ==========================================
function applyTheme() {
    const saved = localStorage.getItem('qrforge_theme') || 'system';
    if (saved === 'dark' || (saved === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

dom.themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('qrforge_theme', next);
});

// ==========================================
// 12. Validation
// ==========================================
function isValidUrl(value) {
    if (!value) return false;
    try {
        const test = /^https?:\/\//i.test(value) ? value : 'https://' + value;
        const u = new URL(test);
        return u.hostname.includes('.');
    } catch (e) {
        return false;
    }
}

function validateInput() {
    let isValid = true;
    const type = state.currentType;

    document.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

    if (type === 'url') {
        const url = document.getElementById('input-url').value.trim();
        if (!isValidUrl(url)) {
            document.getElementById('input-url').parentElement.classList.add('error');
            isValid = false;
        }
    }
    if (type === 'email') {
        const email = document.getElementById('email-addr').value;
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            document.getElementById('email-addr').parentElement.classList.add('error');
            isValid = false;
        }
    }
    if (type === 'phone' || type === 'sms') {
        const phone = document.getElementById(type === 'phone' ? 'input-phone' : 'sms-phone').value;
        if (!phone.match(/^\+?[\d\s-]{7,15}$/)) {
            document.getElementById(type === 'phone' ? 'input-phone' : 'sms-phone').parentElement.classList.add('error');
            isValid = false;
        }
    }
    if (type === 'location') {
        const lat = parseFloat(document.getElementById('loc-lat').value);
        const lng = parseFloat(document.getElementById('loc-lng').value);
        if (isNaN(lat) || lat < -90 || lat > 90) {
            document.getElementById('loc-lat').parentElement.classList.add('error');
            isValid = false;
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
            document.getElementById('loc-lng').parentElement.classList.add('error');
            isValid = false;
        }
    }

    if (!isValid) showToast('Please fix invalid inputs', 'error');
    return isValid;
}

// ==========================================
// 13. Toast Notifications
// ==========================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    if (type === 'error') toast.style.borderLeft = '4px solid var(--danger)';
    dom.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ==========================================
// 14. Keyboard Shortcuts
// ==========================================
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); generateQR(); }
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); downloadPNG(); }
    if (e.ctrlKey && e.key === 'r') { e.preventDefault(); resetQR(); }
});

// ==========================================
// 15. Helpers & Initialization
// ==========================================
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function truncate(str, n) { return str.length > n ? str.substring(0, n) + '…' : str; }

function prettyPreview(data) {
    if (/^https?:\/\//i.test(data)) {
        try {
            const u = new URL(data);
            return u.hostname + (u.pathname !== '/' ? u.pathname.slice(0, 18) : '');
        } catch (e) { /* ignore */ }
    }
    if (data.startsWith('WIFI:')) { const m = data.match(/S:([^;]*)/); return 'Wi-Fi: ' + (m ? m[1] : ''); }
    if (data.startsWith('BEGIN:VCARD')) { const m = data.match(/FN:(.*)/); return 'Contact: ' + (m ? m[1].trim() : ''); }
    if (data.startsWith('geo:')) return 'Location: ' + data.slice(4);
    return truncate(data, 30);
}

function switchTab(type) {
    state.currentType = type;
    dom.tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
        tab.setAttribute('aria-selected', tab.dataset.type === type);
    });
    renderForm(type);
    resetQR(false);
}

function attachInputListeners() {
    dom.form.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(state.debounceTimer);
            state.debounceTimer = setTimeout(generateQR, 500);
        });
    });
}

function enableActionButtons(enable) {
    dom.downloadPngBtn.disabled = !enable;
    dom.downloadSvgBtn.disabled = !enable;
    dom.copyImageBtn.disabled = !enable;
    dom.copyDataBtn.disabled = !enable;
    dom.favoriteBtn.disabled = !enable;
    dom.downloadPdfBtn.disabled = !enable;
}

function resetQR(showToastMsg = true) {
    dom.form.reset();
    dom.qrContainer.innerHTML = '';
    dom.qrContainer.classList.add('hidden');
    dom.emptyState.classList.remove('hidden');
    dom.qrInfo.classList.add('hidden');
    enableActionButtons(false);
    state.qrData = '';
    if (showToastMsg) showToast('QR reset');
}

function regenerateFromHistory(data, type) {
    if (type === 'BATCH') { showToast('Use the Batch QR tab to create batches.'); return; }
    let tab = type;
    if (type === 'SCANNED') {
        const map = { 'Website':'url', 'Wi-Fi':'wifi', 'Phone':'phone', 'Email':'email', 'SMS':'sms', 'Location':'location', 'Contact':'contact', 'Text':'text' };
        tab = map[detectQRType(data)] || 'text';
    }
    switchToView('generator');
    switchTab(tab);
    setTimeout(() => {
        fillFormForType(tab, data);
        generateQR();
    }, 100);
}

function fillFormForType(type, data) {
    try {
        switch (type) {
            case 'text': document.getElementById('input-text').value = data; break;
            case 'url': document.getElementById('input-url').value = data.replace(/^https?:\/\//i, ''); break;
            case 'phone': document.getElementById('input-phone').value = data.replace(/^tel:/i, ''); break;
            case 'email': {
                const m = data.match(/^mailto:([^?]*)\??(.*)$/i);
                if (m) {
                    document.getElementById('email-addr').value = m[1];
                    const params = new URLSearchParams(m[2] || '');
                    document.getElementById('email-subject').value = params.get('subject') || '';
                    document.getElementById('email-body').value = params.get('body') || '';
                }
                break;
            }
            case 'sms': {
                const m = data.match(/^sms:([^?]*)\??(.*)$/i);
                if (m) {
                    document.getElementById('sms-phone').value = m[1];
                    const params = new URLSearchParams(m[2] || '');
                    document.getElementById('sms-body').value = params.get('body') || '';
                }
                break;
            }
            case 'location': {
                const m = data.match(/^geo:([-0-9.]+),([-0-9.]+)/i);
                if (m) {
                    document.getElementById('loc-lat').value = m[1];
                    document.getElementById('loc-lng').value = m[2];
                }
                break;
            }
            case 'wifi': {
                const w = parseWifiString(data);
                document.getElementById('wifi-ssid').value = w.ssid;
                document.getElementById('wifi-pass').value = w.password;
                document.getElementById('wifi-type').value = w.type;
                document.getElementById('wifi-hidden').checked = w.hidden;
                break;
            }
            case 'contact': {
                const v = parseVCard(data);
                document.getElementById('contact-name').value = v.name;
                document.getElementById('contact-phone').value = v.phone;
                document.getElementById('contact-email').value = v.email;
                document.getElementById('contact-company').value = v.company;
                document.getElementById('contact-website').value = v.website;
                document.getElementById('contact-address').value = v.address;
                break;
            }
        }
    } catch (e) {
        console.error('Fill form error:', e);
    }
}

function parseWifiString(data) {
    const result = { ssid: '', password: '', type: 'WPA', hidden: false };
    data.split(';').forEach(part => {
        if (part.startsWith('S:')) result.ssid = part.substring(2);
        if (part.startsWith('P:')) result.password = part.substring(2);
        if (part.startsWith('T:')) result.type = part.substring(2);
        if (part.startsWith('H:true')) result.hidden = true;
    });
    return result;
}

function parseVCard(data) {
    const result = { name: '', phone: '', email: '', company: '', website: '', address: '' };
    data.split('\n').forEach(line => {
        if (line.startsWith('FN:')) result.name = line.substring(3);
        if (line.startsWith('TEL:')) result.phone = line.substring(4);
        if (line.startsWith('EMAIL:')) result.email = line.substring(6);
        if (line.startsWith('ORG:')) result.company = line.substring(4);
        if (line.startsWith('URL:')) result.website = line.substring(4);
        if (line.startsWith('ADR:')) result.address = line.substring(4);
    });
    return result;
}

function switchToView(view) {
    dom.navTabs.forEach(t => t.classList.toggle('active', t.dataset.view === view));
    dom.generatorView.classList.toggle('hidden', view !== 'generator');
    dom.scannerView.classList.toggle('hidden', view !== 'scanner');
    dom.batchView.classList.toggle('hidden', view !== 'batch');
    if (view !== 'scanner') stopCamera();
}

dom.navTabs.forEach(tab => tab.addEventListener('click', () => switchToView(tab.dataset.view)));

dom.scannerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        dom.scannerTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        stopCamera();
        if (tab.dataset.mode === 'camera') {
            dom.cameraMode.classList.remove('hidden');
            dom.uploadMode.classList.add('hidden');
        } else {
            dom.cameraMode.classList.add('hidden');
            dom.uploadMode.classList.remove('hidden');
        }
    });
});

dom.tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.type)));
dom.generateBtn.addEventListener('click', () => { generateQR(); focusResult(); });
dom.downloadPngBtn.addEventListener('click', downloadPNG);
dom.downloadSvgBtn.addEventListener('click', downloadSVG);
dom.downloadPdfBtn.addEventListener('click', downloadPDF);
dom.copyImageBtn.addEventListener('click', copyQRImage);
dom.copyDataBtn.addEventListener('click', copyQRData);
dom.favoriteBtn.addEventListener('click', toggleFavorite);
dom.resetBtn.addEventListener('click', () => resetQR(true));
dom.clearHistoryBtn.addEventListener('click', clearHistory);

// Initial Load
applyTheme();
renderForm('text');
renderHistory();
renderFavorites();
initializeScanner();
initializeLogo();
initializeLiveCustom();
initializeBatch();
initializeMobileUX();
document.body.classList.add('mobile-tab-create');
syncHex();

// ==========================================
// 16. STYLE MODULE (Fancy dots & corner eyes)
// ==========================================
function makeStyledQRCanvas(data, size) {
    try {
        const holder = document.createElement('div');
        const qr = new QRCode(holder, {
            text: data, width: size, height: size,
            colorDark: '#000000', colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel[dom.errorCorrection.value]
        });
        const model = qr._oQRCode;
        if (!model || !model.modules) return null;

        const mc = model.moduleCount;
        const margin = 4;
        const cell = size / (mc + margin * 2);
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = dom.bgColor.value;
        ctx.fillRect(0, 0, size, size);

        const dotStyle = dom.dotStyle.value;
        const eyeStyle = dom.eyeStyle.value;
        const useGrad = dom.gradToggle.checked;
        const inFinder = (r, c) =>
            (r < 7 && c < 7) || (r < 7 && c >= mc - 7) || (r >= mc - 7 && c < 7);

        for (let r = 0; r < mc; r++) {
            for (let c = 0; c < mc; c++) {
                if (!model.modules[r][c] || inFinder(r, c)) continue;
                const x = (c + margin) * cell;
                const y = (r + margin) * cell;
                ctx.fillStyle = useGrad ? gradientColorAt(x + cell / 2, y + cell / 2, size) : dom.fgColor.value;
                drawDot(ctx, x, y, cell, dotStyle);
            }
        }

        const s = 7 * cell;
        const eyes = [
            [margin * cell, margin * cell],
            [(mc - 7 + margin) * cell, margin * cell],
            [margin * cell, (mc - 7 + margin) * cell]
        ];
        eyes.forEach(([ex, ey]) => {
            const color = useGrad ? gradientColorAt(ex + s / 2, ey + s / 2, size) : dom.fgColor.value;
            drawEye(ctx, ex, ey, s, eyeStyle, color);
        });
        return canvas;
    } catch (e) {
        console.error('Styled QR failed:', e);
        return null;
    }
}

function gradientColorAt(x, y, size) {
    const start = hexToRgb(dom.gradStart.value);
    const end = hexToRgb(dom.gradEnd.value);
    const t = (x + y) / (size * 2);
    const r = Math.round(start.r + (end.r - start.r) * t);
    const g = Math.round(start.g + (end.g - start.g) * t);
    const b = Math.round(start.b + (end.b - start.b) * t);
    return `rgb(${r},${g},${b})`;
}

function drawDot(ctx, x, y, cell, style) {
    ctx.beginPath();
    if (style === 'dots') {
        ctx.arc(x + cell / 2, y + cell / 2, cell * 0.45, 0, Math.PI * 2);
    } else if (style === 'rounded') {
        const r = cell * 0.3;
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + cell, y, x + cell, y + cell, r);
        ctx.arcTo(x + cell, y + cell, x, y + cell, r);
        ctx.arcTo(x, y + cell, x, y, r);
        ctx.arcTo(x, y, x + cell, y, r);
    } else {
        ctx.rect(x, y, cell + 0.5, cell + 0.5);
    }
    ctx.closePath();
    ctx.fill();
}

function drawEye(ctx, x, y, s, style, color) {
    const t = s / 7;
    ctx.fillStyle = color;
    eyeShape(ctx, x, y, s, style); ctx.fill();
    ctx.fillStyle = dom.bgColor.value;
    eyeShape(ctx, x + t, y + t, s - 2 * t, style); ctx.fill();
    ctx.fillStyle = color;
    eyeShape(ctx, x + 2 * t, y + 2 * t, s - 4 * t, style); ctx.fill();
}

function eyeShape(ctx, x, y, s, style) {
    ctx.beginPath();
    if (style === 'circle') {
        ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
    } else if (style === 'rounded') {
        const r = s * 0.3;
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + s, y, x + s, y + s, r);
        ctx.arcTo(x + s, y + s, x, y + s, r);
        ctx.arcTo(x, y + s, x, y, r);
        ctx.arcTo(x, y, x + s, y, r);
    } else {
        ctx.rect(x, y, s, s);
    }
    ctx.closePath();
}

// ==========================================
// 17. GRADIENT MODULE
// ==========================================
function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return {
        r: parseInt(h.substring(0, 2), 16),
        g: parseInt(h.substring(2, 4), 16),
        b: parseInt(h.substring(4, 6), 16)
    };
}

function applyGradient(ctx, width, height) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const fg = hexToRgb(dom.fgColor.value);
    const start = hexToRgb(dom.gradStart.value);
    const end = hexToRgb(dom.gradEnd.value);
    const tol = 60;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (Math.abs(r - fg.r) < tol && Math.abs(g - fg.g) < tol && Math.abs(b - fg.b) < tol) {
                const t = (x + y) / (width + height);
                data[i]     = Math.round(start.r + (end.r - start.r) * t);
                data[i + 1] = Math.round(start.g + (end.g - start.g) * t);
                data[i + 2] = Math.round(start.b + (end.b - start.b) * t);
            }
        }
    }
    ctx.putImageData(imgData, 0, 0);
}

function initializeLiveCustom() {
    const ids = ['fg-color', 'bg-color', 'error-correction', 'qr-size', 'grad-toggle', 'grad-start', 'grad-end', 'dot-style', 'eye-style'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const handler = () => {
            syncHex();
            if (id === 'grad-toggle') {
                dom.gradColors.classList.toggle('hidden', !el.checked);
                if (el.checked) showToast('Tip: dark gradient on light background scans best.');
            }
            if ((id === 'dot-style' || id === 'eye-style') && (dom.dotStyle.value !== 'square' || dom.eyeStyle.value !== 'square')) {
                showToast('Tip: fancy styles scan best at 400px+ with EC level H.');
            }
            scheduleSilentRegen();
        };
        el.addEventListener('input', handler);
        el.addEventListener('change', handler);
    });
}

function scheduleSilentRegen() {
    if (!state.qrData) return;
    clearTimeout(state.customTimer);
    state.customTimer = setTimeout(() => generateQR(true), 150);
}

// ==========================================
// 18. LOGO MODULE
// ==========================================
function initializeLogo() {
    dom.uploadLogoBtn.addEventListener('click', () => dom.logoInput.click());
    dom.logoInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleLogoFile(e.target.files[0]);
    });
    dom.removeLogoBtn.addEventListener('click', removeLogo);

    const saved = localStorage.getItem('qrforge_logo');
    if (saved) setLogo(saved);
}

function handleLogoFile(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Please choose an image file for the logo.', 'error');
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        showToast('Logo too large. Max 2 MB.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const max = 200;
            const scale = Math.min(1, max / Math.max(img.width, img.height));
            const w = Math.round(img.width * scale);
            const h = Math.round(img.height * scale);
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            c.getContext('2d').drawImage(img, 0, 0, w, h);
            setLogo(c.toDataURL('image/png'));
            showToast('Logo added! Error correction set to H.');
        };
        img.onerror = () => showToast('Could not read that image.', 'error');
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function setLogo(dataUrl) {
    state.logoDataUrl = dataUrl;
    const img = new Image();
    img.onload = () => {
        state.logoImage = img;
        if (state.qrData) generateQR();
    };
    img.src = dataUrl;

    dom.logoPreview.src = dataUrl;
    dom.logoPreview.classList.remove('hidden');
    dom.removeLogoBtn.classList.remove('hidden');
    dom.errorCorrection.value = 'H';

    try { localStorage.setItem('qrforge_logo', dataUrl); } catch (e) { console.warn('Logo too big to save'); }
}

function removeLogo() {
    state.logoDataUrl = null;
    state.logoImage = null;
    localStorage.removeItem('qrforge_logo');
    dom.logoPreview.classList.add('hidden');
    dom.removeLogoBtn.classList.add('hidden');
    dom.logoInput.value = '';
    showToast('Logo removed');
    if (state.qrData) generateQR();
}

function drawLogoOnCanvas(ctx, size) {
    if (!state.logoImage) return;
    const logoSize = Math.round(size * 0.22);
    const pad = Math.round(logoSize * 0.15);
    const x = (size - logoSize) / 2;
    const y = (size - logoSize) / 2;

    ctx.fillStyle = dom.bgColor.value;
    roundRect(ctx, x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, 12);
    ctx.fill();

    ctx.drawImage(state.logoImage, x, y, logoSize, logoSize);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// ==========================================
// 19. BATCH MODULE
// ==========================================
function initializeBatch() {
    dom.batchGenerateBtn.addEventListener('click', generateBatch);
    dom.batchPrintBtn.addEventListener('click', printSheet);

    dom.batchGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-batch-index]');
        if (!btn) return;
        const i = Number(btn.dataset.batchIndex);
        const item = state.batchItems[i];
        if (!item) return;
        const link = document.createElement('a');
        link.download = 'QRForge-batch-' + (i + 1) + '.png';
        link.href = item.dataUrl;
        link.click();
        showToast('Downloaded ✓');
    });
}

function makeQRCanvas(data, size) {
    const holder = document.createElement('div');
    new QRCode(holder, {
        text: data, width: size, height: size,
        colorDark: '#000000', colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });
    const canvas = holder.querySelector('canvas');
    const margin = Math.max(8, Math.round(canvas.width * 0.08));
    const padded = document.createElement('canvas');
    padded.width = canvas.width + margin * 2;
    padded.height = canvas.height + margin * 2;
    const ctx = padded.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, padded.width, padded.height);
    ctx.drawImage(canvas, margin, margin);
    return padded;
}

function generateBatch() {
    const lines = dom.batchInput.value.split('\n').map(l => l.trim()).filter(l => l.length);
    if (!lines.length) { showToast('Input is empty', 'error'); return; }
    if (lines.length > 50) { showToast('Max 50 items per batch.', 'error'); return; }

    const autoUrl = dom.batchType.value === 'auto';
    state.batchItems = lines.map((line) => {
        let data = line;
        if (autoUrl && !/^https?:\/\//i.test(line) && !line.includes(' ') && /^[\w-]+(\.[\w-]+)+/.test(line)) {
            data = 'https://' + line;
        }
        const canvas = makeQRCanvas(data, 220);
        return { label: line, data: data, dataUrl: canvas.toDataURL('image/png') };
    });

    dom.batchGrid.innerHTML = state.batchItems.map((item, i) => `
        <div class="batch-card">
            <img src="${item.dataUrl}" alt="QR code ${i + 1}">
            <div class="batch-label">${escapeHtml(item.label)}</div>
            <button class="action-btn" data-batch-index="${i}">⬇ PNG</button>
        </div>
    `).join('');

    dom.batchPrintBtn.classList.remove('hidden');
    saveHistory('Batch of ' + state.batchItems.length + ' QR codes', 'BATCH');
    showToast('Batch generated: ' + state.batchItems.length + ' QR codes');
}

function printSheet() {
    if (!state.batchItems.length) { showToast('Generate a batch first.', 'error'); return; }

    const w = window.open('', '_blank');
    if (!w) { showToast('Popup blocked. Allow popups for this site to print.', 'error'); return; }

    const cells = state.batchItems.map((item, i) => `
        <div class="cell">
            <img src="${item.dataUrl}" alt="QR ${i + 1}">
            <div class="label">${escapeHtml(item.label)}</div>
        </div>
    `).join('');

    w.document.write(`<!DOCTYPE html><html><head><title>QRForge Sheet</title><style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
        h1 { font-size: 18px; text-align: center; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; }
        .cell { border: 1px dashed #bbb; padding: 10px; text-align: center; page-break-inside: avoid; }
        .cell img { width: 100%; max-width: 220px; height: auto; }
        .label { margin-top: 6px; font-size: 12px; word-break: break-word; }
        @media print { .cell { border: none; } }
    </style></head><body>
    <h1>QRForge – QR Sheet (${state.batchItems.length} codes)</h1>
    <div class="grid">${cells}</div>
    <script>window.onload = function () { window.focus(); window.print(); };<\/script>
    </body></html>`);
    w.document.close();
    showToast('Print dialog opened – choose "Save as PDF" or print.');
}

// ==========================================
// 20. SCANNER MODULE
// ==========================================
function initializeScanner() {
    dom.startCameraBtn.addEventListener('click', startCamera);
    dom.stopCameraBtn.addEventListener('click', stopCamera);
    dom.cameraSelect.addEventListener('change', switchCamera);
    dom.chooseImageBtn.addEventListener('click', () => dom.imageInput.click());
    dom.imageInput.addEventListener('change', handleImageUpload);
    dom.scanAgainBtn.addEventListener('click', resetScanner);

    dom.dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dom.dropZone.classList.add('dragover'); });
    dom.dropZone.addEventListener('dragleave', () => dom.dropZone.classList.remove('dragover'));
    dom.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dom.dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files[0]);
    });

    window.addEventListener('beforeunload', stopCamera);
}

async function startCamera() {
    if (typeof jsQR === 'undefined') {
        showToast('Scanner library missing. Add libs/jsQR.js', 'error');
        return;
    }
    try {
        dom.cameraStatus.textContent = "Requesting camera access...";
        const constraints = { video: { facingMode: { ideal: 'environment' } }, audio: false };

        try {
            state.scanner.stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (e) {
            console.warn("Environment camera not found, falling back to default camera.");
            state.scanner.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        dom.scannerVideo.srcObject = state.scanner.stream;

        dom.scannerVideo.onplaying = () => {
            dom.startCameraBtn.classList.add('hidden');
            dom.stopCameraBtn.classList.remove('hidden');
            dom.cameraStatus.textContent = "Scanning... Hold QR in frame.";
            getCameraDevices();
            startScanningLoop();
        };
    } catch (err) {
        console.error("Camera Error:", err);
        dom.cameraStatus.textContent = "Camera error.";
        if (err.name === 'NotAllowedError') showToast("Camera permission denied. Check browser settings.", "error");
        else if (err.name === 'NotFoundError') showToast("No camera found on this device.", "error");
        else if (err.name === 'NotReadableError') showToast("Camera is in use by another app (Zoom, Teams, etc.).", "error");
        else showToast("Could not access camera.", "error");
    }
}

function stopCamera() {
    if (state.scanner.stream) {
        state.scanner.stream.getTracks().forEach(track => track.stop());
        state.scanner.stream = null;
    }
    if (state.scanner.animationFrame) {
        cancelAnimationFrame(state.scanner.animationFrame);
        state.scanner.animationFrame = null;
    }
    dom.scannerVideo.srcObject = null;
    dom.startCameraBtn.classList.remove('hidden');
    dom.stopCameraBtn.classList.add('hidden');
    dom.cameraStatus.textContent = "Camera stopped.";
    dom.cameraSelect.classList.add('hidden');
}

async function getCameraDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        if (videoDevices.length > 1) {
            dom.cameraSelect.innerHTML = videoDevices.map((d, i) =>
                `<option value="${d.deviceId}">${d.label || 'Camera ' + (i + 1)}</option>`
            ).join('');
            dom.cameraSelect.classList.remove('hidden');
        }
    } catch (e) { console.warn("Could not list cameras"); }
}

async function switchCamera() {
    const deviceId = dom.cameraSelect.value;
    if (state.scanner.stream) {
        state.scanner.stream.getTracks().forEach(t => t.stop());
        state.scanner.stream = null;
    }
    if (state.scanner.animationFrame) cancelAnimationFrame(state.scanner.animationFrame);
    try {
        state.scanner.stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } }, audio: false });
        dom.scannerVideo.srcObject = state.scanner.stream;
        dom.startCameraBtn.classList.add('hidden');
        dom.stopCameraBtn.classList.remove('hidden');
        dom.cameraStatus.textContent = "Scanning...";
        startScanningLoop();
    } catch (err) {
        showToast("Failed to switch camera", "error");
    }
}

function startScanningLoop() {
    const canvas = dom.scannerCanvas;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    function scanFrame(timestamp) {
        if (!state.scanner.stream) return;

        if (timestamp - state.scanner.lastScanTime > 100) {
            if (dom.scannerVideo.readyState === dom.scannerVideo.HAVE_ENOUGH_DATA) {
                const vw = dom.scannerVideo.videoWidth;
                const vh = dom.scannerVideo.videoHeight;
                if (vw > 0 && vh > 0) {
                    canvas.width = vw;
                    canvas.height = vh;
                    ctx.drawImage(dom.scannerVideo, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "attemptBoth"
                    });
                    if (code) {
                        handleScanResult(code.data);
                        return;
                    }
                }
            }
            state.scanner.lastScanTime = timestamp;
        }
        state.scanner.animationFrame = requestAnimationFrame(scanFrame);
    }
    state.scanner.animationFrame = requestAnimationFrame(scanFrame);
}

function handleImageUpload(e) {
    if (e.target.files.length) handleImageFile(e.target.files[0]);
}

function handleImageFile(file) {
    if (typeof jsQR === 'undefined') {
        showToast('Scanner library missing. Add libs/jsQR.js', 'error');
        return;
    }
    if (!file.type.startsWith('image/')) {
        showToast("Please upload a valid image (PNG/JPG/WEBP).", "error");
        return;
    }

    const objectUrl = URL.createObjectURL(file);
    dom.uploadPreview.src = objectUrl;
    dom.uploadPreview.classList.remove('hidden');

    const img = new Image();
    img.onload = () => {
        const canvas = dom.scannerCanvas;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });

        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

        if (code) {
            handleScanResult(code.data);
        } else {
            showToast("No QR code found in this image.", "error");
        }
    };
    img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        showToast("Could not read this image.", "error");
    };
    img.src = objectUrl;
}

function handleScanResult(data) {
    const now = Date.now();
    if (data === state.scanner.lastScannedData && (now - state.scanner.lastScanTimestamp) < 2000) return;

    state.scanner.lastScannedData = data;
    state.scanner.lastScanTimestamp = now;

    stopCamera();
    renderScanResult(data);
    saveHistory(data, 'SCANNED');
    showToast("QR detected successfully!");
}

function detectQRType(data) {
    if (/^https?:\/\//i.test(data)) return 'Website';
    if (/^WIFI:/i.test(data)) return 'Wi-Fi';
    if (/^tel:/i.test(data)) return 'Phone';
    if (/^mailto:/i.test(data)) return 'Email';
    if (/^sms:/i.test(data)) return 'SMS';
    if (/^geo:/i.test(data)) return 'Location';
    if (/^BEGIN:VCARD/i.test(data)) return 'Contact';
    return 'Text';
}

function renderScanResult(data) {
    const type = detectQRType(data);
    dom.resultType.textContent = type;
    dom.resultContent.textContent = data;

    dom.scanResultEmpty.classList.add('hidden');
    dom.scanResultCard.classList.remove('hidden');

    dom.resultActions.innerHTML = '';
    const addBtn = (text, onClick) => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = text;
        btn.onclick = onClick;
        dom.resultActions.appendChild(btn);
    };

    const isSafeUrl = /^https?:\/\//i.test(data);

    switch (type) {
        case 'Website':
            if (isSafeUrl) addBtn('Open Link', () => window.open(data, '_blank'));
            addBtn('Copy Link', () => copyText(data));
            break;
        case 'Phone':
            addBtn('Call', () => { window.location.href = data; });
            addBtn('Copy Number', () => copyText(data.replace(/^tel:/i, '')));
            break;
        case 'Email':
            addBtn('Send Email', () => { window.location.href = data; });
            addBtn('Copy Email', () => copyText(data));
            break;
        case 'SMS':
            addBtn('Open SMS', () => { window.location.href = data; });
            addBtn('Copy', () => copyText(data));
            break;
        case 'Location':
            addBtn('Open Maps', () => window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(data.replace(/^geo:/i, '')), '_blank'));
            addBtn('Copy Coords', () => copyText(data.replace(/^geo:/i, '')));
            break;
        case 'Wi-Fi':
            addBtn('Copy Wi-Fi Details', () => copyText(data));
            break;
        case 'Contact':
            addBtn('Copy Contact Data', () => copyText(data));
            break;
        default:
            addBtn('Copy Text', () => copyText(data));
    }
    addBtn('Copy Result', () => copyText(data));
}

function resetScanner() {
    dom.scanResultCard.classList.add('hidden');
    dom.scanResultEmpty.classList.remove('hidden');
    dom.uploadPreview.classList.add('hidden');
    dom.imageInput.value = '';
    state.scanner.lastScannedData = '';

    if (!dom.cameraMode.classList.contains('hidden')) {
        startCamera();
    }
}

// ==========================================
// 21. MOBILE UX MODULE (bottom nav, accordions, hex chips)
// ==========================================
function initializeMobileUX() {
    document.querySelectorAll('.bnav-item').forEach(b =>
        b.addEventListener('click', () => setMobileTab(b.dataset.tab)));

    document.querySelectorAll('.acc-header').forEach(h =>
        h.addEventListener('click', () => {
            const open = h.parentElement.classList.toggle('open');
            h.setAttribute('aria-expanded', open);
        }));

    dom.moreActionsBtn.addEventListener('click', () =>
        dom.actionButtons.classList.toggle('show-more'));

    dom.openBatchBtn.addEventListener('click', () => switchToView('batch'));
}

function setMobileTab(tab) {
    document.body.classList.remove('mobile-tab-create', 'mobile-tab-scan', 'mobile-tab-history', 'mobile-tab-favorites');
    document.body.classList.add('mobile-tab-' + tab);
    document.querySelectorAll('.bnav-item').forEach(b =>
        b.classList.toggle('active', b.dataset.tab === tab));
    if (tab === 'scan') switchToView('scanner');
    else switchToView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function focusResult() {
    if (window.innerWidth > 768 || !state.qrData) return;
    setTimeout(() => {
        document.getElementById('qr-preview-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
}

function syncHex() {
    dom.fgHex.textContent = dom.fgColor.value.toUpperCase();
    dom.bgHex.textContent = dom.bgColor.value.toUpperCase();
    dom.gradStartHex.textContent = dom.gradStart.value.toUpperCase();
    dom.gradEndHex.textContent = dom.gradEnd.value.toUpperCase();
}

// ==========================================
// 22. PWA: Service Worker registration
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => console.warn('Service worker not available'));
    });
}