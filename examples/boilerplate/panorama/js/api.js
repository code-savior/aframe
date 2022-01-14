async function fetchProjectInfo (projectId) {
  const url = `${API_7NIU}/${projectId}/index.json`
  const response = await fetch(url)
    .then(response => response.json())
    .catch((error) => {
      console.error('fetchProjectInfo error!', error)
      return {}
    })
  return response
}