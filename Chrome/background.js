// Update icon based on state
function updateIcon(enabled) {
    const path = enabled ? "icons/loop-" : "icons/loop-disabled-";
    chrome.action.setIcon({
      path: {
        "16": path + "16.png",
        "32": path + "32.png"
      }
    });
  }
  
  // Initialize icon on startup
  chrome.storage.local.get('loopEnabled', (result) => {
    const enabled = result.loopEnabled !== false; // Default to true if not set
    updateIcon(enabled);
  });
  
  // Handle toolbar button click
  chrome.action.onClicked.addListener(async (tab) => {
    // Get current state
    const result = await chrome.storage.local.get('loopEnabled');
    const newState = !(result.loopEnabled !== false); // Default to true if not set
    
    // Save new state
    await chrome.storage.local.set({ loopEnabled: newState });
    
    // Update icon to reflect state
    updateIcon(newState);
    
    // Send message to content script to update videos
    try {
      await chrome.tabs.sendMessage(tab.id, { 
        loopEnabled: newState,
        forceRefresh: true
      });
    } catch (e) {
      console.log("Couldn't send message to tab", e);
    }
  });