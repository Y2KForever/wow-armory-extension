import { useMemo, useRef, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { motion } from 'framer-motion';
import { ApiCharacter, AchievementDefinition } from '@/types/Characters';
import { useFetchAchievementCategoryQuery, useFetchAchievementTreeQuery } from '@/store/api/characters';
import { Spinner } from '@/assets/icons/Spinner';
import { Trophy } from '@/assets/icons/Trophy';
import { FeatOfStrength } from '@/assets/icons/FeatOfStrength';
import {
  buildCategoryProgress,
  countColor,
  formatEarnedDate,
  overallProgress,
  percent,
  progressFill,
  rarityColor,
  sortAchievements,
} from '@/lib/achievements';

const Chevron = ({ size = 9 }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className="flex-none fill-none stroke-blizzard-gold-dim"
    strokeWidth={2.6}
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const SectionRule = ({ label, hint }: { label: string; hint?: string }) => (
  <div
    className="flex items-center flex-none gap-[7px] h-[19px] px-[9px]"
    style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.22),rgba(0,0,0,0) 72%)' }}
  >
    <span className="text-[8.5px] font-semibold tracking-[.16em] whitespace-nowrap text-blizzard-gold-mid">
      {label}
    </span>
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.5),transparent)' }} />
    {hint && <span className="text-[8px] font-medium text-[#6f6141]">{hint}</span>}
  </div>
);

const ProgressBar = ({ pct }: { pct: number }) => (
  <div className="h-[5px] bg-black/50" style={{ boxShadow: 'inset 0 0 0 1px rgba(138,109,20,.25)' }}>
    <div className="h-full" style={{ width: `${pct}%`, background: progressFill(pct) }} />
  </div>
);

const StatHeader = ({
  points,
  pct,
  earned,
  showPct,
}: {
  points: number;
  pct: number;
  earned: string;
  showPct: boolean;
}) => (
  <div
    className="flex flex-col flex-none border-b border-[rgba(138,109,20,.4)]"
    style={{ background: 'linear-gradient(180deg,#14120c,#0a0b0d)' }}
  >
    <div className="flex items-center h-[46px] gap-[10px] px-[11px]">
      <div
        className="flex items-center justify-center flex-none w-[28px] h-[28px]"
        style={{
          background: 'linear-gradient(180deg,#2a2210,#141108)',
          boxShadow: 'inset 0 1px 0 rgba(242,206,78,.25), 0 0 0 1px #6b5420',
        }}
      >
        <Trophy className="w-[15px] h-[15px] fill-blizzard-yellow text-blizzard-yellow" />
      </div>
      <div className="flex items-baseline min-w-0 gap-[6px]">
        <span
          className="font-friz text-[21px] leading-none text-blizzard-yellow"
          style={{ textShadow: '0 1px 3px #000' }}
        >
          {points.toLocaleString()}
        </span>
        <span className="text-[8px] font-semibold tracking-[.13em] text-blizzard-gold-mute">POINTS</span>
      </div>
      <div className="flex flex-col items-end flex-none ml-auto gap-[2px]">
        <div className="flex items-baseline gap-[5px]">
          <span className="text-[8px] font-semibold tracking-[.13em] text-blizzard-gold-mute">COMPLETED</span>
          <span className="text-[12px] font-bold leading-none text-[#d8d3c6]">{showPct ? `${pct}%` : '—'}</span>
        </div>
        <span className="text-[8.5px] whitespace-nowrap text-[#6f6141]">{earned}</span>
      </div>
    </div>
  </div>
);

const AchievementRow = ({
  achievement,
  earned,
  onHover,
}: {
  achievement: AchievementDefinition;
  earned: boolean;
  onHover: (achievement: AchievementDefinition | null, top: number) => void;
}) => (
  <div
    onMouseEnter={(event) => onHover(achievement, event.currentTarget.getBoundingClientRect().top)}
    onMouseLeave={() => onHover(null, 0)}
    className="flex items-center gap-[8px] h-[32px] px-[10px] border-b border-white/[.03] hover:bg-[rgba(221,172,0,.06)]"
  >
    <div
      className="flex-none w-[20px] h-[20px] bg-cover bg-center"
      style={{
        backgroundImage: `url(${achievement.icon})`,
        filter: earned ? 'none' : 'grayscale(1)',
        opacity: earned ? 1 : 0.4,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.8), 0 0 0 1px rgba(138,109,20,.4)',
      }}
    />
    <span
      className="flex-1 min-w-0 text-[9.5px] truncate"
      style={{ color: earned ? rarityColor(achievement.points) : '#5f5744' }}
    >
      {achievement.name}
    </span>
    {earned && (
      <svg viewBox="0 0 24 24" width="10" height="10" className="flex-none fill-none stroke-[#7fc994]" strokeWidth={3}>
        <path d="M5 13l4.5 4.5L19 7" />
      </svg>
    )}
    {achievement.points > 0 ? (
      <span
        className="flex-none w-[16px] text-right text-[9.5px] font-bold"
        style={{ color: earned ? '#ddac00' : '#4b4639' }}
      >
        {achievement.points}
      </span>
    ) : (
      <span className="flex flex-none justify-end w-[16px]">
        <FeatOfStrength className="w-[14px] h-[14px]" style={{ color: earned ? '#c9a53c' : '#4b4639' }} />
      </span>
    )}
  </div>
);

const AchievementTooltip = ({
  achievement,
  earned,
  top,
}: {
  achievement: AchievementDefinition;
  earned: boolean;
  top: number;
}) => (
  <div
    className="absolute left-[10px] right-[10px] z-20 flex flex-col gap-[3px] px-[9px] pt-[7px] pb-[8px] border border-blizzard-gold-dim"
    style={{
      top,
      background: 'linear-gradient(180deg,rgba(14,13,9,.98),rgba(5,6,8,.98))',
      boxShadow: '0 4px 20px rgba(0,0,0,.85), inset 0 0 0 1px rgba(0,0,0,.8)',
    }}
  >
    <div className="flex items-baseline gap-[6px]">
      <span
        className="flex-1 min-w-0 text-[11.5px] font-semibold leading-[1.25]"
        style={{ color: rarityColor(achievement.points) }}
      >
        {achievement.name}
      </span>
      {achievement.points > 0 ? (
        <span className="flex-none text-[10.5px] font-bold text-blizzard-yellow">{achievement.points}</span>
      ) : (
        <FeatOfStrength className="flex-none w-[14px] h-[14px] text-blizzard-gold-mid" />
      )}
    </div>
    {achievement.description && (
      <>
        <div className="h-px" style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.7),transparent)' }} />
        <span className="text-[10.5px] leading-[1.35] text-[#c3bdad]">{achievement.description}</span>
      </>
    )}
    <div className="flex items-baseline gap-[6px]">
      <span className="text-[9.5px]" style={{ color: earned ? '#7fc994' : '#6f6141' }}>
        {earned ? 'Earned' : 'Not earned'}
      </span>
      {achievement.points === 0 && <span className="ml-auto text-[9px] text-blizzard-gold-mid">Feat of Strength</span>}
    </div>
  </div>
);

type Crumb = { categoryId: number; subcategoryId: number | null; title: string };

export const AchievementsView = ({ character }: { character: ApiCharacter }) => {
  const [crumb, setCrumb] = useState<Crumb | null>(null);
  const [hovered, setHovered] = useState<{ achievement: AchievementDefinition; top: number } | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { data: tree, isLoading, isError } = useFetchAchievementTreeQuery();
  const { data: detail, isFetching: isDetailFetching } = useFetchAchievementCategoryQuery(
    { categoryId: crumb?.categoryId ?? 0 },
    { skip: !crumb },
  );

  const recent = useMemo(() => (character.achievements?.recent ?? []).slice(0, 6), [character]);
  const earned = useMemo(() => new Set(character.achievements?.earned_ids ?? []), [character]);
  const categories = useMemo(() => buildCategoryProgress(tree?.categories ?? [], earned), [tree, earned]);
  const overall = useMemo(() => overallProgress(tree?.categories ?? [], earned), [tree, earned]);

  const points = character.achievements?.points ?? 0;

  const notIndexed = isError || (!isLoading && (tree?.categories?.length ?? 0) === 0);

  const handleHover = (achievement: AchievementDefinition | null, top: number) => {
    if (!achievement) return setHovered(null);
    const bounds = bodyRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const offset = top - bounds.top;
    const flip = offset > bounds.height - 96;
    setHovered({ achievement, top: flip ? Math.max(4, offset - 90) : offset + 34 });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Spinner className="animate-spin fill-blizzard-gold-dim" />
      </div>
    );
  }

  const subcategory = crumb?.subcategoryId
    ? detail?.subcategories.find((sub) => sub.id === crumb.subcategoryId)
    : undefined;

  const items = subcategory
    ? subcategory.achievements
    : crumb && detail && detail.subcategories.length === 0
      ? detail.achievements
      : null;

  const crumbCount = (() => {
    if (!crumb || !detail) return '';
    const list = items ?? [...detail.achievements, ...detail.subcategories.flatMap((sub) => sub.achievements)];
    const have = list.filter((achievement) => earned.has(achievement.id)).length;
    return `${have}/${list.length}`;
  })();

  return (
    <motion.div
      key="achievements"
      className="flex flex-col flex-1 min-h-0 font-semplicita"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <StatHeader
        points={points}
        pct={overall.pct}
        earned={notIndexed ? 'awaiting nightly index' : `${overall.have} of ${overall.total} earned`}
        showPct={!notIndexed}
      />

      {crumb && (
        <div
          onClick={() => setCrumb(crumb.subcategoryId ? { ...crumb, subcategoryId: null } : null)}
          className="flex items-center flex-none gap-[7px] h-[26px] px-[9px] border-b border-[rgba(138,109,20,.45)] hover:cursor-pointer"
          style={{ background: 'linear-gradient(180deg,rgba(221,172,0,.12),rgba(0,0,0,.4))' }}
        >
          <svg
            viewBox="0 0 24 24"
            width="11"
            height="11"
            className="flex-none fill-none stroke-blizzard-gold-mid"
            strokeWidth={2.4}
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
          <span className="text-[10px] font-semibold truncate text-[#f2ce4e]">
            {subcategory ? subcategory.name : crumb.title}
          </span>
          <span className="flex-none text-[9px] whitespace-nowrap text-[#6f6141]">
            {subcategory ? crumb.title : ''}
          </span>
          <span className="flex-none ml-auto text-[9.5px] font-bold text-blizzard-yellow">{crumbCount}</span>
        </div>
      )}

      <div ref={bodyRef} className="relative flex flex-col flex-1 min-h-0">
        <SimpleBar className="flex-1 min-h-0" style={{ width: '100%' }}>
          {!crumb && (
            <>
              {recent.length > 0 && (
                <>
                  <SectionRule label="RECENTLY EARNED" />
                  {recent.map((entry) => (
                    <div
                      key={entry.id}
                      onMouseEnter={(event) => handleHover(entry, event.currentTarget.getBoundingClientRect().top)}
                      onMouseLeave={() => handleHover(null, 0)}
                      className="flex items-center gap-[8px] h-[36px] px-[10px] border-b border-white/[.035] hover:bg-[rgba(221,172,0,.07)]"
                    >
                      <div
                        className="flex-none w-[24px] h-[24px] bg-cover bg-center"
                        style={{
                          backgroundImage: entry.icon ? `url(${entry.icon})` : undefined,
                          backgroundColor: '#14120c',
                          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.8), 0 0 0 1px rgba(138,109,20,.5)',
                        }}
                      />
                      <div className="flex flex-col flex-1 min-w-0 gap-px">
                        <span className="text-[10px] font-medium truncate" style={{ color: rarityColor(entry.points) }}>
                          {entry.name}
                        </span>
                        <span className="text-[8.5px] text-[#5f5744]">{formatEarnedDate(entry.completed)}</span>
                      </div>
                      {entry.points > 0 ? (
                        <div className="flex items-center flex-none gap-[3px]">
                          <Trophy className="flex-none w-[9px] h-[9px] fill-blizzard-gold-dim text-blizzard-gold-dim" />
                          <span className="text-[10px] font-bold text-blizzard-yellow">{entry.points}</span>
                        </div>
                      ) : (
                        <FeatOfStrength className="flex-none w-[14px] h-[14px] text-blizzard-gold-mid" />
                      )}
                    </div>
                  ))}
                </>
              )}

              <SectionRule label="BY CATEGORY" hint={notIndexed ? undefined : 'tap to open'} />
              {notIndexed && (
                <div className="flex flex-col gap-[4px] px-[10px] py-[12px]">
                  <span className="text-[10px] text-[#8d8674]">Categories have not been indexed yet.</span>
                  <span className="text-[9px] leading-[1.4] text-[#5f5744]">
                    They are rebuilt nightly — check back tomorrow.
                  </span>
                </div>
              )}
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setCrumb({ categoryId: category.id, subcategoryId: null, title: category.name })}
                  className="flex flex-col gap-[3px] pt-[7px] pb-[8px] px-[10px] border-b border-white/[.03] hover:cursor-pointer hover:bg-[rgba(221,172,0,.08)]"
                >
                  <div className="flex items-baseline gap-[7px]">
                    <span className="min-w-0 text-[9.5px] truncate text-[#d8d3c6]">{category.name}</span>
                    {category.subcategoryCount > 0 && (
                      <span className="flex-none text-[8px] whitespace-nowrap text-[#4b4639]">
                        {category.subcategoryCount} sections
                      </span>
                    )}
                    <span className="flex-none ml-auto text-[8.5px] text-[#5f5744]">{category.total}</span>
                    <span className="flex-none text-[10px] font-bold" style={{ color: countColor(category.pct) }}>
                      {category.have}
                    </span>
                    <Chevron />
                  </div>
                  <ProgressBar pct={category.pct} />
                </div>
              ))}
            </>
          )}

          {crumb && isDetailFetching && (
            <div className="flex items-center justify-center py-6">
              <Spinner className="animate-spin fill-blizzard-gold-dim" />
            </div>
          )}

          {crumb && !isDetailFetching && detail && !items && (
            <>
              {detail.subcategories.map((sub) => {
                const have = sub.achievements.filter((achievement) => earned.has(achievement.id)).length;
                const pct = percent(have, sub.achievements.length);
                return (
                  <div
                    key={sub.id}
                    onClick={() => setCrumb({ ...crumb, subcategoryId: sub.id })}
                    className="flex flex-col gap-[4px] pt-[9px] pb-[10px] px-[10px] border-b border-[rgba(138,109,20,.2)] hover:cursor-pointer hover:bg-[rgba(221,172,0,.08)]"
                  >
                    <div className="flex items-baseline gap-[7px]">
                      <span className="min-w-0 text-[11px] font-medium truncate text-[#e8e4da]">{sub.name}</span>
                      <span className="flex-none ml-auto text-[8.5px] text-[#5f5744]">{sub.achievements.length}</span>
                      <span className="flex-none text-[10.5px] font-bold" style={{ color: countColor(pct) }}>
                        {have}
                      </span>
                      <Chevron size={10} />
                    </div>
                    <ProgressBar pct={pct} />
                  </div>
                );
              })}
              {detail.achievements.length > 0 &&
                sortAchievements(detail.achievements, earned).map((achievement) => (
                  <AchievementRow
                    key={achievement.id}
                    achievement={achievement}
                    earned={earned.has(achievement.id)}
                    onHover={handleHover}
                  />
                ))}
            </>
          )}

          {crumb && !isDetailFetching && items && (
            <>
              {sortAchievements(items, earned).map((achievement) => (
                <AchievementRow
                  key={achievement.id}
                  achievement={achievement}
                  earned={earned.has(achievement.id)}
                  onHover={handleHover}
                />
              ))}
            </>
          )}
        </SimpleBar>
        {hovered && (
          <AchievementTooltip
            achievement={hovered.achievement}
            earned={earned.has(hovered.achievement.id)}
            top={hovered.top}
          />
        )}
        <div
          className="absolute bottom-0 left-0 right-0 h-[24px] pointer-events-none"
          style={{ background: 'linear-gradient(180deg,rgba(8,9,12,0),rgba(8,9,12,.95))' }}
        />
      </div>
    </motion.div>
  );
};
