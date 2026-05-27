import express from 'express'
import { z } from 'zod'

import { themeController } from '../controllers/theme.controller.js'

export const themesRouter = express.Router()

const createThemeSchema = z.object({
  name: z.string().min(1),
  background_type: z.string().min(1),
  background_value: z.string().min(1),
  accent: z.string().min(1),
  spotify_embed_url: z.string().url(),
})

const updateThemeSchema = createThemeSchema.partial()

const validate = (schema) => (req, res, next) => {
  try {
    req.payload = schema.parse(req.body ?? {})
    next()
  } catch (err) {
    next(err)
  }
}

themesRouter.get('/', themeController.getAll)
themesRouter.post('/', validate(createThemeSchema), themeController.create)
themesRouter.put('/:id', validate(updateThemeSchema), themeController.update)
