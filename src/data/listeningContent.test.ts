import { describe, it, expect } from 'vitest';
import {
  listeningTracks,
  getTrackById,
  getTracksByLevel,
  getTracksByType,
} from './listeningContent';

describe('listeningContent', () => {
  it('has at least 10 tracks', () => {
    expect(listeningTracks.length).toBeGreaterThanOrEqual(10);
  });

  it('has at least 5 dialogues', () => {
    expect(getTracksByType('dialogue').length).toBeGreaterThanOrEqual(5);
  });

  it('has at least 5 monologues', () => {
    expect(getTracksByType('monologue').length).toBeGreaterThanOrEqual(5);
  });

  it('all tracks have exactly 5 questions', () => {
    for (const track of listeningTracks) {
      expect(track.questions.length).toBe(5);
    }
  });

  it('all questions have a valid correctIndex', () => {
    for (const track of listeningTracks) {
      for (const q of track.questions) {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      }
    }
  });

  it('all tracks have a positive duration', () => {
    for (const track of listeningTracks) {
      expect(track.duration).toBeGreaterThan(0);
    }
  });

  describe('getTrackById', () => {
    it('returns the correct track for a known id', () => {
      const track = getTrackById('lt-001');
      expect(track).toBeDefined();
      expect(track?.title).toBe('At the Coffee Shop');
    });

    it('returns undefined for an unknown id', () => {
      expect(getTrackById('lt-999')).toBeUndefined();
    });
  });

  describe('getTracksByLevel', () => {
    it('returns only tracks of the given CEFR level', () => {
      const b1Tracks = getTracksByLevel('B1');
      for (const t of b1Tracks) {
        expect(t.level).toBe('B1');
      }
    });

    it('covers at least 4 different CEFR levels', () => {
      const levels = new Set(listeningTracks.map((t) => t.level));
      expect(levels.size).toBeGreaterThanOrEqual(4);
    });
  });
});
