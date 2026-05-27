import express from 'express'
import { z } from 'zod'

import { analyticsController } from '../controllers/analytics.controller.js'

export const analyticsRouter = express.Router()

const rangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

const validateRange = (req, res, next) => {
  try {
    req.query = rangeSchema.parse(req.query ?? {})
    next()
  } catch (err) {
    next(err)
  }
}

analyticsRouter.get('/subject-time', validateRange, analyticsController.getSubjectTime)
analyticsRouter.get('/daily', validateRange, analyticsController.getDaily)
