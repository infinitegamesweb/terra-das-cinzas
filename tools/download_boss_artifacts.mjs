import fs from 'fs';
import path from 'path';

const API_KEY = process.env.SPRITERRIFIC_API_KEY;
const BASE_URL = process.env.SPRITERRIFIC_API_BASE || 'https://courteous-mouse-611.convex.site';
const JOB_ID = 'kh768pgrgm8gz18m3ngqh8jhxx8fg7j6';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'X-Spriterrific-Skill-Version': '1.3.2'
};

async function downloadFile(url, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  console.log(`Saved: ${dest} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log('Fetching artifacts for job:', JOB_ID);
  const res = await fetch(`${BASE_URL}/api/v1/jobs/${JOB_ID}`, { headers });
  const data = await res.json();
  const job = data.job;

  const suffix = JOB_ID.slice(-8);
  const runDir = path.resolve(`spriterrific-runs/ashen-golem-boss-${suffix}`);
  const gameMonsterDir = path.resolve(`assets/monsters/boss_ashen_golem`);
  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(gameMonsterDir, { recursive: true });

  fs.writeFileSync(path.join(runDir, 'job.json'), JSON.stringify(job, null, 2));

  for (const art of job.artifacts) {
    console.log(`Artifact: ${art.name} (${art.contentType})`);
    const filename = art.name.replace(/\//g, '_');
    const ext = path.extname(art.url.split('?')[0]) || (art.name.endsWith('.png') ? '.png' : (art.name.endsWith('.gif') ? '.gif' : '.json'));

    const destRun = path.join(runDir, `${filename}${art.name.includes('.') ? '' : ext}`);
    await downloadFile(art.url, destRun);

    if (art.name === 'anchors/anchor-s') {
      await downloadFile(art.url, path.join(gameMonsterDir, 'anchor-s.png'));
    } else if (art.name === 'anchors/candidate') {
      await downloadFile(art.url, path.join(gameMonsterDir, 'candidate.png'));
    } else if (art.name === 'idle/spritesheet') {
      await downloadFile(art.url, path.join(gameMonsterDir, 'idle_spritesheet.png'));
    } else if (art.name === 'idle/preview') {
      await downloadFile(art.url, path.join(gameMonsterDir, 'idle_preview.gif'));
    } else if (art.name === 'idle/manifest') {
      await downloadFile(art.url, path.join(gameMonsterDir, 'idle_manifest.json'));
    } else if (art.name === 'attack/spritesheet') {
      await downloadFile(art.url, path.join(gameMonsterDir, 'attack_spritesheet.png'));
    } else if (art.name === 'attack/preview') {
      await downloadFile(art.url, path.join(gameMonsterDir, 'attack_preview.gif'));
    } else if (art.name === 'attack/manifest') {
      await downloadFile(art.url, path.join(gameMonsterDir, 'attack_manifest.json'));
    }
  }

  console.log('All artifacts downloaded successfully!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
