const SKILLS = [
  "React / Next.js",
  "JavaScript (ES6+)",
  "Node & APIs",
  "Real-time / WebSockets",
  "Supabase · Firebase",
  "CAD / Fusion 360",
  "Woodworking",
  "Mechanical design",
  "AI integration",
];

export default function Skills() {
  return (
    <section id='skills' className='section-pad'>
      <div className='sec-head reveal d1'>
        <span className='idx'>02</span>
        <h2>The toolkit</h2>
      </div>
      <div className='skills'>
        {SKILLS.map((skill, i) => (
          <span
            key={skill}
            className={`chip reveal d${Math.min(6, 2 + Math.floor(i / 2))}`}
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
