import * as Yup from 'yup';
import { Op } from 'sequelize';
import { isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      order: ['date'],
      include: [User],
      limit: 10,
      offset: 10 * page - 10,
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const { title, location, date, file_id, description } = req.body;

    /**
     * Check for past dates
     */

    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }

    const meetup = await Meetup.create({
      title,
      location,
      date,
      file_id,
      description,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      file_id: Yup.number(),
      description: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const meetupdate = await Meetup.findOne({
      where: {
        user_id: req.userId,
        id: req.params.idMeetup,
      },
    });

    if (!meetupdate) {
      return res.status(400).json({ error: 'This meetup is not your' });
    }

    if (meetupdate.past) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }

    const meetUpUpdate = await meetupdate.update(req.body);

    return res.json(meetUpUpdate);
  }

  async delete(req, res) {
    const meetupdelete = await Meetup.findOne({
      where: {
        user_id: req.userId,
        id: req.params.idMeetup,
      },
    });

    if (!meetupdelete) {
      return res.status(400).json({ error: 'This meetup is not your' });
    }

    if (meetupdelete.past) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }

    await meetupdelete.destroy(req.params.idMeetup);

    return res.send();
  }
}

export default new MeetupController();
