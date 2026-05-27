import { pool } from '../db.js'

export const sessionModel = {
  findAll({ from, to, subjectId }) {
    return pool.query(
      `
      select id, subject_id, theme_id, started_at, ended_at, duration_seconds, kind, note
      from pomodoro_sessions
      where ($1::timestamptz is null or started_at >= $1::timestamptz)
        and ($2::timestamptz is null or ended_at <= $2::timestamptz)
        and ($3::uuid is null or subject_id = $3::uuid)
      order by started_at desc
      `,
      [from ?? null, to ?? null, subjectId ?? null],
    )
  },

  create({ subject_id, theme_id, started_at, ended_at, duration_seconds, kind, note }) {
    return pool.query(
      `
      insert into pomodoro_sessions (subject_id, theme_id, started_at, ended_at, duration_seconds, kind, note)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning id, subject_id, theme_id, started_at, ended_at, duration_seconds, kind, note
      `,
      [subject_id ?? null, theme_id ?? null, started_at, ended_at, duration_seconds, kind, note ?? null],
    )
  },
}
