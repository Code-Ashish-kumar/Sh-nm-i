import { pool } from '../db.js'

export const timerSettingsModel = {
  findActive() {
    return pool.query(`
      select id, name, work_minutes, short_break_minutes, long_break_minutes, long_break_every, updated_at
      from timer_settings
      where is_active = true
      limit 1
    `)
  },

  create({ name, work_minutes, short_break_minutes, long_break_minutes, long_break_every }) {
    return pool.query(
      `
      insert into timer_settings (name, work_minutes, short_break_minutes, long_break_minutes, long_break_every, is_active)
      values ($1, $2, $3, $4, $5, true)
      returning id, name, work_minutes, short_break_minutes, long_break_minutes, long_break_every, updated_at
      `,
      [name, work_minutes, short_break_minutes, long_break_minutes, long_break_every],
    )
  },

  updateById(id, { name, work_minutes, short_break_minutes, long_break_minutes, long_break_every }) {
    return pool.query(
      `
      update timer_settings
      set
        name = $2,
        work_minutes = $3,
        short_break_minutes = $4,
        long_break_minutes = $5,
        long_break_every = $6,
        updated_at = now()
      where id = $1
      returning id, name, work_minutes, short_break_minutes, long_break_minutes, long_break_every, updated_at
      `,
      [id, name, work_minutes, short_break_minutes, long_break_minutes, long_break_every],
    )
  },
}
