import passport from 'passport';
import LocalStrategy from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { UserRepository } from '../repositories/user.repository.js';

const LocalStrategyCtor = LocalStrategy.Strategy;

export default function initPassport() {
  // Local strategy for login (email + password)
  passport.use('local', new LocalStrategyCtor(
    { usernameField: 'email', passwordField: 'password', session: false },
    async (email, password, done) => {
      try {
        const user = await UserRepository.findByEmail(email);
        if (!user) return done(null, false, { message: 'Usuario no encontrado' });

        const valid = await UserRepository.verifyPassword(password, user.password);
        if (!valid) return done(null, false, { message: 'Contraseña incorrecta' });

        const safeUser = user.toObject();
        delete safeUser.password;
        return done(null, safeUser);
      } catch (err) {
        return done(err);
      }
    }
  ));

  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  };

  const jwtVerify = async (jwt_payload, done) => {
    try {
      // payload will include sub (user id) when we sign token
      const userId = jwt_payload.sub;
      const user = await UserRepository.findById(userId);
      if (!user) return done(null, false, { message: 'Token válido, usuario no encontrado' });
      
      const safeUser = user.toObject();
      delete safeUser.password;
      return done(null, safeUser);
    } catch (err) {
      return done(err, false);
    }
  };

  // jwt strategy (named 'jwt')
  passport.use('jwt', new JwtStrategy(jwtOptions, jwtVerify));

  // strategy 'current' (consigna) - same behavior as jwt
  passport.use('current', new JwtStrategy(jwtOptions, jwtVerify));
}
