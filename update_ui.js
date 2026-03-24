const fs = require('fs');

const filePath = 'd:\\portfolio\\index.html';

let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Font URL
content = content.replace(
    'family=Inter:wght@300;400;500;600;700',
    'family=Outfit:wght@300;400;500;600;700;800'
);

// 2. Update Tailwind Config
content = content.replace(
    "inter: ['Inter', 'sans-serif']",
    "sans: ['Outfit', 'sans-serif']"
);

// 3. Update CSS Body font
content = content.replace(
    "font-family: 'Inter', sans-serif;",
    "font-family: 'Outfit', sans-serif;"
);

// 4. Color Palette Root
const old_root = `:root {
            --bg-primary: #F0FDFA;
            --bg-secondary: #FFFFFF;
            --bg-card: #FFFFFF;
            --bg-card-hover: #CCFBF1;
            --text-primary: #134E4A;
            --text-secondary: #0F766E;
            --text-muted: #5EEAD4;
            --accent-primary: #0D9488;
            --accent-secondary: #F43F5E;
            --border-color: rgba(13, 148, 136, 0.2);
            --glow-color: rgba(13, 148, 136, 0.15);
        }`;
const new_root = `:root {
            --bg-primary: #FAFAFA;
            --bg-secondary: #F4F4F5;
            --bg-card: rgba(255, 255, 255, 0.6);
            --bg-card-hover: rgba(255, 255, 255, 0.9);
            --text-primary: #09090B;
            --text-secondary: #3F3F46;
            --text-muted: #71717A;
            --accent-primary: #4F46E5;
            --accent-secondary: #EC4899;
            --border-color: rgba(79, 70, 229, 0.15);
            --glow-color: rgba(79, 70, 229, 0.15);
        }`;
content = content.replace(old_root, new_root);

// Color Palette Dark
const old_dark = `.dark {
            --bg-primary: #042F2E;
            --bg-secondary: #0A3D3C;
            --bg-card: #134E4A;
            --bg-card-hover: #115E59;
            --text-primary: #F0FDFA;
            --text-secondary: #99F6E4;
            --text-muted: #5EEAD4;
            --accent-primary: #2DD4BF;
            --accent-secondary: #FB7185;
            --border-color: rgba(45, 212, 191, 0.15);
            --glow-color: rgba(45, 212, 191, 0.2);
        }`;
const new_dark = `.dark {
            --bg-primary: #09090B;
            --bg-secondary: #000000;
            --bg-card: rgba(24, 24, 27, 0.5);
            --bg-card-hover: rgba(39, 39, 42, 0.7);
            --text-primary: #FAFAFA;
            --text-secondary: #A1A1AA;
            --text-muted: #71717A;
            --accent-primary: #8B5CF6;
            --accent-secondary: #06B6D4;
            --border-color: rgba(139, 92, 246, 0.2);
            --glow-color: rgba(139, 92, 246, 0.25);
        }`;
content = content.replace(old_dark, new_dark);

// 5. Fix syntax error
content = content.replace(
        `.nav-link:hover::before {
            background: var(--accent-primary);
            opacity: 0.3;
        }
        }`, 
        `.nav-link:hover::before {
            background: var(--accent-primary);
            opacity: 0.3;
        }`
);

// 6. Add Glassmorphism to cards
content = content.replace('.bg-card { background-color: var(--bg-card); }', '.bg-card { background-color: var(--bg-card); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }');

// 7. Add text gradient utility
if (!content.includes('.text-gradient')) {
    content = content.replace('</style>', `
        .text-gradient {
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
    </style>`);
}

// 8. Enhance hover states
content = content.replace(
        `.card-hover:hover {
            transform: translateY(-4px);
            border-color: var(--accent-primary);
            box-shadow: 0 0 10px var(--glow-color);
        }`, 
        `.card-hover:hover {
            transform: translateY(-6px) scale(1.02);
            border-color: var(--accent-primary);
            box-shadow: 0 15px 30px -10px var(--glow-color);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }`
);

// 9. Improve skill items
content = content.replace(
        `.skill-item {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }`, 
        `.skill-item {
            background: var(--bg-card);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
        }`
);

// 10. Update Hero Title
content = content.replace(
    '<h1 id="hero-title" class="text-5xl md:text-7xl font-bold mt-4 mb-6 tracking-tight text-primary">VENKATA NARAYANA</h1>',
    '<h1 id="hero-title" class="text-5xl md:text-7xl font-extrabold mt-4 mb-6 tracking-tight text-primary">VENKATA <span class="text-gradient">NARAYANA</span></h1>'
);

// 11. Update terminal syntax color inside index.html for sleeker look
content = content.replace(
    `.terminal {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
            font-family: 'JetBrains Mono', monospace;
        }`,
    `.terminal {
            background: rgba(9, 9, 11, 0.6);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            overflow: hidden;
            font-family: 'JetBrains Mono', monospace;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            transform: perspective(1000px) rotateX(2deg);
            transition: transform 0.5s ease, box-shadow 0.5s ease;
        }
        
        .terminal:hover {
            transform: perspective(1000px) rotateX(0deg) translateY(-5px);
            box-shadow: 0 30px 60px -12px var(--glow-color);
            border-color: rgba(139, 92, 246, 0.3);
        }`
);

// 12. Update full stack developer subtitle
content = content.replace(
    '<span class="text-accent text-sm font-semibold tracking-[4px] uppercase">Full Stack Developer</span>',
    '<span class="text-gradient text-sm font-semibold tracking-[4px] uppercase">Full Stack Developer</span>'
);

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated successfully!");
