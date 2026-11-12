
const WIN_OK_FLAG = -69;
let winCreatedByUndocking = WIN_OK_FLAG;

chrome.windows.onFocusChanged.addListener(function(winId) {
	
	if (winId == chrome.windows.WINDOW_ID_NONE) {
		return;
	}
	
	// a tab was detached then attached to this window
	// do not process. Problem if you do.
	if (winCreatedByUndocking == winId) {
		return;
	}
	
	// some other window, later we can process the newly created window.
	winCreatedByUndocking = WIN_OK_FLAG;
	
	chrome.windows.get(winId, function(win) {
		
		if (win.type != chrome.windows.WindowType.NORMAL) {
			return;
		}	
		checkIfTabNeedsToBeCreated(win.id);
	});
});
  
chrome.tabs.onAttached.addListener(function(tabId, attachInfo) { 

	winCreatedByUndocking = attachInfo.newWindowId;
});
 
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) { 
	
	// ignore if the main window is closed.
	if (removeInfo.isWindowClosing) {
		return;
	}	
	checkIfTabNeedsToBeCreated(removeInfo.windowId);
});
  
function checkIfTabNeedsToBeCreated(winId) {
	
	let qInfo = {
		windowId : winId
	};
	
	chrome.tabs.query(qInfo, function(rslt) {
		
		if (rslt.length == 1) {
			
			let tabWinId = rslt[0].windowId;
			
			// there is only 1 tab on this window
			if (rslt[0].pinned) {
				// the tab is pinned, create a normal tab
				//chrome.tabs.create({}, function(tab) {});
				createTab(tabWinId);
			}
			else {
				// create pinned tab
				// so it'll look nice, nicely arranged @ the end.
				createPinnedTab(tabWinId);
			}
		}
	});		
}

function createTab(winId) {
	
	let tab = {
		windowId : winId
	};	
	chrome.tabs.create(tab, function(tab) {});	
}

function createPinnedTab(winId) {
	
	let tab = {
		pinned : true,
		index : 0,
		active : false,
		windowId : winId
	};	
	chrome.tabs.create(tab, function(tab) {});	
}
