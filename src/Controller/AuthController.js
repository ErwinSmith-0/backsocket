import authModel from "../DB/Model/authModel.js";
import roomModel from "../DB/Model/roomModel.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { comparePassword, hashPassword } from "../Utils/SecuringPassword.js";

const createProfile = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = hashPassword(password);
    const User = await authModel.findOne({ username });
    if (!User) {
      //   const User = await authModel.create();
      let authData = {
        username,
        password: hashedPassword,
      };
      const Auth = new authModel(authData);
      await Auth.save();
      //   const token = await OtptokenGen({ authData });
      return next(
        CustomSuccess.createSuccess(
          { authData: Auth },
          // { token },
          "user created and logged in",
          200
        )
      );
    }
    const isPasswordValid = comparePassword(password, User.password);
    if (!isPasswordValid) {
      return next(CustomError.unauthorized("Invalid Password"));
    }
    // const token = await OtptokenGen({ authData });
    return next(
      CustomSuccess.createSuccess(
        { authData: User },
        // { token },
        "user logged in",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const getall = async (req, res, next) => {
  const result = await authModel.find();
  if (!result) {
    return next(
      CustomSuccess.createSuccess(
        {},
        // { token },
        "no users",
        200
      )
    );
  }
  return next(
    CustomSuccess.createSuccess(
      result,
      // { token },
      "All users",
      200
    )
  );
};

const room = async (req, res, next) => {
  try {
    const { sender, receiver } = req.body;

    let room = await roomModel.findOne({ sender: sender, receiver: receiver });

    if (!room) {
      room = await roomModel.findOne({ sender: receiver, receiver: sender });

      if (!room) {
        const roomData = {
          sender: sender,
          receiver: receiver,
        };
        room = await roomModel.create(roomData);
        // await room.save();
        return res
          .status(201)
          .json({ success: true, data: room, message: "Room created" });
      }
    }

    return res
      .status(201)
      .json({ success: true, data: room, message: "Room exist" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getsenderreceiver = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    const names = await roomModel
      .findOne({
        _id: roomId,
      })
      .populate({
        path: "sender",
        select: "username",
      })
      .populate({
        path: "receiver",
        select: "username ",
      })
      .select("-messages");
    const data = {
      sender: names.sender,
      receiver: names.receiver,
    };
    return next(
      CustomSuccess.createSuccess(
        data,
        // { token },
        "All usernames",
        200
      )
    );
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Project.find(query)
//   .populate({
//      path: 'pages',
//      populate: {
//        path: 'components',
//        model: 'Component'
//      }
//   })
//   .exec(function(err, docs) {});

const AuthController = {
  createProfile,
  getall,
  room,
  getsenderreceiver,
};

export default AuthController;
