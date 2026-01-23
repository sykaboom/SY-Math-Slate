import './style.css';
import { sanitizeHTML } from './utils/sanitizer.js';

let solutionData = ["<span class='step-num'>Step 1.</span> 준비 완료"];
    
    const state = {
        currentLine: 0, currentPage: 0, pages: [[]],
        zoom: 1.0, panX: 0, panY: 0, tool: null,
        inkStrokes: [[]], actionStack: [[]], typing: false,
        penColor: '#FFFF00', columnCount: 1, theme: 'dark',
        penType: 'highlighter',
        laserType: 'standard', laserColor: '#FF0000', laserPath: []
    };

    const els = {
        scaler: document.getElementById('board-scaler'),
        content: document.getElementById('content-area'),
        canvas: document.getElementById('drawing-canvas'),
        ctx: document.getElementById('drawing-canvas').getContext('2d'),
        laserCanvas: document.getElementById('laser-canvas'),
        laserCtx: document.getElementById('laser-canvas').getContext('2d'),
        prompter: document.getElementById('prompter-text'),
        penOptions: document.getElementById('pen-options'),
        laserOptions: document.getElementById('laser-options'),
        cursor: document.getElementById('cursor'),
        viewport: document.getElementById('viewport'),
        pageInd: document.getElementById('page-indicator'),
        colDisplay: document.getElementById('col-display'),
        editorModal: document.getElementById('rich-editor-modal'),
        pasteModal: document.getElementById('paste-helper-modal'),
        pasteTarget: document.getElementById('paste-target'),
        blockList: document.getElementById('editor-block-list'),
        delModal: document.getElementById('del-confirm-overlay'),
        lasso: document.getElementById('selection-lasso'),
        bulkToolbar: document.getElementById('bulk-toolbar'),
        themeBtn: document.getElementById('btn-theme'),
        speedInput: document.getElementById('typing-speed')
    };

    let pendingDeleteRow = null;
    const inputConfig = {
        smoothing: { minAlpha: 0.35, maxAlpha: 0.85, maxSpeed: 1.2, minDistance: 0.4 },
        palmReject: { minWidth: 25, minHeight: 25 },
        pressure: { min: 0.1, max: 1.0 }
    };
    let activeStroke = null;
    let activePointerType = null;
    let lastRawPoint = null;
    let lastSmoothPoint = null;
    let lastDrawPoint = null;

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function isPalmTouch(e) {
        if (e.pointerType !== 'touch') return false;
        const w = e.width || 0;
        const h = e.height || 0;
        return w >= inputConfig.palmReject.minWidth && h >= inputConfig.palmReject.minHeight;
    }

    function getPointerPressure(e) {
        if (e.pointerType !== 'pen') return 0.5;
        const pressure = typeof e.pressure === 'number' ? e.pressure : 0.5;
        return clamp(pressure, inputConfig.pressure.min, inputConfig.pressure.max);
    }

    function getCoalescedEvents(e) {
        if (typeof e.getCoalescedEvents === 'function') {
            const events = e.getCoalescedEvents();
            if (events && events.length > 0) return events;
        }
        return [e];
    }

    function toRgba(color, alpha) {
        const r = parseInt(color.substr(1,2), 16);
        const g = parseInt(color.substr(3,2), 16);
        const b = parseInt(color.substr(5,2), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    function getStrokeWidth(baseWidth, pressure, penType, pointerType) {
        if (pointerType !== 'pen') return baseWidth;
        const p = clamp(pressure ?? 0.5, inputConfig.pressure.min, inputConfig.pressure.max);
        let minFactor = 0.35;
        let maxFactor = 1.25;
        if (penType === 'pencil') { minFactor = 0.5; maxFactor = 1.1; }
        if (penType === 'highlighter') { minFactor = 0.9; maxFactor = 1.05; }
        return baseWidth * (minFactor + (maxFactor - minFactor) * p);
    }

    function makePoint(e) {
        const pt = getCanvasPoint(e.clientX, e.clientY);
        return { x: pt.x, y: pt.y, p: getPointerPressure(e), t: e.timeStamp || performance.now() };
    }

    function smoothPoint(rawPoint) {
        if (!lastSmoothPoint || !lastRawPoint) return rawPoint;
        const dt = Math.max(1, rawPoint.t - lastRawPoint.t);
        const dx = rawPoint.x - lastRawPoint.x;
        const dy = rawPoint.y - lastRawPoint.y;
        const dist = Math.hypot(dx, dy);
        const speed = dist / dt;
        const t = Math.min(speed / inputConfig.smoothing.maxSpeed, 1);
        const alpha = inputConfig.smoothing.minAlpha + (inputConfig.smoothing.maxAlpha - inputConfig.smoothing.minAlpha) * t;
        return {
            x: lastSmoothPoint.x + (rawPoint.x - lastSmoothPoint.x) * alpha,
            y: lastSmoothPoint.y + (rawPoint.y - lastSmoothPoint.y) * alpha,
            p: rawPoint.p,
            t: rawPoint.t
        };
    }

    function shouldAcceptDrawInput(e) {
        return e.pointerType !== 'touch';
    }

    function execStyle(command) {
        document.execCommand(command, false, null);
    }

    function clearFormat() {
        document.execCommand('removeFormat', false, null);
    }

    function applyClass(className) {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        if (range.collapsed) return;

        const container = selection.anchorNode?.nodeType === Node.ELEMENT_NODE
            ? selection.anchorNode
            : selection.anchorNode?.parentElement;
        if (!container || !container.closest('.editor-block-content')) return;

        const span = document.createElement('span');
        span.className = className;
        span.appendChild(range.extractContents());
        range.insertNode(span);
        selection.removeAllRanges();

        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);
    }

    function setLaserType(type) {
        state.laserType = type;
        document.querySelectorAll('#laser-options .pen-type-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`laser-type-${type}`).classList.add('active');
        const w = document.getElementById('laser-width'); const a = document.getElementById('laser-alpha');
        if(type === 'standard') { w.value = 10; a.value = 90; setLaserColor('#FF0000'); } else { w.value = 40; a.value = 40; setLaserColor('#FFFF00'); }
    }
    function setLaserColor(color) { state.laserColor = color; document.getElementById('laser-color').value = color; }

    function setPenType(type) {
        state.penType = type;
        document.querySelectorAll('#pen-options .pen-type-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`type-${type}`).classList.add('active');
        const w = document.getElementById('pen-width'); const a = document.getElementById('pen-alpha');
        if (type === 'fountain') { w.value = 3; a.value = 100; setPenColor('#ffffff'); }
        else if (type === 'pencil') { w.value = 2; a.value = 80; setPenColor('#cccccc'); }
        else if (type === 'highlighter') { w.value = 20; a.value = 30; setPenColor('#FFFF00'); }
    }
    
    let evCache = []; let prevDiff = -1; let isPanning = false; let isDrawing = false; let currentPath = []; let panStartX = 0, panStartY = 0;
    function getCanvasPoint(cx, cy) { const rect = els.canvas.getBoundingClientRect(); return { x: (cx - rect.left) * (els.canvas.width / rect.width), y: (cy - rect.top) * (els.canvas.height / rect.height) }; }

    els.viewport.addEventListener('pointerdown', handlePointerDown);
    els.viewport.addEventListener('pointermove', handlePointerMove);
    els.viewport.addEventListener('pointerup', handlePointerUp);
    els.viewport.addEventListener('pointercancel', handlePointerUp);
    els.viewport.addEventListener('pointerout', handlePointerUp);
    els.viewport.addEventListener('pointerleave', handlePointerUp);

    function handlePointerDown(e) {
        if(e.target.closest('#ui-layer') || e.target.closest('.resize-handle') || e.target.closest('.delete-handle') || e.target.closest('.invert-handle') || e.target.closest('.paste-box')) return;
        if (isPalmTouch(e)) return;
        if(!e.target.closest('.img-wrapper')) deselectAllImages();
        evCache.push(e);
        if ((state.tool === 'pen' || state.tool === 'eraser') && evCache.length === 1 && shouldAcceptDrawInput(e)) {
            isDrawing = true;
            activePointerType = e.pointerType;
            els.canvas.setPointerCapture(e.pointerId);
            const pt = makePoint(e);
            currentPath = [pt];
            lastRawPoint = pt;
            lastSmoothPoint = pt;
            lastDrawPoint = pt;
            if (state.tool === 'pen') {
                const alpha = document.getElementById('pen-alpha').value / 100;
                activeStroke = {
                    type: 'pen',
                    penType: state.penType,
                    color: state.penColor,
                    rgba: toRgba(state.penColor, alpha),
                    width: Number(document.getElementById('pen-width').value),
                    alpha,
                    pointerType: activePointerType
                };
            } else {
                activeStroke = { type: 'eraser', width: 40 };
            }
            renderCanvas();
        }
        else if (state.tool === 'laser' && evCache.length === 1 && shouldAcceptDrawInput(e)) {
            els.laserCanvas.setPointerCapture(e.pointerId);
            const pt = getCanvasPoint(e.clientX, e.clientY);
            state.laserPath = [{x: pt.x, y: pt.y, time: Date.now()}];
            if(!laserLoopRunning) { laserLoopRunning = true; requestAnimationFrame(laserLoop); }
        }
        else if (state.tool === 'pan' || evCache.length === 2) { isPanning = true; isDrawing = false; if(evCache.length === 1) { panStartX = e.clientX - state.panX; panStartY = e.clientY - state.panY; } els.viewport.setPointerCapture(e.pointerId); }
    }

    function handlePointerMove(e) {
        const index = evCache.findIndex(cachedEv => cachedEv.pointerId === e.pointerId); if (index > -1) evCache[index] = e;
        if (evCache.length === 2) { const dx = evCache[0].clientX - evCache[1].clientX; const dy = evCache[0].clientY - evCache[1].clientY; const curDiff = Math.hypot(dx, dy); if (prevDiff > 0) { const zoomDelta = (curDiff - prevDiff) * 0.005; state.zoom = Math.min(Math.max(state.zoom + zoomDelta, 0.5), 5.0); updateTransform(); } prevDiff = curDiff; }
        else if (isPanning && evCache.length === 1) { state.panX = e.clientX - panStartX; state.panY = e.clientY - panStartY; updateTransform(); }
        else if (state.tool === 'laser' && evCache.length === 1) {
            const events = getCoalescedEvents(e);
            for (const ev of events) {
                const pt = getCanvasPoint(ev.clientX, ev.clientY);
                state.laserPath.push({x: pt.x, y: pt.y, time: Date.now()});
            }
        }
        else if (isDrawing && evCache.length === 1 && activeStroke) {
            const ctx = els.ctx;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            const events = getCoalescedEvents(e);
            for (const ev of events) {
                const rawPoint = makePoint(ev);
                const smooth = smoothPoint(rawPoint);
                if (lastDrawPoint) {
                    const dist = Math.hypot(smooth.x - lastDrawPoint.x, smooth.y - lastDrawPoint.y);
                    if (dist < inputConfig.smoothing.minDistance) {
                        lastRawPoint = rawPoint;
                        continue;
                    }
                    if (activeStroke.type === 'pen') {
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.strokeStyle = activeStroke.rgba;
                        const pressure = (lastDrawPoint.p + smooth.p) / 2;
                        ctx.lineWidth = getStrokeWidth(activeStroke.width, pressure, activeStroke.penType, activeStroke.pointerType);
                        if (activeStroke.penType === 'pencil') { ctx.shadowBlur = 2; ctx.shadowColor = activeStroke.rgba; } else { ctx.shadowBlur = 0; }
                        ctx.beginPath();
                        ctx.moveTo(lastDrawPoint.x, lastDrawPoint.y);
                        ctx.lineTo(smooth.x, smooth.y);
                        ctx.stroke();
                    } else {
                        ctx.globalCompositeOperation = 'destination-out';
                        ctx.lineWidth = activeStroke.width;
                        ctx.strokeStyle = 'rgba(0,0,0,1)';
                        ctx.shadowBlur = 0;
                        ctx.beginPath();
                        ctx.moveTo(lastDrawPoint.x, lastDrawPoint.y);
                        ctx.lineTo(smooth.x, smooth.y);
                        ctx.stroke();
                    }
                }
                currentPath.push(smooth);
                lastRawPoint = rawPoint;
                lastSmoothPoint = smooth;
                lastDrawPoint = smooth;
            }
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    function handlePointerUp(e) {
        const index = evCache.findIndex(cachedEv => cachedEv.pointerId === e.pointerId); if (index > -1) evCache.splice(index, 1); if (evCache.length < 2) prevDiff = -1;
        if (isDrawing && evCache.length === 0 && activeStroke) {
            isDrawing = false;
            if (activeStroke.type === 'pen') {
                state.inkStrokes[state.currentPage].push({
                    type: 'pen',
                    penType: activeStroke.penType,
                    path: currentPath,
                    color: activeStroke.color,
                    width: activeStroke.width,
                    alpha: activeStroke.alpha,
                    pointerType: activeStroke.pointerType
                });
            } else {
                state.inkStrokes[state.currentPage].push({ type: 'eraser', path: currentPath, width: activeStroke.width });
            }
            activeStroke = null;
            activePointerType = null;
            lastRawPoint = null;
            lastSmoothPoint = null;
            lastDrawPoint = null;
            renderCanvas();
        }
        if (evCache.length === 0) isPanning = false;
    }

    let laserLoopRunning = false;
    function laserLoop() {
        if (state.laserPath.length === 0) { els.laserCtx.clearRect(0, 0, els.laserCanvas.width, els.laserCanvas.height); laserLoopRunning = false; return; }
        const now = Date.now(); const maxLife = 1500; state.laserPath = state.laserPath.filter(p => now - p.time < maxLife);
        const ctx = els.laserCtx; ctx.clearRect(0, 0, els.laserCanvas.width, els.laserCanvas.height);
        if (state.laserPath.length > 1) {
            ctx.lineJoin = 'round'; ctx.lineCap = 'round'; const width = document.getElementById('laser-width').value; const alphaVal = document.getElementById('laser-alpha').value / 100; const color = state.laserColor;
            if (state.laserType === 'standard') { ctx.shadowBlur = 10; ctx.shadowColor = color; ctx.globalCompositeOperation = 'source-over'; for(let i=1; i<state.laserPath.length; i++) { const p1 = state.laserPath[i-1]; const p2 = state.laserPath[i]; const age = now - p2.time; const opacity = Math.max(0, 1 - age/maxLife) * alphaVal; ctx.beginPath(); ctx.strokeStyle = color; ctx.globalAlpha = opacity; ctx.lineWidth = width; ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); } ctx.globalAlpha = 1.0; ctx.shadowBlur = 0; } 
            else if (state.laserType === 'highlighter') { ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over'; ctx.beginPath(); ctx.moveTo(state.laserPath[0].x, state.laserPath[0].y); for(let i=1; i<state.laserPath.length; i++) { ctx.lineTo(state.laserPath[i].x, state.laserPath[i].y); } const r = parseInt(color.substr(1,2), 16); const g = parseInt(color.substr(3,2), 16); const b = parseInt(color.substr(5,2), 16); ctx.strokeStyle = `rgb(${r},${g},${b})`; ctx.lineWidth = width; ctx.globalAlpha = alphaVal; ctx.stroke(); ctx.globalAlpha = 1.0; }
        }
        if (state.laserPath.length > 0) requestAnimationFrame(laserLoop); else laserLoopRunning = false;
    }

    function toggleTheme() { state.theme = state.theme === 'dark' ? 'light' : 'dark'; document.body.setAttribute('data-theme', state.theme); els.themeBtn.innerText = state.theme === 'dark' ? '🌓' : '☀️'; }
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen();
        }
    }
    function updateTransform() { els.scaler.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`; }
    function resetView() { state.zoom = 1.0; state.panX = 0; state.panY = 0; updateTransform(); }

    function setTool(toolName) {
        if (state.tool === toolName) state.tool = null; else state.tool = toolName;
        document.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        if (state.tool) { const btn = document.getElementById(`tool-${state.tool}`); if(btn) btn.classList.add('active'); }
        els.penOptions.style.display = 'none'; els.laserOptions.style.display = 'none';
        if (state.tool === 'pen') { els.canvas.style.pointerEvents = 'auto'; els.laserCanvas.style.pointerEvents = 'none'; els.penOptions.style.display = 'flex'; }
        else if (state.tool === 'laser') { els.canvas.style.pointerEvents = 'none'; els.laserCanvas.style.pointerEvents = 'auto'; els.laserOptions.style.display = 'flex'; }
        else if (state.tool === 'eraser') { els.canvas.style.pointerEvents = 'auto'; els.laserCanvas.style.pointerEvents = 'none'; }
        else { els.canvas.style.pointerEvents = 'none'; els.laserCanvas.style.pointerEvents = 'none'; }
    }

    function setPenColor(color) { state.penColor = color; document.getElementById('pen-color').value = color; }
    function drawStoredStroke(ctx, stroke) {
        const path = stroke.path || [];
        if (path.length < 2) return;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        if (stroke.type === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.shadowBlur = 0;
            for (let i = 1; i < path.length; i++) {
                const p1 = path[i - 1];
                const p2 = path[i];
                ctx.lineWidth = stroke.width;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
            return;
        }
        const rgba = stroke.rgba || toRgba(stroke.color, stroke.alpha);
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = rgba;
        if (stroke.penType === 'pencil') { ctx.shadowBlur = 2; ctx.shadowColor = rgba; } else { ctx.shadowBlur = 0; }
        for (let i = 1; i < path.length; i++) {
            const p1 = path[i - 1];
            const p2 = path[i];
            const pressure = ((p1.p ?? 0.5) + (p2.p ?? 0.5)) / 2;
            ctx.lineWidth = getStrokeWidth(stroke.width, pressure, stroke.penType, stroke.pointerType);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }
    function renderCanvas() {
        const ctx = els.ctx;
        ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
        state.inkStrokes[state.currentPage].forEach(s => drawStoredStroke(ctx, s));
        ctx.globalCompositeOperation = 'source-over';
    }
    function undoStroke() { if (state.inkStrokes[state.currentPage].length > 0) { state.inkStrokes[state.currentPage].pop(); renderCanvas(); } }
    function clearCanvas() { state.inkStrokes[state.currentPage] = []; renderCanvas(); }

    function insertImage(file) { const reader = new FileReader(); reader.onload = function(e) { const div = document.createElement('div'); div.className = 'item img-item'; const wrapper = document.createElement('div'); wrapper.className = 'img-wrapper'; const img = document.createElement('img'); img.src = e.target.result; const handle = document.createElement('div'); handle.className = 'resize-handle'; const delBtn = document.createElement('div'); delBtn.className = 'delete-handle'; delBtn.innerText = 'X'; delBtn.onclick = (ev) => { ev.stopPropagation(); div.remove(); }; const invertBtn = document.createElement('div'); invertBtn.className = 'invert-handle'; invertBtn.innerText = '🌓'; invertBtn.onpointerdown = (ev) => { ev.stopPropagation(); const current = img.style.filter; if(current === 'invert(1)') img.style.filter = 'invert(0)'; else if(current === 'invert(0)') img.style.filter = 'invert(1)'; else { const isDark = document.body.getAttribute('data-theme') === 'dark'; img.style.filter = isDark ? 'invert(0)' : 'invert(1)'; } }; wrapper.addEventListener('pointerdown', (ev) => { if(ev.target === handle || ev.target === delBtn || ev.target === invertBtn) return; ev.stopPropagation(); deselectAllImages(); wrapper.classList.add('selected'); }); let startX, startW; handle.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); ev.preventDefault(); startX = ev.clientX; startW = wrapper.offsetWidth; handle.setPointerCapture(ev.pointerId); const onMove = (mv) => { wrapper.style.width = (startW + (mv.clientX - startX) / state.zoom) + 'px'; }; const onUp = () => { handle.removeEventListener('pointermove', onMove); handle.removeEventListener('pointerup', onUp); }; handle.addEventListener('pointermove', onMove); handle.addEventListener('pointerup', onUp); }); wrapper.appendChild(img); wrapper.appendChild(handle); wrapper.appendChild(delBtn); wrapper.appendChild(invertBtn); div.appendChild(wrapper); safeInsert(div); state.pages[state.currentPage].push(div); state.actionStack[state.currentPage].push({ type: 'image' }); }; reader.readAsDataURL(file); }
    function deselectAllImages() { document.querySelectorAll('.img-wrapper.selected').forEach(el => el.classList.remove('selected')); }
    function loadTextData(text) { const lines = text.split(/\r\n|\r|\n/); const newData = []; for (let line of lines) { if(line.trim() === "") newData.push(" "); else newData.push(line); } if (newData.length > 0) { solutionData = newData; state.currentLine = 0; state.currentPage = 0; state.pages = [[]]; state.inkStrokes = [[]]; state.actionStack = [[]]; els.content.innerHTML = ''; els.content.appendChild(els.cursor); renderCanvas(); updatePageUI(); updatePrompter(); alert("파일 로드 완료"); } }
    
    let isSelecting = false; let selectStartX = 0, selectStartY = 0; let selectedBlocks = new Set();
    function startSelection(e) { if (e.target.closest('.editor-block-content') || e.target.tagName === 'BUTTON') return; isSelecting = true; const rect = els.blockList.getBoundingClientRect(); selectStartX = e.clientX - rect.left + els.blockList.scrollLeft; selectStartY = e.clientY - rect.top + els.blockList.scrollTop; els.lasso.style.left = selectStartX + 'px'; els.lasso.style.top = selectStartY + 'px'; els.lasso.style.display = 'block'; els.blockList.setPointerCapture(e.pointerId); if (!e.shiftKey) clearSelection(); els.blockList.addEventListener('pointermove', updateSelection); els.blockList.addEventListener('pointerup', endSelection); }
    function updateSelection(e) { if (!isSelecting) return; e.preventDefault(); const rect = els.blockList.getBoundingClientRect(); const currentX = e.clientX - rect.left + els.blockList.scrollLeft; const currentY = e.clientY - rect.top + els.blockList.scrollTop; const left = Math.min(selectStartX, currentX); const top = Math.min(selectStartY, currentY); const width = Math.abs(currentX - selectStartX); const height = Math.abs(currentY - selectStartY); els.lasso.style.left = left + 'px'; els.lasso.style.top = top + 'px'; els.lasso.style.width = width + 'px'; els.lasso.style.height = height + 'px'; Array.from(els.blockList.children).forEach(row => { if (checkIntersection(row, left, top, width, height)) { row.classList.add('selected'); selectedBlocks.add(row); } }); }
    function endSelection(e) { isSelecting = false; els.lasso.style.display = 'none'; els.blockList.removeEventListener('pointermove', updateSelection); els.blockList.removeEventListener('pointerup', endSelection); updateBulkToolbar(); }
    function checkIntersection(row, lx, ly, lw, lh) { const rx = row.offsetLeft; const ry = row.offsetTop; const rw = row.offsetWidth; const rh = row.offsetHeight; return (lx < rx + rw && lx + lw > rx && ly < ry + rh && ly + lh > ry); }
    function clearSelection() { selectedBlocks.forEach(row => row.classList.remove('selected')); selectedBlocks.clear(); updateBulkToolbar(); }
    function updateBulkToolbar() { els.bulkToolbar.style.display = selectedBlocks.size > 0 ? 'flex' : 'none'; if(selectedBlocks.size>0) document.getElementById('selected-count').innerText = `${selectedBlocks.size}개`; }
    function bulkDelete() {
        if (selectedBlocks.size === 0) return;
        selectedBlocks.forEach(row => row.remove());
        selectedBlocks.clear();
        updateBulkToolbar();
    }
    function addNewBlock() {
        createBlockElement('', els.blockList.children.length);
        updateBulkToolbar();
    }
    function deleteAllBlocks() {
        if (els.blockList.children.length === 0) return;
        if (!confirm('모든 블록을 삭제할까요?')) return;
        els.blockList.innerHTML = '';
        selectedBlocks.clear();
        updateBulkToolbar();
    }
    function confirmDeleteRow() {
        if (pendingDeleteRow) {
            pendingDeleteRow.remove();
            pendingDeleteRow = null;
            updateBulkToolbar();
        }
        els.delModal.style.display = 'none';
    }
    function cancelDeleteRow() { pendingDeleteRow = null; els.delModal.style.display = 'none'; }
    function createBlockElement(text, index) { const row = document.createElement('div'); row.className = 'editor-block-row'; row.dataset.index = index; const content = document.createElement('div'); content.className = 'editor-block-content'; content.contentEditable = true; content.innerHTML = text; row.appendChild(content); els.blockList.appendChild(row); return row; }
    function renderBlockList() { els.blockList.innerHTML = ''; selectedBlocks.clear(); updateBulkToolbar(); solutionData.forEach((text, index) => { createBlockElement(text, index); }); }
    function openEditor() { renderBlockList(); els.editorModal.style.display = 'flex'; els.blockList.addEventListener('pointerdown', startSelection); }
    function closeEditor() { els.editorModal.style.display = 'none'; }
    function saveRichData() { const blocks = document.querySelectorAll('.editor-block-content'); const newData = []; blocks.forEach(b => newData.push(b.innerHTML)); solutionData = newData; state.currentLine = 0; state.currentPage = 0; state.pages = [[]]; state.inkStrokes = [[]]; state.actionStack = [[]]; els.content.innerHTML = ''; els.content.appendChild(els.cursor); renderCanvas(); updatePageUI(); updatePrompter(); closeEditor(); }
    function safeInsert(element) { const parent = els.cursor.parentNode; if (parent !== els.content && parent !== null) { if (parent.nextSibling) els.content.insertBefore(els.cursor, parent.nextSibling); else els.content.appendChild(els.cursor); } els.content.insertBefore(element, els.cursor); }
    function checkOverflowAndPaginate(newElement) { if (els.content.scrollWidth > els.content.clientWidth + 10) { newElement.remove(); nextPage(); safeInsert(newElement); return true; } return false; }
    
    // [MODIFIED] 애니메이션 로직: 너비 기반 일정 속도 구현
    async function typeNode(target, node) {
        const isMath = node.tagName && (node.tagName.toLowerCase().startsWith('mjx-') || node.classList.contains('mjx-container'));
        if (isMath) {
            const element = node.cloneNode(true); 
            element.classList.add('math-reveal');
            target.insertBefore(element, els.cursor); 
            
            // Reflow 강제하여 너비 계산 준비
            void element.offsetWidth;
            
            // 수식 너비 가져오기 (px)
            const width = element.offsetWidth;
            const speedVal = parseInt(els.speedInput.value); // 사용자 입력값 (1 ~ ...)
            
            // duration 계산: (너비 * 입력값) / 상수
            // 상수 500은 튜닝값 (Speed 1일 때, 500px 너비를 1초에 그림)
            let duration = (width * speedVal) / 500;
            
            // 너무 짧으면 어색하므로 최소 0.1초 보장
            if (duration < 0.1) duration = 0.1;

            element.style.transition = `clip-path ${duration}s linear`; 
            element.style.clipPath = 'inset(0 0 0 0)';
            
            await new Promise(r => setTimeout(r, duration * 1000));
            if (element.nextSibling) target.insertBefore(els.cursor, element.nextSibling); else target.appendChild(els.cursor);
        } else if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent; const speed = parseInt(els.speedInput.value);
            for (let i = 0; i < text.length; i++) { target.insertBefore(document.createTextNode(text[i]), els.cursor); await new Promise(r => setTimeout(r, speed * 2)); }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node.cloneNode(false); target.insertBefore(element, els.cursor); element.appendChild(els.cursor);
            const children = Array.from(node.childNodes); for (const child of children) await typeNode(element, child);
            if (element.nextSibling) target.insertBefore(els.cursor, element.nextSibling); else target.appendChild(els.cursor);
        }
    }

    async function typeText(div, html) {
        state.typing = true; 
        const tempDiv = document.createElement('div'); tempDiv.style.visibility = 'hidden'; tempDiv.style.position = 'absolute'; document.body.appendChild(tempDiv); tempDiv.innerHTML = sanitizeHTML(html);
        if (window.MathJax) await MathJax.typesetPromise([tempDiv]);
        div.appendChild(els.cursor);
        const nodes = Array.from(tempDiv.childNodes); for (const node of nodes) { await typeNode(div, node); }
        document.body.removeChild(tempDiv); state.typing = false; 
    }

    async function nextStep() {
        if (state.typing || state.currentLine >= solutionData.length) return;
        const div = document.createElement('div'); div.className = 'item text-item'; safeInsert(div);
        if (checkOverflowAndPaginate(div)) {}
        state.pages[state.currentPage].push(div); state.actionStack[state.currentPage].push({ type: 'text', index: state.currentLine });
        await typeText(div, solutionData[state.currentLine]); 
        state.currentLine++; updatePrompter();
    }
    
    function insertBlankLine() { if (state.typing) return; const div = document.createElement('div'); div.className = 'item text-item'; div.innerHTML = '&nbsp;'; safeInsert(div); state.pages[state.currentPage].push(div); state.actionStack[state.currentPage].push({ type: 'blank' }); }
    function insertColumnBreak() { if (state.typing) return; const div = document.createElement('div'); div.className = 'force-break'; safeInsert(div); state.pages[state.currentPage].push(div); state.actionStack[state.currentPage].push({ type: 'break' }); }
    function prevStep() { if (state.typing) return; const stack = state.actionStack[state.currentPage]; if (stack.length === 0) { if(state.currentPage > 0) prevPage(); return; } const action = stack.pop(); const pageContent = state.pages[state.currentPage]; const el = pageContent.pop(); if (el) el.remove(); const lastEl = pageContent.length > 0 ? pageContent[pageContent.length-1] : null; if (lastEl && lastEl.classList.contains('text-item')) lastEl.appendChild(els.cursor); else els.content.appendChild(els.cursor); if (action.type === 'text') state.currentLine = action.index; updatePrompter(); }
    function updatePageUI() { els.content.innerHTML = ''; state.pages[state.currentPage].forEach(el => els.content.appendChild(el)); const pageContent = state.pages[state.currentPage]; if (pageContent.length > 0) { const lastEl = pageContent[pageContent.length - 1]; if (lastEl.classList.contains('text-item')) lastEl.appendChild(els.cursor); else els.content.appendChild(els.cursor); } else els.content.appendChild(els.cursor); renderCanvas(); els.pageInd.innerText = `P.${state.currentPage + 1}`; }
    function nextPage() { if (state.currentPage === state.pages.length - 1) { state.pages.push([]); state.inkStrokes.push([]); state.actionStack.push([]); } state.currentPage++; updatePageUI(); }
    function prevPage() { if (state.currentPage > 0) { state.currentPage--; updatePageUI(); } }
    function updatePrompter() { if (state.currentLine >= solutionData.length) els.prompter.innerText = "(끝)"; else els.prompter.innerText = solutionData[state.currentLine].replace(/(<([^>]+)>)/gi, "") || "(공백)"; }
    function adjustColumns(delta) { let newCount = state.columnCount + delta; if (newCount < 1) newCount = 1; if (newCount > 4) newCount = 4; state.columnCount = newCount; els.content.style.columnCount = state.columnCount; els.colDisplay.innerText = `${state.columnCount}단`; }
    function resizeCanvas() { els.canvas.width = 3000; els.canvas.height = 1688; els.laserCanvas.width = 3000; els.laserCanvas.height = 1688; }
    setTimeout(resizeCanvas, 100);

    function bindUI() {
        const byId = (id) => document.getElementById(id);
        const on = (id, event, handler) => {
            const el = byId(id);
            if (el) el.addEventListener(event, handler);
        };

        const fileInput = byId('file-input');
        const imageInput = byId('image-input');

        on('btn-paste-close', 'click', closePasteModal);
        on('btn-style-bold', 'click', () => execStyle('bold'));
        on('btn-style-clear', 'click', clearFormat);
        on('btn-style-step', 'click', () => applyClass('step-num'));
        on('btn-style-highlight', 'click', () => applyClass('highlight'));
        on('btn-style-accent', 'click', () => applyClass('accent'));
        on('btn-style-neon-green', 'click', () => applyClass('neon-green'));
        on('btn-bulk-delete', 'click', bulkDelete);
        on('btn-add-block', 'click', addNewBlock);
        on('btn-delete-all', 'click', deleteAllBlocks);
        on('btn-editor-cancel', 'click', closeEditor);
        on('btn-editor-save', 'click', saveRichData);
        on('btn-row-delete', 'click', confirmDeleteRow);
        on('btn-row-cancel', 'click', cancelDeleteRow);

        on('type-fountain', 'click', () => setPenType('fountain'));
        on('type-pencil', 'click', () => setPenType('pencil'));
        on('type-highlighter', 'click', () => setPenType('highlighter'));
        document.querySelectorAll('[data-pen-color]').forEach((btn) => {
            btn.addEventListener('click', () => setPenColor(btn.dataset.penColor));
        });
        const penColorInput = byId('pen-color');
        if (penColorInput) penColorInput.addEventListener('change', (e) => setPenColor(e.target.value));

        on('laser-type-standard', 'click', () => setLaserType('standard'));
        on('laser-type-highlighter', 'click', () => setLaserType('highlighter'));
        document.querySelectorAll('[data-laser-color]').forEach((btn) => {
            btn.addEventListener('click', () => setLaserColor(btn.dataset.laserColor));
        });
        const laserColorInput = byId('laser-color');
        if (laserColorInput) laserColorInput.addEventListener('change', (e) => setLaserColor(e.target.value));

        on('tool-zoom-in', 'click', () => setTool('zoom-in'));
        on('tool-zoom-out', 'click', () => setTool('zoom-out'));
        on('tool-pan', 'click', () => setTool('pan'));
        on('btn-reset-view', 'click', resetView);

        on('tool-pen', 'click', () => setTool('pen'));
        on('tool-eraser', 'click', () => setTool('eraser'));
        on('tool-laser', 'click', () => setTool('laser'));
        on('btn-undo', 'click', undoStroke);
        on('btn-clear-canvas', 'click', clearCanvas);

        on('btn-columns-dec', 'click', () => adjustColumns(-1));
        on('btn-columns-inc', 'click', () => adjustColumns(1));

        on('btn-open-file', 'click', () => fileInput?.click());
        on('btn-open-image', 'click', () => imageInput?.click());
        on('btn-open-paste', 'click', openPasteModal);
        on('btn-insert-blank', 'click', insertBlankLine);
        on('btn-insert-break', 'click', insertColumnBreak);
        on('btn-open-editor', 'click', openEditor);

        on('btn-theme', 'click', toggleTheme);
        on('btn-fullscreen', 'click', toggleFullscreen);
        on('btn-prev-step', 'click', prevStep);
        on('btn-next-step', 'click', nextStep);
        on('btn-prev-page', 'click', prevPage);
        on('btn-next-page', 'click', nextPage);
    }

    document.getElementById('file-input').addEventListener('change', function(e) { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(e) { loadTextData(e.target.result); }; reader.readAsText(file); e.target.value = ''; });
    document.getElementById('image-input').addEventListener('change', function(e) { const file = e.target.files[0]; if (!file) return; if (file.type.startsWith('image/')) { insertImage(file); } else { alert("이미지 파일만 선택 가능합니다."); } e.target.value = ''; });
    document.addEventListener('keydown', e => { if (document.activeElement.isContentEditable || document.activeElement.tagName === 'INPUT') return; if (e.key === 'ArrowRight' || e.key === ' ') { nextStep(); e.preventDefault(); } if (e.key === 'ArrowLeft') { prevStep(); e.preventDefault(); } });
    document.body.addEventListener('dragover', e => e.preventDefault());
    document.body.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length > 0) { const file = e.dataTransfer.files[0]; if (file.type === 'text/plain' || file.name.endsWith('.txt')) { const reader = new FileReader(); reader.onload = e => loadTextData(e.target.result); reader.readAsText(file); } else if (file.type.startsWith('image/')) { insertImage(file); } } });
    
    document.addEventListener('paste', e => { if (els.editorModal.style.display === 'flex' && els.pasteModal.style.display !== 'flex') return; const items = (e.clipboardData || e.originalEvent.clipboardData).items; let imageFound = false; for (let i of items) { if (i.type.indexOf("image") === 0) { insertImage(i.getAsFile()); imageFound = true; } } if (imageFound) { e.preventDefault(); if (els.pasteModal.style.display === 'flex') closePasteModal(); } });
    function openPasteModal() { els.pasteModal.style.display = 'flex'; els.pasteTarget.innerHTML = "여기를 길게 터치하여<br>'붙여넣기'를 선택하세요."; els.pasteTarget.focus(); }
    function closePasteModal() { els.pasteModal.style.display = 'none'; }

    bindUI();
    updatePrompter(); updatePageUI();
