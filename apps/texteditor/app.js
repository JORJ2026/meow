const logo = document.querySelector('#logo');
const word = document.querySelector('#word');
const nameInput = document.querySelector('#nameInput');
const subtitle = document.querySelector('#subtitle');
const subtitleInput = document.querySelector('#subtitleInput');
const subtitleColor = document.querySelector('#subtitleColor');
const swatches = document.querySelector('#swatches');
const introAudio = document.querySelector('#logoAudio');
const soundToggle = document.querySelector('#soundToggle');
let soundEnabled = true;
introAudio.volume = 0.72;
const defaultColors = ['#34bb68', '#f34049', '#aa6bea', '#9653d5', '#ff9d3d', '#4b9eff'];
let colors = [...defaultColors];
let exportTitle = 'Bardel';
let exportSubtitle = 'Entertainment';
let exportSubtitleColor = '#ffffff';
let motionIndex = 0;
let motionSelected = false;
const letterStyleSelect = document.querySelector('#letterStyle');
const subtitleStyleSelect = document.querySelector('#subtitleStyle');
const logoSizeInput = document.querySelector('#logoSize');
const subtitleSizeInput = document.querySelector('#subtitleSize');
const logoSizeValue = document.querySelector('#logoSizeValue');
const subtitleSizeValue = document.querySelector('#subtitleSizeValue');
const configurationSelect = document.querySelector('#logoConfiguration');
const configurationDescription = document.querySelector('#configurationDescription');
const monoPaletteSelect = document.querySelector('#monoPalette');
const scrollModeToggle = document.querySelector('#scrollModeToggle');
const scrollEditor = document.querySelector('#scrollEditor');
const scrollInput = document.querySelector('#scrollInput');
const scrollText = document.querySelector('#scrollText');
const scrollStage = document.querySelector('#scrollStage');
const scrollActions = document.querySelector('#scrollActions');
const scrollExportStatus = document.querySelector('#scrollExportStatus');
const scrollThemeSelect = document.querySelector('#scrollTheme');
const scrollThemeSwatch = document.querySelector('#scrollThemeSwatch');
const visualEnhancementSelect = document.querySelector('#visualEnhancement');
const visualDescription = document.querySelector('#visualDescription');
const sidebarToggle = document.querySelector('#sidebarToggle');
const controlSidebar = document.querySelector('#controlSidebar');
const sidebarScrim = document.querySelector('#sidebarScrim');
function setSidebarOpen(open) {
  document.querySelector('.maker').classList.toggle('sidebar-open', open);
  controlSidebar.setAttribute('aria-hidden', String(!open));
  controlSidebar.inert = !open;
  sidebarToggle.setAttribute('aria-expanded', String(open));
  sidebarToggle.setAttribute('aria-label', open ? 'Close controls' : 'Open controls');
  if (!open) sidebarToggle.focus();
}
sidebarToggle.addEventListener('click', () => setSidebarOpen(!document.querySelector('.maker').classList.contains('sidebar-open')));
sidebarScrim.addEventListener('click', () => setSidebarOpen(false));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setSidebarOpen(false); });
const stage = document.querySelector('.stage');
const glyphPackInput = document.querySelector('#glyphPack');
const glyphPackStatus = document.querySelector('#glyphPackStatus');
const sequenceDisplay = document.querySelector('#sequenceDisplay');
const sequenceEntry = document.querySelector('#sequenceEntry');
const sequenceList = document.querySelector('#sequenceList');
const sequenceStatus = document.querySelector('#sequenceStatus');
const importedGlyphs = new Map();
const sequenceItems = [];
let sequenceAnimation = null;
let sequenceTimer = null;
let sequenceCursor = 0;
let sequenceRunning = false;
let activeVisualEnhancement = null;
const letterStyles = [
  { family: '"Bardel", Georgia, serif', weight: 400, tracking: -0.045 },
  { family: 'Georgia, "Times New Roman", serif', weight: 700, tracking: -0.035 },
  { name: 'Classic Roman', family: '"Times New Roman", Times, serif', weight: 400, tracking: -0.025 },
  { family: 'Rockwell, "Courier New", serif', weight: 700, tracking: -0.045 },
  { family: 'Arial, Helvetica, sans-serif', weight: 700, tracking: -0.035 },
  { family: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif', weight: 900, tracking: -0.035 },
  { family: '"Arial Rounded MT Bold", "Trebuchet MS", sans-serif', weight: 700, tracking: -0.025 },
  { family: '"Courier New", monospace', weight: 700, tracking: -0.06 },
  { family: '"Trebuchet MS", Arial, sans-serif', weight: 700, tracking: -0.045 },
  { family: 'Palatino, "Palatino Linotype", Georgia, serif', weight: 700, italic: true, tracking: -0.04 },
  { family: '"Brush Script MT", "Segoe Script", cursive', weight: 700, tracking: -0.01 }
];
const additionalFonts = [
  ['Inter','sans-serif'], ['Montserrat','sans-serif'], ['Playfair Display','serif'], ['Oswald','sans-serif'], ['Lora','serif'],
  ['Merriweather','serif'], ['Roboto Slab','serif'], ['Bebas Neue','sans-serif'], ['Poppins','sans-serif'], ['Raleway','sans-serif'],
  ['Nunito','sans-serif'], ['Work Sans','sans-serif'], ['DM Sans','sans-serif'], ['Space Grotesk','sans-serif'], ['Archivo Black','sans-serif'],
  ['Barlow Condensed','sans-serif'], ['Abril Fatface','serif'], ['Cinzel','serif'], ['Cormorant Garamond','serif'], ['Josefin Sans','sans-serif'],
  ['Libre Baskerville','serif'], ['Anton','sans-serif'], ['Sora','sans-serif'], ['Rubik','sans-serif'], ['Fira Sans','sans-serif'],
  ['Fira Mono','monospace'], ['IBM Plex Sans','sans-serif'], ['IBM Plex Serif','serif'], ['Bungee','sans-serif'], ['Fredoka','sans-serif'],
  ['Lobster','cursive'], ['Permanent Marker','cursive'], ['Pacifico','cursive'], ['Caveat','cursive'], ['Comfortaa','sans-serif'],
  ['Quicksand','sans-serif'], ['Exo 2','sans-serif'], ['Orbitron','sans-serif'], ['Rajdhani','sans-serif'], ['Teko','sans-serif'],
  ['Alfa Slab One','serif'], ['Zilla Slab','serif'], ['Bitter','serif'], ['Crimson Text','serif'], ['Manrope','sans-serif'],
  ['Karla','sans-serif'], ['Archivo','sans-serif'], ['Space Mono','monospace'], ['Urbanist','sans-serif'], ['Bodoni Moda','serif']
];
additionalFonts.forEach(([name, fallback], index) => {
  letterStyles.push({
    name,
    google: name,
    family: '"' + name + '", ' + fallback,
    weight: [400, 500, 600, 700, 800, 900][index % 6],
    italic: [4, 9, 14, 19, 24, 29, 34, 39, 44, 49].includes(index),
    tracking: ((index % 7) - 3) * 0.012 - 0.01
  });
});
letterStyles.push({ name: 'Imported Handwriting', family: 'Arial, sans-serif', weight: 400, tracking: 0.02 });
const importedHandwritingStyleIndex = letterStyles.length - 1;
const fontLoads = new Map();
function loadLetterFont(style) {
  if (!style.google) return Promise.resolve();
  if (fontLoads.has(style.google)) return fontLoads.get(style.google);
  const load = new Promise(resolve => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(style.google).replace(/%20/g, '+') + '&display=swap';
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.append(link);
  });
  fontLoads.set(style.google, load);
  return load;
}
function populateLetterStyleMenus() {
  [letterStyleSelect, subtitleStyleSelect].forEach((select, menuIndex) => {
    select.replaceChildren();
    letterStyles.forEach((style, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = style.name || ['Bardel Original','Serif Book','Classic Roman','Slab Rock','Modern Sans','Heavy Display','Rounded','Mono Type','Humanist','Editorial Italic','Handwritten'][index];
      select.append(option);
    });
    select.value = menuIndex === 0 ? '0' : '2';
  });
}
const paletteNames = [
  'Silver Spectrum','Carbon Contrast','Graphite Studio','Slate Signature','Steel Finish',
  'Soft Smoke','Pewter Classic','Ash & Ivory','Chalk Mark','Onyx Edge',
  'Warm Gray Paper','Cool Gray Grid','Mist Gradient','High-Key Pearl','Deep Contrast',
  'Fog & Flint','Midnight Silver','Platinum Finish','Classic Black & White','Spotlight Mono'
];
const paletteShades = [
  [248,224,198,170,140,232],[255,226,194,158,118,242],[242,216,186,154,120,230],[238,214,184,150,116,228],[246,220,188,154,120,234],
  [250,228,202,174,144,238],[242,218,190,160,126,230],[248,222,192,160,124,236],[255,236,214,186,150,244],[246,214,178,140,104,234],
  [247,220,190,158,124,234],[246,220,192,162,130,232],[250,234,216,196,172,244],[255,242,228,208,184,248],[255,222,180,136,96,242],
  [250,232,210,186,160,240],[246,222,194,158,120,232],[252,230,206,176,144,242],[255,224,184,136,88,246],[255,240,220,192,156,250]
];
const paletteHex = value => '#' + value.toString(16).padStart(2, '0').repeat(3);
const palettes = paletteNames.map((name, index) => ({
  name,
  colors: paletteShades[index].map(paletteHex),
  subtitle: paletteHex(paletteShades[index][0])
}));
const visualColorways = [
  { name: 'Arctic Glass', accent: '#8fe1ff', glow: '#174a72', frame: '#35647a', background: 'radial-gradient(ellipse at 50% 46%, #203849 0%, #151e28 52%, #0c1118 100%)' },
  { name: 'Gilded Night', accent: '#f4c76a', glow: '#79501b', frame: '#806332', background: 'radial-gradient(ellipse at 50% 46%, #382b1a 0%, #1d1812 52%, #100d09 100%)' },
  { name: 'Rose Electric', accent: '#ff91bd', glow: '#762d58', frame: '#75445b', background: 'radial-gradient(ellipse at 50% 46%, #38212e 0%, #20151d 52%, #100b10 100%)' },
  { name: 'Verdant Studio', accent: '#83e1a0', glow: '#285c3d', frame: '#426950', background: 'radial-gradient(ellipse at 50% 46%, #20352b 0%, #152019 52%, #090e0b 100%)' },
  { name: 'Ultraviolet', accent: '#b9a1ff', glow: '#49357d', frame: '#594c7d', background: 'radial-gradient(ellipse at 50% 46%, #2d2543 0%, #1b1728 52%, #0c0a12 100%)' }
];
const visualModes = [
  { name: 'Soft Lift', description: 'A gentle lifted shadow adds separation without changing the letterforms.', blur: 10, dx: 0, dy: 7 },
  { name: 'Halo Bloom', description: 'A soft colored bloom surrounds the mark for a luminous finish.', blur: 17, dx: 0, dy: 0 },
  { name: 'Neon Rim', description: 'A bright tight edge and wider halo give the logo a vivid night-sign glow.', blur: 12, dx: 0, dy: 0, neon: true },
  { name: 'Fine Outline', description: 'A fine accent outline sharpens every letter against the preview backdrop.', blur: 0, dx: 0, dy: 0, outline: 1 },
  { name: 'Double Edge', description: 'A crisp outline and offset color shadow create a layered dimensional edge.', blur: 5, dx: 3, dy: 3, outline: 1 },
  { name: 'Cast Shadow', description: 'A directional long shadow gives the wordmark weight and depth.', blur: 2, dx: 8, dy: 9 },
  { name: 'Beveled Light', description: 'A small highlight and dark falloff suggest a clean pressed surface.', blur: 3, dx: 1, dy: 4, bevel: true },
  { name: 'Spotlit', description: 'A broad, restrained aura focuses attention on the center of the mark.', blur: 24, dx: 0, dy: 0 },
  { name: 'Chromatic Echo', description: 'Offset colored echoes add a modern layered print treatment.', blur: 4, dx: 4, dy: 2, echo: true },
  { name: 'Satin Rim', description: 'A subtle rim glow and soft falloff give the lettering a polished finish.', blur: 8, dx: -1, dy: 3, outline: 0.6 }
];
const visualEnhancements = visualColorways.flatMap((colorway, colorIndex) => visualModes.map((mode, modeIndex) => ({
  name: colorway.name + ' · ' + mode.name,
  description: mode.description + ' ' + colorway.name + ' supplies the coordinated accent, backdrop, and frame.',
  colorway,
  mode,
  index: colorIndex * visualModes.length + modeIndex
})));
function applyVisualEnhancement(index) {
  const preset = visualEnhancements[index];
  if (!preset) {
    activeVisualEnhancement = null;
    stage.style.removeProperty('--visual-background');
    stage.style.removeProperty('--visual-frame');
    stage.style.removeProperty('--visual-stage-shadow');
    stage.style.removeProperty('--visual-accent');
    logo.style.filter = '';
    logo.classList.remove('visual-outline');
    visualDescription.textContent = 'Original finish';
    return;
  }
  activeVisualEnhancement = preset;
  stage.style.setProperty('--visual-background', preset.colorway.background);
  stage.style.setProperty('--visual-frame', preset.colorway.frame);
  stage.style.setProperty('--visual-stage-shadow', '0 20px 58px #0007, inset 0 1px 0 #ffffff10, 0 0 26px ' + preset.colorway.glow + '55');
  stage.style.setProperty('--visual-accent', preset.colorway.accent);
  logo.style.setProperty('--visual-outline-width', preset.mode.outline + 'px');
  logo.classList.toggle('visual-outline', Boolean(preset.mode.outline));
  const color = preset.colorway.accent;
  const glow = preset.colorway.glow;
  let filter = 'drop-shadow(' + preset.mode.dx + 'px ' + preset.mode.dy + 'px ' + preset.mode.blur + 'px ' + glow + ')';
  if (preset.mode.neon) filter = 'drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 ' + preset.mode.blur + 'px ' + color + ') drop-shadow(0 0 ' + (preset.mode.blur * 2) + 'px ' + glow + ')';
  if (preset.mode.bevel) filter = 'drop-shadow(0 -1px 0 #ffffff88) drop-shadow(0 4px 3px #0009)';
  if (preset.mode.echo) filter = 'drop-shadow(' + preset.mode.dx + 'px 0 0 ' + color + ') drop-shadow(-' + preset.mode.dx + 'px 2px 0 ' + glow + ') drop-shadow(0 5px 8px #0008)';
  logo.style.filter = filter;
  visualDescription.textContent = preset.description;
}
visualEnhancements.forEach((preset, index) => {
  const option = document.createElement('option');
  option.value = String(index + 1);
  option.textContent = String(index + 1).padStart(2, '0') + ' · ' + preset.name;
  option.title = preset.description;
  visualEnhancementSelect.append(option);
});
visualEnhancementSelect.addEventListener('change', () => {
  if (visualEnhancementSelect.value === '') applyVisualEnhancement(-1);
  else applyVisualEnhancement(Number(visualEnhancementSelect.value) - 1);
});

const presetNames = [
  'Nordic Form','Civic Standard','Quiet Luxury','Atlas Capital','Mono Atelier','Meridian Health','Cedar House','Vertex Systems','Northstar Studio','Fieldwork Goods',
  'Maison Moderne','Clearwater Labs','Foundry Works','Aperture Media','Evergreen Organics','Summit Advisory','Urban Ledger','Forma Architecture','Stillwater Spa','Keystone Legal',
  'Brightline Education','Common Ground','Blackwing Audio','Stone & Thread','Prime Motion','Pioneer Robotics','Sunday Market','The Modernist','Harbor & Co.','True North Finance',
  'Paper Trail Press','Silverline Travel','Oak & Iron','Open Circuit','Blue Hour Cinema','Morrow Wellness','Westward Supply','Kindred Coffee','Monarch Atelier','Metric Consulting',
  'Quiet Current','Beacon Property','Daily Practice','Crown & Vale','Studio Hush','Plainspoken','Lumen House','Archive Objects','New Standard','Forma Italic'
];
const presetNotes = [
  'A calm Nordic wordmark with generous air, subtle contrast and a clear supporting line.',
  'A dependable civic identity built for legibility, trust and everyday applications.',
  'A restrained premium signature with editorial contrast and polished proportions.',
  'A confident finance mark balancing an assured headline with measured supporting type.',
  'A precise monochrome identity that feels crafted, architectural and contemporary.',
  'A reassuring health brand with approachable forms and crisp information hierarchy.',
  'An artisanal natural-goods mark, warm in character yet disciplined in execution.',
  'A sharp technology wordmark with a compact, modern profile and clean hierarchy.',
  'An expansive creative identity with an optimistic headline and composed details.',
  'A tactile retail signature designed to feel honest, useful and quietly distinctive.',
  'A refined fashion-house treatment with elegant letterforms and restrained spacing.',
  'A fresh science identity balancing clarity with a little human warmth.',
  'A sturdy maker’s mark with engineered structure and a confident baseline.',
  'A film-and-media identity with expressive display lettering and clean credits.',
  'A considered organic brand with natural character and understated supporting type.',
  'A composed advisory identity designed to signal expertise without visual noise.',
  'A contemporary business mark with readable geometry and a confident rhythm.',
  'A structural architecture identity emphasizing proportion, clarity and permanence.',
  'A gentle wellness signature with fluid character and quiet sophistication.',
  'A formal legal identity with established authority and excellent small-size clarity.',
  'An energetic learning brand with friendly forms and an optimistic, clear voice.',
  'A community-minded identity with open character and balanced professional polish.',
  'A bold audio mark with punchy display lettering and a tidy secondary line.',
  'A thoughtful craft label balancing material warmth with editorial restraint.',
  'A kinetic sports identity with strong silhouettes and an unmistakable forward feel.',
  'A future-facing robotics mark with technical precision and modern contrast.',
  'A welcoming food-market identity with fresh personality and easy readability.',
  'A gallery-minded wordmark pairing cultured typography with a minimal signature.',
  'A coastal hospitality identity with calm character and an elegant supporting voice.',
  'A dependable finance mark with assertive lettering and careful tonal hierarchy.',
  'A literary press identity with bookish detail and clean, memorable structure.',
  'A premium travel signature designed to feel composed, worldly and timeless.',
  'A durable maker identity with weight, craft and a clear industrial edge.',
  'A clean digital product mark that stays crisp across screens and interfaces.',
  'A cinematic identity with expressive scale and refined supporting typography.',
  'A contemporary self-care mark built around calm, clarity and human warmth.',
  'A practical outdoor brand with sturdy character and an assured visual voice.',
  'A friendly coffee identity that feels familiar, crafted and professionally finished.',
  'A boutique design signature with elegant contrast and confident presentation.',
  'A precise consulting identity that feels rigorous, clear and quietly modern.',
  'A fluid, restful wellness mark with a serene rhythm and subtle editorial tone.',
  'A polished property identity designed to convey stability and considered value.',
  'A practical health brand balancing daily approachability with professional clarity.',
  'A classic luxury signature with distinctive display character and refined detail.',
  'A minimal creative studio mark with soft elegance and disciplined negative space.',
  'A direct, modern identity that favors confidence, clarity and lasting utility.',
  'A luminous hospitality mark with a refined headline and soft tonal contrast.',
  'A collectible design label pairing archival character with contemporary restraint.',
  'A clear, adaptable corporate identity ready for print, digital and signage.',
  'A graceful italic signature with editorial poise and a confident professional finish.'
];
const presetSubtitles = [2,1,2,4,7,8,2,11,13,4,13,2,3,1,15,2,4,28,9,31,40,8,17,29,14,24,21,38,20,16,53,29,3,24,13,15,14,40,60,2,44,13,21,28,30,56,19,38,22,9];
const professionalConfigurations = presetNames.map((name, index) => ({
  name,
  note: presetNotes[index],
  logoStyle: index + 11,
  subtitleStyle: presetSubtitles[index],
  palette: index % palettes.length,
  logoSize: [168,182,196,176,190][index % 5],
  subtitleSize: [28,32,36,30,34][index % 5]
}));
let selectedLetterStyle = 0;
let selectedSubtitleStyle = 2;
function logoGlyphWidth(char, size, context, styleIndex = selectedLetterStyle) {
  const entry = styleIndex === importedHandwritingStyleIndex ? importedGlyphs.get(char) : null;
  if (entry && entry.image.naturalHeight) return size * Math.min(1.6, entry.image.naturalWidth / entry.image.naturalHeight);
  return context.measureText(char).width;
}

function updateLogo() {
  const title = nameInput.value || '';
  exportTitle = title;
  selectedLetterStyle = Number(letterStyleSelect.value) || 0;
  const type = letterStyles[selectedLetterStyle];
  word.style.fontFamily = type.family;
  word.style.fontWeight = String(type.weight);
  word.style.fontStyle = type.italic ? 'italic' : 'normal';
  word.style.letterSpacing = type.tracking + 'em';
  word.classList.toggle('original-style', selectedLetterStyle === 0);
  const requestedLogoSize = Number(logoSizeInput.value);
  logoSizeValue.value = String(requestedLogoSize);
  logoSizeValue.textContent = String(requestedLogoSize);
  selectedSubtitleStyle = Number(subtitleStyleSelect.value) || 0;
  const subtitleType = letterStyles[selectedSubtitleStyle];
  subtitle.style.fontFamily = subtitleType.family;
  subtitle.style.fontWeight = String(subtitleType.weight);
  subtitle.style.fontStyle = subtitleType.italic ? 'italic' : 'normal';
  word.replaceChildren();
  colors = Array.from({ length: title.length }, (_, i) => colors[i] || defaultColors[i % defaultColors.length]);
  const measure = document.createElement('canvas').getContext('2d');
  measure.font = (type.italic ? 'italic ' : '') + type.weight + ' 182px ' + type.family;
  const titleWidth = [...title].reduce((sum, char) => sum + logoGlyphWidth(char, 182, measure), 0) + Math.max(0, [...title].length - 1) * 182 * type.tracking;
  const available = Math.max(120, document.querySelector('.stage').clientWidth - 100);
  const fontSize = Math.min(requestedLogoSize, titleWidth > 0 ? 182 * available / titleWidth : requestedLogoSize);
  word.style.setProperty('--logo-font-size', fontSize + 'px');
  const subtitleMeasure = document.createElement('canvas').getContext('2d');
  subtitleMeasure.font = (subtitleType.italic ? 'italic ' : '') + subtitleType.weight + ' 38px ' + subtitleType.family;
  const requestedSubtitleSize = Number(subtitleSizeInput.value);
  subtitleSizeValue.value = String(requestedSubtitleSize);
  subtitleSizeValue.textContent = String(requestedSubtitleSize);
  const subtitleWidth = subtitleMeasure.measureText(exportSubtitle.toUpperCase()).width + Math.max(0, exportSubtitle.length - 1) * 38 * 0.24;
  const subtitleSize = Math.min(requestedSubtitleSize, subtitleWidth > 0 ? 38 * available / subtitleWidth : requestedSubtitleSize);
  subtitle.style.setProperty('--subtitle-size', subtitleSize + 'px');
  [...title].forEach((char, index) => {
    const glyph = document.createElement('span');
    glyph.className = 'letter anim-' + (index % 6);
    if (selectedLetterStyle === 0 && title === 'Bardel' && index === 2) glyph.classList.add('outlined');
    if (selectedLetterStyle === 0 && title === 'Bardel' && index === 5) glyph.classList.add('striped');
    glyph.style.setProperty('--color', colors[index]);
    const handwrittenGlyph = selectedLetterStyle === importedHandwritingStyleIndex ? importedGlyphs.get(char) : null;
    if (handwrittenGlyph) {
      glyph.classList.add('custom-glyph');
      const image = document.createElement('img');
      image.src = handwrittenGlyph.url;
      image.alt = char;
      image.draggable = false;
      glyph.append(image);
    } else {
      glyph.textContent = char;
    }
    word.append(glyph);
  });
  word.setAttribute('aria-label', title || 'Logo preview');
  renderSwatches();
}

function populateDesignTools() {
  const palettePlaceholder = document.createElement('option');
  palettePlaceholder.value = '';
  palettePlaceholder.textContent = 'Choose a monochrome palette…';
  monoPaletteSelect.append(palettePlaceholder);
  palettes.forEach((palette, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = palette.name;
    monoPaletteSelect.append(option);
  });
  professionalConfigurations.forEach((config, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = String(index + 1).padStart(2, '0') + ' · ' + config.name;
    configurationSelect.append(option);
  });
}
function applyMonochromePalette(index) {
  const palette = palettes[index];
  if (!palette) return;
  const titleLength = [...nameInput.value].length;
  colors = Array.from({ length: titleLength }, (_, letterIndex) => palette.colors[letterIndex % palette.colors.length]);
  subtitleColor.value = palette.subtitle;
  exportSubtitleColor = palette.subtitle;
  subtitle.style.setProperty('--subtitle-color', palette.subtitle);
  updateLogo();
}
function showConfigurationDescription(index) {
  const config = professionalConfigurations[index];
  if (!config) {
    configurationDescription.textContent = 'Choose a configuration to read its design notes.';
    return;
  }
  const logoName = letterStyles[config.logoStyle].name;
  const subtitleName = letterStyles[config.subtitleStyle].name || ['Bardel Original','Serif Book','Classic Roman','Slab Rock','Modern Sans','Heavy Display','Rounded','Mono Type','Humanist','Editorial Italic','Handwritten'][config.subtitleStyle];
  configurationDescription.textContent = config.note + ' Uses ' + logoName + ' for the logo and ' + subtitleName + ' for the subtitle, in the ' + palettes[config.palette].name + ' grayscale palette. Suggested sizes: ' + config.logoSize + ' px logo, ' + config.subtitleSize + ' px subtitle.';
}
function applyProfessionalConfiguration(index) {
  const config = professionalConfigurations[index];
  if (!config) return;
  letterStyleSelect.value = String(config.logoStyle);
  subtitleStyleSelect.value = String(config.subtitleStyle);
  logoSizeInput.value = String(config.logoSize);
  subtitleSizeInput.value = String(config.subtitleSize);
  monoPaletteSelect.value = String(config.palette);
  selectedLetterStyle = config.logoStyle;
  selectedSubtitleStyle = config.subtitleStyle;
  applyMonochromePalette(config.palette);
  Promise.all([loadLetterFont(letterStyles[config.logoStyle]), loadLetterFont(letterStyles[config.subtitleStyle])]).then(updateLogo);
}
configurationSelect.addEventListener('change', () => {
  if (configurationSelect.value === '') {
    showConfigurationDescription(-1);
    return;
  }
  const selectedIndex = Number(configurationSelect.value);
  showConfigurationDescription(selectedIndex);
  applyProfessionalConfiguration(selectedIndex);
});
monoPaletteSelect.addEventListener('change', () => applyMonochromePalette(Number(monoPaletteSelect.value)));

function renderSwatches() {
  swatches.replaceChildren();
  [...exportTitle].forEach((char, index) => {
    const label = document.createElement('label');
    label.className = 'color-chip';
    label.title = 'Color for ' + char + ' (letter ' + (index + 1) + ')';
    const picker = document.createElement('input');
    picker.type = 'color';
    picker.value = colors[index];
    picker.setAttribute('aria-label', 'Color for letter ' + char + ', position ' + (index + 1));
    picker.addEventListener('input', () => {
      colors[index] = picker.value;
      const glyph = word.children[index];
      if (glyph) glyph.style.setProperty('--color', picker.value);
    });
    label.append(picker);
    swatches.append(label);
  });
}

nameInput.addEventListener('input', updateLogo);
glyphPackInput.addEventListener('change', async () => {
  const files = [...glyphPackInput.files];
  if (!files.length) return;
  glyphPackStatus.textContent = 'Importing glyph images…';
  let imported = 0;
  const aliases = {
    space: ' ', blank: ' ', period: '.', fullstop: '.', comma: ',', exclamation: '!', exclamationmark: '!',
    question: '?', questionmark: '?', apostrophe: "'", singlequote: "'", quote: '"', doublequote: '"',
    colon: ':', semicolon: ';', hyphen: '-', dash: '-', underscore: '_', plus: '+', equals: '=',
    ampersand: '&', at: '@', hash: '#', number: '#', dollar: '$', percent: '%', asterisk: '*',
    slash: '/', backslash: '\\', leftparenthesis: '(', rightparenthesis: ')', leftbracket: '[', rightbracket: ']',
    leftbrace: '{', rightbrace: '}', less: '<', greater: '>', pipe: '|', tilde: '~', caret: '^'
  };
  const charFromFilename = filename => {
    const base = filename.split('/').pop().replace(/\.[^.]+$/, '').trim();
    const normalized = base.toLowerCase().replace(/[ _-]+/g, '');
    return Object.prototype.hasOwnProperty.call(aliases, normalized) ? aliases[normalized] : Array.from(base)[0];
  };
  const saveGlyph = async (char, blob, filename) => {
    if (!char || char === ' ') return;
    const extension = filename.split('.').pop().toLowerCase();
    const inferredType = ({ png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' })[extension];
    if (!blob.type.startsWith('image/') && !inferredType) return;
    if (!blob.type.startsWith('image/')) blob = new Blob([blob], { type: inferredType });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });
    const previous = importedGlyphs.get(char);
    if (previous) URL.revokeObjectURL(previous.url);
    importedGlyphs.set(char, { url, image });
    imported++;
  };
  try {
    for (const file of files) {
      if (/\.zip$/i.test(file.name)) {
        const module = await import('https://esm.sh/jszip@3.10.1');
        const zip = await module.default.loadAsync(file);
        for (const [path, entry] of Object.entries(zip.files)) {
          if (entry.dir || !/\.(png|jpe?g|webp|gif)$/i.test(path)) continue;
          await saveGlyph(charFromFilename(path), await entry.async('blob'), path);
        }
      } else {
        await saveGlyph(charFromFilename(file.name), file, file.name);
      }
    }
    if (imported) {
      letterStyleSelect.value = String(importedHandwritingStyleIndex);
      updateLogo();
      glyphPackStatus.textContent = imported + ' glyph image' + (imported === 1 ? '' : 's') + ' imported. Handwriting style selected.';
    } else {
      glyphPackStatus.textContent = 'No named image glyphs found.';
    }
  } catch (error) {
    console.error('Could not import handwriting pack:', error);
    glyphPackStatus.textContent = 'Could not read that image pack.';
  }
});
logoSizeInput.addEventListener('input', updateLogo);
subtitleSizeInput.addEventListener('input', updateLogo);
letterStyleSelect.addEventListener('change', () => {
  updateLogo();
  loadLetterFont(letterStyles[selectedLetterStyle]).then(() => { if (Number(letterStyleSelect.value) === selectedLetterStyle) updateLogo(); });
});
subtitleStyleSelect.addEventListener('change', () => {
  updateLogo();
  loadLetterFont(letterStyles[selectedSubtitleStyle]).then(() => { if (Number(subtitleStyleSelect.value) === selectedSubtitleStyle) updateLogo(); });
});
function chooseRandomStyle(select, excluded = -1) {
  let index;
  do { index = Math.floor(Math.random() * letterStyles.length); } while (index === excluded);
  select.value = String(index);
  return index;
}
function applyRandomStyles(logoIndex, subtitleIndex = selectedSubtitleStyle) {
  letterStyleSelect.value = String(logoIndex);
  subtitleStyleSelect.value = String(subtitleIndex);
  updateLogo();
  Promise.all([loadLetterFont(letterStyles[logoIndex]), loadLetterFont(letterStyles[subtitleIndex])])
    .then(() => {
      if (Number(letterStyleSelect.value) === logoIndex && Number(subtitleStyleSelect.value) === subtitleIndex) updateLogo();
    });
}
document.querySelector('#randomLetterStyle').addEventListener('click', () => {
  const next = chooseRandomStyle(letterStyleSelect, selectedLetterStyle);
  applyRandomStyles(next, selectedSubtitleStyle);
});
document.querySelector('#randomStylePair').addEventListener('click', () => {
  const logoIndex = chooseRandomStyle(letterStyleSelect, selectedLetterStyle);
  const subtitleIndex = chooseRandomStyle(subtitleStyleSelect, logoIndex);
  applyRandomStyles(logoIndex, subtitleIndex);
});
subtitleInput.addEventListener('input', () => {
  exportSubtitle = subtitleInput.value;
  subtitle.textContent = exportSubtitle;
  updateLogo();
});
subtitleColor.addEventListener('input', () => {
  exportSubtitleColor = subtitleColor.value;
  subtitle.style.setProperty('--subtitle-color', exportSubtitleColor);
});

function randomBrightColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 76 + Math.floor(Math.random() * 18);
  const lightness = 57 + Math.floor(Math.random() * 11);
  const light = lightness / 100;
  const chroma = (1 - Math.abs(2 * light - 1)) * saturation / 100;
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = light - chroma / 2;
  const [r, g, b] = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x] : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x];
  return '#' + [r, g, b].map(value => Math.round((value + m) * 255).toString(16).padStart(2, '0')).join('');
}

document.querySelector('#randomize').addEventListener('click', () => {
  const consonants = 'bcdfghjklmnprstvz';
  const vowels = 'aeiou';
  const length = 4 + Math.floor(Math.random() * 4);
  let randomName = '';
  for (let i = 0; i < length; i++) {
    const alphabet = i % 2 === 0 ? consonants : vowels;
    const char = alphabet[Math.floor(Math.random() * alphabet.length)];
    randomName += i === 0 ? char.toUpperCase() : char;
  }
  nameInput.value = randomName;
  colors = Array.from({ length }, randomBrightColor);
  subtitleColor.value = randomBrightColor();
  exportSubtitleColor = subtitleColor.value;
  subtitle.style.setProperty('--subtitle-color', exportSubtitleColor);
  updateLogo();
});

function playIntroAudio() {
  if (!soundEnabled) return;
  introAudio.currentTime = 0;
  introAudio.play().catch(error => console.warn('Intro audio could not play:', error));
}

function replayIntro(playSound = true) {
  if (motionSelected) {
    playMotion(motionIndex, playSound);
    return;
  }
  logo.classList.remove('custom-motion', 'replay', 'playing');
  void logo.offsetWidth;
  logo.classList.add('replay', 'playing');
  window.setTimeout(() => logo.classList.remove('playing'), 1900);
  if (playSound) playIntroAudio();
}

// Eleven families with twenty parameter variations each make a 220-style entrance library.
function makeMotionFrames(mode, variation, index) {
  const distance = 36 + variation * 5;
  const scale = 0.16 + (variation % 10) * 0.075;
  const angle = 24 + variation * 13;
  const side = index % 2 ? 1 : -1;
  const end = { opacity: 1, transform: 'translate(0,0) rotate(0) scale(1)', filter: 'blur(0px)', clipPath: 'inset(0 0 0 0)' };
  const start = { opacity: 0 };
  if (mode === 0) Object.assign(start, { transform: 'translateY(' + distance + 'px) scale(.72)' });
  if (mode === 1) Object.assign(start, { transform: 'translateX(' + side * distance + 'px) scale(.86)' });
  if (mode === 2) Object.assign(start, { transform: 'translateY(' + (-side * distance) + 'px) rotate(' + side * angle + 'deg)' });
  if (mode === 3) Object.assign(start, { transform: 'scale(' + scale + ')' });
  if (mode === 4) Object.assign(start, { transform: 'rotate(' + side * angle + 'deg) scale(.65)', filter: 'blur(4px)' });
  if (mode === 5) Object.assign(start, { transform: 'perspective(700px) rotateY(' + side * (75 + variation * 4) + 'deg) scale(.8)' });
  if (mode === 6) return [start, { opacity: 1, transform: 'translateY(' + (-distance * .18) + 'px) scale(1.12)', offset: .72 }, end];
  if (mode === 7) Object.assign(start, { transform: 'scale(' + (.75 + scale / 3) + ')', filter: 'blur(' + (8 + variation) + 'px)' });
  if (mode === 8) Object.assign(start, { opacity: 1, transform: 'none', clipPath: index % 2 ? 'inset(0 100% 0 0)' : 'inset(100% 0 0 0)' });
  if (mode === 9) Object.assign(start, { transform: 'rotate(' + side * (120 + variation * 18) + 'deg) scale(' + scale + ')', filter: 'blur(6px)' });
  if (mode === 10) return [
    { opacity: 0, transform: 'translateY(' + distance + 'px) scale(.82)' },
    { opacity: 1, transform: 'translateY(' + (-distance * .58) + 'px) scale(1.04)', offset: .58 },
    { opacity: 1, transform: 'translateY(8px) scale(.98)', offset: .78 },
    { opacity: 1, transform: 'translateY(' + (-distance * .12) + 'px) scale(1.01)', offset: .9 },
    end
  ];
  return [start, end];
}

function playMotion(index, playSound = true) {
  logo.classList.remove('replay', 'playing', 'custom-motion');
  void logo.offsetWidth;
  logo.classList.add('custom-motion');
  const mode = Math.floor(index / 20);
  const variation = index % 20;
  const letters = [...word.children];
  const duration = 620 + (variation % 7) * 95;
  const easing = ['cubic-bezier(.2,.8,.2,1)', 'ease-out', 'cubic-bezier(.16,1,.3,1)'][variation % 3];
  letters.forEach((letter, i) => {
    letter.getAnimations().forEach(animation => animation.cancel());
    letter.animate(makeMotionFrames(mode, variation, i + variation), { duration, delay: Math.min(i * 55, 1400), easing, fill: 'both' });
  });
  subtitle.getAnimations().forEach(animation => animation.cancel());
  subtitle.animate([
    { opacity: 0, transform: 'translateY(14px)', filter: 'blur(5px)' },
    { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
  ], { duration: 620, delay: Math.min(letters.length * 55, 1400) + 80, easing: 'ease-out', fill: 'both' });
  if (playSound) playIntroAudio();
}

document.querySelector('#replay').addEventListener('click', () => replayIntro());
document.querySelector('#motion').addEventListener('click', event => {
  if (motionSelected) motionIndex = (motionIndex + 1) % 220;
  else motionSelected = true;
  event.currentTarget.textContent = 'Motion ' + String(motionIndex + 1).padStart(3, '0') + ' / 220';
  playMotion(motionIndex);
});
soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute('aria-pressed', String(soundEnabled));
  soundToggle.setAttribute('aria-label', soundEnabled ? 'Sound on' : 'Sound off');
  soundToggle.textContent = soundEnabled ? '♫' : '♪';
  soundToggle.classList.toggle('muted', !soundEnabled);
  if (soundEnabled) {
    replayIntro();
  } else {
    introAudio.pause();
    introAudio.currentTime = 0;
  }
});

async function drawLogo(jpeg = false) {
  const type = letterStyles[selectedLetterStyle];
  const subtitleType = letterStyles[selectedSubtitleStyle];
  await Promise.all([loadLetterFont(type), loadLetterFont(subtitleType)]);
  await Promise.all([
    document.fonts.load((type.italic ? 'italic ' : '') + type.weight + ' 180px ' + type.family),
    document.fonts.load((subtitleType.italic ? 'italic ' : '') + subtitleType.weight + ' 48px ' + subtitleType.family)
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 540;
  const ctx = canvas.getContext('2d');
  if (jpeg) {
    ctx.fillStyle = '#101014';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.font = (type.italic ? 'italic ' : '') + type.weight + ' 230px ' + type.family;
  const requestedExportLogoSize = Number(logoSizeInput.value) * 230 / 182;
  const titleWidthAtMax = [...exportTitle].reduce((sum, char) => sum + logoGlyphWidth(char, 230, ctx), 0) + Math.max(0, [...exportTitle].length - 1) * 230 * type.tracking;
  const fontSize = Math.min(requestedExportLogoSize, titleWidthAtMax > 0 ? requestedExportLogoSize * 1160 / titleWidthAtMax : requestedExportLogoSize);
  ctx.font = (type.italic ? 'italic ' : '') + type.weight + ' ' + fontSize + 'px ' + type.family;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const glyphs = [...exportTitle];
  const widths = glyphs.map(char => logoGlyphWidth(char, fontSize, ctx));
  const gap = fontSize * type.tracking;
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, glyphs.length - 1);
  let x = (canvas.width - totalWidth) / 2;
  const baseY = 310;
  for (let i = 0; i < glyphs.length; i++) {
    if (activeVisualEnhancement) {
      const { mode, colorway } = activeVisualEnhancement;
      ctx.shadowColor = mode.neon ? colorway.accent : colorway.glow;
      ctx.shadowBlur = mode.blur;
      ctx.shadowOffsetX = mode.dx;
      ctx.shadowOffsetY = mode.dy;
      if (mode.outline) {
        ctx.lineWidth = mode.outline;
        ctx.strokeStyle = colorway.accent;
        ctx.strokeText(glyphs[i], x, baseY);
      }
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    const originalStyle = selectedLetterStyle === 0;
    const customGlyph = selectedLetterStyle === importedHandwritingStyleIndex ? importedGlyphs.get(glyphs[i]) : null;
    const striped = originalStyle && exportTitle === 'Bardel' && i === 5;
    if (customGlyph) {
      const imageWidth = widths[i];
      ctx.drawImage(customGlyph.image, x, baseY - fontSize * .82, imageWidth, fontSize);
    } else if (striped) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, baseY - fontSize, widths[i] + 4, fontSize + 25);
      ctx.clip();
      ctx.fillStyle = colors[i];
      ctx.fillText(glyphs[i], x, baseY);
      ctx.globalCompositeOperation = 'source-atop';
      for (let y = baseY - fontSize; y < baseY + 25; y += 34) {
        ctx.fillStyle = '#f18ab9';
        ctx.fillRect(x - 3, y + 17, widths[i] + 15, 17);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = colors[i];
      if (originalStyle && exportTitle === 'Bardel' && i === 2) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#d5a8ff';
        ctx.strokeText(glyphs[i], x, baseY);
      }
      ctx.fillText(glyphs[i], x, baseY);
    }
    x += widths[i] + gap;
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = exportSubtitleColor;
  const requestedExportSubtitleSize = Number(subtitleSizeInput.value) * 48 / 38;
  ctx.font = (subtitleType.italic ? 'italic ' : '') + subtitleType.weight + ' ' + requestedExportSubtitleSize + 'px ' + subtitleType.family;
  const labelText = exportSubtitle.toUpperCase();
  const labelWidthAtMax = ctx.measureText(labelText).width + Math.max(0, labelText.length - 1) * 10 * requestedExportSubtitleSize / 48;
  const labelSize = Math.min(requestedExportSubtitleSize, labelWidthAtMax > 0 ? requestedExportSubtitleSize * 1120 / labelWidthAtMax : requestedExportSubtitleSize);
  ctx.font = (subtitleType.italic ? 'italic ' : '') + subtitleType.weight + ' ' + labelSize + 'px ' + subtitleType.family;
  ctx.letterSpacing = (10 * labelSize / 48) + 'px';
  ctx.fillText(labelText, canvas.width / 2, 410);
  return canvas;
}

async function downloadLogo(format) {
  const button = document.querySelector(format === 'png' ? '#png' : '#jpg');
  button.disabled = true;
  try {
    const canvas = await drawLogo(format === 'jpg');
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const link = document.createElement('a');
    link.download = (exportTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'logo') + '.' + format;
    link.href = canvas.toDataURL(mime, .95);
    link.click();
  } catch (error) {
    console.error('Could not export logo:', error);
  } finally {
    button.disabled = false;
  }
}

document.querySelector('#png').addEventListener('click', () => downloadLogo('png'));
document.querySelector('#jpg').addEventListener('click', () => downloadLogo('jpg'));

// Motion exports capture the selected Web Animations API pose frame-by-frame,
// then encode the frames locally in the browser.
const exportStatus = document.querySelector('#exportStatus');
let exportLibraries;
let ffmpegInstance;

async function loadExportLibraries() {
  if (!exportLibraries) {
    exportLibraries = Promise.all([
      import('https://esm.sh/html2canvas@1.4.1'),
      import('https://esm.sh/jszip@3.10.1'),
      import('https://esm.sh/@ffmpeg/ffmpeg@0.12.10'),
      import('https://esm.sh/@ffmpeg/util@0.12.1')
    ]).then(([html2canvasModule, zipModule, ffmpegModule, utilModule]) => ({
      html2canvas: html2canvasModule.default,
      JSZip: zipModule.default,
      FFmpeg: ffmpegModule.FFmpeg,
      toBlobURL: utilModule.toBlobURL
    }));
  }
  return exportLibraries;
}

async function getEncoder() {
  const { FFmpeg, toBlobURL } = await loadExportLibraries();
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
    ffmpegInstance.on('log', ({ message }) => {
      if (message.includes('frame=')) exportStatus.textContent = 'Encoding motion…';
    });
    const base = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
    await ffmpegInstance.load({
      coreURL: await toBlobURL(base + '/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL(base + '/ffmpeg-core.wasm', 'application/wasm')
    });
  }
  return ffmpegInstance;
}

async function captureSelectedMotion() {
  const { html2canvas } = await loadExportLibraries();
  // Rewind the chosen animation so every export starts at its true beginning.
  playMotion(motionSelected ? motionIndex : 0, false);
  motionSelected = true;
  document.querySelector('#motion').textContent = 'Motion ' + String(motionIndex + 1).padStart(3, '0') + ' / 220';
  const animations = [...logo.getAnimations({ subtree: true })];
  animations.forEach(animation => animation.pause());
  const endTime = Math.max(1000, ...animations.map(animation => {
    const timing = animation.effect?.getTiming();
    return timing ? timing.delay + timing.duration : 0;
  })) + 180;
  const fps = 12;
  const totalFrames = Math.ceil(endTime / 1000 * fps);
  const frames = [];
  const previousTime = animations.map(animation => animation.currentTime);
  try {
    for (let frame = 0; frame < totalFrames; frame++) {
      const time = frame * 1000 / fps;
      animations.forEach(animation => { animation.currentTime = time; });
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const image = await html2canvas(document.querySelector('.stage'), {
        backgroundColor: '#17171d', scale: 1, logging: false, useCORS: true
      });
      frames.push(image);
      exportStatus.textContent = 'Capturing motion… ' + Math.round((frame + 1) / totalFrames * 100) + '%';
    }
  } finally {
    animations.forEach((animation, index) => {
      animation.currentTime = previousTime[index] ?? 0;
      animation.play();
    });
  }
  return { frames, fps };
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

const aliceDemo = `Alice’s Adventures in Wonderland — Lewis Carroll (1865, public domain)

Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice, “without pictures or conversations?”

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be too late!” (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet.

It flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and, burning with curiosity, she ran across the field after it, and was just in time to see it pop down a large rabbit-hole under the hedge.

In another moment down went Alice after it, never once considering how in the world she was to get out again.

The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well.

“Either the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her and to wonder what was going to happen next.”`;
scrollInput.value = aliceDemo;
scrollText.textContent = aliceDemo;
let scrollAnimation = null;
let scrollDurationMs = 30000;
let scrollRevision = 0;

function startScrollAnimation() {
  scrollRevision++;
  const revision = scrollRevision;
  scrollText.getAnimations().forEach(animation => animation.cancel());
  scrollAnimation = null;
  scrollText.textContent = scrollInput.value || ' ';
  scrollText.style.fontFamily = word.style.fontFamily || 'Arial, sans-serif';
  scrollText.style.fontWeight = word.style.fontWeight || '400';
  scrollText.style.fontStyle = word.style.fontStyle || 'normal';
  return new Promise(resolve => requestAnimationFrame(() => {
    if (revision !== scrollRevision || !document.querySelector('.maker').classList.contains('scroll-mode')) {
      resolve(null);
      return;
    }
    const distance = scrollText.scrollHeight + scrollStage.clientHeight;
    scrollDurationMs = Math.max(12000, Math.min(120000, distance / 78 * 1000));
    scrollAnimation = scrollText.animate([
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-' + distance + 'px)' }
    ], { duration: scrollDurationMs, iterations: Infinity, easing: 'linear' });
    resolve(scrollAnimation);
  }));
}

scrollModeToggle.addEventListener('click', () => {
  const maker = document.querySelector('.maker');
  const enabled = !maker.classList.contains('scroll-mode');
  maker.classList.toggle('scroll-mode', enabled);
  scrollModeToggle.textContent = enabled ? 'Logo Mode' : 'Scroll Mode';
  scrollModeToggle.setAttribute('aria-pressed', String(enabled));
  scrollEditor.hidden = !enabled;
  scrollActions.hidden = !enabled;
  if (enabled) startScrollAnimation();
  else {
    scrollRevision++;
    if (scrollAnimation) scrollAnimation.cancel();
    scrollAnimation = null;
  }
});
document.querySelector('#loadStoryDemo').addEventListener('click', () => {
  scrollInput.value = aliceDemo;
  if (document.querySelector('.maker').classList.contains('scroll-mode')) startScrollAnimation();
});
scrollInput.addEventListener('input', () => {
  if (document.querySelector('.maker').classList.contains('scroll-mode')) startScrollAnimation();
  else scrollText.textContent = scrollInput.value;
});

async function downloadScrollStill(format) {
  const button = document.querySelector(format === 'png' ? '#scrollPng' : '#scrollJpg');
  button.disabled = true;
  scrollExportStatus.textContent = 'Rendering image…';
  try {
    const { html2canvas } = await loadExportLibraries();
    const canvas = await html2canvas(scrollStage, {
      backgroundColor: format === 'jpg' ? '#101014' : '#17171d', scale: 1, logging: false
    });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, format === 'jpg' ? 'image/jpeg' : 'image/png', .95));
    downloadBlob(blob, 'scroll-text.' + format);
    scrollExportStatus.textContent = 'Download ready';
  } catch (error) {
    console.error('Scroll image export failed:', error);
    scrollExportStatus.textContent = 'Export failed — please try again';
  } finally {
    button.disabled = false;
  }
}

async function downloadScrollVideo(format) {
  const buttons = [...document.querySelectorAll('#scrollActions button')];
  buttons.forEach(button => button.disabled = true);
  const writtenFiles = [];
  let animation;
  let restoreTime = 0;
  try {
    scrollExportStatus.textContent = 'Preparing scroll…';
    animation = await startScrollAnimation();
    if (!animation) throw new Error('Scroll animation is not available.');
    restoreTime = Number(animation.currentTime) || 0;
    animation.pause();
    animation.currentTime = 0;
    const fps = 8;
    const frameCount = Math.ceil(scrollDurationMs / 1000 * fps);
    const { html2canvas } = await loadExportLibraries();
    const ffmpeg = await getEncoder();
    const sequence = 'scroll-frame-';
    for (let frame = 0; frame < frameCount; frame++) {
      animation.currentTime = Math.min(scrollDurationMs - 1, frame * 1000 / fps);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const canvas = await html2canvas(scrollStage, { backgroundColor: '#17171d', scale: .8, logging: false });
      const bytes = await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? blob.arrayBuffer().then(resolve, reject) : reject(new Error('Could not render a video frame.')), 'image/png'));
      const filename = sequence + String(frame).padStart(4, '0') + '.png';
      await ffmpeg.writeFile(filename, new Uint8Array(bytes));
      writtenFiles.push(filename);
      scrollExportStatus.textContent = 'Rendering scroll… ' + Math.round((frame + 1) / frameCount * 100) + '%';
    }
    const outputName = 'scroll-text';
    if (format === 'flv') {
      await ffmpeg.exec(['-framerate', String(fps), '-i', sequence + '%04d.png', '-an', '-c:v', 'flv', '-pix_fmt', 'yuv420p', '-f', 'flv', outputName + '.flv']);
    } else if (format === 'mp4') {
      await ffmpeg.exec(['-framerate', String(fps), '-i', sequence + '%04d.png', '-an', '-c:v', 'mpeg4', '-q:v', '5', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-f', 'mp4', outputName + '.mp4']);
    } else {
      await ffmpeg.exec(['-framerate', String(fps), '-i', sequence + '%04d.png', '-vf', 'split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer', '-loop', '0', outputName + '.gif']);
    }
    const output = await ffmpeg.readFile(outputName + '.' + format);
    const mime = format === 'flv' ? 'video/x-flv' : format === 'mp4' ? 'video/mp4' : 'image/gif';
    downloadBlob(new Blob([output], { type: mime }), outputName + '.' + format);
    await ffmpeg.deleteFile(outputName + '.' + format);
    scrollExportStatus.textContent = 'Download ready';
  } catch (error) {
    console.error('Scroll video export failed:', error);
    scrollExportStatus.textContent = 'Export failed — please try again';
  } finally {
    if (ffmpegInstance) {
      for (const file of writtenFiles) {
        try { await ffmpegInstance.deleteFile(file); } catch {}
      }
    }
    if (animation) {
      animation.currentTime = 0;
      animation.play();
    }
    buttons.forEach(button => button.disabled = false);
  }
}
document.querySelector('#scrollPng').addEventListener('click', () => downloadScrollStill('png'));
document.querySelector('#scrollJpg').addEventListener('click', () => downloadScrollStill('jpg'));
document.querySelector('#scrollFlv').addEventListener('click', () => downloadScrollVideo('flv'));
document.querySelector('#scrollMp4').addEventListener('click', () => downloadScrollVideo('mp4'));
document.querySelector('#scrollGif').addEventListener('click', () => downloadScrollVideo('gif'));

async function makeMotionExport(kind) {
  const button = document.querySelector(kind === 'flv' ? '#flv' : '#gifZip');
  const buttons = [...document.querySelectorAll('.motion-export')];
  buttons.forEach(item => item.disabled = true);
  const oldLabel = button.innerHTML;
  try {
    exportStatus.textContent = 'Preparing motion…';
    const { frames, fps } = await captureSelectedMotion();
    exportStatus.textContent = 'Loading video encoder…';
    const ffmpeg = await getEncoder();
    const { JSZip } = await loadExportLibraries();
    const prefix = 'motion-frames';
    for (let index = 0; index < frames.length; index++) {
      const bytes = await new Promise(resolve => frames[index].toBlob(blob => blob.arrayBuffer().then(resolve), 'image/png'));
      await ffmpeg.writeFile(prefix + String(index).padStart(4, '0') + '.png', new Uint8Array(bytes));
    }
    const motionName = 'motion-' + String((motionSelected ? motionIndex : 0) + 1).padStart(3, '0');
    if (kind === 'flv') {
      await ffmpeg.exec(['-framerate', String(fps), '-i', prefix + '%04d.png', '-an', '-c:v', 'flv', '-pix_fmt', 'yuv420p', '-f', 'flv', motionName + '.flv']);
      const output = await ffmpeg.readFile(motionName + '.flv');
      downloadBlob(new Blob([output.buffer], { type: 'video/x-flv' }), motionName + '.flv');
      await ffmpeg.deleteFile(motionName + '.flv');
    } else {
      await ffmpeg.exec(['-framerate', String(fps), '-i', prefix + '%04d.png', '-vf', 'split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer', '-loop', '0', motionName + '.gif']);
      const output = await ffmpeg.readFile(motionName + '.gif');
      const zip = new JSZip();
      zip.file(motionName + '.gif', output);
      const archive = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      downloadBlob(archive, motionName + '.zip');
      await ffmpeg.deleteFile(motionName + '.gif');
    }
    exportStatus.textContent = 'Download ready';
    setTimeout(() => { if (exportStatus.textContent === 'Download ready') exportStatus.textContent = ''; }, 3000);
  } catch (error) {
    console.error('Motion export failed:', error);
    exportStatus.textContent = 'Export failed — please try again';
  } finally {
    // Remove temporary frame files so repeated exports do not accumulate memory.
    if (ffmpegInstance) {
      for (let index = 0; index < 80; index++) {
        try { await ffmpegInstance.deleteFile('motion-frames' + String(index).padStart(4, '0') + '.png'); } catch {}
      }
    }
    buttons.forEach(item => item.disabled = false);
    button.innerHTML = oldLabel;
  }
}

document.querySelector('#flv').addEventListener('click', () => makeMotionExport('flv'));
document.querySelector('#gifZip').addEventListener('click', () => makeMotionExport('gif'));
function updateSequenceList() {
  sequenceList.replaceChildren();
  sequenceItems.forEach((item, index) => {
    const li = document.createElement('li');
    const preview = document.createElement('span');
    preview.textContent = (index + 1) + '. ' + (item.kind === 'logo' ? 'Logo · ' : 'Scroll · ') + item.text.replace(/\s+/g, ' ').slice(0, 58);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '×';
    remove.setAttribute('aria-label', 'Remove sequence item ' + (index + 1));
    remove.addEventListener('click', () => {
      stopSequencePlayback();
      sequenceItems.splice(index, 1);
      updateSequenceList();
    });
    li.append(preview, remove);
    sequenceList.append(li);
  });
}
function addCurrentLogoToSequence() {
  const text = nameInput.value.trim();
  if (!text) { sequenceStatus.textContent = 'Enter logo text first.'; return; }
  sequenceItems.push({
    kind: 'logo', text, colors: [...colors], subtitle: exportSubtitle, subtitleColor: exportSubtitleColor,
    logoStyle: selectedLetterStyle, subtitleStyle: selectedSubtitleStyle,
    logoSize: Number(logoSizeInput.value), subtitleSize: Number(subtitleSizeInput.value),
    visualIndex: visualEnhancementSelect.value === '' ? -1 : Number(visualEnhancementSelect.value) - 1
  });
  updateSequenceList();
  sequenceStatus.textContent = sequenceItems.length + ' item' + (sequenceItems.length === 1 ? '' : 's') + ' in sequence.';
}
function addTextToSequence() {
  const text = sequenceEntry.value.trim();
  if (!text) { sequenceStatus.textContent = 'Paste or type text first.'; return; }
  sequenceItems.push({ kind: 'scroll', text, theme: Number(scrollThemeSelect.value) || 0, logoStyle: selectedLetterStyle });
  updateSequenceList();
  sequenceStatus.textContent = sequenceItems.length + ' item' + (sequenceItems.length === 1 ? '' : 's') + ' in sequence.';
}
function fitSequenceLogoText(text, type, requestedSize) {
  const context = document.createElement('canvas').getContext('2d');
  context.font = (type.italic ? 'italic ' : '') + type.weight + ' 182px ' + type.family;
  const measured = [...text].reduce((sum, char) => sum + logoGlyphWidth(char, 182, context, letterStyles.indexOf(type)), 0) + Math.max(0, [...text].length - 1) * 182 * type.tracking;
  return Math.min(requestedSize, measured > 0 ? 182 * Math.max(120, stage.clientWidth - 90) / measured : requestedSize);
}
function renderSequenceItem(item) {
  if (sequenceAnimation) sequenceAnimation.cancel();
  sequenceAnimation = null;
  sequenceDisplay.replaceChildren();
  sequenceDisplay.style.background = 'transparent';
  if (item.kind === 'logo') {
    const type = letterStyles[item.logoStyle];
    const subType = letterStyles[item.subtitleStyle];
    const card = document.createElement('div');
    card.className = 'logo sequence-logo';
    const wordmark = document.createElement('div');
    wordmark.className = 'word' + (item.logoStyle === 0 ? ' original-style' : '');
    wordmark.style.fontFamily = type.family;
    wordmark.style.fontWeight = String(type.weight);
    wordmark.style.fontStyle = type.italic ? 'italic' : 'normal';
    wordmark.style.letterSpacing = type.tracking + 'em';
    const measure = document.createElement('canvas').getContext('2d');
    measure.font = (type.italic ? 'italic ' : '') + type.weight + ' 182px ' + type.family;
    const totalWidth = [...item.text].reduce((sum, char) => sum + logoGlyphWidth(char, 182, measure, item.logoStyle), 0) + Math.max(0, [...item.text].length - 1) * 182 * type.tracking;
    const logoSize = Math.min(item.logoSize, totalWidth > 0 ? 182 * Math.max(120, stage.clientWidth - 90) / totalWidth : item.logoSize);
    wordmark.style.setProperty('--logo-font-size', logoSize + 'px');
    [...item.text].forEach((char, index) => {
      const glyph = document.createElement('span');
      glyph.className = 'letter anim-' + (index % 6);
      glyph.style.setProperty('--color', item.colors[index] || item.colors[index % item.colors.length] || '#eee');
      const imageGlyph = item.logoStyle === importedHandwritingStyleIndex ? importedGlyphs.get(char) : null;
      if (imageGlyph) {
        glyph.classList.add('custom-glyph');
        const img = document.createElement('img');
        img.src = imageGlyph.url;
        img.alt = char;
        glyph.append(img);
      } else glyph.textContent = char;
      wordmark.append(glyph);
    });
    const caption = document.createElement('div');
    caption.className = 'entertainment';
    caption.textContent = item.subtitle;
    caption.style.fontFamily = subType.family;
    caption.style.fontWeight = String(subType.weight);
    caption.style.fontStyle = subType.italic ? 'italic' : 'normal';
    caption.style.color = item.subtitleColor;
    caption.style.setProperty('--subtitle-size', item.subtitleSize + 'px');
    card.append(wordmark, caption);
    const visual = item.visualIndex >= 0 ? visualEnhancements[item.visualIndex] : null;
    if (visual) {
      card.style.filter = 'drop-shadow(0 0 ' + (visual.mode.blur || 8) + 'px ' + visual.colorway.glow + ')';
      if (visual.mode.outline) {
        card.classList.add('visual-outline');
        card.style.setProperty('--visual-outline-width', visual.mode.outline + 'px');
        card.style.setProperty('--visual-accent', visual.colorway.accent);
      }
    }
    sequenceDisplay.append(card);
    sequenceAnimation = card.animate([{ opacity: 0, transform: 'translateY(12px) scale(.985)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 550, fill: 'both', easing: 'ease-out' });
    return 2600;
  }
  const theme = scrollThemes[item.theme] || scrollThemes[0];
  sequenceDisplay.style.background = 'radial-gradient(ellipse at 50% 45%, ' + theme.glow + ' 0%, ' + theme.bg + ' 52%, #07090d 100%)';
  const track = document.createElement('div');
  track.className = 'sequence-scroll-text';
  track.textContent = item.text;
  track.style.color = theme.ink;
  const textType = letterStyles[item.logoStyle] || letterStyles[0];
  track.style.fontFamily = textType.family;
  sequenceDisplay.append(track);
  const distance = track.scrollHeight + stage.clientHeight;
  const duration = Math.max(12000, Math.min(120000, distance / 78 * 1000));
  sequenceAnimation = track.animate([
    { transform: 'translate(-50%, 0px)' },
    { transform: 'translate(-50%, -' + distance + 'px)' }
  ], { duration, fill: 'forwards', easing: 'linear' });
  return duration;
}
function stopSequencePlayback() {
  clearTimeout(sequenceTimer);
  sequenceTimer = null;
  sequenceRunning = false;
  if (sequenceAnimation) sequenceAnimation.cancel();
  sequenceAnimation = null;
  document.querySelector('.maker').classList.remove('sequence-mode');
  sequenceDisplay.replaceChildren();
  document.querySelector('#stopSequence').disabled = true;
  document.querySelector('#playSequence').disabled = false;
}
function playSequenceFrom(index = 0) {
  if (!sequenceItems.length) { sequenceStatus.textContent = 'Add a logo or scrolling text to start.'; return; }
  clearTimeout(sequenceTimer);
  sequenceRunning = true;
  sequenceCursor = index;
  document.querySelector('.maker').classList.add('sequence-mode');
  document.querySelector('#stopSequence').disabled = false;
  document.querySelector('#playSequence').disabled = true;
  const playNext = () => {
    if (!sequenceRunning || sequenceCursor >= sequenceItems.length) {
      stopSequencePlayback();
      sequenceStatus.textContent = 'Sequence finished.';
      return;
    }
    const duration = renderSequenceItem(sequenceItems[sequenceCursor]);
    sequenceStatus.textContent = 'Playing item ' + (sequenceCursor + 1) + ' of ' + sequenceItems.length;
    sequenceCursor++;
    sequenceTimer = setTimeout(playNext, duration);
  };
  playNext();
}
async function exportSequence(format) {
  if (!sequenceItems.length) { sequenceStatus.textContent = 'Add items to the sequence first.'; return; }
  const buttons = [...document.querySelectorAll('.sequence-download')];
  buttons.forEach(button => button.disabled = true);
  let ffmpeg;
  const written = [];
  try {
    document.querySelector('.maker').classList.add('sequence-mode');
    if (format === 'png' || format === 'jpg') {
      const item = sequenceItems[0];
      if (item.kind === 'logo') await loadLetterFont(letterStyles[item.logoStyle]);
      renderSequenceItem(item);
      if (sequenceAnimation && item.kind === 'logo') sequenceAnimation.finish();
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const { html2canvas } = await loadExportLibraries();
      const canvas = await html2canvas(stage, { backgroundColor: format === 'jpg' ? '#101014' : null, scale: 1, logging: false, useCORS: true });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, format === 'jpg' ? 'image/jpeg' : 'image/png', .95));
      downloadBlob(blob, 'logo-sequence.' + format);
      sequenceStatus.textContent = 'First sequence frame downloaded.';
      return;
    }
    sequenceStatus.textContent = 'Preparing sequence export…';
    const { html2canvas, JSZip } = await loadExportLibraries();
    ffmpeg = await getEncoder();
    const fps = 8;
    let frameNumber = 0;
    for (let itemIndex = 0; itemIndex < sequenceItems.length; itemIndex++) {
      const item = sequenceItems[itemIndex];
      if (item.kind === 'logo') await loadLetterFont(letterStyles[item.logoStyle]);
      const duration = renderSequenceItem(item);
      if (sequenceAnimation) sequenceAnimation.pause();
      const frames = Math.ceil(duration / 1000 * fps);
      for (let frame = 0; frame < frames; frame++) {
        if (sequenceAnimation) sequenceAnimation.currentTime = item.kind === 'logo' ? Math.min(550, frame * 1000 / fps) : frame * 1000 / fps;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const canvas = await html2canvas(stage, { backgroundColor: '#17171d', scale: .8, logging: false, useCORS: true });
        const buffer = await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? blob.arrayBuffer().then(resolve, reject) : reject(new Error('Could not render sequence frame.')), 'image/png'));
        const filename = 'series-frame-' + String(frameNumber++).padStart(5, '0') + '.png';
        await ffmpeg.writeFile(filename, new Uint8Array(buffer));
        written.push(filename);
      }
      sequenceStatus.textContent = 'Rendering sequence… ' + Math.round((itemIndex + 1) / sequenceItems.length * 100) + '%';
    }
    const base = 'logo-sequence';
    const videoFormat = format === 'zip' ? 'gif' : format;
    if (videoFormat === 'flv') {
      await ffmpeg.exec(['-framerate', String(fps), '-i', 'series-frame-%05d.png', '-an', '-c:v', 'flv', '-pix_fmt', 'yuv420p', '-f', 'flv', base + '.flv']);
    } else if (videoFormat === 'mp4') {
      await ffmpeg.exec(['-framerate', String(fps), '-i', 'series-frame-%05d.png', '-an', '-c:v', 'mpeg4', '-q:v', '5', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-f', 'mp4', base + '.mp4']);
    } else {
      await ffmpeg.exec(['-framerate', String(fps), '-i', 'series-frame-%05d.png', '-vf', 'split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer', '-loop', '0', base + '.gif']);
    }
    const output = await ffmpeg.readFile(base + '.' + videoFormat);
    if (format === 'zip') {
      const zip = new JSZip();
      zip.file(base + '.gif', output);
      downloadBlob(await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }), base + '.zip');
    } else {
      const mime = format === 'flv' ? 'video/x-flv' : format === 'mp4' ? 'video/mp4' : 'image/gif';
      downloadBlob(new Blob([output], { type: mime }), base + '.' + format);
    }
    await ffmpeg.deleteFile(base + '.' + videoFormat);
    sequenceStatus.textContent = 'Sequence download ready.';
  } catch (error) {
    console.error('Sequence export failed:', error);
    sequenceStatus.textContent = 'Sequence export failed — try again.';
  } finally {
    if (ffmpeg) for (const filename of written) { try { await ffmpeg.deleteFile(filename); } catch {} }
    buttons.forEach(button => button.disabled = false);
  }
}
document.querySelector('#addCurrentLogo').addEventListener('click', addCurrentLogoToSequence);
document.querySelector('#addSequenceText').addEventListener('click', addTextToSequence);
document.querySelector('#playSequence').addEventListener('click', () => playSequenceFrom());
document.querySelector('#stopSequence').addEventListener('click', stopSequencePlayback);
document.querySelector('#clearSequence').addEventListener('click', () => {
  stopSequencePlayback();
  sequenceItems.splice(0, sequenceItems.length);
  updateSequenceList();
  sequenceStatus.textContent = 'Sequence cleared.';
});
document.querySelectorAll('.sequence-download').forEach(button => button.addEventListener('click', () => exportSequence(button.dataset.format)));

const scrollThemes = [
  { name: 'Midnight Gold', ink: '#f5dfaa', bg: '#100e0a', glow: '#342719', edge: '#080807', halo: '#c8943a66' },
  { name: 'Polar Blue', ink: '#e6f4ff', bg: '#071521', glow: '#12344b', edge: '#040c14', halo: '#42a9e866' },
  { name: 'Jade Archive', ink: '#d8f1df', bg: '#091710', glow: '#183729', edge: '#050b08', halo: '#5fc48855' },
  { name: 'Aubergine', ink: '#f0e1f5', bg: '#170d1c', glow: '#382344', edge: '#0b0710', halo: '#be7bd955' },
  { name: 'Paper Cream', ink: '#f5ead3', bg: '#211c15', glow: '#453622', edge: '#100d09', halo: '#d5b77b55' },
  { name: 'Crimson Stage', ink: '#ffe5e5', bg: '#1d090d', glow: '#4a1820', edge: '#0d0507', halo: '#e7758055' },
  { name: 'Slate Silver', ink: '#e1e7ed', bg: '#11171d', glow: '#2d3945', edge: '#080b0f', halo: '#9ab4ce55' },
  { name: 'Rose Quartz', ink: '#ffe5ef', bg: '#1d1017', glow: '#432535', edge: '#0b080a', halo: '#e28eae55' },
  { name: 'Copper & Ink', ink: '#f4d5bd', bg: '#17100d', glow: '#493023', edge: '#090706', halo: '#df946455' },
  { name: 'Violet Night', ink: '#e9e5ff', bg: '#100e20', glow: '#292653', edge: '#070711', halo: '#9f91ff66' },
  { name: 'Forest Canopy', ink: '#e8f0d5', bg: '#10170d', glow: '#2c3a1c', edge: '#080c07', halo: '#a9c86b55' },
  { name: 'Ocean Depth', ink: '#d9f4f5', bg: '#081619', glow: '#16434a', edge: '#040b0c', halo: '#59c4c855' }
];
function applyScrollTheme(index) {
  const theme = scrollThemes[index];
  if (!theme) return;
  scrollStage.style.setProperty('--scroll-ink', theme.ink);
  scrollStage.style.setProperty('--scroll-background', theme.bg);
  scrollStage.style.setProperty('--scroll-glow', theme.glow);
  scrollStage.style.setProperty('--scroll-edge', theme.edge);
  scrollStage.style.setProperty('--scroll-halo', theme.halo);
  scrollThemeSwatch.style.background = 'linear-gradient(135deg, ' + theme.ink + ' 0 45%, ' + theme.glow + ' 45% 100%)';
}
scrollThemes.forEach((theme, index) => {
  const option = document.createElement('option');
  option.value = String(index);
  option.textContent = theme.name;
  scrollThemeSelect.append(option);
});
scrollThemeSelect.value = '0';
applyScrollTheme(0);
scrollThemeSelect.addEventListener('change', () => applyScrollTheme(Number(scrollThemeSelect.value)));
populateLetterStyleMenus();
populateDesignTools();
updateLogo();
document.fonts.ready.then(updateLogo);
window.addEventListener('resize', updateLogo);
