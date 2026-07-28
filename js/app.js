/**
 * Skin Intelligence & Personalized Skincare Planner
 * Humanized Main Application Logic & Consultation Manager
 */

document.addEventListener('DOMContentLoaded', () => {
    // App State
    const state = {
        currentRole: 'user',
        analyzer: new SkinImageAnalyzer(),
        currentAnalysis: null,
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
        selectedClient: window.SKIN_DATA.CLIENT_PROFILES[0]
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

    // Preset Demo Profiles
    const PRESET_IMAGES = [
        {
            name: 'Sample Profile A (Blemishes & Redness)',
            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Sample Profile B (Pigmentation)',
            url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80'
        },
        {
            name: 'Sample Profile C (Fine Lines)',
            url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80'
        }
    ];

    // 1. Role Switching Handler
    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            roleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetRole = btn.dataset.role;
            state.currentRole = targetRole;

            roleViews.forEach(view => {
                if (view.id === `view-${targetRole}`) {
                    view.style.display = 'block';
                } else {
                    view.style.display = 'none';
                }
            });

            if (targetRole === 'consultant') renderConsultantDashboard();
            if (targetRole === 'dermatologist') renderDermatologistDashboard();
            if (targetRole === 'admin') renderAdminDashboard();
        });
    });

    // 2. Image Upload Handlers
    dropzone.addEventListener('click', () => imageUploadInput.click());
    
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--primary)';
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = 'rgba(99, 102, 241, 0.4)';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    });

    imageUploadInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    });

    // Preset Image Clicks
    presetBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadImageUrl(PRESET_IMAGES[index].url);
        });
    });

    // Webcam Capture Support
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

                const dataUrl = canvas.toDataURL('image/png');
                loadImageUrl(dataUrl);
            } catch (err) {
                alert('Webcam access failed or denied. Loading default photo.');
                loadImageUrl(PRESET_IMAGES[0].url);
            }
        });
    }

    function processFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => loadImageUrl(e.target.result);
        reader.readAsDataURL(file);
    }

    function loadImageUrl(url) {
        scanStatus.textContent = 'Carefully analyzing your facial photo...';
        scanStatus.style.color = 'var(--primary)';

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = async () => {
            previewImg.src = url;
            previewImg.style.display = 'block';

            try {
                const analysisResult = await state.analyzer.analyzeImage(img);
                state.currentAnalysis = analysisResult;

                annotatedCanvasImg.src = analysisResult.overlayDataUrl;
                annotatedCanvasImg.style.display = 'block';

                scanStatus.textContent = 'Analysis Complete! 6-Zone Health Map Prepared.';
                scanStatus.style.color = 'var(--accent-teal)';

                renderScanResults(analysisResult);
            } catch (err) {
                console.error(err);
                scanStatus.textContent = 'Notice: ' + err.message;
            }
        };
        img.src = url;
    }

    // 3. Render 6-Class Assessment & Weighted Score
    function renderScanResults(analysis) {
        const findings = analysis.classFindings;
        const concernGrid = document.getElementById('concern-grid');
        concernGrid.innerHTML = '';

        const activeConcernIds = [];

        window.SKIN_DATA.CONCERN_CLASSES.forEach(cls => {
            const data = findings[cls.id];
            if (!data) return;

            if (data.score > 35) {
                activeConcernIds.push(cls.id);
            }

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
                    <strong style="color:#fff">${data.score}/100</strong>
                </div>
                <div class="score-bar-bg">
                    <div class="score-bar-fill" style="width: ${data.score}%"></div>
                </div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                    Analysis Match: ${data.confidence}%
                </div>
            `;
            concernGrid.appendChild(card);
        });

        // 4. Calculate Weighted Skin Health Score (35% Condition, 20% Lifestyle, 15% Sleep, 20% Routine, 10% Hydration)
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
                row.style.cssText = 'display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-glass); font-size:0.85rem;';
                row.innerHTML = `
                    <span style="text-transform:capitalize; color:var(--text-secondary)">${key} (${val.weight})</span>
                    <strong>${val.score}/100 <span style="color:var(--text-muted)">(+${val.weightedContrib} pts)</span></strong>
                `;
                breakdownEl.appendChild(row);
            });
        }

        // 5. Generate Personalized Morning & Evening Rituals
        const routine = SkincareRoutineGenerator.generatePersonalizedRoutine(activeConcernIds, state.userProfile.skinType);
        renderRoutineSteps('morning-routine-list', routine.morning);
        renderRoutineSteps('evening-routine-list', routine.evening);

        // 6. Check Ingredient Conflicts & Synergies
        const selectedIngredients = ['Retinol / Retinoids', 'Vitamin C (L-Ascorbic Acid)', 'Niacinamide (Vitamin B3)', 'Ceramides NP/AP/EOP'];
        const safetyAnalysis = SkincareRoutineGenerator.analyzeIngredientSafety(selectedIngredients);
        renderIngredientSafety(safetyAnalysis);

        // 7. Render Product Recommendations
        renderProductCatalog(activeConcernIds);
    }

    function renderRoutineSteps(containerId, steps) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        steps.forEach((step, idx) => {
            const card = document.createElement('div');
            card.className = 'routine-step-card';
            card.innerHTML = `
                <div class="step-num">${idx + 1}</div>
                <div>
                    <div style="font-size:0.75rem; color:var(--primary); font-weight:600; text-transform:uppercase;">${step.category}</div>
                    <div style="font-weight:600; color:#fff; font-size:0.95rem;">${step.name}</div>
                    <div style="font-size:0.8rem; color:var(--accent-teal); margin:2px 0;">Key Ingredient: ${step.active}</div>
                    <div style="font-size:0.8rem; color:var(--text-secondary);">${step.instruction}</div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function renderIngredientSafety(safety) {
        const container = document.getElementById('ingredient-safety-box');
        if (!container) return;
        container.innerHTML = '';

        if (safety.conflicts.length > 0) {
            safety.conflicts.forEach(c => {
                const box = document.createElement('div');
                box.style.cssText = 'padding:1rem; background:rgba(239, 68, 68, 0.1); border:1px solid var(--accent-rose); border-radius:var(--radius-md); margin-bottom:0.75rem;';
                box.innerHTML = `
                    <div style="color:var(--accent-rose); font-weight:700; font-size:0.9rem;">🌿 Care Tip: ${c.ingredients.join(' + ')}</div>
                    <div style="font-size:0.85rem; color:var(--text-primary); margin-top:4px;">${c.advice}</div>
                `;
                container.appendChild(box);
            });
        }

        if (safety.synergies.length > 0) {
            safety.synergies.forEach(s => {
                const box = document.createElement('div');
                box.style.cssText = 'padding:1rem; background:rgba(16, 185, 129, 0.1); border:1px solid var(--accent-teal); border-radius:var(--radius-md); margin-bottom:0.75rem;';
                box.innerHTML = `
                    <div style="color:var(--accent-teal); font-weight:700; font-size:0.9rem;">✨ Beautiful Synergy: ${s.ingredients.join(' + ')}</div>
                    <div style="font-size:0.85rem; color:var(--text-primary); margin-top:4px;">${s.advice}</div>
                `;
                container.appendChild(box);
            });
        }
    }

    function renderProductCatalog(activeConcernIds) {
        const grid = document.getElementById('product-recommendations-grid');
        if (!grid) return;
        grid.innerHTML = '';

        window.SKIN_DATA.PRODUCTS.forEach(p => {
            const card = document.createElement('div');
            card.className = 'glass-card';
            card.style.cssText = 'padding:1rem; display:flex; flex-direction:column; justify-content:space-between;';
            card.innerHTML = `
                <div>
                    <img src="${p.image}" alt="${p.name}" style="width:100%; height:140px; object-fit:cover; border-radius:var(--radius-md); margin-bottom:0.75rem;">
                    <div style="font-size:0.75rem; color:var(--text-muted);">${p.brand} • ${p.category}</div>
                    <div style="font-weight:600; color:#fff; font-size:0.95rem; margin:2px 0;">${p.name}</div>
                    <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.5rem;">Actives: ${p.keyIngredients.join(', ')}</div>
                </div>
                <div style="display:flex; justify-between; align-items:center; margin-top:0.75rem; border-top:1px solid var(--border-glass); padding-top:0.75rem;">
                    <span style="font-weight:700; color:var(--accent-teal); font-size:1.1rem;">$${p.price.toFixed(2)}</span>
                    <span style="background:rgba(99,102,241,0.2); color:var(--primary); padding:2px 8px; border-radius:var(--radius-full); font-size:0.75rem; font-weight:600;">Suitability: ${p.suitabilityScore}%</span>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function renderConsultantDashboard() {
        const tableBody = document.getElementById('consultant-client-table');
        if (!tableBody) return;
        tableBody.innerHTML = '';

        window.SKIN_DATA.CLIENT_PROFILES.forEach(client => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <img src="${client.avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
                        <div>
                            <strong style="color:#fff">${client.name}</strong>
                            <div style="font-size:0.75rem; color:var(--text-muted)">Age ${client.age} • ${client.skinType}</div>
                        </div>
                    </div>
                </td>
                <td><strong style="color:var(--accent-teal)">${client.overallScore}/100</strong></td>
                <td>${client.primaryConcerns.map(c => `<span style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:0.75rem; margin-right:4px;">${c}</span>`).join('')}</td>
                <td>${client.lastScanDate}</td>
                <td>
                    <button class="btn btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="alert('Viewing Care Plan for ${client.name}')">View Plan</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function renderDermatologistDashboard() {
        const list = document.getElementById('derm-patient-list');
        if (!list) return;
        list.innerHTML = '';

        window.SKIN_DATA.CLIENT_PROFILES.forEach(client => {
            const card = document.createElement('div');
            card.className = 'glass-card';
            card.style.marginBottom = '1rem';
            card.innerHTML = `
                <div style="display:flex; justify-between; align-items:center; margin-bottom:0.75rem;">
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <img src="${client.avatar}" style="width:42px; height:42px; border-radius:50%; object-fit:cover;">
                        <div>
                            <h4 style="color:#fff; font-size:1.1rem;">${client.name}</h4>
                            <div style="font-size:0.8rem; color:var(--text-secondary)">Clinical Vitality Score: <strong style="color:var(--accent-teal)">${client.overallScore}/100</strong></div>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="font-size:0.8rem; padding:6px 12px;" onclick="alert('Clinical care note updated for ${client.name}')">+ Add Clinical Care Note</button>
                </div>
                <div style="font-size:0.85rem; color:var(--text-secondary); background:rgba(0,0,0,0.2); padding:0.75rem; border-radius:var(--radius-md)">
                    <strong>Dermatological Guidance:</strong> Patient shows mild redness and localized blemishes. Recommend gentle cleansing, 0.5% Encapsulated Retinol twice weekly, and daily soothing mineral SPF 50.
                </div>
            `;
            list.appendChild(card);
        });
    }

    function renderAdminDashboard() {}

    const exportBtn = document.getElementById('btn-export-pdf');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            window.print();
        });
    }

    loadImageUrl(PRESET_IMAGES[0].url);
});
