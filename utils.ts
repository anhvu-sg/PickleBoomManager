export const generateAvatar = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Pickleball palette: Lime greens and sporty hues
  const hues = [70, 80, 90, 100, 110, 120, 130];
  const hue = hues[Math.abs(hash) % hues.length];
  const bgColor = `hsl(${hue}, 85%, 90%)`;
  const patternColor = `hsl(${hue}, 85%, 75%)`;
  const textColor = `hsl(${hue}, 90%, 25%)`;
  
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const svg = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="holes-${hash}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="3" fill="${patternColor}" />
        </pattern>
      </defs>
      <circle cx="50" cy="50" r="50" fill="${bgColor}" />
      <circle cx="50" cy="50" r="50" fill="url(#holes-${hash})" />
      <circle cx="50" cy="50" r="45" fill="none" stroke="${textColor}" stroke-width="2" opacity="0.2" />
      <text x="50" y="50" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="800" font-size="32" fill="${textColor}" text-anchor="middle" dy=".35em">${initials}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};