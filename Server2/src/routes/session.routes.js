import express from 'express'
import { z } from 'zod'

import { sessionController } from '../controllers/session.controller.js'

export const sessionsRouter = express.Router()

const querySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  subjectId: z.string().uuid().optional(),
})

const createSchema = z.object({
  subject_id: z.string().uuid().nullable().optional(),
  theme_id: z.string().uuid().nullable().optional(),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime(),
  duration_seconds: z.number().int().positive(),
  kind: z.enum(['work', 'break']),
  note: z.string().max(500).nullable().optional(),
})

sessionsRouter.get('/', (req, res, next) => {
  try {
    req.query = querySchema.parse(req.query ?? {})
    next()
  } catch (err) {
    next(err)
  }
}, sessionController.getAll)

sessionsRouter.post('/', (req, res, next) => {
  try {
    req.payload = createSchema.parse(req.body ?? {})
    next()
  } catch (err) {
    next(err)
  }
}, sessionController.create)
