import { Op } from 'sequelize';

import User from '../models/User';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';

import Mail from '../../lib/Mail';

class SubscriptionController {
  async index(req, res) {
    // lista somente as inscriçoes do usuario logado que ainda nao aconteceram
    const listAll = await Subscription.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });
    return res.json(listAll);
  }

  async store(req, res) {
    // pegando infos do usuario logado
    const user = await User.findByPk(req.userId);
    // buscando meetup + infos do usuario que criou
    const meetUp = await Meetup.findByPk(req.params.idMeet, {
      include: [User],
    });

    // O usuário não pode se inscrever em meetups que já aconteceram.
    if (meetUp.past === true) {
      return res.status(400).json({ error: 'Event has already happened' });
    }

    if (user.id === meetUp.User.id) {
      return res
        .status(400)
        .json({ error: 'Cant subscribe to you own meetups' });
    }

    // O usuário não pode se inscrever no mesmo meetup duas vezes.
    const searchSub = await Subscription.findOne({
      where: {
        meetup_id: req.params.idMeet,
        user_id: user.id,
      },
    });

    if (searchSub) {
      return res
        .status(400)
        .json({ error: 'User already registered in the event' });
    }

    // O usuário não pode se inscrever em dois meetups que acontecem no mesmo horário.
    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetUp.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same time" });
    }

    const subscript = await Subscription.create({
      meetup_id: req.params.idMeet,
      user_id: user.id,
    });

    await Mail.sendMail({
      to: `${meetUp.User.name} <${meetUp.User.email}>`,
      subject: 'Você tem um novo inscrito',
      template: 'subscription',
      context: {
        user: meetUp.User.name,
        subName: user.name,
        subEmail: user.email,
      },
    });

    return res.json(subscript);
  }
}

export default new SubscriptionController();
