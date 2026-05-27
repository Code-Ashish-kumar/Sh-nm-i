import { timerSettingsModel } from '../models/timerSettings.model.js'

export const timerSettingsController = {
  async getActive(req, res, next) {
    try {
      const result = await timerSettingsModel.findActive()
      res.json(result.rows[0] ?? null)
    } catch (err) {
      next(err)
    }
  },

  async upsertActive(req, res, next) {
    try {
      const { payload } = req

      const current = await timerSettingsModel.findActive()
      if (!current.rows[0]) {
        const created = await timerSettingsModel.create({
          name: payload.name ?? 'Default',
          work_minutes: payload.work_minutes ?? 25,
          short_break_minutes: payload.short_break_minutes ?? 5,
          long_break_minutes: payload.long_break_minutes ?? 15,
          long_break_every: payload.long_break_every ?? 4,
        })
        return res.json(created.rows[0])
      }

      const row = current.rows[0]
      const updated = await timerSettingsModel.updateById(row.id, {
        name: payload.name ?? row.name,
        work_minutes: payload.work_minutes ?? row.work_minutes,
        short_break_minutes: payload.short_break_minutes ?? row.short_break_minutes,
        long_break_minutes: payload.long_break_minutes ?? row.long_break_minutes,
        long_break_every: payload.long_break_every ?? row.long_break_every,
      })
      res.json(updated.rows[0])
    } catch (err) {
      next(err)
    }
  },
}
