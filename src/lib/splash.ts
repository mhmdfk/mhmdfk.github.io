export function isSplashActive() {
  return (
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('splash-pending')
  )
}
