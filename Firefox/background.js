browser.browserAction.onClicked.addListener(async (tab) => {
    // Get current state
    const result = await browser.storage.local.get('loopEnabled');
    const newState = !(result.loopEnabled !== false); // Default to true if not set
    
    // Save new state
    await browser.storage.local.set({ loopEnabled: newState });
    
    // Update icon to reflect state
    updateIcon(newState);
    
    // Send message to content script to update videos (with force refresh)
    try {
      await browser.tabs.sendMessage(tab.id, { 
        loopEnabled: newState,
        forceRefresh: true
      });
    } catch (e) {
      // Tab might have changed/unloaded - we'll catch it on next activation
      console.log("Couldn't send message to tab", e);
    }
  });
  
  // Update icon based on state
  function updateIcon(enabled) {
    const path = enabled ? "icons/loop-" : "icons/loop-disabled-";
    browser.browserAction.setIcon({
      path: {
        16: path + "16.png",
        32: path + "32.png"
      }
    });
  }
  
  // Initialize icon on startup
  browser.storage.local.get('loopEnabled').then(result => {
    const enabled = result.loopEnabled !== false; // Default to true if not set
    updateIcon(enabled);
  });