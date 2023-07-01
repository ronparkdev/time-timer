declare namespace whale {
  namespace sidebarAction {
    function setBadgeText(details: { text: string }): void
    function setBadgeBackgroundColor(details: { color: string | [number, number, number, number] }): void
  }
}

const canUseWhaleSidebar = () => typeof whale !== 'undefined' && typeof whale.sidebarAction !== 'undefined'

const setBadgeText = (text: string) => {
  if (!canUseWhaleSidebar()) {
    return
  }

  whale.sidebarAction.setBadgeText({
    text,
  })
}

const setBadgeColor = (color: string) => {
  if (!canUseWhaleSidebar()) {
    return
  }

  whale.sidebarAction.setBadgeBackgroundColor({
    color,
  })
}

export const ExtensionUtils = {
  setBadgeText,
  setBadgeColor,
}
