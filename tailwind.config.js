/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapeamento correto em grupo de cores (rpg.bg, rpg.panel, rpg.card, etc.)
        rpg: {
          bg: '#121214',       // Fundo ultra escuro do Obsidian
          panel: '#1a1a1e',    // Painel lateral de navegação
          card: '#202024',     // Cards de NPCs, Monstros e notas
          accent: '#8257e5',   // Roxo mágico de destaque do Master App
          text: '#e1e1e6',     // Texto principal claro e confortável
          muted: '#8d8d99',    // Texto silenciado/secundário
        }
      }
    },
  },
  plugins: [],
}