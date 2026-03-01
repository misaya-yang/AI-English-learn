import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';
import { adminSelect } from '../_shared/supabase-admin.ts';

interface ContentTrackRow {
  id: string;
  exam_type: 'IELTS' | 'TOEFL';
  skill: 'writing' | 'speaking' | 'reading' | 'listening';
  band_target: string;
  title: string;
  source: string;
  license: string;
  attribution?: string;
}

interface ContentUnitRow {
  id: string;
  track_id: string;
  title: string;
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  estimated_minutes: number;
  learning_objectives: string[];
  item_ids: string[];
  source: string;
  license: string;
  attribution?: string;
  created_at: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const auth = await requireAuthenticatedUser(req);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const examType = body.examType === 'TOEFL' ? 'TOEFL' : 'IELTS';
    const skill = body.skill || 'writing';
    const bandTarget = typeof body.bandTarget === 'string' ? body.bandTarget : '';

    const tracks = await adminSelect<ContentTrackRow>('content_tracks', {
      select: 'id,exam_type,skill,band_target,title,source,license,attribution',
      eq: {
        is_published: true,
        exam_type: examType,
        skill,
      },
      order: { column: 'updated_at', ascending: false },
      limit: 50,
    });

    const filteredTracks = bandTarget
      ? tracks.filter((track) => track.band_target === bandTarget)
      : tracks;

    if (filteredTracks.length === 0) {
      return jsonResponse({ examType, skill, bandTarget: bandTarget || null, units: [] });
    }

    const trackIds = filteredTracks.map((track) => track.id);

    const units = await adminSelect<ContentUnitRow>('content_units', {
      select:
        'id,track_id,title,cefr_level,estimated_minutes,learning_objectives,item_ids,source,license,attribution,created_at',
      in: { track_id: trackIds },
      order: { column: 'created_at', ascending: false },
      limit: 200,
    });

    const payload = units.map((unit) => ({
      id: unit.id,
      trackId: unit.track_id,
      title: unit.title,
      cefrLevel: unit.cefr_level,
      estimatedMinutes: unit.estimated_minutes,
      learningObjectives: Array.isArray(unit.learning_objectives) ? unit.learning_objectives : [],
      itemIds: Array.isArray(unit.item_ids) ? unit.item_ids : [],
      source: unit.source,
      license: unit.license,
      attribution: unit.attribution,
      createdAt: unit.created_at,
    }));

    return jsonResponse({
      examType,
      skill,
      bandTarget: bandTarget || null,
      units: payload,
      provider: 'edge',
    });
  } catch (error) {
    console.error('[content-units] error', error);
    return jsonResponse(
      {
        error: 'content_units_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});
