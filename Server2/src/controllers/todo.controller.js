import { todoModel } from '../models/todo.model.js'

export const todoController = {
  async getAll(req, res, next) {
    try {
      const result = await todoModel.findAll(req.themeId ?? null)
      res.json(result.rows)
    } catch (err) {
      next(err)
    }
  },

  async create(req, res, next) {
    try {
      const created = await todoModel.create(req.payload)
      res.status(201).json(created.rows[0])
    } catch (err) {
      next(err)
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params
      const { payload } = req

      const current = await todoModel.findById(id)
      if (!current.rows[0]) return res.status(404).json({ error: 'Todo not found' })

      const row = current.rows[0]
      const nextIsDone = payload.is_done ?? row.is_done
      const nextDoneAt = nextIsDone ? row.done_at ?? new Date().toISOString() : null

      const updated = await todoModel.updateById(id, {
        text: payload.text ?? row.text,
        is_done: nextIsDone,
        theme_id: payload.theme_id ?? row.theme_id,
        done_at: nextDoneAt,
      })
      res.json(updated.rows[0])
    } catch (err) {
      next(err)
    }
  },

  async remove(req, res, next) {
    try {
      await todoModel.deleteById(req.params.id)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}
