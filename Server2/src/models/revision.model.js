import { pool } from '../db.js'

export const revisionModel = {
  findAll({ from, to }) {
    return pool.query(
      `
      select id, subject_id, topic, scheduled_at, is_done, created_at, done_at
      from revision_items
      where ($1::timestamptz is null or scheduled_at >= $1::timestamptz)
        and ($2::timestamptz is null or scheduled_at <= $2::timestamptz)
      order by scheduled_at asc
      `,
      [from ?? null, to ?? null],
    )
  },

  findById(id) {
    return pool.query(
      `select id, subject_id, topic, scheduled_at, is_done, created_at, done_at from revision_items where id = $1`,
      [id],
    )
  },

  create({ subject_id, topic, scheduled_at }) {
    return pool.query(
      `
      insert into revision_items (subject_id, topic, scheduled_at)
      values ($1, $2, $3)
      returning id, subject_id, topic, scheduled_at, is_done, created_at, done_at
      `,
      [subject_id ?? null, topic, scheduled_at],
    )
  },

  updateById(id, { subject_id, topic, scheduled_at, is_done, done_at }) {
    return pool.query(
      `
      update revision_items
      set subject_id = $2, topic = $3, scheduled_at = $4, is_done = $5, done_at = $6
      where id = $1
      returning id, subject_id, topic, scheduled_at, is_done, created_at, done_at
      `,
      [id, subject_id, topic, scheduled_at, is_done, done_at],
    )
  },

  deleteById(id) {
    return pool.query(`delete from revision_items where id = $1`, [id])
  },
}
