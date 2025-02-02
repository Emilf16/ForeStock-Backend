import mongoose, { Document, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    authentication: {
      password: { type: String, required: true, select: false },
      salt: { type: String, required: true, select: false },
      sessionToken: { type: String, select: false },
    },
    role: { type: String, enum: [ 'employee', 'customer'], default: 'customer' },
  },
  { timestamps: true } // Agregar timestamps para createdAt y updatedAt
);

export interface IUser extends Document {
  username: string;
  email: string;
  authentication: {
    password: string;
    salt: string;
    sessionToken: string;
  };
  role:  'employee' | 'customer';
}

export const UserModel = mongoose.model<IUser>('User', userSchema);


// Obtener todos los usuarios
export const getUsers = () => UserModel.find();

// Obtener un usuario por email
export const getUserByEmail = (email: string) => UserModel.findOne({ email });

// Obtener un usuario por sessionToken
export const getUserBySessionToken = (sessionToken: string) =>
  UserModel.findOne({ 'authentication.sessionToken': sessionToken });

// Obtener un usuario por ID
export const getUserById = (id: string) => UserModel.findById(id);

// Crear un nuevo usuario
export const createUser = (values: Record<string, any>) =>
  new UserModel(values).save().then((user) => user.toObject());

// Eliminar un usuario por ID
export const deleteUserById = (id: string) => UserModel.findByIdAndDelete(id);

// Actualizar un usuario por ID
export const updateUserById = (id: string, values: Record<string, any>) =>
  UserModel.findByIdAndUpdate(id, values, { new: true }); // Se asegura de devolver el documento actualizado
