// src/components/CandidateCard.jsx
import React, { useState } from 'react';
import { MapPin, Calendar, CheckCircle, Vote } from 'lucide-react';
import { Modal } from './UI';
import { Badge } from './UI';

const CandidateCard = ({ candidate, onVote, hasVoted, votedCandidateId, loading }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const isVotedFor = votedCandidateId === candidate.id;
  const canVote = !hasVoted && !loading;

  return (
    <>
      <div className={`card p-6 flex flex-col gap-4 animate-slide-up group relative overflow-hidden
        ${isVotedFor ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-navy-950' : ''}
        ${hasVoted && !isVotedFor ? 'opacity-60' : ''}
      `}>
        {/* Voted badge */}
        {isVotedFor && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              <CheckCircle className="w-3.5 h-3.5" />
              YOUR VOTE
            </span>
          </div>
        )}

        {/* Candidate Avatar + Info */}
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${candidate.bgColor} flex items-center justify-center text-white font-display font-bold text-xl shadow-lg flex-shrink-0`}>
            {candidate.initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white leading-tight">
              {candidate.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: candidate.partyColor }}
              >
                {candidate.partyShort}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{candidate.party}</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {candidate.state}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Age {candidate.age}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
          {candidate.bio}
        </p>

        {/* Platform tags */}
        <div className="flex flex-wrap gap-1.5">
          {candidate.platform.slice(0, 3).map(item => (
            <Badge key={item} color="gray">{item}</Badge>
          ))}
          {candidate.platform.length > 3 && (
            <Badge color="gray">+{candidate.platform.length - 3} more</Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-gray-100 dark:border-navy-700">
          <button
            onClick={() => setDetailOpen(true)}
            className="btn-secondary flex-1 justify-center text-sm py-2.5"
          >
            View Profile
          </button>
          <button
            onClick={() => canVote && onVote(candidate)}
            disabled={!canVote}
            className={`btn-vote flex-1 justify-center text-sm py-2.5
              ${isVotedFor ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-none' : ''}
              ${hasVoted && !isVotedFor ? 'opacity-40 cursor-not-allowed bg-gray-400 from-gray-400 to-gray-400 shadow-none hover:transform-none' : ''}
            `}
          >
            {isVotedFor ? (
              <><CheckCircle className="w-4 h-4" /> Voted</>
            ) : (
              <><Vote className="w-4 h-4" /> Vote</>
            )}
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Candidate Profile" size="md">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${candidate.bgColor} flex items-center justify-center text-white font-display font-bold text-2xl shadow-lg`}>
              {candidate.initials}
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">{candidate.name}</h3>
              <p className="text-sm font-medium mt-0.5" style={{ color: candidate.partyColor }}>{candidate.party}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{candidate.state}</span>
                <span>Age {candidate.age}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">About</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{candidate.bio}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Platforms</h4>
            <div className="grid grid-cols-2 gap-2">
              {candidate.platform.map(item => (
                <div key={item} className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-navy-800 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: candidate.partyColor }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-navy-700 flex gap-3">
            <button
              onClick={() => { setDetailOpen(false); if (canVote) onVote(candidate); }}
              disabled={!canVote}
              className={`btn-vote flex-1 justify-center ${!canVote ? 'opacity-40 cursor-not-allowed hover:transform-none' : ''}`}
            >
              {isVotedFor ? <><CheckCircle className="w-4 h-4" /> You Voted Here</> : <><Vote className="w-4 h-4" /> Cast Vote</>}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CandidateCard;
