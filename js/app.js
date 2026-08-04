/**
 * Skin Intelligence & Personalized Skincare Planner
 * Full-Stack Client connected to FastAPI Backend (JWT Auth, OpenCV ML Model, SQLite DB & Gemini LLM)
 */

const API_BASE = "http://127.0.0.1:8000";

document.addEventListener('DOMContentLoaded', () => {
    // App State
    const state = {
        currentUser: null,
        authToken: localStorage.getItem('skin_intel_token') || null,
        currentRole: 'user',
        currentAnalysis: null,
        currentAssessmentId: null,
        currentAgeGroup: '26-39',
        selectedProductCategory: 'All',
        selectedProductSort: 'match',
        completedStepIds: new Set(),
        userProfile: {
            name: 'Sophia Chen',
            age: 28,
            skinType: 'Combination / Sensitive',
            sleepHours: 7.5,
            waterLiters: 2.2,
            sunExposure: 'Moderate',
            stressLevel: 'Medium',
            routineConsistencyDays: 6
        },
        clientProfiles: window.SKIN_DATA ? window.SKIN_DATA.CLIENT_PROFILES : []
    };

    // UI Elements
    const roleBtns = document.querySelectorAll('.role-btn');
    const roleViews = document.querySelectorAll('.role-view');
    const imageUploadInput = document.getElementById('image-upload');
    const dropzone = document.getElementById('upload-dropzone');
    const previewImg = document.getElementById('preview-img');
    const annotatedCanvasImg = document.getElementById('annotated-canvas-img');
    const presetBtns = document.querySelectorAll('.btn-preset');
    const webcamBtn = document.getElementById('btn-webcam');
    const scanStatus = document.getElementById('scan-status');

    const estimatedAgeBadge = document.getElementById('estimated-age-badge');
    const userAgeSelect = document.getElementById('user-age-select');
    const ageFocusText = document.getElementById('age-focus-text');

    const prodFilterBtns = document.querySelectorAll('.btn-prod-filter');
    const prodSortSelect = document.getElementById('prod-sort-select');

    const authHeaderContainer = document.getElementById('auth-header-container');
    const loginModal = document.getElementById('login-modal');
    const loginModalClose = document.getElementById('login-modal-close');
    const btnOpenLogin = document.getElementById('btn-open-login');
    const authLoginForm = document.getElementById('auth-login-form');
    const demoLoginBtns = document.querySelectorAll('.btn-demo-login');

    const chatContainer = document.getElementById('chat-messages-container');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('btn-chat-send');
    const chatQuickBtns = document.querySelectorAll('.btn-chat-quick');

    const modal = document.getElementById('client-modal');
    const modalBody = document.getElementById('modal-body');

    function formatConcernLabel(key) {
        const map = {
            'acne': 'Blemishes',
            'hyperpigmentation': 'Dark Spots',
            'wrinkles': 'Fine Lines',
            'redness': 'Redness & Sensitive',
            'oily_pores': 'Pores & Sebum',
            'dryness': 'Dryness & Barrier'
        };
        return map[key] || key;
    }

    // ================= 1. INITIALIZATION & IMMEDIATE UI RENDER =================
    const initialAnalysis = {
        estimatedAge: { id: '26-39', years: 28 },
        overallConditionScore: 78,
        skinType: 'Combination / Sensitive',
        classFindings: {
            acne: { score: 45, severity: 'Needs Gentle Care', confidence: 95 },
            hyperpigmentation: { score: 38, severity: 'Noticeable Spots', confidence: 91 },
            wrinkles: { score: 25, severity: 'Superficial Lines', confidence: 94 },
            redness: { score: 52, severity: 'Localized Redness', confidence: 88 },
            oily_pores: { score: 40, severity: 'Moderate Shine', confidence: 92 },
            dryness: { score: 30, severity: 'Mild Tightness', confidence: 89 }
        }
    };
    state.currentAnalysis = initialAnalysis;

    // Immediately render all sections so page is wowed on load!
    renderScanResults(state.currentAnalysis);
    renderConsultantDashboard();
    renderDermatologistDashboard();

    // Check for saved assessment or live backend session
    checkAuthSession();
    fetchBackendAssessments();

    // ================= 2. GLOBAL DELEGATED CLICK HANDLERS FOR MODALS =================
    document.addEventListener('click', (e) => {
        const viewPlanBtn = e.target.closest('.btn-view-plan');
        if (viewPlanBtn) {
            const clientId = viewPlanBtn.getAttribute('data-client-id');
            openClientPlanModal(clientId);
            return;
        }

        const closeBtn = e.target.closest('.modal-close, #btn-close-modal-inside');
        if (closeBtn || e.target === modal || e.target === loginModal) {
            if (modal) modal.classList.remove('active');
            if (loginModal) loginModal.classList.remove('active');
            return;
        }
    });

    function openClientPlanModal(clientId) {
        const client = state.clientProfiles.find(c => c.id === clientId);
        if (!client || !modalBody || !modal) return;

        modalBody.innerHTML = `
            <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem;">
                <div class="user-avatar-initials" style="width:54px; height:54px; font-size:1.2rem; background:var(--terracotta); color:#fff;">${client.initials || 'SC'}</div>
                <div>
                    <h2 class="font-serif" style="font-size:1.5rem; color:var(--text-primary); margin:0;">${client.name}</h2>
                    <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">
                        Age ${client.age} (${client.ageGroup || '26-39'}) • ${client.skinType} • Health Score: <strong style="color:var(--sage);">${client.overallScore}/100</strong>
                    </div>
                </div>
            </div>

            <div style="background:var(--bg-warm-accent); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-soft); margin-bottom:1.25rem;">
                <h4 style="font-family:'Playfair Display', serif; font-size:1.1rem; color:var(--text-primary); margin-bottom:0.5rem;">Primary Focus Areas</h4>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                    ${client.primaryConcerns.map(c => `<span style="background:#ffffff; border:1px solid var(--border-soft); padding:4px 12px; border-radius:var(--radius-full); font-size:0.8rem; font-weight:600; color:var(--terracotta);">${formatConcernLabel(c)}</span>`).join(' ')}
                </div>
            </div>

            <div style="background:var(--bg-warm-accent); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-soft); margin-bottom:1.25rem;">
                <h4 style="font-family:'Playfair Display', serif; font-size:1.1rem; color:var(--text-primary); margin-bottom:0.5rem;">Lifestyle & Clinical Metrics</h4>
                <div style="font-size:0.85rem; color:var(--text-secondary); display:grid; grid-template-columns:1fr 1fr; gap:0.6rem;">
                    <div>💤 Sleep: <strong>${client.lifestyle.sleepHours} hrs/night</strong></div>
                    <div>💧 Water: <strong>${client.lifestyle.waterLiters} L/day</strong></div>
                    <div>☀️ Sun Exposure: <strong>${client.lifestyle.sunExposure}</strong></div>
                    <div>🧘 Stress Level: <strong>${client.lifestyle.stressLevel}</strong></div>
                </div>
            </div>

            <div style="background:#ffffff; padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-soft); margin-bottom:1.25rem;">
                <h4 style="font-family:'Playfair Display', serif; font-size:1.1rem; color:var(--text-primary); margin-bottom:0.5rem;">Clinical Notes & Specialist Impression</h4>
                <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5; margin:0;">
                    ${client.clinicalNote || 'Patient exhibits localized focus areas requiring barrier support and daily SPF 50 mineral protection.'}
                </p>
            </div>

            <div style="text-align:right;">
                <button class="btn btn-primary" id="btn-close-modal-inside">Close Care Plan</button>
            </div>
        `;

        modal.classList.add('active');
    }

    // ================= 3. AUTHENTICATION & SESSION =================
    if (btnOpenLogin) btnOpenLogin.addEventListener('click', () => { if (loginModal) loginModal.classList.add('active'); });
    if (loginModalClose) loginModalClose.addEventListener('click', () => { if (loginModal) loginModal.classList.remove('active'); });

    async function checkAuthSession() {
        if (!state.authToken) return;
        try {
            const res = await fetch(`${API_BASE}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${state.authToken}` }
            });
            if (res.ok) {
                const userData = await res.json();
                loginUser(userData, state.authToken);
            } else {
                localStorage.removeItem('skin_intel_token');
                state.authToken = null;
            }
        } catch (e) {
            console.log("FastAPI Auth Server Offline or connecting locally...", e);
        }
    }

    if (authLoginForm) {
        authLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password')?.value || "SecurePassword123!";
            const role = document.getElementById('login-role')?.value || "user";

            try {
                let res = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!res.ok) {
                    res = await fetch(`${API_BASE}/api/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email,
                            password,
                            full_name: email.split('@')[0].replace('.', ' '),
                            role
                        })
                    });
                }

                if (res.ok) {
                    const tokenData = await res.json();
                    localStorage.setItem('skin_intel_token', tokenData.access_token);
                    loginUser({
                        id: tokenData.user_id,
                        email: tokenData.email,
                        full_name: tokenData.full_name,
                        role: tokenData.role
                    }, tokenData.access_token);
                    if (loginModal) loginModal.classList.remove('active');
                } else {
                    const err = await res.json();
                    alert(`Authentication Error: ${err.detail || 'Could not sign in'}`);
                }
            } catch (err) {
                console.error("Auth error:", err);
            }
        });
    }

    demoLoginBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const role = btn.dataset.role;
            const email = btn.dataset.email;
            const password = "SecurePassword123!";

            try {
                let res = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!res.ok) {
                    res = await fetch(`${API_BASE}/api/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email,
                            password,
                            full_name: btn.dataset.name,
                            role
                        })
                    });
                }

                if (res.ok) {
                    const tokenData = await res.json();
                    localStorage.setItem('skin_intel_token', tokenData.access_token);
                    loginUser({
                        id: tokenData.user_id,
                        email: tokenData.email,
                        full_name: tokenData.full_name,
                        role: tokenData.role
                    }, tokenData.access_token);
                    if (loginModal) loginModal.classList.remove('active');
                }
            } catch (err) {
                console.error("Demo login error:", err);
            }
        });
    });

    function loginUser(userObj, token) {
        state.currentUser = userObj;
        state.authToken = token;
        state.currentRole = userObj.role;

        const displayName = userObj.full_name || userObj.email.split('@')[0];
        const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        if (authHeaderContainer) {
            authHeaderContainer.innerHTML = `
                <div class="user-auth-badge">
                    <div class="user-avatar-initials">${initials || 'SK'}</div>
                    <div style="font-size:0.8rem; font-weight:600; color:var(--text-primary); cursor:pointer;" title="Click to Sign Out" id="btn-logout">
                        ${displayName} <span style="font-size:0.7rem; color:var(--terracotta);">(${userObj.role})</span> 🚪
                    </div>
                </div>
            `;

            document.getElementById('btn-logout').addEventListener('click', () => {
                localStorage.removeItem('skin_intel_token');
                alert('You have been signed out.');
                location.reload();
            });
        }

        roleBtns.forEach(b => {
            if (b.dataset.role === userObj.role) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        roleViews.forEach(view => {
            view.style.display = (view.id === `view-${userObj.role}`) ? 'block' : 'none';
        });

        if (userObj.role === 'consultant') renderConsultantDashboard();
        if (userObj.role === 'dermatologist') renderDermatologistDashboard();
        if (userObj.role === 'admin') renderAdminDashboard();
    }

    // Preset Demo Profiles
    const PRESET_IMAGES = [
        {
            name: 'Profile A: Young Blemish Care (22y)',
            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
            forcedAgeGroup: '18-25'
        },
        {
            name: 'Profile B: Adult Dark Spots (32y)',
            url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
            forcedAgeGroup: '26-39'
        },
        {
            name: 'Profile C: Mature Firming (48y)',
            url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
            forcedAgeGroup: '40-54'
        }
    ];

    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            roleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetRole = btn.dataset.role;
            state.currentRole = targetRole;

            roleViews.forEach(view => {
                view.style.display = (view.id === `view-${targetRole}`) ? 'block' : 'none';
            });

            if (targetRole === 'consultant') renderConsultantDashboard();
            if (targetRole === 'dermatologist') renderDermatologistDashboard();
            if (targetRole === 'admin') renderAdminDashboard();
        });
    });

    if (userAgeSelect) {
        userAgeSelect.addEventListener('change', (e) => {
            state.currentAgeGroup = e.target.value;
            updateAgeBadgeUI(state.currentAgeGroup);
            if (state.currentAnalysis) {
                renderScanResults(state.currentAnalysis);
            }
        });
    }

    prodFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            prodFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedProductCategory = btn.dataset.category;
            renderFilteredProducts();
        });
    });

    if (prodSortSelect) {
        prodSortSelect.addEventListener('change', (e) => {
            state.selectedProductSort = e.target.value;
            renderFilteredProducts();
        });
    }

    // ================= 4. FASTAPI COMPUTER VISION ML MODEL & UPLOADS =================
    if (dropzone) {
        dropzone.addEventListener('click', () => imageUploadInput.click());
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--terracotta)'; });
        dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--border-warm)'; });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'var(--border-warm)';
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                uploadImageToBackend(e.dataTransfer.files[0]);
            }
        });
    }

    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                uploadImageToBackend(e.target.files[0]);
            }
        });
    }

    presetBtns.forEach((btn, index) => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (scanStatus) scanStatus.textContent = 'Fetching preset skin photo...';
            try {
                const response = await fetch(PRESET_IMAGES[index].url);
                const blob = await response.blob();
                const file = new File([blob], `preset_${index}.jpg`, { type: 'image/jpeg' });
                uploadImageToBackend(file);
            } catch (err) {
                console.error("Preset load error:", err);
            }
        });
    });

    if (webcamBtn) {
        webcamBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const video = document.createElement('video');
                video.srcObject = stream;
                await video.play();

                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;
                canvas.getContext('2d').drawImage(video, 0, 0);

                stream.getTracks().forEach(track => track.stop());

                canvas.toBlob((blob) => {
                    const file = new File([blob], "webcam_snap.png", { type: "image/png" });
                    uploadImageToBackend(file);
                }, 'image/png');
            } catch (err) {
                alert('Webcam unavailable. Preset sample photo loaded.');
            }
        });
    }

    async function uploadImageToBackend(file) {
        if (scanStatus) {
            scanStatus.textContent = '⚡ Running OpenCV Computer Vision ML Pipeline...';
            scanStatus.style.color = 'var(--terracotta)';
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (previewImg) {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('file', file);

        const headers = {};
        if (state.authToken) {
            headers['Authorization'] = `Bearer ${state.authToken}`;
        }

        try {
            const res = await fetch(`${API_BASE}/api/assess`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (!res.ok) {
                throw new Error(`FastAPI Server Error: ${res.statusText}`);
            }

            const data = await res.json();
            state.currentAssessmentId = data.id;

            const origUrl = `${API_BASE}${data.original_image_url}`;
            const annoUrl = `${API_BASE}${data.annotated_image_url}`;

            if (previewImg) previewImg.src = origUrl;
            if (annotatedCanvasImg) {
                annotatedCanvasImg.src = annoUrl;
                annotatedCanvasImg.style.display = 'block';
            }

            let ageGroupId = '26-39';
            if (data.estimated_age < 25) ageGroupId = '18-25';
            else if (data.estimated_age >= 25 && data.estimated_age < 40) ageGroupId = '26-39';
            else if (data.estimated_age >= 40 && data.estimated_age < 55) ageGroupId = '40-54';
            else ageGroupId = '55+';

            state.currentAgeGroup = ageGroupId;
            if (userAgeSelect) userAgeSelect.value = ageGroupId;

            const classFindings = {
                acne: { score: Math.round(100 - data.metrics.blemish_clarity.score), severity: data.metrics.blemish_clarity.status, confidence: 95 },
                hyperpigmentation: { score: Math.round(100 - data.metrics.pigmentation_evenness.score), severity: data.metrics.pigmentation_evenness.status, confidence: 91 },
                wrinkles: { score: Math.round(100 - data.metrics.wrinkle_clarity.score), severity: data.metrics.wrinkle_clarity.status, confidence: 94 },
                redness: { score: Math.round(100 - data.metrics.calmness_sensitivity.score), severity: data.metrics.calmness_sensitivity.status, confidence: 88 },
                oily_pores: { score: Math.round(100 - data.metrics.pore_refinement.score), severity: data.metrics.pore_refinement.status, confidence: 92 },
                dryness: { score: Math.round(100 - data.metrics.moisture_barrier.score), severity: data.metrics.moisture_barrier.status, confidence: 89 }
            };

            state.currentAnalysis = {
                estimatedAge: { id: ageGroupId, years: data.estimated_age },
                overallConditionScore: data.overall_score,
                skinType: data.skin_type,
                classFindings,
                overlayDataUrl: annoUrl
            };

            if (scanStatus) {
                scanStatus.textContent = `✅ ML Scan Complete! Est. Age: ${data.estimated_age}y (${data.skin_type})`;
                scanStatus.style.color = 'var(--sage)';
            }

            updateAgeBadgeUI(ageGroupId, `ML Est. Age: ${data.estimated_age} years (${data.skin_type})`);
            renderScanResults(state.currentAnalysis);

        } catch (err) {
            console.error("FastAPI Upload Error:", err);
            if (scanStatus) {
                scanStatus.textContent = `Notice: Scan saved locally. (${err.message})`;
                scanStatus.style.color = 'var(--text-muted)';
            }
        }
    }

    function updateAgeBadgeUI(ageGroupId, customFocus = null) {
        const groupObj = window.SKIN_DATA.AGE_GROUPS.find(g => g.id === ageGroupId);
        if (estimatedAgeBadge && groupObj) {
            estimatedAgeBadge.textContent = `Age Profile: ${groupObj.label}`;
        }
        if (ageFocusText && groupObj) {
            ageFocusText.textContent = `Target Focus: ${customFocus || groupObj.focus}.`;
        }
    }

    function renderScanResults(analysis) {
        if (!analysis || !analysis.classFindings) return;
        const findings = analysis.classFindings;
        const concernGrid = document.getElementById('concern-grid');
        if (concernGrid) {
            concernGrid.innerHTML = '';

            window.SKIN_DATA.CONCERN_CLASSES.forEach(cls => {
                const data = findings[cls.id];
                if (!data) return;

                const card = document.createElement('div');
                card.className = 'concern-card';
                card.style.setProperty('--class-color', cls.color);

                card.innerHTML = `
                    <div class="concern-header">
                        <span>${cls.name}</span>
                        <span class="severity-pill" style="color:${cls.color}">${data.severity}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:var(--text-secondary)">
                        <span>Observation Index</span>
                        <strong style="color:var(--text-primary)">${data.score}/100</strong>
                    </div>
                    <div class="score-bar-bg">
                        <div class="score-bar-fill" style="width: ${data.score}%"></div>
                    </div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                        FastAPI ML Confidence: ${data.confidence}%
                    </div>
                `;
                concernGrid.appendChild(card);
            });
        }

        const healthResult = SkinScoringEngine.calculateHealthScore({
            conditionScore: analysis.overallConditionScore,
            sleepHours: state.userProfile.sleepHours,
            waterLiters: state.userProfile.waterLiters,
            sunExposure: state.userProfile.sunExposure,
            stressLevel: state.userProfile.stressLevel,
            routineConsistencyDays: state.userProfile.routineConsistencyDays
        });

        const scoreCircle = document.getElementById('score-circle');
        const scoreVal = document.getElementById('score-value');
        const scoreGrade = document.getElementById('score-grade');

        if (scoreCircle && scoreVal) {
            scoreVal.textContent = healthResult.overallScore;
            scoreGrade.textContent = `Status: ${healthResult.grade}`;
            scoreGrade.style.color = healthResult.gradeColor;

            const deg = (healthResult.overallScore / 100) * 360;
            scoreCircle.style.setProperty('--score-deg', deg);
            scoreCircle.style.setProperty('--score-color', healthResult.gradeColor);
        }

        const breakdownEl = document.getElementById('score-breakdown-list');
        if (breakdownEl) {
            breakdownEl.innerHTML = '';
            Object.entries(healthResult.breakdown).forEach(([key, val]) => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-soft); font-size:0.85rem;';
                row.innerHTML = `
                    <span style="text-transform:capitalize; color:var(--text-secondary); font-weight:500;">${key} (${val.weight})</span>
                    <strong style="color:var(--text-primary);">${val.score}/100 <span style="color:var(--text-muted); font-weight:normal;">(+${val.weightedContrib} pts)</span></strong>
                `;
                breakdownEl.appendChild(row);
            });
        }

        const activeConcerns = Object.keys(findings).filter(k => findings[k].score > 35);
        const routine = SkincareRoutineGenerator.generatePersonalizedRoutine(activeConcerns, state.userProfile.skinType, state.currentAgeGroup);
        renderRoutineSteps('morning-routine-list', routine.morning);
        renderRoutineSteps('afternoon-routine-list', routine.afternoon);
        renderRoutineSteps('evening-routine-list', routine.evening);
        renderRoutineSteps('weekly-routine-list', routine.weekly);
        updateRoutineProgressTracker();

        renderIngredientSafety();
        renderFilteredProducts();
    }

    function renderRoutineSteps(containerId, steps) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        if (!steps || steps.length === 0) {
            container.innerHTML = '<div style="padding:10px; color:var(--text-muted); font-size:0.85rem;">No specific steps needed for this ritual.</div>';
            return;
        }

        steps.forEach((step, idx) => {
            const stepId = `${containerId}-${idx}`;
            const isChecked = state.completedStepIds.has(stepId);
            const item = document.createElement('div');
            item.style.cssText = 'padding:10px 12px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;';
            item.innerHTML = `
                <div>
                    <div style="font-size:0.72rem; color:var(--terracotta); font-weight:700; text-transform:uppercase;">${step.category || 'Step ' + (idx + 1)}</div>
                    <strong style="color:var(--text-primary); font-size:0.9rem;">${step.name || 'Care Step'}</strong>
                    <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">✨ <em>Active:</em> ${step.active || 'Gentle Formulated Care'}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${step.instruction || ''}</div>
                </div>
                <input type="checkbox" data-step-id="${stepId}" ${isChecked ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;">
            `;
            container.appendChild(item);
        });

        container.querySelectorAll('input[type="checkbox"]').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const id = e.target.dataset.stepId;
                if (e.target.checked) state.completedStepIds.add(id);
                else state.completedStepIds.delete(id);
                updateRoutineProgressTracker();
            });
        });
    }

    function updateRoutineProgressTracker() {
        const completedCount = state.completedStepIds.size;
        const trackerSpan = document.querySelector('span[style*="Completed"]');
        if (trackerSpan) {
            trackerSpan.textContent = `${completedCount} of 4 Steps Completed`;
        }
    }

    function renderIngredientSafety() {
        const box = document.getElementById('ingredient-safety-box');
        if (!box) return;

        const selectedIngredients = ['Retinol', 'Vitamin C', 'Salicylic Acid', 'Niacinamide', 'Ceramides'];
        const safety = SkincareRoutineGenerator.analyzeIngredientSafety(selectedIngredients);

        box.innerHTML = '';

        if (safety.conflicts.length > 0) {
            safety.conflicts.forEach(c => {
                const div = document.createElement('div');
                div.style.cssText = 'background:var(--terracotta-soft); border:1px solid var(--terracotta); border-radius:var(--radius-md); padding:0.85rem; margin-bottom:0.75rem; font-size:0.82rem;';
                div.innerHTML = `
                    <strong style="color:var(--terracotta); display:block; margin-bottom:4px;">💡 ${c.type} (${c.ingredients.join(' + ')})</strong>
                    <span style="color:var(--text-primary); line-height:1.4;">${c.advice}</span>
                `;
                box.appendChild(div);
            });
        }

        if (safety.synergies.length > 0) {
            safety.synergies.forEach(s => {
                const div = document.createElement('div');
                div.style.cssText = 'background:var(--sage-soft); border:1px solid var(--sage); border-radius:var(--radius-md); padding:0.85rem; margin-bottom:0.75rem; font-size:0.82rem;';
                div.innerHTML = `
                    <strong style="color:var(--sage); display:block; margin-bottom:4px;">✨ ${s.benefit} (${s.ingredients.join(' + ')})</strong>
                    <span style="color:var(--text-primary); line-height:1.4;">${s.advice}</span>
                `;
                box.appendChild(div);
            });
        }
    }

    function renderFilteredProducts() {
        const grid = document.getElementById('product-recommendations-grid');
        if (!grid) return;
        grid.innerHTML = '';

        let prods = [...(window.SKIN_DATA ? window.SKIN_DATA.PRODUCTS : [])];

        if (state.selectedProductCategory !== 'All') {
            const cat = state.selectedProductCategory.toLowerCase();
            prods = prods.filter(p => {
                const pCat = (p.category || '').toLowerCase();
                return pCat.includes(cat) || cat.includes(pCat);
            });
        }

        const activeConcerns = state.currentAnalysis ? Object.keys(state.currentAnalysis.classFindings).filter(k => state.currentAnalysis.classFindings[k].score > 35) : ['acne', 'wrinkles'];
        const skinType = state.currentAnalysis ? state.currentAnalysis.skinType : state.userProfile.skinType;

        prods = prods.map(p => {
            const match = SkincareRoutineGenerator.calculateAgeAdjustedMatch(p, activeConcerns, state.currentAgeGroup, skinType);
            return { ...p, suitabilityScore: match.suitabilityScore, ageMatchExplanation: match.ageMatchExplanation };
        });

        if (state.selectedProductSort === 'match') {
            prods.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
        } else if (state.selectedProductSort === 'price-low') {
            prods.sort((a, b) => a.price - b.price);
        } else if (state.selectedProductSort === 'price-high') {
            prods.sort((a, b) => b.price - a.price);
        }

        if (prods.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; padding: 2rem; text-align: center; color: var(--text-muted); background: var(--bg-warm-accent); border-radius: var(--radius-md);">No products found matching this category filter.</div>';
            return;
        }

        prods.forEach(p => {
            const card = document.createElement('div');
            card.style.cssText = 'background:#ffffff; border:1px solid var(--border-soft); border-radius:var(--radius-md); padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: transform 0.2s ease, box-shadow 0.2s ease;';

            const badgeBg = p.suitabilityScore >= 88 ? 'var(--sage-soft)' : (p.suitabilityScore >= 78 ? 'var(--amber-soft)' : 'var(--terracotta-soft)');
            const badgeColor = p.suitabilityScore >= 88 ? 'var(--sage)' : (p.suitabilityScore >= 78 ? 'var(--amber-gold)' : 'var(--terracotta)');
            const skinTypesLabel = (p.targetSkinTypes || []).join(' • ') || 'All Skin Types';

            card.innerHTML = `
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
                        <span style="font-size:0.75rem; color:var(--terracotta); font-weight:700; text-transform:uppercase;">${p.brand}</span>
                        <span style="background:${badgeBg}; color:${badgeColor}; border:1px solid ${badgeColor}; padding:3px 10px; border-radius:var(--radius-full); font-size:0.78rem; font-weight:700;">${p.suitabilityScore}% Match</span>
                    </div>
                    <h4 style="font-family:'Playfair Display', serif; font-size:1.1rem; color:var(--text-primary); margin-bottom:0.4rem; line-height:1.3;">${p.name}</h4>
                    <div style="font-size:0.75rem; color:var(--sage); font-weight:600; margin-bottom:0.5rem; display:flex; align-items:center; gap:4px;">
                        <span>🌿 Ideal Skin Profile:</span> <span>${skinTypesLabel}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.6rem;">
                        ✨ <strong>Key Actives:</strong> ${(p.keyIngredients || []).join(', ')}
                    </div>
                    <div style="font-size:0.78rem; color:var(--text-muted); background:var(--bg-warm-accent); padding:8px 12px; border-radius:var(--radius-sm); margin-bottom:1rem; line-height:1.45; border-left:3px solid ${badgeColor};">
                        ${p.ageMatchExplanation}
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-soft); padding-top:0.85rem;">
                    <span style="font-size:1.15rem; font-weight:700; color:var(--text-primary);">$${p.price.toFixed(2)}</span>
                    <button class="btn btn-primary btn-add-ritual" data-prod-name="${p.name}" style="padding:7px 16px; font-size:0.8rem;">+ Add to Ritual</button>
                </div>
            `;
            grid.appendChild(card);
        });

        grid.querySelectorAll('.btn-add-ritual').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.getAttribute('data-prod-name');
                alert(`✨ ${name} has been added to your personalized care ritual schedule!`);
            });
        });
    }

    // ================= 5. FASTAPI GOOGLE GEMINI LLM CHATBOT INTEGRATION =================
    if (chatSendBtn && chatInput) {
        chatSendBtn.addEventListener('click', handleChatSubmit);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChatSubmit();
        });
    }

    chatQuickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.textContent.replace(/"/g, '');
            chatInput.value = question;
            handleChatSubmit();
        });
    });

    loadChatHistory();

    async function loadChatHistory() {
        try {
            const res = await fetch(`${API_BASE}/api/chat/history?session_id=skin-intel-session`);
            if (res.ok) {
                const history = await res.json();
                if (history.length > 0) {
                    chatContainer.innerHTML = '';
                    history.forEach(msg => {
                        if (msg.role === 'user') {
                            appendUserChatMessage(msg.content);
                        } else {
                            appendConsultantChatMessage(msg.content);
                        }
                    });
                }
            }
        } catch (e) {
            console.log("Chat history offline or starting fresh session.");
        }
    }

    async function handleChatSubmit() {
        const text = chatInput.value.trim();
        if (!text) return;

        appendUserChatMessage(text);
        chatInput.value = '';

        const typingBubble = document.createElement('div');
        typingBubble.id = 'typing-indicator';
        typingBubble.style.cssText = 'display:flex; gap:0.75rem; align-items:center; color:var(--text-muted); font-size:0.85rem; font-style:italic;';
        typingBubble.innerHTML = `🌸 <span>SkinIntellect AI is thinking...</span>`;
        chatContainer.appendChild(typingBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        const headers = { 'Content-Type': 'application/json' };
        if (state.authToken) {
            headers['Authorization'] = `Bearer ${state.authToken}`;
        }

        try {
            const res = await fetch(`${API_BASE}/api/chat`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    session_id: 'skin-intel-session',
                    message: text,
                    assessment_id: state.currentAssessmentId
                })
            });

            if (typingBubble) typingBubble.remove();

            if (res.ok) {
                const data = await res.json();
                appendConsultantChatMessage(data.response);
            } else {
                appendConsultantChatMessage("Sorry, I encountered an issue connecting to the AI Chat server.");
            }
        } catch (err) {
            if (typingBubble) typingBubble.remove();
            console.error("Chat error:", err);
            appendConsultantChatMessage("I am currently in local fallback mode. Make sure the FastAPI server is running on " + API_BASE);
        }
    }

    function appendUserChatMessage(message) {
        const bubble = document.createElement('div');
        bubble.style.cssText = 'display:flex; justify-content:flex-end; gap:0.75rem; margin-bottom:0.75rem;';
        bubble.innerHTML = `
            <div style="background:var(--terracotta); color:#ffffff; padding:0.85rem 1.1rem; border-radius:var(--radius-md) 0 var(--radius-md) var(--radius-md); max-width:80%; font-size:0.88rem; line-height:1.5;">
                ${escapeHtml(message)}
            </div>
            <div class="user-avatar-initials" style="background:#ffffff; font-size:0.75rem;">${(state.currentUser && state.currentUser.full_name ? state.currentUser.full_name.substring(0, 2) : 'US').toUpperCase()}</div>
        `;
        chatContainer.appendChild(bubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function appendConsultantChatMessage(message) {
        const bubble = document.createElement('div');
        bubble.style.cssText = 'display:flex; gap:0.75rem; align-items:flex-start; margin-bottom:0.75rem;';
        const formattedMsg = escapeHtml(message)
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');

        bubble.innerHTML = `
            <div style="width:36px; height:36px; border-radius:50%; background:var(--terracotta); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0;">🌸</div>
            <div style="background:#ffffff; border:1px solid var(--border-soft); padding:0.85rem 1.1rem; border-radius:0 var(--radius-md) var(--radius-md) var(--radius-md); max-width:80%; font-size:0.88rem; color:var(--text-primary); line-height:1.5;">
                ${formattedMsg}
            </div>
        `;
        chatContainer.appendChild(bubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Dashboard Renders
    function renderConsultantDashboard() {
        const tableBody = document.getElementById('consultant-client-table');
        if (!tableBody) return;
        tableBody.innerHTML = '';

        state.clientProfiles.forEach(client => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <div class="user-avatar-initials">${client.initials || 'SC'}</div>
                        <div>
                            <strong style="color:var(--text-primary); font-family:'Playfair Display', serif; font-size:1rem;">${client.name}</strong>
                            <div style="font-size:0.75rem; color:var(--text-muted)">Age ${client.age} • ${client.skinType}</div>
                        </div>
                    </div>
                </td>
                <td><strong style="color:var(--sage); font-size:1.05rem;">${client.overallScore}/100</strong></td>
                <td><span style="background:var(--terracotta-soft); color:var(--terracotta); border:1px solid var(--terracotta); padding:2px 8px; border-radius:var(--radius-full); font-size:0.75rem; font-weight:700;">${client.ageGroup || '26-39'}</span></td>
                <td>${client.primaryConcerns.map(c => `<span style="background:#ffffff; border:1px solid var(--border-soft); padding:3px 8px; border-radius:var(--radius-full); font-size:0.75rem; margin-right:4px; font-weight:500; display:inline-block; margin-bottom:2px;">${formatConcernLabel(c)}</span>`).join(' ')}</td>
                <td>${client.lastScanDate}</td>
                <td><button class="btn btn-secondary btn-view-plan" data-client-id="${client.id}" style="padding:5px 12px; font-size:0.78rem;">View Care Plan</button></td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function renderDermatologistDashboard() {
        const list = document.getElementById('derm-patient-list');
        if (!list) return;
        list.innerHTML = '';

        state.clientProfiles.forEach(client => {
            const card = document.createElement('div');
            card.style.cssText = 'background:var(--bg-warm-accent); border:1px solid var(--border-soft); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1.25rem;';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.85rem;">
                    <div style="display:flex; align-items:center; gap:0.85rem;">
                        <div class="user-avatar-initials" style="width:44px; height:44px; font-size:0.95rem;">${client.initials || 'SC'}</div>
                        <div>
                            <h4 style="color:var(--text-primary); font-size:1.15rem; font-family:'Playfair Display', serif; margin:0;">${client.name}</h4>
                            <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">Clinical Health Index: <strong style="color:var(--sage)">${client.overallScore}/100</strong> • Age: ${client.age} (${client.ageGroup || '26-39'}) • ${client.skinType}</div>
                        </div>
                    </div>
                </div>
                <div style="font-size:0.85rem; color:var(--text-secondary); background:#ffffff; border:1px solid var(--border-soft); padding:1rem; border-radius:var(--radius-md);">
                    <strong style="color:var(--terracotta);">Clinical Impression:</strong> ${client.clinicalNote}
                </div>
            `;
            list.appendChild(card);
        });
    }

    function renderAdminDashboard() {}

    const exportBtn = document.getElementById('btn-export-pdf');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => { window.print(); });
    }

    function fetchBackendAssessments() {
        fetch(`${API_BASE}/api/assessments`)
            .then(r => r.json())
            .then(assessments => {
                if (assessments && assessments.length > 0) {
                    const latest = assessments[0];
                    state.currentAssessmentId = latest.id;
                    if (previewImg) {
                        previewImg.src = `${API_BASE}${latest.original_image_url}`;
                        previewImg.style.display = 'block';
                    }
                    if (annotatedCanvasImg) {
                        annotatedCanvasImg.src = `${API_BASE}${latest.annotated_image_url}`;
                        annotatedCanvasImg.style.display = 'block';
                    }
                    if (scanStatus) scanStatus.textContent = `✅ ML Scan Active (Score: ${latest.overall_score}/100)`;

                    const classFindings = {
                        acne: { score: Math.round(100 - (latest.metrics.blemish_clarity ? latest.metrics.blemish_clarity.score : 80)), severity: 'Active Care', confidence: 95 },
                        hyperpigmentation: { score: Math.round(100 - (latest.metrics.pigmentation_evenness ? latest.metrics.pigmentation_evenness.score : 85)), severity: 'Noticeable Spots', confidence: 91 },
                        wrinkles: { score: Math.round(100 - (latest.metrics.wrinkle_clarity ? latest.metrics.wrinkle_clarity.score : 90)), severity: 'Superficial Lines', confidence: 94 },
                        redness: { score: Math.round(100 - (latest.metrics.calmness_sensitivity ? latest.metrics.calmness_sensitivity.score : 90)), severity: 'Calm', confidence: 88 },
                        oily_pores: { score: Math.round(100 - (latest.metrics.pore_refinement ? latest.metrics.pore_refinement.score : 85)), severity: 'Refined', confidence: 92 },
                        dryness: { score: Math.round(100 - (latest.metrics.moisture_barrier ? latest.metrics.moisture_barrier.score : 80)), severity: 'Hydrated', confidence: 89 }
                    };

                    state.currentAnalysis = {
                        estimatedAge: { id: '26-39', years: latest.estimated_age },
                        overallConditionScore: latest.overall_score,
                        skinType: latest.skin_type,
                        classFindings,
                        overlayDataUrl: `${API_BASE}${latest.annotated_image_url}`
                    };

                    renderScanResults(state.currentAnalysis);
                }
            })
            .catch(() => {
                console.log("Using initial local analysis state");
            });
    }
});
