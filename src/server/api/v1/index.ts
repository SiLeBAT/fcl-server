import * as express from 'express';
import { institutionsRouter } from './../../authentication';
import { uploadRouter, validationRouter } from './../../sampleManagement';

export const router = express.Router();

router.use('/institutions', institutionsRouter);
router.use('/upload', uploadRouter);
router.use('/validation', validationRouter);
