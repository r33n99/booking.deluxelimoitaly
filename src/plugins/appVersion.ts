export default () => {
  const version = import.meta.env.VITE_PROJECT_VERSION || 'unknown'

  console.log(
    `%cApp Version: ${version}`,
    'color: #2196F3; font-size: 14px; font-weight: bold; background: #E3F2FD; padding: 4px 8px; border-radius: 4px;'
  )
}
