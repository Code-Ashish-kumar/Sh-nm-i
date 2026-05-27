import { pool } from '../db.js'

export const subjectModel = {
  findAll() {
    return pool.query(`select id, name from subjects order by name asc`)
  },

  upsert({ name }) {
    return pool.query(
      `
      insert into subjects (name)
      values ($1)
      on conflict (name) do update set name = excluded.name
      returning id, name
      `,
      [name],
    )
  },
}
