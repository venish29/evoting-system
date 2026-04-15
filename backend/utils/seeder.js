// utils/seeder.js — Seeds initial candidates, admin user, and election on first run

const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

const CANDIDATES_SEED = [
  {
    candidateId: 'c001',
    name: 'Priyank Patel',
    party: 'Progressive Alliance',
    partyColor: '#3b82f6',
    partyShort: 'PA',
    position: 'Presidential Candidate',
    age: 54,
    state: 'California',
    bio: 'Former Senator with 18 years of public service. Champion of healthcare reform, clean energy, and economic equity for all citizens.',
    platform: ['Universal Healthcare', 'Clean Energy by 2035', 'Education Reform', 'Living Wage'],
    initials: 'PP',
    bgColor: 'from-blue-500 to-blue-700',
    voteCount: 87420,
  },
  {
    candidateId: 'c002',
    name: 'Mohan Suryvanshi',
    party: 'National Conservative Union',
    partyColor: '#ef4444',
    partyShort: 'NCU',
    position: 'Presidential Candidate',
    age: 61,
    state: 'Texas',
    bio: 'Successful businessman turned senator. Advocates for fiscal responsibility, strong borders, and revitalizing American manufacturing.',
    platform: ['Tax Reduction', 'Border Security', 'Manufacturing Jobs', 'Military Strength'],
    initials: 'MS',
    bgColor: 'from-red-500 to-red-700',
    voteCount: 79850,
  },
  {
    candidateId: 'c003',
    name: 'Shaktirajsinh Jadeja',
    party: 'Citizens Reform Party',
    partyColor: '#10b981',
    partyShort: 'CRP',
    position: 'Presidential Candidate',
    age: 48,
    state: 'New York',
    bio: 'Renowned economist and policy expert. Focused on systemic reform, anti-corruption measures, and building a transparent government.',
    platform: ['Anti-Corruption', 'Economic Reform', 'Tech Innovation', 'Social Justice'],
    initials: 'SJ',
    bgColor: 'from-emerald-500 to-emerald-700',
    voteCount: 41330,
  },
  {
    candidateId: 'c004',
    name: 'Shyam Makvana',
    party: 'Liberty First Party',
    partyColor: '#f59e0b',
    partyShort: 'LFP',
    position: 'Presidential Candidate',
    age: 57,
    state: 'Montana',
    bio: 'Constitutional lawyer and civil liberties advocate. Committed to limited government, personal freedoms, and state sovereignty.',
    platform: ['Constitutional Rights', 'Limited Government', 'State Sovereignty', 'Free Markets'],
    initials: 'SM',
    bgColor: 'from-amber-500 to-amber-700',
    voteCount: 22680,
  },
  {
    candidateId: 'c005',
    name: 'Meet Parmar',
    party: 'Green Earth Coalition',
    partyColor: '#84cc16',
    partyShort: 'GEC',
    position: 'Presidential Candidate',
    age: 43,
    state: 'Oregon',
    bio: 'Environmental scientist and activist. Passionate about climate action, sustainable development, and protecting natural resources for future generations.',
    platform: ['Climate Action', 'Renewable Energy', 'Biodiversity Protection', 'Green Jobs'],
    initials: 'MP',
    bgColor: 'from-lime-500 to-green-600',
    voteCount: 17470,
  },
];

const seeder = async () => {
  try {
    // ── Candidates ──────────────────────────────────────────────────────────
    const candidateCount = await Candidate.countDocuments();
    if (candidateCount === 0) {
      await Candidate.insertMany(CANDIDATES_SEED);
      console.log('🌱 Candidates seeded');
    }

    // ── Admin user ──────────────────────────────────────────────────────────
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        voterId: 'ADMIN001',
        name: 'Venish Parmar',
        email: 'venish@evote.gov',
        password: 'Admin@123',
        dob: '1980-01-01',
        state: 'Washington DC',
        role: 'admin',
      });
      console.log('🌱 Admin user seeded  (voterId: ADMIN001, password: Admin@123)');
    }

    // ── Election info ───────────────────────────────────────────────────────
    const electionExists = await Election.countDocuments();
    if (electionExists === 0) {
      const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
      await Election.create({
        title: '2026 General Presidential Election',
        subtitle: 'Cast your vote for the next President',
        deadline,
        totalRegistered: 248750,
        isActive: true,
      });
      console.log('🌱 Election info seeded');
    }
  } catch (err) {
    console.error('Seeder error:', err.message);
  }
};

module.exports = seeder;
