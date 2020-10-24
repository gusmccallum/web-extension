import Utils from '../Utils';

describe('Utils', () => {
  describe('stripUrl()', () => {
    it('should only return the protocol, host, and path of the input so that all urls are standardized', () => {
      expect(Utils.stripUrl('https://anime-skip.com')).toBe('https://anime-skip.com/');
      expect(Utils.stripUrl('https://anime-skip.com/test')).toBe('https://anime-skip.com/test');
      expect(Utils.stripUrl('https://anime-skip.com/test#heading')).toBe(
        'https://anime-skip.com/test'
      );
      expect(Utils.stripUrl('https://anime-skip.com/test?query=param')).toBe(
        'https://anime-skip.com/test'
      );
      expect(Utils.stripUrl('https://anime-skip.com/test#heading?query=param')).toBe(
        'https://anime-skip.com/test'
      );

      expect(
        Utils.stripUrl(
          'https://www.funimation.com/shows/the-irregular-at-magic-high-school/yokohama-disturbance-part-ii/uncut/?lang=japanese&qid=undefined'
        )
      ).toBe(
        'https://www.funimation.com/shows/the-irregular-at-magic-high-school/yokohama-disturbance-part-ii/uncut/'
      );
    });
  });

  describe('formatSeconds()', () => {
    describe('includeDecimals = true', () => {
      it('should return the correct minutes, seconds, and decimal seconds', () => {
        expect(Utils.formatSeconds(100.247, true)).toBe('1:40.25');
        expect(Utils.formatSeconds(290, true)).toBe('4:50.00');
        expect(Utils.formatSeconds(0, true)).toBe('0:00.00');
        expect(Utils.formatSeconds(20.0, true)).toBe('0:20.00');
        expect(Utils.formatSeconds(5.6, true)).toBe('0:05.60');
        expect(Utils.formatSeconds(7.03, true)).toBe('0:07.03');
        expect(Utils.formatSeconds(65.3, true)).toBe('1:05.30');
        expect(Utils.formatSeconds(65.3, true)).toBe('1:05.30');
      });

      it('should floor the decimal only when it rounds up to the next whole number', () => {
        expect(Utils.formatSeconds(65.996, true)).toBe('1:05.99');
      });
    });

    describe('includeDecimals = false', () => {
      it('should return the correct minutes and floored seconds', () => {
        expect(Utils.formatSeconds(100.247, false)).toBe('1:40');
        expect(Utils.formatSeconds(290, false)).toBe('4:50');
        expect(Utils.formatSeconds(0, false)).toBe('0:00');
        expect(Utils.formatSeconds(20.0, false)).toBe('0:20');
        expect(Utils.formatSeconds(5.6, false)).toBe('0:05');
        expect(Utils.formatSeconds(65.3, false)).toBe('1:05');
        expect(Utils.formatSeconds(65.996, false)).toBe('1:05');
      });
    });
  });

  describe('padLeft()', () => {
    it('should pad the number with zeros', () => {
      expect(Utils.padLeft(123, 0)).toBe('123');
      expect(Utils.padLeft(1, 0)).toBe('1');
      expect(Utils.padLeft(123, 2)).toBe('123');
      expect(Utils.padLeft(1, 2)).toBe('01');
      expect(Utils.padLeft(0, 2)).toBe('00');

      expect(Utils.padLeft('test', 6, ' ')).toBe('  test');
      expect(Utils.padLeft('test', 6, '-')).toBe('--test');
      expect(Utils.padLeft('test', 4, ' ')).toBe('test');
      expect(Utils.padLeft('test', 1, ' ')).toBe('test');
    });
  });

  describe('padRight()', () => {
    it('should pad the number with zeros', () => {
      expect(Utils.padRight(123, 0)).toBe('123');
      expect(Utils.padRight(1, 0)).toBe('1');
      expect(Utils.padRight(123, 2)).toBe('123');
      expect(Utils.padRight(1, 2)).toBe('10');
      expect(Utils.padRight(0, 2)).toBe('00');

      expect(Utils.padRight('test', 6, ' ')).toBe('test  ');
      expect(Utils.padRight('test', 6, '-')).toBe('test--');
      expect(Utils.padRight('test', 4, ' ')).toBe('test');
      expect(Utils.padRight('test', 1, ' ')).toBe('test');
    });
  });

  describe('arrayIncludes()', () => {
    const array = [
      { id: '1', name: 'item 1' },
      { id: '2', name: 'item 2' },
      { id: '3', name: 'item 3' },
      { id: '4' },
    ];

    it('should return true when there is a matching value at the key', () => {
      expect(Utils.arrayIncludes(array, 'id', { id: '1' })).toBeTruthy();
    });

    it('should return false when there is NOT a matching value at the key', () => {
      expect(Utils.arrayIncludes(array, 'name', { id: '4', name: 'item 4' })).toBeFalsy();
    });
  });

  describe('computeTimestampDiffs()', () => {
    it('should return the correct toCreate', () => {
      const oldTimestamps: Api.Timestamp[] = [];
      const newTimestamps: Api.AmbigousTimestamp[] = [
        { id: '0', at: 0, typeId: 'intro', source: 'ANIME_SKIP' },
      ];

      const expectedToCreate: Api.AmbigousTimestamp[] = newTimestamps;
      const expectedToUpdate: Api.Timestamp[] = [];
      const expectedToDelete: Api.Timestamp[] = [];

      const { toCreate, toUpdate, toDelete } = Utils.computeTimestampDiffs(
        oldTimestamps,
        newTimestamps
      );

      expect(toCreate).toEqual(expectedToCreate);
      expect(toUpdate).toEqual(expectedToUpdate);
      expect(toDelete).toEqual(expectedToDelete);
    });

    it('should return the correct toUpdate containing only updated timestamps', () => {
      const oldTimestamps: Api.Timestamp[] = [
        { id: '0', at: 0, typeId: 'intro', source: 'ANIME_SKIP' },
        { id: '1', at: 1, typeId: 'intro', source: 'ANIME_SKIP' },
        { id: '2', at: 2, typeId: 'intro', source: 'ANIME_SKIP' },
      ];
      const newTimestamps: Api.AmbigousTimestamp[] = [
        { id: '0', at: 0, typeId: 'branding', source: 'ANIME_SKIP' },
        { id: '1', at: 1, typeId: 'intro', source: 'ANIME_SKIP' },
        { id: '2', at: 3, typeId: 'intro', source: 'ANIME_SKIP' },
      ];

      const expectedToCreate: Api.AmbigousTimestamp[] = [];
      const expectedToUpdate: Api.Timestamp[] = [
        { id: '0', at: 0, typeId: 'branding', source: 'ANIME_SKIP' },
        { id: '2', at: 3, typeId: 'intro', source: 'ANIME_SKIP' },
      ];
      const expectedToDelete: Api.Timestamp[] = [];

      const { toCreate, toUpdate, toDelete } = Utils.computeTimestampDiffs(
        oldTimestamps,
        newTimestamps
      );

      expect(toCreate).toEqual(expectedToCreate);
      expect(toUpdate).toEqual(expectedToUpdate);
      expect(toDelete).toEqual(expectedToDelete);
    });

    it('should return the correct toDelete', () => {
      const oldTimestamps: Api.Timestamp[] = [
        { id: '0', at: 0, typeId: 'branding', source: 'ANIME_SKIP' },
      ];
      const newTimestamps: Api.AmbigousTimestamp[] = [];

      const expectedToCreate: Api.AmbigousTimestamp[] = [];
      const expectedToUpdate: Api.Timestamp[] = [];
      const expectedToDelete: Api.Timestamp[] = oldTimestamps;

      const { toCreate, toUpdate, toDelete } = Utils.computeTimestampDiffs(
        oldTimestamps,
        newTimestamps
      );

      expect(toCreate).toEqual(expectedToCreate);
      expect(toUpdate).toEqual(expectedToUpdate);
      expect(toDelete).toEqual(expectedToDelete);
    });

    it('should return the correct toCreate, toUpdate (only updated items), toDelete for a complete example', () => {
      const oldTimestamps: Api.Timestamp[] = [
        { id: '0', at: 0, typeId: 'branding', source: 'ANIME_SKIP' },
        { id: '1', at: 2, typeId: 'recap', source: 'ANIME_SKIP' },
        { id: '2', at: 4, typeId: 'intro', source: 'BETTER_VRV' },
        { id: '3', at: 6, typeId: 'cannon', source: 'ANIME_SKIP' },
        { id: '4', at: 8, typeId: 'credits', source: 'ANIME_SKIP' },
        { id: '5', at: 8, typeId: 'filler', source: 'ANIME_SKIP' },
      ];
      const newTimestamps: Api.AmbigousTimestamp[] = [
        { id: '0', at: 1, typeId: 'filler', source: 'ANIME_SKIP' },
        { id: '1', at: 2, typeId: 'recap', source: 'ANIME_SKIP' },
        { id: '2', at: 3, typeId: 'intro', source: 'BETTER_VRV' },
        { id: '6', at: 4, typeId: 'filler', source: 'ANIME_SKIP' },
        { id: '3', at: 6, typeId: 'cannon', source: 'ANIME_SKIP' },
        { id: '7', at: 7, typeId: 'credits', source: 'ANIME_SKIP' },
        { id: '8', at: 8, typeId: 'preview', source: 'ANIME_SKIP' },
      ];

      const expectedToCreate: Api.AmbigousTimestamp[] = [
        { id: '6', at: 4, typeId: 'filler', source: 'ANIME_SKIP' },
        { id: '7', at: 7, typeId: 'credits', source: 'ANIME_SKIP' },
        { id: '8', at: 8, typeId: 'preview', source: 'ANIME_SKIP' },
      ];
      const expectedToUpdate: Api.Timestamp[] = [
        { id: '0', at: 1, typeId: 'filler', source: 'ANIME_SKIP' },
        { id: '2', at: 3, typeId: 'intro', source: 'BETTER_VRV' },
      ];
      const expectedToDelete: Api.Timestamp[] = [
        { id: '4', at: 8, typeId: 'credits', source: 'ANIME_SKIP' },
        { id: '5', at: 8, typeId: 'filler', source: 'ANIME_SKIP' },
      ];

      const { toCreate, toUpdate, toDelete } = Utils.computeTimestampDiffs(
        oldTimestamps,
        newTimestamps
      );

      expect(toCreate).toEqual(expectedToCreate);
      expect(toUpdate).toEqual(expectedToUpdate);
      expect(toDelete).toEqual(expectedToDelete);
    });
  });
});
