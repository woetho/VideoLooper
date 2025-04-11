// Configuration
const CHECK_INTERVAL = 1000; // Check every 3 seconds

// State tracking
let lastVideoCount = 0;
let currentLoopState = true;

// Function to set loop on all videos
function setVideoLoops(shouldLoop, forceUpdate = false) {
  const vids = document.getElementsByTagName('video');
  
  // Only proceed if video count changed, state changed, or forced update
  if (vids.length !== lastVideoCount || currentLoopState !== shouldLoop || forceUpdate) {
    console.log(`Updating ${vids.length} video(s) to loop=${shouldLoop}`);
    lastVideoCount = vids.length;
    currentLoopState = shouldLoop;
    
    for (let i = 0; i < vids.length; i++) {
      if (vids[i].loop !== shouldLoop) {
        vids[i].loop = shouldLoop;
      }
    }
  }
}

// Main function to initialize looping
async function initializeLooping() {
  // Get stored preference (default to true)
  const result = await chrome.storage.local.get(['loopEnabled']);
  currentLoopState = result.loopEnabled !== false;
  
  // Apply immediately (force initial update)
  setVideoLoops(currentLoopState, true);
  
  // Set up periodic checking
  setInterval(() => {
    setVideoLoops(currentLoopState);
  }, CHECK_INTERVAL);
  
  // Watch for dynamically added videos
  const observer = new MutationObserver(mutations => {
    // Only process if mutations contain video elements
    const hasVideoChanges = mutations.some(mutation => 
      Array.from(mutation.addedNodes).some(node => 
        node.nodeName === 'VIDEO' || (node.querySelector && node.querySelector('video'))
      )
    );
    
    if (hasVideoChanges) {
      setVideoLoops(currentLoopState);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
}

// Listen for toggle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.hasOwnProperty('loopEnabled')) {
    // Force update when toggled via button
    setVideoLoops(message.loopEnabled, true);
  }
});

// Start the looping system
initializeLooping();