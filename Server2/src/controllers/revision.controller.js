import { revisionModel } from '../models/revision.model.js'

export const revisionController = {
  async getAll(req, res, next) {
    try {
      const result = await revisionModel.findAll(req.query)
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  async create(req, res, next) {
    try {
      const created = await revisionModel.create(req.payload)
      res.status(201).json(created.rows[0])
    } catch (err) {
      next(err)
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params
      const { payload } = req

      const current = await revisionModel.findById(id)
      if (!current.rows[0]) return res.status(404).json({ error: 'Revision item not found' })

      const row = current.rows[0]
      const nextIsDone = payload.is_done ?? row.is_done
      const nextDoneAt = nextIsDone ? row.done_at ?? new Date().toISOString() : null

      const updated = await revisionModel.updateById(id, {
        subject_id: payload.subject_id ?? row.subject_id,
        topic: payload.topic ?? row.topic,
        scheduled_at: payload.scheduled_at ?? row.scheduled_at,
        is_done: nextIsDone,
        done_at: nextDoneAt,
      })
      res.json(updated.rows[0])
    } catch (err) {
      next(err)
    }
  },

  async remove(req, res, next) {
    try {
      await revisionModel.deleteById(req.params.id)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}
