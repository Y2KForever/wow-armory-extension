import { useMemo, useState } from 'react';
import { WowCharacter } from '@/types/Characters';
import { removeSpace } from '@/lib/utils';

type SortKey = 'level' | 'name';

interface ICharacterPickerProps {
  characters: WowCharacter[];
  selected: Set<number>;
  onToggle: (id: number) => void;
  onSetMany: (ids: number[], on: boolean) => void;
}

const Checkbox = ({ on, size = 14 }: { on: boolean; size?: number }) => (
  <div
    className="flex items-center justify-center flex-none"
    style={{
      width: size,
      height: size,
      background: on ? '#ddac00' : 'rgba(0,0,0,.5)',
      border: `1px solid ${on ? '#f2ce4e' : '#4a3f22'}`,
    }}
  >
    {on && (
      <svg viewBox="0 0 24 24" width={size - 4} height={size - 4} className="fill-none stroke-[#231a02]" strokeWidth={3.5}>
        <path d="M5 13l4.5 4.5L19 7" />
      </svg>
    )}
  </div>
);

export const CharacterPicker = ({ characters, selected, onToggle, onSetMany }: ICharacterPickerProps) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('level');

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = characters.filter(
      (character) =>
        !needle ||
        character.name.toLowerCase().includes(needle) ||
        character.realm.name.toLowerCase().includes(needle) ||
        character.class.toLowerCase().includes(needle),
    );

    const byRealm = new Map<string, WowCharacter[]>();
    for (const character of matched) {
      const key = `${character.realm.name}|${character.faction}|${character.namespace}`;
      const bucket = byRealm.get(key);
      if (bucket) bucket.push(character);
      else byRealm.set(key, [character]);
    }

    return [...byRealm.entries()].map(([key, rows]) => {
      const [realm, faction, namespace] = key.split('|');
      rows.sort((a, b) =>
        sort === 'level' ? b.level - a.level || a.name.localeCompare(b.name) : a.name.localeCompare(b.name),
      );
      return { key, realm, faction, namespace, rows };
    });
  }, [characters, query, sort]);

  const visibleIds = groups.flatMap((group) => group.rows.map((row) => row.id));

  return (
    <div className="flex flex-col flex-1 min-h-0 pt-[14px] px-[18px]">
      <div className="flex items-center flex-none gap-[8px]">
        <span className="text-[9.5px] font-semibold tracking-[.16em] text-blizzard-gold-mid">
          CHOOSE WHAT TO IMPORT
        </span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.5),transparent)' }} />
        <span className="text-[11px] text-[#6f6752]">{characters.length} found</span>
      </div>

      <div className="flex items-center flex-none gap-[8px] pt-[11px] pb-[12px]">
        <div className="flex items-center flex-1 gap-[8px] h-[32px] px-[10px] bg-black/50 border border-[#332b18]">
          <svg viewBox="0 0 24 24" width="13" height="13" className="flex-none fill-none stroke-[#6f6752]" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="M16.5 16.5L21 21" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name, realm, or class"
            className="flex-1 min-w-0 h-[30px] bg-transparent border-0 outline-none text-[12px] text-[#e8e4da] placeholder:text-[#5a5445]"
          />
          {query && (
            <div onClick={() => setQuery('')} className="flex flex-none text-[#6f6752] hover:text-[#f2ce4e] hover:cursor-pointer">
              <svg viewBox="0 0 24 24" width="13" height="13" className="fill-none stroke-current" strokeWidth={2}>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </div>
          )}
        </div>
        <PickerButton onClick={() => setSort(sort === 'level' ? 'name' : 'level')}>
          <svg viewBox="0 0 24 24" width="12" height="12" className="flex-none fill-none stroke-current" strokeWidth={2}>
            <path d="M7 4v16M7 20l-3-3M7 20l3-3M14 7h7M14 12h5M14 17h3" />
          </svg>
          {sort === 'level' ? 'Level' : 'Name'}
        </PickerButton>
        <PickerButton onClick={() => onSetMany(visibleIds, true)}>Select all</PickerButton>
        <PickerButton onClick={() => onSetMany(visibleIds, false)} danger>
          Clear
        </PickerButton>
      </div>

      <div
        className="flex flex-col flex-1 min-h-0 border border-[rgba(138,109,20,.4)]"
        style={{ background: 'linear-gradient(180deg,rgba(138,109,20,.06),rgba(0,0,0,.25))' }}
      >
        <div
          className="flex items-center flex-none h-[22px] px-[12px]"
          style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.2),rgba(0,0,0,0) 88%)' }}
        >
          <span className="flex-none w-[24px]" />
          <span className="flex-1 text-[8.5px] font-semibold tracking-[.14em] text-blizzard-gold-mid">CHARACTER</span>
          <span className="flex-none w-[38px] text-right text-[8.5px] font-semibold tracking-[.1em] text-blizzard-gold-mid">
            LVL
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {groups.map((group) => {
            const ids = group.rows.map((row) => row.id);
            const allOn = ids.every((id) => selected.has(id));
            return (
              <div key={group.key}>
                <div
                  onClick={() => onSetMany(ids, !allOn)}
                  className="flex items-center gap-[8px] h-[28px] px-[12px] border-t border-[rgba(138,109,20,.22)] hover:cursor-pointer hover:bg-[rgba(221,172,0,.07)]"
                  style={{ background: 'linear-gradient(90deg,rgba(255,255,255,.05),rgba(255,255,255,0) 70%)' }}
                >
                  <Checkbox on={allOn} size={12} />
                  <span className="font-friz text-[12px] tracking-[.03em] text-blizzard-gold-mid">{group.realm}</span>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: group.faction?.toLowerCase() === 'horde' ? '#c14b4b' : '#5b8dd6' }}
                  >
                    {group.faction}
                  </span>
                  <span className="text-[10px] text-[#4b4639]">{group.namespace}</span>
                  <div
                    className="flex-1 h-px"
                    style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.28),transparent)' }}
                  />
                  <span className="text-[10px] font-medium text-[#5a5445]">{group.rows.length}</span>
                </div>

                {group.rows.map((character) => {
                  const on = selected.has(character.id);
                  return (
                    <div
                      key={character.id}
                      onClick={() => onToggle(character.id)}
                      className="flex items-center h-[40px] px-[12px] border-b border-[rgba(255,255,255,.035)] hover:cursor-pointer hover:bg-[rgba(221,172,0,.09)]"
                      style={{ background: on ? 'rgba(221,172,0,.06)' : 'transparent' }}
                    >
                      <div className="flex items-center flex-none w-[24px]">
                        <Checkbox on={on} />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 gap-px">
                        <span
                          className={`text-[13px] font-semibold leading-[1.15] truncate text-class-${removeSpace(
                            character.class,
                          )}`}
                          style={{ textShadow: '0 1px 2px #000' }}
                        >
                          {character.name}
                        </span>
                        <span className="text-[10.5px] leading-[1.15] text-[#6f6752]">
                          {character.race} {character.class}
                        </span>
                      </div>
                      <span className="flex-none w-[38px] text-right text-[12px] font-medium text-[#c3bdad]">
                        {character.level}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {groups.length === 0 && (
            <div className="py-[40px] px-[12px] text-center text-[12px] text-[#5a5445]">
              No characters match that filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PickerButton = ({
  onClick,
  danger,
  children,
}: {
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center flex-none gap-[7px] h-[32px] px-[11px] border border-[#332b18] text-[11px] font-medium text-[#9c8c5f] hover:cursor-pointer ${
      danger ? 'hover:text-[#c14b4b] hover:border-[#5a2323]' : 'hover:text-[#f2ce4e] hover:border-blizzard-gold-dim'
    }`}
    style={{ background: 'linear-gradient(180deg,#1b1810,#100e09)' }}
  >
    {children}
  </div>
);
