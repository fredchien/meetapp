import Meetup from '../models/Meetup';

class OrganizationController {
  async index(req, res) {
    const loggedUser = req.userId;

    const listMeet = await Meetup.findAll({
      where: { user_id: loggedUser },
    });
    return res.json(listMeet);
  }
}

export default new OrganizationController();
