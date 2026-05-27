import { subjectModel } from '../models/subject.model.js'

export const subjectController = {
  async getAll(req, res, next) {
    try {
      const result = await subjectModel.findAll()
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  async create(req, res, next) {
    try {
      const created = await subjectModel.upsert(req.payload)
      res.status(201).json(created.rows[0])
    } catch (err) {
      next(err)
    }
  },
}
