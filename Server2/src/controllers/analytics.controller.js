import { analyticsModel } from '../models/analytics.model.js'

export const analyticsController = {
  async getSubjectTime(req, res, next) {
    try {
      const result = await analyticsModel.getSubjectTime(req.query)
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  async getDaily(req, res, next) {
    try {
      const result = await analyticsModel.getDaily(req.query)
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },
}
