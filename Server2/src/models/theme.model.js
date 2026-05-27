import { pool } from '../db.js'

export const themeModel = {
  findAll() {
    return pool.query(`
      select id, name, background_type, background_value, accent, spotify_embed_url, created_at
      from themes
      order by created_at desc
    `)
  },

  findById(id) {
    return pool.query(
      `
      select id, name, background_type, background_value, accent, spotify_embed_url, created_at
      from themes
      where id = $1
      `,
      [id],
    )
  },

  create({ name, background_type, background_value, accent, spotify_embed_url }) {
    return pool.query(
      `
      insert into themes (name, background_type, background_value, accent, spotify_embed_url)
      values ($1, $2, $3, $4, $5)
      returning id, name, background_type, background_value, accent, spotify_embed_url, created_at
      `,
      [name, background_type, background_value, accent, spotify_embed_url],
    )
  },

  updateById(id, { name, background_type, background_value, accent, spotify_embed_url }) {
    return pool.query(
      `
      update themes
      set
        name = $2,
        background_type = $3,
        background_value = $4,
        accent = $5,
        spotify_embed_url = $6
      where id = $1
      returning id, name, background_type, background_value, accent, spotify_embed_url, created_at
      `,
      [id, name, background_type, background_value, accent, spotify_embed_url],
    )
  },
}
