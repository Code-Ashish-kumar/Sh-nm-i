import { themeModel } from '../models/theme.model.js'

export const themeController = {
  async getAll(req, res, next) {
    try {
      const result = await themeModel.findAll()
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  async create(req, res, next) {
    try {
      const created = await themeModel.create(req.payload)
      res.status(201).json(created.rows[0])
    } catch (err) {
      next(err)
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params
      const { payload } = req

      const current = await themeModel.findById(id)
      if (!current.rows[0]) return res.status(404).json({ error: 'Theme not found' })

      const row = current.rows[0]
      const updated = await themeModel.updateById(id, {
        name: payload.name ?? row.name,
        background_type: payload.background_type ?? row.background_type,
        background_value: payload.background_value ?? row.background_value,
        accent: payload.accent ?? row.accent,
        spotify_embed_url: payload.spotify_embed_url ?? row.spotify_embed_url,
      })
      res.json(updated.rows[0])
    } catch (err) {
      next(err)
    }
  },
}
