/**
 * Skin Intelligence & Personalized Skincare Planner
 * Human-Crafted Application Logic, Interactive Routine Tracker & Filtered Product Recommendations
 */

document.addEventListener('DOMContentLoaded', () => {
    // App State with Routine Progress Tracking
    const state = {
        currentUser: {
            name: 'Sophia Chen',
            initials: 'SC',
            email: 'sophia.chen@skincare.com',
            role: 'user'
        },
        currentRole: 'user',
        analyzer: new SkinImageAnalyzer(),
        currentAnalysis: null,
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
        clientProfiles: window.SKIN_DATA.CLIENT_PROFILES
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
    const ageSpecialistTip = document.getElementById('age-specialist-tip');

    // Product Filter & Sort Elements
    const prodFilterBtns = document.querySelectorAll('.btn-prod-filter');
    const prodSortSelect = document.getElementById('prod-sort-select');

    // Auth Elements
    const authHeaderContainer = document.getElementById('auth-header-container');
    const loginModal = document.getElementById('login-modal');
    const loginModalClose = document.getElementById('login-modal-close');
    const btnOpenLogin = document.getElementById('btn-open-login');
    const authLoginForm = document.getElementById('auth-login-form');
    const demoLoginBtns = document.querySelectorAll('.btn-demo-login');

    // Chat Elements
    const chatContainer = document.getElementById('chat-messages-container');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('btn-chat-send');
    const chatQuickBtns = document.querySelectorAll('.btn-chat-quick');

    const modal = document.getElementById('client-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalBody = document.getElementById('modal-body');

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    function closeModal() {
        if (modal) modal.classList.remove('active');
    }

    // AUTHENTICATION MODAL LOGIC
    if (btnOpenLogin) btnOpenLogin.addEventListener('click', openLoginModal);
    if (loginModalClose) loginModalClose.addEventListener('click', closeLoginModal);
    if (loginModal) loginModal.addEventListener('click', (e) => { if (e.target === loginModal) closeLoginModal(); });

    function openLoginModal() {
        if (loginModal) loginModal.classList.add('active');
    }

    function closeLoginModal() {
        if (loginModal) loginModal.classList.remove('active');
    }

    if (authLoginForm) {
        authLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const role = document.getElementById('login-role').value;
            const name = email.split('@')[0].replace('.', ' ');
            const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
            const initials = formattedName.substring(0, 2).toUpperCase();

            loginUser({
                name: formattedName,
                initials,
                email,
                role
            });
            closeLoginModal();
        });
    }

    demoLoginBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const role = btn.dataset.role;
            const name = btn.dataset.name;
            const email = btn.dataset.email;
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            loginUser({
                name,
                initials,
                email,
                role
            });
            closeLoginModal();
        });
    });

    function loginUser(userObj) {
        state.currentUser = userObj;
        state.currentRole = userObj.role;

        if (authHeaderContainer) {
            authHeaderContainer.innerHTML = `
                <div class="user-auth-badge">
                    <div class="user-avatar-initials">${userObj.initials || 'SK'}</div>
                    <div style="font-size:0.8rem; font-weight:600; color:var(--text-primary); cursor:pointer;" title="Click to Sign Out" id="btn-logout">
                        ${userObj.name} <span style="font-size:0.7rem; color:var(--terracotta);">(${userObj.role})</span> 🚪
                    </div>
                </div>
            `;

            document.getElementById('btn-logout').addEventListener('click', () => {
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

    // 1. Role Switching Handler
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

    // 2. Age Select Listener
    if (userAgeSelect) {
        userAgeSelect.addEventListener('change', (e) => {
            state.currentAgeGroup = e.target.value;
            updateAgeBadgeUI(state.currentAgeGroup);
            if (state.currentAnalysis) {
                renderScanResults(state.currentAnalysis);
            }
        });
    }

    // 3. Product Filter & Sort Listeners
    prodFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            prodFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedProductCategory = btn.dataset.category;
            if (state.currentAnalysis) {
                renderFilteredProducts();
            }
        });
    });

    if (prodSortSelect) {
        prodSortSelect.addEventListener('change', (e) => {
            state.selectedProductSort = e.target.value;
            if (state.currentAnalysis) {
                renderFilteredProducts();
            }
        });
    }

    // 4. Image Upload & Camera Handlers
    dropzone.addEventListener('click', () => imageUploadInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--terracotta)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--border-warm)'; });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--border-warm)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    });

    imageUploadInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    });

    presetBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadImageUrl(PRESET_IMAGES[index].url, PRESET_IMAGES[index].forcedAgeGroup);
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

                const dataUrl = canvas.toDataURL('image/png');
                loadImageUrl(dataUrl);
            } catch (err) {
                alert('Webcam unavailable. Loading sample photo.');
                loadImageUrl(PRESET_IMAGES[0].url, '18-25');
            }
        });
    }

    function processFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => loadImageUrl(e.target.result);
        reader.readAsDataURL(file);
    }

    function loadImageUrl(url, forcedAgeGroup = null) {
        scanStatus.textContent = 'Analyzing facial skin & estimating age group...';
        scanStatus.style.color = 'var(--terracotta)';

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = async () => {
            previewImg.src = url;
            previewImg.style.display = 'block';

            try {
                const analysisResult = await state.analyzer.analyzeImage(img);
                if (forcedAgeGroup) {
                    analysisResult.estimatedAge.id = forcedAgeGroup;
                    if (forcedAgeGroup === '18-25') analysisResult.estimatedAge.label = '18–25 Years (Young Adult)';
                    if (forcedAgeGroup === '26-39') analysisResult.estimatedAge.label = '26–39 Years (Adult)';
                    if (forcedAgeGroup === '40-54') analysisResult.estimatedAge.label = '40–54 Years (Mature)';
                    if (forcedAgeGroup === '55+') analysisResult.estimatedAge.label = '55+ Years (Graceful Senior)';
                }

                state.currentAnalysis = analysisResult;
                state.currentAgeGroup = analysisResult.estimatedAge.id;
                userAgeSelect.value = state.currentAgeGroup;

                annotatedCanvasImg.src = analysisResult.overlayDataUrl;
                annotatedCanvasImg.style.display = 'block';

                scanStatus.textContent = 'Assessment Complete! 6-Zone Map & Age Profile Set.';
                scanStatus.style.color = 'var(--sage)';

                updateAgeBadgeUI(state.currentAgeGroup, analysisResult.estimatedAge.focus);
                renderScanResults(analysisResult);
            } catch (err) {
                console.error(err);
                scanStatus.textContent = 'Notice: ' + err.message;
            }
        };
        img.src = url;
    }

    function updateAgeBadgeUI(ageGroupId, customFocus = null) {
        const groupObj = window.SKIN_DATA.AGE_GROUPS.find(g => g.id === ageGroupId);
        if (estimatedAgeBadge && groupObj) {
            estimatedAgeBadge.textContent = `Age Profile: ${groupObj.label}`;
        }

        if (ageFocusText && groupObj) {
            ageFocusText.textContent = `Target Focus: ${customFocus || groupObj.focus}.`;
        }

        if (ageSpecialistTip && groupObj) {
            if (ageGroupId === '18-25') {
                ageSpecialistTip.textContent = 'Young Skin Tip: Keep routines gentle! Avoid over-stripping natural lipids and use non-comedogenic hydration.';
            } else if (ageGroupId === '26-39') {
                ageSpecialistTip.textContent = 'Adult Skin Tip: Focus on antioxidant defense (Vitamin C morning) and early line prevention with gentle retinoids.';
            } else if (ageGroupId === '40-54') {
                ageSpecialistTip.textContent = 'Mature Skin Tip: Support natural collagen synthesis with Copper Peptides, Encapsulated Retinol, and Ceramide barrier cream.';
            } else {
                ageSpecialistTip.textContent = 'Graceful Senior Tip: Replenish deep skin lipids (Ceramides, Squalane, Shea) to maintain barrier elasticity and prevent moisture loss.';
            }
        }
    }

    // 5. Render 6-Class Assessment & Weighted Score
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
                    <strong style="color:var(--text-primary)">${data.score}/100</strong>
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

        // Calculate Weighted Score
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

        // 6. Generate 4 Care Ritual Schedules & Render Interactive Tracker
        const routine = SkincareRoutineGenerator.generatePersonalizedRoutine(activeConcernIds, state.userProfile.skinType, state.currentAgeGroup);
        renderRoutineSteps('morning-routine-list', routine.morning);
        renderRoutineSteps('afternoon-routine-list', routine.afternoon);
        renderRoutineSteps('evening-routine-list', routine.evening);
        renderRoutineSteps('weekly-routine-list', routine.weekly);
        updateRoutineProgressTracker();

        // 7. Ingredient Safety
        const selectedIngredients = ['Retinol / Retinoids', 'Vitamin C (L-Ascorbic Acid)', 'Niacinamide (Vitamin B3)', 'Ceramides NP/AP/EOP'];
        const safetyAnalysis = SkincareRoutineGenerator.analyzeIngredientSafety(selectedIngredients);
        renderIngredientSafety(safetyAnalysis);

        // 8. Render Filtered Product Catalog
        renderFilteredProducts();
    }

    function renderRoutineSteps(containerId, steps) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        steps.forEach((step, idx) => {
            const isCompleted = state.completedStepIds.has(step.id);

            const card = document.createElement('div');
            card.className = 'routine-step-card';
            if (isCompleted) {
                card.style.background = 'var(--sage-soft)';
                card.style.borderColor = 'var(--sage)';
            }

            card.innerHTML = `
                <input type="checkbox" class="step-checkbox" data-step-id="${step.id}" ${isCompleted ? 'checked' : ''} style="accent-color:var(--terracotta); width:20px; height:20px; margin-top:6px; cursor:pointer;">
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="font-size:0.75rem; color:var(--terracotta); font-weight:700; text-transform:uppercase;">${step.category}</div>
                        <span style="font-size:0.72rem; color:var(--text-muted); background:#ffffff; border:1px solid var(--border-soft); padding:2px 8px; border-radius:var(--radius-full);">⏱️ ${step.duration}</span>
                    </div>
                    <div style="font-weight:700; color:var(--text-primary); font-size:1.02rem; font-family:'Playfair Display', serif; margin:2px 0;">${step.name}</div>
                    <div style="font-size:0.82rem; color:var(--sage); font-weight:600; margin:2px 0;">Key Actives: ${step.active} • <span style="color:var(--text-secondary); font-weight:normal;">Target: ${step.targetZone}</span></div>
                    <div style="font-size:0.82rem; color:var(--text-secondary); margin-top:3px;"><strong>Method:</strong> ${step.method}. ${step.instruction}</div>
                </div>
            `;
            container.appendChild(card);
        });

        // Add checkbox change listeners
        container.querySelectorAll('.step-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const stepId = e.target.getAttribute('data-step-id');
                if (e.target.checked) {
                    state.completedStepIds.add(stepId);
                } else {
                    state.completedStepIds.delete(stepId);
                }
                if (state.currentAnalysis) {
                    renderScanResults(state.currentAnalysis);
                }
            });
        });
    }

    function updateRoutineProgressTracker() {
        const totalMorningSteps = 4;
        const completedCount = Array.from(state.completedStepIds).filter(id => id.startsWith('m')).length;
        const percent = Math.round((completedCount / totalMorningSteps) * 100);

        const progressText = document.getElementById('routine-progress-text');
        const progressBar = document.getElementById('routine-progress-bar');

        if (progressText) progressText.textContent = `${completedCount} of ${totalMorningSteps} Morning Steps Done (${percent}%)`;
        if (progressBar) progressBar.style.width = `${percent}%`;
    }

    function renderIngredientSafety(safety) {
        const container = document.getElementById('ingredient-safety-box');
        if (!container) return;
        container.innerHTML = '';

        if (safety.conflicts.length > 0) {
            safety.conflicts.forEach(c => {
                const box = document.createElement('div');
                box.style.cssText = 'padding:1rem; background:var(--rose-soft); border:1px solid var(--rose-clay); border-radius:var(--radius-md); margin-bottom:0.75rem;';
                box.innerHTML = `
                    <div style="color:var(--terracotta); font-weight:700; font-size:0.9rem;">🌿 Care Tip: ${c.ingredients.join(' + ')}</div>
                    <div style="font-size:0.84rem; color:var(--text-primary); margin-top:4px;">${c.advice}</div>
                `;
                container.appendChild(box);
            });
        }

        if (safety.synergies.length > 0) {
            safety.synergies.forEach(s => {
                const box = document.createElement('div');
                box.style.cssText = 'padding:1rem; background:var(--sage-soft); border:1px solid var(--sage); border-radius:var(--radius-md); margin-bottom:0.75rem;';
                box.innerHTML = `
                    <div style="color:var(--sage); font-weight:700; font-size:0.9rem;">✨ Beautiful Synergy: ${s.ingredients.join(' + ')}</div>
                    <div style="font-size:0.84rem; color:var(--text-primary); margin-top:4px;">${s.advice}</div>
                `;
                container.appendChild(box);
            });
        }
    }

    function renderFilteredProducts() {
        const grid = document.getElementById('product-recommendations-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const activeConcernIds = state.currentAnalysis ? Object.keys(state.currentAnalysis.classFindings).filter(k => state.currentAnalysis.classFindings[k].score > 35) : [];

        let products = window.SKIN_DATA.PRODUCTS.map(p => {
            const ageMatch = SkincareRoutineGenerator.calculateAgeAdjustedMatch(p, activeConcernIds, state.currentAgeGroup);
            return {
                ...p,
                suitabilityScore: ageMatch.suitabilityScore,
                ageMatchExplanation: ageMatch.ageMatchExplanation
            };
        });

        // Filter by Category
        if (state.selectedProductCategory !== 'All') {
            products = products.filter(p => p.category.toLowerCase().includes(state.selectedProductCategory.toLowerCase()));
        }

        // Sort Products
        if (state.selectedProductSort === 'match') {
            products.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
        } else if (state.selectedProductSort === 'price-low') {
            products.sort((a, b) => a.price - b.price);
        } else if (state.selectedProductSort === 'price-high') {
            products.sort((a, b) => b.price - a.price);
        }

        products.forEach(p => {
            const card = document.createElement('div');
            card.style.cssText = 'background:var(--bg-warm-accent); border:1px solid var(--border-soft); border-radius:var(--radius-md); padding:1.1rem; display:flex; flex-direction:column; justify-content:space-between;';
            card.innerHTML = `
                <div>
                    <img src="${p.image}" alt="${p.name}" style="width:100%; height:140px; object-fit:cover; border-radius:var(--radius-md); margin-bottom:0.75rem; border:1px solid var(--border-soft);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                        <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${p.brand} • ${p.category}</span>
                        <span style="background:var(--sage-soft); border:1px solid var(--sage); color:var(--sage); font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:var(--radius-full);">
                            ${p.suitabilityScore}% Match
                        </span>
                    </div>
                    <div style="font-weight:700; color:var(--text-primary); font-size:1.02rem; font-family:'Playfair Display', serif; margin:3px 0;">${p.name}</div>
                    <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.4rem;">Actives: ${p.keyIngredients.join(', ')}</div>
                    
                    <div style="display:flex; gap:4px; flex-wrap:wrap; margin-bottom:6px;">
                        ${(p.tags || []).map(t => `<span style="font-size:0.68rem; background:#ffffff; border:1px solid var(--border-soft); padding:1px 6px; border-radius:var(--radius-full); color:var(--text-secondary);">${t}</span>`).join('')}
                    </div>

                    <div style="font-size:0.76rem; color:var(--terracotta); background:#ffffff; border:1px solid var(--border-soft); padding:6px 8px; border-radius:var(--radius-sm); margin-top:4px;">
                        ${p.ageMatchExplanation}
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.85rem; border-top:1px solid var(--border-soft); padding-top:0.75rem;">
                    <span style="font-weight:700; color:var(--terracotta); font-size:1.1rem;">$${p.price.toFixed(2)}</span>
                    <button class="btn btn-secondary btn-add-to-ritual" data-prod-name="${p.name}" style="padding:4px 10px; font-size:0.75rem;">Add to Ritual</button>
                </div>
            `;
            grid.appendChild(card);
        });

        // Event listeners for Add to Ritual buttons
        grid.querySelectorAll('.btn-add-to-ritual').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.getAttribute('data-prod-name');
                alert(`✨ ${name} has been added to your personalized care ritual schedule!`);
            });
        });
    }

    // 9. INTERACTIVE CHAT HANDLER
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

    function handleChatSubmit() {
        const text = chatInput.value.trim();
        if (!text) return;

        appendUserChatMessage(text);
        chatInput.value = '';

        setTimeout(() => {
            const reply = generateConsultantReply(text, state.currentAgeGroup, state.currentAnalysis);
            appendConsultantChatMessage(reply);
        }, 500);
    }

    function appendUserChatMessage(message) {
        const bubble = document.createElement('div');
        bubble.style.cssText = 'display:flex; justify-content:flex-end; gap:0.75rem;';
        bubble.innerHTML = `
            <div style="background:var(--terracotta); color:#ffffff; padding:0.85rem 1.1rem; border-radius:var(--radius-md) 0 var(--radius-md) var(--radius-md); max-width:80%; font-size:0.88rem; line-height:1.5;">
                ${message}
            </div>
            <div class="user-avatar-initials" style="background:#ffffff; font-size:0.75rem;">${state.currentUser.initials || 'SC'}</div>
        `;
        chatContainer.appendChild(bubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function appendConsultantChatMessage(message) {
        const bubble = document.createElement('div');
        bubble.style.cssText = 'display:flex; gap:0.75rem; align-items:flex-start;';
        bubble.innerHTML = `
            <div style="width:36px; height:36px; border-radius:50%; background:var(--terracotta); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0;">🌸</div>
            <div style="background:#ffffff; border:1px solid var(--border-soft); padding:0.85rem 1.1rem; border-radius:0 var(--radius-md) var(--radius-md) var(--radius-md); max-width:80%; font-size:0.88rem; color:var(--text-primary); line-height:1.5;">
                ${message}
            </div>
        `;
        chatContainer.appendChild(bubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function generateConsultantReply(questionText, ageGroupId, analysis) {
        const q = questionText.toLowerCase();
        const ageObj = window.SKIN_DATA.AGE_GROUPS.find(g => g.id === ageGroupId) || { label: 'Adult' };

        if (q.includes('age') || q.includes('old') || q.includes('profile')) {
            return `Based on your digital skin scan, your profile is currently aligned with the <strong>${ageObj.label}</strong> group. For this age group, we prioritize <em>${ageObj.focus}</em>. Our product suitability scores have been adjusted to boost products rich in these key actives!`;
        }
        
        if (q.includes('dark spot') || q.includes('pigmentation') || q.includes('sun')) {
            return `For dark spots and sun marks, I recommend using our <strong>GlowBright 15% Vitamin C Antioxidant Serum</strong> during your Morning Ritual, followed by broad-spectrum <strong>SPF 50 Mineral Protection</strong>. At night, pair it with Niacinamide to gently fade melanin discoloration without barrier irritation.`;
        }

        if (q.includes('combine') || q.includes('retinol') || q.includes('vitamin c')) {
            return `Yes, you can use both safely! The key is <strong>Ritual Timing</strong>: Apply Vitamin C in the ☀️ Morning Ritual for daytime antioxidant defense, and use Encapsulated Retinol in the 🌙 Evening Ritual to allow deep cell turnover while you sleep. Avoid applying direct acids and retinol in the same session.`;
        }

        if (q.includes('afternoon') || q.includes('weekly') || q.includes('routine')) {
            return `Your routine features 4 distinct care rituals: ☀️ <strong>Morning</strong> (Antioxidants & SPF), 🌤️ <strong>Afternoon</strong> (Hydrating mist & SPF cushion touch-up), 🌙 <strong>Evening</strong> (Double cleansing & active night renewal), and 🗓️ <strong>Weekly Special Care</strong> (Exfoliating pore mask 2x/week + Hydrating sheet mask 1x/week).`;
        }

        return `Thank you for asking! For your <strong>${ageObj.label}</strong> profile, the most important foundation is maintaining a healthy moisture barrier using Ceramides & Niacinamide, coupled with daily mineral SPF 50. Let me know if you would like specific product recommendations or step-by-step guidance!`;
    }

    // 10. Consultant Dashboard Render with Monogram Badges
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
                <td>${client.primaryConcerns.map(c => `<span style="background:#ffffff; border:1px solid var(--border-soft); padding:3px 8px; border-radius:var(--radius-full); font-size:0.75rem; margin-right:4px; font-weight:500;">${c}</span>`).join('')}</td>
                <td>${client.lastScanDate}</td>
                <td>
                    <button class="btn btn-secondary btn-view-plan" data-client-id="${client.id}" style="padding:5px 12px; font-size:0.78rem;">View Care Plan</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-view-plan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clientId = e.target.getAttribute('data-client-id');
                openClientPlanModal(clientId);
            });
        });
    }

    // 11. Dermatologist Dashboard Render with Monogram Badges
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
                            <h4 style="color:var(--text-primary); font-size:1.15rem; font-family:'Playfair Display', serif;">${client.name}</h4>
                            <div style="font-size:0.8rem; color:var(--text-secondary)">Clinical Health Index: <strong style="color:var(--sage)">${client.overallScore}/100</strong> • Age: ${client.age} (${client.ageGroup || '26-39'}) • ${client.skinType}</div>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-add-note" data-client-id="${client.id}" style="font-size:0.8rem; padding:6px 14px;">+ Add Clinical Note</button>
                </div>
                <div style="font-size:0.85rem; color:var(--text-secondary); background:#ffffff; border:1px solid var(--border-soft); padding:1rem; border-radius:var(--radius-md);">
                    <strong style="color:var(--terracotta);">Clinical Impression:</strong> ${client.clinicalNote || `Patient exhibits localized focus areas (${client.primaryConcerns.join(', ')}). Recommended treatment includes gentle barrier support, Encapsulated Retinol, and daily SPF 50 mineral protection tailored for ${client.ageGroup || '26-39'} skin.`}
                </div>
            `;
            list.appendChild(card);
        });

        document.querySelectorAll('.btn-add-note').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clientId = e.target.getAttribute('data-client-id');
                openAddClinicalNoteModal(clientId);
            });
        });
    }

    function openClientPlanModal(clientId) {
        const client = state.clientProfiles.find(c => c.id === clientId);
        if (!client) return;

        modalBody.innerHTML = `
            <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem;">
                <div class="user-avatar-initials" style="width:54px; height:54px; font-size:1.2rem;">${client.initials || 'SC'}</div>
                <div>
                    <h2 class="font-serif" style="font-size:1.5rem; color:var(--text-primary);">${client.name}</h2>
                    <div style="font-size:0.85rem; color:var(--text-secondary);">Age ${client.age} (${client.ageGroup || '26-39'}) • ${client.skinType} • Score: <strong style="color:var(--sage)">${client.overallScore}/100</strong></div>
                </div>
            </div>

            <div style="background:var(--bg-warm-accent); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-soft); margin-bottom:1.25rem;">
                <h4 style="font-family:'Playfair Display', serif; font-size:1.1rem; color:var(--text-primary); margin-bottom:0.5rem;">Primary Care Focus Areas</h4>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                    ${client.primaryConcerns.map(c => `<span style="background:#ffffff; border:1px solid var(--border-soft); padding:4px 12px; border-radius:var(--radius-full); font-size:0.8rem; font-weight:600; color:var(--terracotta);">${c}</span>`).join('')}
                </div>
            </div>

            <div style="background:var(--bg-warm-accent); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-soft); margin-bottom:1.25rem;">
                <h4 style="font-family:'Playfair Display', serif; font-size:1.1rem; color:var(--text-primary); margin-bottom:0.5rem;">Lifestyle Habits</h4>
                <div style="font-size:0.85rem; color:var(--text-secondary); display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
                    <div>💤 Sleep: <strong>${client.lifestyle.sleepHours} hrs/night</strong></div>
                    <div>💧 Water: <strong>${client.lifestyle.waterLiters} L/day</strong></div>
                    <div>☀️ Sun Exposure: <strong>${client.lifestyle.sunExposure}</strong></div>
                    <div>🧘 Stress: <strong>${client.lifestyle.stressLevel}</strong></div>
                </div>
            </div>

            <div style="text-align:right;">
                <button class="btn btn-secondary" onclick="document.getElementById('client-modal').classList.remove('active')">Close Care Plan</button>
            </div>
        `;

        modal.classList.add('active');
    }

    function openAddClinicalNoteModal(clientId) {
        const client = state.clientProfiles.find(c => c.id === clientId);
        if (!client) return;

        modalBody.innerHTML = `
            <h2 class="font-serif" style="font-size:1.4rem; color:var(--text-primary); margin-bottom:0.5rem;">Add Clinical Note for ${client.name}</h2>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1.25rem;">Write custom dermatological notes and treatment recommendations for ${client.name}.</p>

            <textarea id="clinical-note-input" rows="4" style="width:100%; padding:0.85rem; border-radius:var(--radius-md); border:1px solid var(--border-warm); font-family:'Plus Jakarta Sans', sans-serif; font-size:0.9rem; margin-bottom:1.25rem;" placeholder="Enter specific clinical guidance, active percentages, or prescription recommendations...">${client.clinicalNote || ''}</textarea>

            <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
                <button class="btn btn-secondary" onclick="document.getElementById('client-modal').classList.remove('active')">Cancel</button>
                <button class="btn btn-primary" id="save-note-btn">Save Note</button>
            </div>
        `;

        modal.classList.add('active');

        document.getElementById('save-note-btn').addEventListener('click', () => {
            const noteText = document.getElementById('clinical-note-input').value;
            client.clinicalNote = noteText;
            renderDermatologistDashboard();
            closeModal();
        });
    }

    function renderAdminDashboard() {}

    const exportBtn = document.getElementById('btn-export-pdf');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => { window.print(); });
    }

    loadImageUrl(PRESET_IMAGES[0].url, '18-25');
});
