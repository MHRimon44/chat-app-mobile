import { initials, mergeUniqueById } from './listHelpers';

describe('chat list helpers', () => {
  it('merges cursor pages without duplicates and keeps authoritative updates', () => {
    expect(
      mergeUniqueById(
        [{ id: '1', value: 'old' }],
        [
          { id: '1', value: 'new' },
          { id: '2', value: 'two' },
        ],
      ),
    ).toEqual([
      { id: '1', value: 'new' },
      { id: '2', value: 'two' },
    ]);
  });

  it('builds bounded initials', () => {
    expect(initials('  Ada Lovelace Byron ')).toBe('AL');
  });
});
