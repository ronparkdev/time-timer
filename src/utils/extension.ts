declare namespace whale {
  namespace sidebarAction {
    function setBadgeText(details: { text: string }): void
    function setBadgeBackgroundColor(details: { color: string | [number, number, number, number] }): void
  }
}

const canUseWhaleSidebar = () => typeof whale !== 'undefined' && typeof whale.sidebarAction !== 'undefined'

const setDoneBadge = () => {
  if (!canUseWhaleSidebar()) {
    return
  }

  whale.sidebarAction.setBadgeText({
    text: '🎉',
  })

  whale.sidebarAction.setBadgeBackgroundColor({
    color: `#ff0000`,
  })
}

const unsetDoneBadge = () => {
  if (!canUseWhaleSidebar()) {
    return
  }

  whale.sidebarAction.setBadgeText({
    text: '',
  })
}

export const ExtensionUtils = {
  setDoneBadge,
  unsetDoneBadge,
}
