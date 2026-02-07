import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository.js';
import { EmailService } from './email.service.js';

export class PasswordService {
  static async requestPasswordReset(email) {
    const user = await UserRepository.findByEmail(email);
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return { success: true, message: 'Si el email existe, se enviará un correo con instrucciones' };
    }

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Expira en 1 hora

    // Guardar token en la base de datos
    await UserRepository.updateResetToken(user._id, resetToken, resetExpires);

    // Enviar email
    await EmailService.sendPasswordResetEmail(user.email, resetToken);

    return { success: true, message: 'Si el email existe, se enviará un correo con instrucciones' };
  }

  static async resetPassword(token, newPassword) {
    // Buscar usuario con token válido (no expirado)
    const user = await UserRepository.findByResetToken(token);
    
    if (!user) {
      throw new Error('Token inválido o expirado');
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const isSamePassword = await UserRepository.checkPasswordChanged(newPassword, user.password);
    if (isSamePassword) {
      throw new Error('La nueva contraseña no puede ser igual a la anterior');
    }

    // Actualizar contraseña y limpiar token
    await UserRepository.updateById(user._id, {
      password: newPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    });

    return { success: true, message: 'Contraseña restablecida exitosamente' };
  }
}




