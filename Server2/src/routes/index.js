import express from 'express'

import { timerSettingsRouter } from './timerSettings.routes.js'
import { themesRouter } from './theme.routes.js'
import { todosRouter } from './todo.routes.js'
import { subjectsRouter } from './subject.routes.js'
import { sessionsRouter } from './session.routes.js'
import { revisionsRouter } from './revision.routes.js'
import { analyticsRouter } from './analytics.routes.js'

export const apiRouter = express.Router()

apiRouter.use('/timer-settings', timerSettingsRouter)
apiRouter.use('/themes', themesRouter)
apiRouter.use('/todos', todosRouter)
apiRouter.use('/subjects', subjectsRouter)
apiRouter.use('/sessions', sessionsRouter)
apiRouter.use('/revisions', revisionsRouter)
apiRouter.use('/analytics', analyticsRouter)
