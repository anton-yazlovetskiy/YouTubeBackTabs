const speedValue = document.getElementById('speedValue');
let currentSpeed = 1.5;

// Загружаем сохраненное значение
chrome.storage.local.get(['preferredSpeed'], (res) => {
    if (res.preferredSpeed) {
        currentSpeed = parseFloat(res.preferredSpeed);
        speedValue.textContent = currentSpeed.toFixed(2) + 'x';
    }
});

function updateAndNotify(delta) {
    currentSpeed = Math.max(0.25, Math.min(4, currentSpeed + delta));
    speedValue.textContent = currentSpeed.toFixed(2) + 'x';
    
    // Сохраняем
    chrome.storage.local.set({ preferredSpeed: currentSpeed.toString() });

    // Сразу отправляем в активную вкладку
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
                action: "forceUpdateSpeed", 
                newSpeed: currentSpeed 
            });
        }
    });
}

document.getElementById('minus').onclick = () => updateAndNotify(-0.25);
document.getElementById('plus').onclick = () => updateAndNotify(0.25);