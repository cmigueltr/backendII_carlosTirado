export class UserDTO {
  constructor(user) {
    this.id = user._id || user.id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.age = user.age;
    this.role = user.role;
    // No incluimos: password, resetPasswordToken, resetPasswordExpires
  }

  static fromUser(user) {
    if (!user) return null;
    return new UserDTO(user);
  }

  static fromUsers(users) {
    return users.map(user => UserDTO.fromUser(user));
  }
}




