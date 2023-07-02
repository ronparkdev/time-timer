declare namespace whale {
  namespace sidebarAction {
    function setBadgeText(details: { text: string }): void
    function setBadgeBackgroundColor(details: { color: string | [number, number, number, number] }): void
  }
}

const canUseWhaleSidebar = () => typeof whale !== 'undefined' && typeof whale.sidebarAction !== 'undefined'

const pushNotification = ({ title, message, iconUrl }: { title: string; message: string; iconUrl: string }) => {
  const opt = {
    type: 'basic',
    title,
    message,
    iconUrl,
  } as const

  chrome.notifications.create('timerFinished', opt, function (id) {
    console.log('Last notification ID:', id)
  })
}

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
  pushNotification,
  setBadgeText,
  setBadgeColor,
}
