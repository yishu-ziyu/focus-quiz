// Focus Quiz - Options Logic

const providerSelect = document.getElementById('provider');
const apiKeyInput = document.getElementById('apiKey');
const saveButton = document.getElementById('save');
const statusDiv = document.getElementById('status');

// Load saved settings
chrome.storage.local.get(['provider', 'openaiKey', 'geminiKey', 'minimaxKey'], (result) => {
    if (result.provider) {
        providerSelect.value = result.provider;
    }

    // Pre-fill key based on current provider
    updateInputForProvider(providerSelect.value, result);
});

// Update input value when provider changes
providerSelect.addEventListener('change', () => {
    chrome.storage.local.get(['openaiKey', 'geminiKey', 'minimaxKey'], (result) => {
        updateInputForProvider(providerSelect.value, result);
    });
});

function updateInputForProvider(provider, data) {
    if (provider === 'openai') {
        apiKeyInput.value = data.openaiKey || '';
        apiKeyInput.placeholder = 'sk-...';
    } else if (provider === 'gemini') {
        apiKeyInput.value = data.geminiKey || '';
        apiKeyInput.placeholder = 'AIza...';
    } else if (provider === 'minimax') {
        apiKeyInput.value = data.minimaxKey || '';
        apiKeyInput.placeholder = 'sk-...';
    }
}

// Save settings
saveButton.addEventListener('click', () => {
    const provider = providerSelect.value;
    const key = apiKeyInput.value.trim();

    if (!key) {
        showStatus('Please enter an API Key.', false);
        return;
    }

    const updates = {
        provider: provider
    };

    if (provider === 'openai') {
        updates.openaiKey = key;
    } else if (provider === 'gemini') {
        updates.geminiKey = key;
    } else if (provider === 'minimax') {
        updates.minimaxKey = key;
    }

    chrome.storage.local.set(updates, () => {
        showStatus('Settings saved successfully!', true);

        // Notify other parts of the extension that settings changed
        chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED' });
    });
});

function showStatus(text, isSuccess) {
    statusDiv.textContent = text;
    statusDiv.className = isSuccess ? 'mt-3 text-center text-sm h-5 text-zinc-600' : 'mt-3 text-center text-sm h-5 text-red-600';
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'mt-3 text-center text-sm h-5';
    }, 3000);
}
