import express from 'express'
import { z } from 'zod'

import { timerSettingsController } from '../controllers/timerSettings.controller.js'

export const timerSettingsRouter = express.Router()

const putActiveSchema = z.object({
  name: z.string().min(1).optional(),
  work_minutes: z.number().int().positive().optional(),
  short_break_minutes: z.number().int().positive().optional(),
  long_break_minutes: z.number().int().positive().optional(),
  long_break_every: z.number().int().positive().optional(),
})

timerSettingsRouter.get('/active', timerSettingsController.getActive)

timerSettingsRouter.put('/active', (req, res, next) => {
  try {
    req.payload = putActiveSchema.parse(req.body ?? {})
    next()
  } catch (err) {
    next(err)
  }
}, timerSettingsController.upsertActive)
