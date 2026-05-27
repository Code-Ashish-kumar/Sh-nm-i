import express from 'express'
import { z } from 'zod'

import { todoController } from '../controllers/todo.controller.js'

export const todosRouter = express.Router()

const createSchema = z.object({
  text: z.string().min(1),
  theme_id: z.string().uuid().nullable().optional(),
})

const patchSchema = z.object({
  text: z.string().min(1).optional(),
  is_done: z.boolean().optional(),
  theme_id: z.string().uuid().nullable().optional(),
})

const validate = (schema) => (req, res, next) => {
  try {
    req.payload = schema.parse(req.body ?? {})
    next()
  } catch (err) {
    next(err)
  }
}

todosRouter.get('/', (req, res, next) => {
  try {
    const themeIdRaw = req.query.themeId
    req.themeId =
      typeof themeIdRaw === 'string' && themeIdRaw.length > 0
        ? z.string().uuid().parse(themeIdRaw)
        : null
    next()
  } catch (err) {
    next(err)
  }
}, todoController.getAll)

todosRouter.post('/', validate(createSchema), todoController.create)

todosRouter.patch('/:id', (req, res, next) => {
  try {
    z.string().uuid().parse(req.params.id)
    req.payload = patchSchema.parse(req.body ?? {})
    next()
  } catch (err) {
    next(err)
  }
}, todoController.update)

todosRouter.delete('/:id', (req, res, next) => {
  try {
    z.string().uuid().parse(req.params.id)
    next()
  } catch (err) {
    next(err)
  }
}, todoController.remove)
