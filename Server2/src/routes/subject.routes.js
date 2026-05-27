import express from 'express'
import { z } from 'zod'

import { subjectController } from '../controllers/subject.controller.js'

export const subjectsRouter = express.Router()

const createSchema = z.object({
  name: z.string().min(1),
})

subjectsRouter.get('/', subjectController.getAll)

subjectsRouter.post('/', (req, res, next) => {
  try {
    req.payload = createSchema.parse(req.body ?? {})
    next()
  } catch (err) {
    next(err)
  }
}, subjectController.create)
