const layoutParts = ['login.html', 'app-shell.html', 'overlays.html'];

export async function mountLayout() {
  const root = document.querySelector('#app-root');
  try {
    const parts = await Promise.all(layoutParts.map(async part => {
      const response = await fetch(new URL(`../components/${part}`, import.meta.url));
      if (!response.ok) throw new Error(`Unable to load ${part}: ${response.status}`);
      return response.text();
    }));
    root.innerHTML = parts.join('\n');
  } catch (error) {
    root.innerHTML = '<p role="alert">FitZone could not load its page components. Check that the project is served from a local web server, then reload.</p>';
    throw error;
  }
}
