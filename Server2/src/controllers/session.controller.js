import { sessionModel } from '../models/session.model.js'

export const sessionController = {
  async getAll(req, res, next) {
    try {
      const result = await sessionModel.findAll(req.query)
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  async create(req, res, next) {
    try {
      const created = await sessionModel.create(req.payload)
      res.status(201).json(created.rows[0])
    } catch (err) {
      next(err)
    }
  },
}
