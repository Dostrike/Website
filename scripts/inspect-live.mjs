const origin = process.argv[2] || 'https://dostrike.com';
for (const route of ['/', '/blog/minimax-algorithm-tic-tac-toe/', '/tictactoe-setup', '/ads.txt', '/robots.txt', '/not-a-real-dostrike-page']) {
  try {
    const response = await fetch(origin + route, { signal: AbortSignal.timeout(30000) });
    const html = await response.text();
    console.log(JSON.stringify({ route, status: response.status, server: response.headers.get('server'),
      canonical: html.match(/<link[^>]*rel="canonical"[^>]*>/g),
      adsenseVerification: html.includes('name="google-adsense-account"'),
      text: route.endsWith('.txt') ? html.slice(0, 200) : undefined,
      bytes: html.length }));
  } catch (error) { console.log(route, error.message); }
}
