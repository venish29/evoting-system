// src/pages/ResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { fetchResults } from '../services/api';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import { RefreshCw, Award, TrendingUp, Users, BarChart2 } from 'lucide-react';
import { PageLoader, StatCard } from '../components/UI';
import { formatNumber, formatPct } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const CHART_VIEWS = ['bar', 'doughnut', 'pie'];

const ResultsPage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('bar');
  const [refreshing, setRefreshing] = useState(false);
  const { dark } = useTheme();

  const load = async () => {
    const data = await fetchResults();
    setResults(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const refresh = () => { setRefreshing(true); load(); };

  if (loading) return <PageLoader text="Fetching results..." />;

  const sorted = [...results.candidates].sort((a, b) => b.voteCount - a.voteCount);
  const winner = sorted[0];
  const gridColor = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const tickColor = dark ? '#94a3b8' : '#6b7280';
  const textColor = dark ? '#f1f5f9' : '#1e293b';

  const chartData = {
    labels: sorted.map(c => c.name.split(' ').slice(0, 2).join(' ')),
    datasets: [{
      label: 'Votes',
      data: sorted.map(c => c.voteCount),
      backgroundColor: sorted.map(c => c.partyColor + 'CC'),
      borderColor: sorted.map(c => c.partyColor),
      borderWidth: 2,
      borderRadius: 10,
      hoverBackgroundColor: sorted.map(c => c.partyColor),
    }],
  };

  const pieData = {
    labels: sorted.map(c => c.name.split(' ').slice(0, 2).join(' ')),
    datasets: [{
      data: sorted.map(c => c.voteCount),
      backgroundColor: sorted.map(c => c.partyColor + 'CC'),
      borderColor: sorted.map(c => c.partyColor),
      borderWidth: 2,
      hoverOffset: 10,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeInOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: dark ? '#1e293b' : '#fff',
        titleColor: textColor,
        bodyColor: tickColor,
        borderColor: dark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: ctx => ` ${formatNumber(ctx.parsed.y)} votes (${formatPct(ctx.parsed.y, results.total)}%)`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: tickColor, font: { family: "'DM Sans'", size: 12 } },
        border: { display: false },
      },
      y: {
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: tickColor, font: { family: "'DM Sans'", size: 12 }, callback: v => formatNumber(v) },
        border: { display: false },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { animateRotate: true, animateScale: true, duration: 1000 },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: textColor, padding: 16, font: { family: "'DM Sans'", size: 12 }, usePointStyle: true, pointStyleWidth: 10 },
      },
      tooltip: {
        backgroundColor: dark ? '#1e293b' : '#fff',
        titleColor: textColor,
        bodyColor: tickColor,
        borderColor: dark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: ctx => ` ${formatNumber(ctx.parsed)} votes (${formatPct(ctx.parsed, results.total)}%)`,
        },
      },
    },
  };

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Live Election Results</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">2024 General Presidential Election · Updated in real-time</p>
        </div>
        <button onClick={refresh} disabled={refreshing} className="btn-secondary self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Votes Cast" value={formatNumber(results.total)} color="blue" />
        <StatCard icon={TrendingUp} label="Voter Turnout" value={`${results.turnout}%`} sub="of registered voters" color="green" />
        <StatCard icon={Award} label="Leading" value={winner.name.split(' ')[0]} sub={formatPct(winner.voteCount, results.total) + '% of votes'} color="amber" />
        <StatCard icon={BarChart2} label="Candidates" value={results.candidates.length} sub="on the ballot" color="purple" />
      </div>

      {/* Chart Controls */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">Vote Distribution</h2>
          <div className="flex gap-2">
            {CHART_VIEWS.map(v => (
              <button key={v} onClick={() => setChartView(v)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize
                  ${chartView === v ? 'bg-navy-600 text-white shadow-md' : 'bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-navy-700'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72 sm:h-96">
          {chartView === 'bar' && <Bar data={chartData} options={barOptions} />}
          {chartView === 'doughnut' && <Doughnut data={pieData} options={{ ...pieOptions, cutout: '65%' }} />}
          {chartView === 'pie' && <Pie data={pieData} options={pieOptions} />}
        </div>
      </div>

      {/* Detailed Leaderboard */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-5">Candidate Rankings</h2>
        <div className="space-y-4">
          {sorted.map((c, i) => {
            const pct = parseFloat(formatPct(c.voteCount, results.total));
            const isLeading = i === 0;
            return (
              <div key={c.id} className={`p-4 rounded-2xl border transition-all ${isLeading ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10' : 'border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-800/50'}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold
                      ${i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                        i === 1 ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300' :
                        'bg-gray-100 text-gray-500 dark:bg-navy-700 dark:text-gray-400'}`}>
                      {i + 1}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.bgColor} flex items-center justify-center text-white font-display font-bold shadow-md`}>
                      {c.initials}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{c.name}</h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: c.partyColor }}>
                          {c.party}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-bold text-xl text-gray-900 dark:text-white">{pct}%</div>
                        <div className="text-sm text-gray-500">{formatNumber(c.voteCount)} votes</div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-navy-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: c.partyColor }}
                      />
                    </div>
                  </div>
                  {isLeading && (
                    <Award className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 dark:text-gray-600 text-center pb-4">
        Results shown are unofficial and may not reflect final certified vote counts. Last updated: {new Date().toLocaleString()}
      </p>
    </div>
  );
};

export default ResultsPage;
