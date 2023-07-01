declare namespace whale {
  namespace sidebarAction {
    function setBadgeText(details: { text: string }): void
    function setBadgeBackgroundColor(details: { color: string | [number, number, number, number] }): void
  }
}

const setDoneBadge = () => {
  if (typeof whale === 'undefined' || typeof whale.sidebarAction === 'undefined') {
    return
  }

  whale.sidebarAction.setBadgeText({
    text: 'Done!',
  })

  whale.sidebarAction.setBadgeBackgroundColor({
    color: `#ff0000`,
  })
}

export const ExtensionUtils = {
  setDoneBadge,
}
