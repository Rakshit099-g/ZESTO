
import axios from "axios";
import { oauth2client } from "../config/googleConfig.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../middleware/trycatch.js";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import crypto from "node:crypto"
import RefreshToken from "../model/RefreshToken.js";




export const loginUser = TryCatch(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      message: "Authorization code is required",
    });
  }

  const googleRes = await oauth2client.getToken(code);
  oauth2client.setCredentials(googleRes.tokens);

  const userRes = await axios.get(
    "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    {
      headers: {
        Authorization: `Bearer ${googleRes.tokens.access_token}`,
      },
    }
  );

  const { email, name, picture } = userRes.data;


  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture,
    });
  }

  const accessToken = jwt.sign(
  { userId: user._id, type: "access" },
  process.env.ACCESS_TOKEN_SECRET as string,
  { expiresIn: "15m" }
);

const refreshToken = jwt.sign(
  { userId: user._id, type: "refresh" },
  process.env.REFRESH_TOKEN_SECRET as string,
  { expiresIn: "7d" }
);

const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
// Save refresh token hash in MongoDB
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    revoked: false,
  });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

res.cookie("accessToken", accessToken, {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000,
});

res.cookie("refreshToken", refreshToken, {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

return res.status(200).json({
  message: "Login successful",
  user,
});
})

// export const refreshAccessToken = TryCatch(async(req,res)=>{
//   const refershToken = req.cookies?.refershToken;
//   if(!refershToken){
//     return res.status(401).json({
//       message:"Please login again",
//     });
//   }
//   try{
//     const decode = jwt.verify(refershToken,process.env.REFRESH_TOKEN_SECRET as string) as {userId:string}
//     const accessToken = jwt.sign(
//       {userId:decode.userId},
//       process.env.ACCESS_TOKEN_SECRET as string,
//       {expiresIn:"15m"}
//     ) 
//     res.cookie("accessToken",accessToken,{
//       httpOnly:true,
//       secure:process.env.NODE_ENV==="production",
//       sameSite:"lax",
//       maxAge:15*60*1000,
//       path:"/"
//     })
//     return res.status(200).json({
//         message: "Access token refreshed",
//       });
//     } catch {
//       return res.status(401).json({
//         message: "Refresh token expired. Please login again.",
//       });
//     }
// })

export const myProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    return res.status(200).json(user);
  }
)
export const refreshAccessToken = TryCatch(async (req, res) => {
  const oldRefreshToken = req.cookies?.refreshToken;

  if (!oldRefreshToken) {
    return res.status(401).json({
      message: "Please login again",
    });
  }

  let decoded: { userId: string; type: string };

  try {
    decoded = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { userId: string; type: string };
  } catch {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }

  if (decoded.type !== "refresh") {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(oldRefreshToken)
    .digest("hex");

  // Purane token ko sirf ek baar use hone do
  const savedToken = await RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      userId: decoded.userId,
      revoked: false,
      expiresAt: { $gt: new Date() },
    },
    { $set: { revoked: true } },
    { new: true }
  );

  if (!savedToken) {
    return res.status(401).json({
      message: "Refresh token revoked or already used",
    });
  }

  const accessToken = jwt.sign(
    { userId: decoded.userId, type: "access" },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "15m" }
  );

  const newRefreshToken = jwt.sign(
    { userId: decoded.userId, type: "refresh" },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "7d" }
  );

  const newTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  await RefreshToken.create({
    userId: decoded.userId,
    tokenHash: newTokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    revoked: false,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", newRefreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "Tokens refreshed successfully",
  });
});


export const logoutUser = TryCatch(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await RefreshToken.updateOne(
      { tokenHash, revoked: false },
      { $set: { revoked: true } }
    );
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});