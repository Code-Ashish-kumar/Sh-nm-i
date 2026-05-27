import express from 'express'
import { z } from 'zod'

import { revisionController } from '../controllers/revision.controller.js'

export const revisionsRouter = express.Router()

const querySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

const createSchema = z.object({
  subject_id: z.string().uuid().nullable().optional(),
  topic: z.string().min(1),
  scheduled_at: z.string().datetime(),
})

const patchSchema = z.object({
  subject_id: z.string().uuid().nullable().optional(),
  topic: z.string().min(1).optional(),
  scheduled_at: z.string().datetime().optional(),
  is_done: z.boolean().optional(),
})

revisionsRouter.get('/', (req, res, next) => {
  try {
    req.query = querySchema.parse(req.query ?? {})
    next()
  } catch (err) {
    next(err)
  }
}, revisionController.getAll)

revisionsRouter.post('/', (req, res, next) => {
  try {
    req.payload = createSchema.parse(req.body ?? {})
    next()
  } catch (err) {
    next(err)
  }
}, revisionController.create)

revisionsRouter.patch('/:id', (req, res, next) => {
  try {
    z.string().uuid().parse(req.params.id)
    req.payload = patchSchema.parse(req.body ?? {})
    next()
  } catch (err) {
    next(err)
  }
}, revisionController.update)

revisionsRouter.delete('/:id', (req, res, next) => {
  try {
    z.string().uuid().parse(req.params.id)
    next()
  } catch (err) {
    next(err)
  }
}, revisionController.remove)
