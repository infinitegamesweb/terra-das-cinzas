// Script to enqueue and download the Spriterrific Cloud Boss generation
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.SPRITERRIFIC_API_KEY || 'sk_61a1d4edddf17d55414796cf7d44c1256f8514dee168d601';
const BASE_URL = process.env.SPRITERRIFIC_API_BASE || 'https://courteous-mouse-611.convex.site';
const SKILL_VERSION = '1.3.2';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'X-Spriterrific-Skill-Version': SKILL_VERSION,
  'Content-Type': 'application/json'
};

async function checkBalance() {
  const res = await fetch(`${BASE_URL}/api/v1/me`, { headers });
  const data = await res.json();
  console.log('Balance:', JSON.stringify(data));
  return data;
}

async function enqueueBoss() {
  const payload = {
    type: 'character',
    characterName: 'ashen-golem-boss',
    sourcePrompt: 'massive ashen magma golem boss, cracked obsidian rock infused with glowing orange molten lava veins, glowing fiery chest core, spiked stone shoulders, dark fantasy 2D pixel art RPG boss',
    gameView: 'top-down',
    direction: 's',
    actions: ['idle', 'attack'],
    candidatePromptPreset: 'high-fidelity-v1',
    chroma: '#00FF00'
  };

  console.log('Enqueueing Boss job to Spriterrific Cloud API...');
  const res = await fetch(`${BASE_URL}/api/v1/jobs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Enqueue failed:', res.status, data);
    process.exit(1);
  }

  console.log('Job enqueued successfully!');
  console.log('Job ID:', data.jobId);
  console.log(`Live Run URL: https://app.spriterrific.com/jobs/${data.jobId}`);
  console.log('Credits debited:', data.credits);
  return data.jobId;
}

async function pollJob(jobId) {
  console.log(`Polling job ${jobId}...`);
  while (true) {
    await new Promise(r => setTimeout(r, 12000));
    try {
      const res = await fetch(`${BASE_URL}/api/v1/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'X-Spriterrific-Skill-Version': SKILL_VERSION
        }
      });
      const data = await res.json();
      const job = data.job;
      if (!job) {
        console.log('No job object returned yet:', data);
        continue;
      }

      console.log(`[${new Date().toLocaleTimeString()}] Status: ${job.status} | Steps: ${job.steps ? job.steps.map(s => `${s.name}:${s.status}`).join(', ') : 'none'}`);

      if (['completed', 'partial', 'failed', 'canceled'].includes(job.status)) {
        return job;
      }
    } catch (err) {
      console.error('Polling error (will retry):', err.message);
    }
  }
}

async function downloadFile(url, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  console.log(`Saved: ${dest} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  await checkBalance();
  const jobId = await enqueueBoss();
  const job = await pollJob(jobId);

  console.log('Final job status:', job.status);
  console.log('Debited:', job.creditsDebited, '| Refunded:', job.creditsRefunded);

  // Save run files
  const suffix = jobId.slice(-8);
  const runDir = path.resolve(`spriterrific-runs/ashen-golem-boss-${suffix}`);
  const gameMonsterDir = path.resolve(`assets/monsters/boss_ashen_golem`);
  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(gameMonsterDir, { recursive: true });

  fs.writeFileSync(path.join(runDir, 'job.json'), JSON.stringify(job, null, 2));

  if (job.artifacts && job.artifacts.length > 0) {
    for (const art of job.artifacts) {
      console.log(`Artifact: ${art.name} -> ${art.url}`);
      const filename = art.name.replace(/\//g, '_');
      const ext = path.extname(art.url.split('?')[0]) || (art.name.endsWith('.png') ? '.png' : (art.name.endsWith('.gif') ? '.gif' : '.json'));

      // Download into run dir
      const destRun = path.join(runDir, `${filename}${art.name.includes('.') ? '' : ext}`);
      await downloadFile(art.url, destRun);

      // Download key game assets into assets/monsters/boss_ashen_golem/
      if (art.name === 'anchors/anchor-s') {
        await downloadFile(art.url, path.join(gameMonsterDir, 'anchor-s.png'));
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
  }

  console.log('All boss assets successfully downloaded and organized!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
