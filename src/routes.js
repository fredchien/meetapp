import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import OrganizationController from './app/controllers/OrganizationController';
import SubscriptionController from './app/controllers/SubscriptionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// USERS
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// AUTH
routes.use(authMiddleware);

routes.put('/users', UserController.update);

// MEETUP
routes.get('/meetup', MeetupController.index);
routes.post('/meetup', MeetupController.store);
routes.put('/meetup/:idMeetup', MeetupController.update);
routes.delete('/meetup/:idMeetup', MeetupController.delete);

// SUBSCRIPTION
routes.get('/subscription/', SubscriptionController.index);
routes.post('/subscription/:idMeet', SubscriptionController.store);

// ORGANIZATION FIND ALL
routes.get('/organization', OrganizationController.index);

// UPLOAD FILE
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
