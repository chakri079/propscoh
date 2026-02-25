import userService from "../services/user.service";

let userController = {
  add: async (req, res, next) => {
    try {
      const user = await userService.create(req.body);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  get: async (req, res, next) => {
    try {
      const users = await userService.getAll();
      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },

  find: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await userService.getProfile(id);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await userService.updateProfile(id, req.body);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await userService.deleteAccount(id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

export default userController;
