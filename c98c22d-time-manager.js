/**
 * time-manager.js - 澳洲储能电站时间管理器
 * 
 * 核心功能：
 * - 跨标签页时间同步
 * - 主从架构避免并发
 * - 支持1x/10x/60x加速仿真
 * - 250ms节流避免UI闪烁
 */

(function() {
    'use strict';

    // ===== CONSTANTS =====
    const HEARTBEAT_INTERVAL_MS = 500;       // Master heartbeat frequency
    const HEARTBEAT_TIMEOUT_MS = 2000;       // Master considered dead after this
    const TICK_INTERVAL_MS = 250;            // Simulation step interval (10 Hz)
    const RAF_THROTTLE = true;              // Use RequestAnimationFrame throttling
    const STORAGE_KEY_MASTER = 'au002_tm_master';
    const STORAGE_KEY_TIME = 'au002_tm_time';
    const STORAGE_KEY_SPEED = 'au002_tm_speed';
    const CHANNEL_NAME = 'au002_time_sync';

    // ===== STATE =====
    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    let isMaster = false;
    let speed = 1;                           // 1x, 10x, 60x
    let simTime = null;                      // Current simulation Date object
    let running = false;
    let tickTimer = null;
    let heartbeatTimer = null;
    let eventListeners = [];
    let rafHandle = null;

    // ===== MASTER LOCK MANAGEMENT =====
    function tryBecomeMaster() {
        const masterInfo = JSON.parse(localStorage.getItem(STORAGE_KEY_MASTER) || '{}');
        const now = Date.now();

        if (!masterInfo.tabId || (now - masterInfo.lastHeartbeat) > HEARTBEAT_TIMEOUT_MS) {
            // No master or master is dead, become master
            localStorage.setItem(STORAGE_KEY_MASTER, JSON.stringify({
                tabId: tabId,
                lastHeartbeat: now
            }));
            return true;
        }

        return masterInfo.tabId === tabId;
    }

    function masterHeartbeat() {
        if (isMaster) {
            localStorage.setItem(STORAGE_KEY_MASTER, JSON.stringify({
                tabId: tabId,
                lastHeartbeat: Date.now()
            }));
        }
    }

    function startHeartbeat() {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(masterHeartbeat, HEARTBEAT_INTERVAL_MS);
    }

    function stopHeartbeat() {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
    }

    // ===== TIME SYNCHRONIZATION =====
    function loadTimeState() {
        const timeData = JSON.parse(localStorage.getItem(STORAGE_KEY_TIME) || '{}');
        const speedData = JSON.parse(localStorage.getItem(STORAGE_KEY_SPEED) || '1');
        
        simTime = timeData.simTime ? new Date(timeData.simTime) : new Date();
        speed = typeof speedData === 'number' ? speedData : 1;
        running = timeData.running || false;
    }

    function saveTimeState() {
        localStorage.setItem(STORAGE_KEY_TIME, JSON.stringify({
            simTime: simTime ? simTime.toISOString() : null,
            running: running,
            lastUpdate: Date.now()
        }));
        localStorage.setItem(STORAGE_KEY_SPEED, speed.toString());
    }

    function broadcastTimeUpdate() {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage({
            type: 'timeUpdate',
            simTime: simTime ? simTime.toISOString() : null,
            speed: speed,
            running: running,
            masterTabId: tabId
        });
        channel.close();
    }

    // ===== SIMULATION TICK =====
    function _tick() {
        if (!isMaster || !running || !simTime) return;

        // Advance simulation time
        const deltaMs = TICK_INTERVAL_MS * speed;
        simTime = new Date(simTime.getTime() + deltaMs);

        // Save state and broadcast
        saveTimeState();
        broadcastTimeUpdate();

        // Trigger UI updates
        _triggerUIUpdate();
    }

    function _triggerUIUpdate() {
        if (RAF_THROTTLE && rafHandle) return;

        const updateUI = () => {
            rafHandle = null;
            eventListeners.forEach(listener => {
                try {
                    listener(simTime, speed, running);
                } catch (err) {
                    console.error('[TimeManager] Event listener error:', err);
                }
            });
        };

        if (RAF_THROTTLE) {
            rafHandle = requestAnimationFrame(updateUI);
        } else {
            updateUI();
        }
    }

    // ===== PUBLIC API =====
    function start() {
        if (!isMaster) return;
        if (running) return;

        running = true;
        if (!simTime) simTime = new Date();

        saveTimeState();
        broadcastTimeUpdate();

        if (tickTimer) clearInterval(tickTimer);
        tickTimer = setInterval(_tick, TICK_INTERVAL_MS);
        
        console.log('[TimeManager] Master started simulation');
    }

    function stop() {
        if (!isMaster) return;

        running = false;
        saveTimeState();
        broadcastTimeUpdate();

        if (tickTimer) {
            clearInterval(tickTimer);
            tickTimer = null;
        }

        console.log('[TimeManager] Master stopped simulation');
    }

    function setSpeed(newSpeed) {
        if (!isMaster) return;
        if (![1, 10, 60].includes(newSpeed)) {
            console.warn('[TimeManager] Invalid speed:', newSpeed);
            return;
        }

        speed = newSpeed;
        saveTimeState();
        broadcastTimeUpdate();
        
        console.log(`[TimeManager] Master set speed to ${speed}x`);
    }

    function setTime(newTime) {
        if (!isMaster) return;
        if (!(newTime instanceof Date)) {
            console.warn('[TimeManager] Invalid time:', newTime);
            return;
        }

        simTime = new Date(newTime);
        saveTimeState();
        broadcastTimeUpdate();
        
        console.log('[TimeManager] Master set time to:', simTime.toISOString());
    }

    function getTime() {
        return simTime ? new Date(simTime) : null;
    }

    function getSpeed() {
        return speed;
    }

    function isRunning() {
        return running;
    }

    function isMasterTab() {
        return isMaster;
    }

    function addEventListener(listener) {
        if (typeof listener === 'function') {
            eventListeners.push(listener);
        }
    }

    function removeEventListener(listener) {
        const index = eventListeners.indexOf(listener);
        if (index > -1) {
            eventListeners.splice(index, 1);
        }
    }

    // ===== CROSS-TAB SYNCHRONIZATION =====
    function handleStorageChange(event) {
        if (event.key === STORAGE_KEY_MASTER) {
            // Master changed, re-evaluate
            setTimeout(initializeMaster, 100);
        }
    }

    function handleBroadcastMessage(event) {
        if (event.data.type === 'timeUpdate' && !isMaster) {
            // Slave receives time update from master
            if (event.data.simTime) {
                simTime = new Date(event.data.simTime);
            }
            speed = event.data.speed;
            running = event.data.running;

            _triggerUIUpdate();
        }
    }

    // ===== INITIALIZATION =====
    function initializeMaster() {
        const wasMaster = isMaster;
        isMaster = tryBecomeMaster();

        if (isMaster && !wasMaster) {
            console.log('[TimeManager] This tab became master:', tabId);
            startHeartbeat();
            
            // Load existing state or initialize
            loadTimeState();
            saveTimeState();
            broadcastTimeUpdate();
            
            if (running && !tickTimer) {
                tickTimer = setInterval(_tick, TICK_INTERVAL_MS);
            }
        } else if (!isMaster && wasMaster) {
            console.log('[TimeManager] This tab lost master status');
            stopHeartbeat();
            
            if (tickTimer) {
                clearInterval(tickTimer);
                tickTimer = null;
            }
        } else if (!isMaster) {
            // Slave: load current state
            loadTimeState();
            _triggerUIUpdate();
        }
    }

    function cleanup() {
        if (tickTimer) clearInterval(tickTimer);
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (rafHandle) cancelAnimationFrame(rafHandle);

        window.removeEventListener('storage', handleStorageChange);
        
        // Remove master lock if this tab owns it
        const masterInfo = JSON.parse(localStorage.getItem(STORAGE_KEY_MASTER) || '{}');
        if (masterInfo.tabId === tabId) {
            localStorage.removeItem(STORAGE_KEY_MASTER);
        }
    }

    // ===== SETUP =====
    function initialize() {
        // Set up event listeners
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('beforeunload', cleanup);
        
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.addEventListener('message', handleBroadcastMessage);
        
        // Initialize master/slave status
        initializeMaster();
        
        console.log('[TimeManager] Initialized tab:', tabId, isMaster ? '(master)' : '(slave)');
    }

    // Auto-initialize when script loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // ===== EXPORT =====
    window.AU002TimeManager = {
        start,
        stop,
        setSpeed,
        setTime,
        getTime,
        getSpeed,
        isRunning,
        isMasterTab,
        addEventListener,
        removeEventListener,
        TICK_INTERVAL_MS,
        SPEEDS: [1, 10, 60]
    };

})();