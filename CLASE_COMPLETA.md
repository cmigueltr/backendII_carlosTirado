# 🎓 CLASE COMPLETA: Arquitectura Profesional de Backend

## 📚 ÍNDICE
1. [Introducción: ¿Por qué esta arquitectura?](#1-introducción)
2. [Orden de creación: ¿Qué hacer primero?](#2-orden-de-creación)
3. [Explicación línea por línea](#3-explicación-línea-por-línea)
4. [Relaciones entre archivos](#4-relaciones-entre-archivos)
5. [Flujo completo de una petición](#5-flujo-completo)

---

## 1. INTRODUCCIÓN: ¿Por qué esta arquitectura?

### ¿Qué problema resolvemos?

Imagina que tienes un código donde TODO está mezclado:
- La lógica de base de datos está en el controlador
- Las validaciones están mezcladas con las consultas
- No puedes reutilizar código
- Es difícil de testear
- Si cambias la base de datos, tienes que cambiar TODO

### La solución: Separar en capas

```
┌─────────────────────────────────────┐
│   CONTROLADOR (Controller)          │  ← Recibe peticiones HTTP
│   - Valida datos de entrada         │
│   - Llama a servicios/repositories  │
│   - Devuelve respuesta HTTP          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   REPOSITORY (Lógica de Negocio)   │  ← Reglas de negocio
│   - Valida stock                    │
│   - Calcula precios                 │
│   - Aplica descuentos               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   DAO (Data Access Object)          │  ← Acceso a base de datos
│   - findById()                      │
│   - create()                        │
│   - update()                        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   MODELO (Mongoose Schema)         │  ← Estructura de datos
│   - Define campos                   │
│   - Validaciones básicas            │
└─────────────────────────────────────┘
```

### Ventajas de esta arquitectura:

1. **Reutilización**: Un DAO puede usarse en múltiples repositories
2. **Testeo**: Puedes testear cada capa independientemente
3. **Mantenimiento**: Cambios en una capa no afectan a otras
4. **Escalabilidad**: Fácil agregar nuevas funcionalidades

---

## 2. ORDEN DE CREACIÓN: ¿Qué hacer primero?

### 🎯 REGLA DE ORO: De abajo hacia arriba

Siempre empieza por lo más básico y construye sobre eso.

### Orden correcto:

```
1. MODELOS (Modelos de datos)
   ↓
2. DAOs (Acceso a datos)
   ↓
3. REPOSITORIES (Lógica de negocio)
   ↓
4. DTOs (Objetos de transferencia)
   ↓
5. SERVICIOS (Servicios externos: email, etc.)
   ↓
6. CONTROLADORES (Manejo de HTTP)
   ↓
7. MIDDLEWARES (Autenticación, autorización)
   ↓
8. RUTAS (Endpoints)
   ↓
9. SERVIDOR (Configuración final)
```

### ¿Por qué este orden?

**Ejemplo práctico:**
- No puedes crear un DAO sin tener el Modelo (necesitas saber qué datos guardar)
- No puedes crear un Repository sin el DAO (necesitas métodos para acceder a datos)
- No puedes crear un Controlador sin el Repository (necesitas la lógica de negocio)

---

## 3. EXPLICACIÓN LÍNEA POR LÍNEA

### PASO 1: MODELOS (La base de todo)

#### 📁 `src/models/user.model.js`

```javascript
import mongoose from 'mongoose';
```
**¿Qué hace?** Importa Mongoose, la librería que nos permite trabajar con MongoDB.
**¿Por qué?** Necesitamos crear esquemas (schemas) para definir la estructura de nuestros datos.

```javascript
const { Schema } = mongoose;
```
**¿Qué hace?** Extrae la clase `Schema` de mongoose.
**¿Por qué?** La usaremos para crear el esquema del usuario.

```javascript
const userSchema = new Schema({
```
**¿Qué hace?** Crea un nuevo esquema (estructura) para el modelo User.
**¿Por qué?** Define qué campos tendrá cada usuario en la base de datos.

```javascript
  first_name: { type: String, required: [true, 'first_name obligatorio'] },
```
**¿Qué hace?** Define un campo `first_name` que:
- Es de tipo String (texto)
- Es obligatorio (required: true)
- Si falta, muestra el mensaje 'first_name obligatorio'

**¿Por qué?** Queremos asegurarnos de que siempre haya un nombre.

```javascript
  email: { type: String, required: [true, 'email obligatorio'], unique: true },
```
**¿Qué hace?** Campo email que:
- Es String
- Es obligatorio
- Es único (no puede haber dos usuarios con el mismo email)

**¿Por qué `unique: true`?** No queremos que dos usuarios tengan el mismo email.

```javascript
  password: { type: String, required: [true, 'password obligatorio'] },
```
**¿Qué hace?** Campo password (se guardará hasheado, no en texto plano).

```javascript
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
```
**¿Qué hace?** Campo role que:
- Solo puede ser 'user' o 'admin' (enum)
- Por defecto es 'user' si no se especifica

**¿Por qué?** Controlamos qué valores puede tener.

```javascript
  cart: { type: Schema.Types.ObjectId, ref: 'Cart' },
```
**¿Qué hace?** Referencia al carrito del usuario.
- `ObjectId`: ID de otro documento
- `ref: 'Cart'`: Hace referencia al modelo Cart

**¿Por qué?** Un usuario tiene un carrito. Esto crea la relación.

```javascript
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
```
**¿Qué hace?** Campos para recuperación de contraseña:
- Token único para resetear
- Fecha de expiración del token

**¿Por qué?** Necesitamos guardar estos datos temporalmente.

```javascript
}, { timestamps: true });
```
**¿Qué hace?** Agrega automáticamente `createdAt` y `updatedAt` a cada documento.

```javascript
export default mongoose.model('User', userSchema);
```
**¿Qué hace?** Crea y exporta el modelo User.
**¿Por qué?** Lo usaremos en otros archivos para hacer consultas.

---

#### 📁 `src/models/product.model.js`

```javascript
const productSchema = new Schema({
  title: { type: String, required: [true, 'title obligatorio'] },
  description: { type: String, required: [true, 'description obligatorio'] },
  price: { type: Number, required: [true, 'price obligatorio'], min: [0, 'price debe ser >= 0'] },
```
**¿Qué hace?** Define precio con validación mínima de 0.
**¿Por qué?** No queremos precios negativos.

```javascript
  code: { type: String, required: [true, 'code obligatorio'], unique: true },
```
**¿Qué hace?** Código único del producto.
**¿Por qué?** Cada producto debe tener un código único (como SKU).

```javascript
  stock: { type: Number, required: [true, 'stock obligatorio'], min: [0, 'stock debe ser >= 0'] },
```
**¿Qué hace?** Stock disponible, no puede ser negativo.

```javascript
  status: { type: Boolean, default: true }
```
**¿Qué hace?** Indica si el producto está activo o no.
**¿Por qué?** Podemos "desactivar" productos sin eliminarlos.

---

#### 📁 `src/models/cart.model.js`

```javascript
const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: [1, 'quantity debe ser >= 1'] }
}, { _id: false });
```
**¿Qué hace?** Define un item del carrito:
- Referencia al producto
- Cantidad (mínimo 1)
- `_id: false`: No crea ID para cada item

**¿Por qué `_id: false`?** Los items del carrito no necesitan ID propio, son parte del carrito.

```javascript
const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [cartItemSchema]
}, { timestamps: true });
```
**¿Qué hace?** Carrito con:
- Referencia al usuario (única: un usuario = un carrito)
- Array de productos (items)

**¿Por qué array?** Un carrito puede tener múltiples productos.

---

#### 📁 `src/models/ticket.model.js`

```javascript
const ticketSchema = new Schema({
  code: { type: String, required: true, unique: true },
```
**¿Qué hace?** Código único del ticket (como número de factura).

```javascript
  purchase_datetime: { type: Date, default: Date.now },
```
**¿Qué hace?** Fecha y hora de compra (automática).

```javascript
  amount: { type: Number, required: true, min: [0, 'amount debe ser >= 0'] },
```
**¿Qué hace?** Monto total de la compra.

```javascript
  purchaser: { type: String, required: true },
```
**¿Qué hace?** Email del comprador.
**¿Por qué String y no referencia?** Por si el usuario se elimina, mantenemos el historial.

```javascript
  products: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }]
```
**¿Qué hace?** Array de productos comprados con:
- Referencia al producto
- Cantidad comprada
- **Precio al momento de compra** (importante: el precio puede cambiar después)

**¿Por qué guardar el precio?** Si el precio cambia después, queremos saber cuánto pagó realmente.

---

### PASO 2: DAOs (Data Access Object)

#### 📁 `src/dao/user.dao.js`

**¿Qué es un DAO?** Capa que SOLO se encarga de acceder a la base de datos. NO tiene lógica de negocio.

```javascript
import User from '../models/user.model.js';
```
**¿Qué hace?** Importa el modelo User.
**¿Por qué?** Necesitamos el modelo para hacer consultas.

```javascript
export class UserDAO {
```
**¿Qué hace?** Crea una clase exportable.
**¿Por qué clase?** Agrupa métodos relacionados y permite usar métodos estáticos.

```javascript
  static async findById(id) {
    return await User.findById(id);
  }
```
**¿Qué hace?** Busca un usuario por ID.
**¿Por qué `static`?** No necesitamos crear una instancia, solo llamar `UserDAO.findById()`.

**¿Por qué `async/await`?** Las consultas a BD son asíncronas.

```javascript
  static async findByEmail(email) {
    return await User.findOne({ email });
  }
```
**¿Qué hace?** Busca usuario por email.
**¿Por qué `findOne`?** Solo esperamos un resultado (email es único).

```javascript
  static async create(userData) {
    return await User.create(userData);
  }
```
**¿Qué hace?** Crea un nuevo usuario.
**¿Por qué simple?** El DAO NO valida ni procesa, solo guarda.

```javascript
  static async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }
```
**¿Qué hace?** Actualiza usuario.
**¿Por qué `{ new: true }`?** Devuelve el documento actualizado, no el anterior.

```javascript
  static async updateResetToken(userId, token, expires) {
    return await User.findByIdAndUpdate(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expires
    }, { new: true });
  }
```
**¿Qué hace?** Actualiza solo los campos de recuperación de contraseña.
**¿Por qué método específico?** Es más claro y reutilizable.

```javascript
  static async findByResetToken(token) {
    return await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
  }
```
**¿Qué hace?** Busca usuario por token Y verifica que no haya expirado.
**¿Qué es `$gt`?** Operador de MongoDB: "greater than" (mayor que).
**¿Por qué?** Solo queremos tokens válidos (no expirados).

---

#### 📁 `src/dao/product.dao.js`

```javascript
  static async updateStock(productId, quantity) {
    return await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: -quantity } },
      { new: true }
    );
  }
```
**¿Qué hace?** Resta cantidad del stock.
**¿Qué es `$inc`?** Operador de MongoDB para incrementar/decrementar.
**¿Por qué `-quantity`?** Restamos stock cuando se vende.

---

### PASO 3: REPOSITORIES (Lógica de Negocio)

#### 📁 `src/repositories/user.repository.js`

**¿Qué es un Repository?** Contiene la LÓGICA DE NEGOCIO. Usa DAOs para acceder a datos.

```javascript
import { UserDAO } from '../dao/user.dao.js';
import bcrypt from 'bcrypt';
```
**¿Qué hace?** Importa el DAO y bcrypt (para hashear passwords).
**¿Por qué?** El Repository usa el DAO y agrega lógica.

```javascript
  static async create(userData) {
    // Lógica de negocio: hashear password antes de crear
    if (userData.password) {
      const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
      userData.password = bcrypt.hashSync(userData.password, SALT_ROUNDS);
    }
    return await UserDAO.create(userData);
  }
```
**¿Qué hace?** 
1. Toma el password en texto plano
2. Lo hashea con bcrypt
3. Llama al DAO para guardarlo

**¿Por qué aquí y no en el DAO?** 
- El DAO solo guarda datos
- El Repository aplica reglas de negocio (passwords deben estar hasheados)

**¿Qué es `SALT_ROUNDS`?** Número de veces que se aplica el hash (más rondas = más seguro pero más lento).

```javascript
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
```
**¿Qué hace?** Compara password en texto plano con el hash guardado.
**¿Por qué método separado?** Reutilizable en login y otras operaciones.

```javascript
  static async checkPasswordChanged(newPassword, currentPasswordHash) {
    return bcrypt.compareSync(newPassword, currentPasswordHash);
  }
```
**¿Qué hace?** Verifica si la nueva contraseña es igual a la anterior.
**¿Por qué?** No queremos que el usuario use la misma contraseña al resetear.

---

#### 📁 `src/repositories/product.repository.js`

```javascript
  static async create(productData) {
    // Lógica de negocio: validar que el código no exista
    const existingProduct = await ProductDAO.findByCode(productData.code);
    if (existingProduct) {
      throw new Error('El código de producto ya existe');
    }
    return await ProductDAO.create(productData);
  }
```
**¿Qué hace?** 
1. Verifica que el código no exista
2. Si existe, lanza error
3. Si no existe, crea el producto

**¿Por qué aquí?** Es una regla de negocio: códigos únicos.

```javascript
  static async checkStock(productId, quantity) {
    const product = await ProductDAO.findById(productId);
    if (!product) {
      return { available: false, message: 'Producto no encontrado' };
    }
    if (product.stock < quantity) {
      return { available: false, message: 'Stock insuficiente', stock: product.stock };
    }
    return { available: true, product };
  }
```
**¿Qué hace?** Verifica si hay stock suficiente.
**¿Por qué objeto de respuesta?** Devuelve información útil:
- `available`: true/false
- `message`: mensaje de error si no hay
- `product`: el producto si está disponible

**¿Por qué no lanzar error directamente?** A veces queremos verificar sin fallar (ej: mostrar advertencia).

---

#### 📁 `src/repositories/cart.repository.js`

```javascript
  static async findByUserId(userId) {
    let cart = await CartDAO.findByUserId(userId);
    if (!cart) {
      // Si no existe, crear uno vacío
      cart = await CartDAO.create({ user: userId, products: [] });
    }
    return cart;
  }
```
**¿Qué hace?** Busca carrito, si no existe lo crea vacío.
**¿Por qué?** Queremos que siempre haya un carrito disponible.

```javascript
  static async addProduct(userId, productId, quantity = 1) {
    const cart = await this.findByUserId(userId);
    
    // Verificar que el producto existe y tiene stock
    const stockCheck = await ProductRepository.checkStock(productId, quantity);
    if (!stockCheck.available) {
      throw new Error(stockCheck.message);
    }

    // Buscar si el producto ya está en el carrito
    const productIndex = cart.products.findIndex(
      item => item.product.toString() === productId.toString()
    );

    if (productIndex >= 0) {
      // Si existe, actualizar la cantidad
      const newQuantity = cart.products[productIndex].quantity + quantity;
      const stockCheckUpdate = await ProductRepository.checkStock(productId, newQuantity);
      if (!stockCheckUpdate.available) {
        throw new Error(stockCheckUpdate.message);
      }
      cart.products[productIndex].quantity = newQuantity;
    } else {
      // Si no existe, agregarlo
      cart.products.push({ product: productId, quantity });
    }

    return await CartDAO.updateByUserId(userId, { products: cart.products });
  }
```
**¿Qué hace paso a paso?**
1. Obtiene o crea el carrito
2. Verifica stock disponible
3. Busca si el producto ya está en el carrito
4. Si está: suma la cantidad y verifica stock nuevamente
5. Si no está: lo agrega
6. Guarda el carrito actualizado

**¿Por qué verificar stock dos veces?** 
- Primera: verificar que hay stock para agregar
- Segunda: verificar que hay stock para la cantidad total (si ya estaba en el carrito)

**¿Por qué `toString()`?** Los ObjectId de MongoDB necesitan convertirse a string para comparar.

---

#### 📁 `src/repositories/ticket.repository.js`

```javascript
  static generateCode() {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }
```
**¿Qué hace?** Genera código único aleatorio.
**¿Por qué?** Cada ticket necesita un código único (como número de factura).

```javascript
  static async create(purchaserEmail, cartProducts) {
    const ticketProducts = [];
    let totalAmount = 0;
    const unavailableProducts = [];

    for (const cartItem of cartProducts) {
      const productId = cartItem.product._id || cartItem.product;
      const quantity = cartItem.quantity;

      const stockCheck = await ProductRepository.checkStock(productId, quantity);
      
      if (stockCheck.available) {
        // Actualizar stock
        await ProductRepository.updateStock(productId, quantity);
        const product = stockCheck.product;
        
        ticketProducts.push({
          product: productId,
          quantity,
          price: product.price
        });
        totalAmount += product.price * quantity;
      } else {
        unavailableProducts.push({
          product: productId,
          quantity,
          reason: stockCheck.message
        });
      }
    }
```
**¿Qué hace paso a paso?**
1. Itera cada producto del carrito
2. Verifica stock
3. Si hay stock:
   - Actualiza el stock (lo resta)
   - Agrega al ticket con el precio actual
   - Suma al total
4. Si no hay stock:
   - Lo agrega a "no disponibles"

**¿Por qué guardar el precio?** El precio puede cambiar después, queremos saber cuánto pagó.

**¿Por qué actualizar stock aquí?** Cuando se crea el ticket, se confirma la compra.

```javascript
    if (ticketProducts.length === 0) {
      throw new Error('No hay productos disponibles para comprar');
    }

    const code = this.generateCode();
    const ticket = await TicketDAO.create({
      code,
      amount: totalAmount,
      purchaser: purchaserEmail,
      products: ticketProducts
    });

    return {
      ticket,
      unavailableProducts
    };
  }
```
**¿Qué hace?**
1. Si no hay productos disponibles, lanza error
2. Genera código único
3. Crea el ticket
4. Devuelve ticket Y productos no disponibles

**¿Por qué devolver ambos?** El frontend necesita saber qué se compró y qué no.

---

### PASO 4: DTOs (Data Transfer Objects)

#### 📁 `src/dto/user.dto.js`

**¿Qué es un DTO?** Objeto que contiene SOLO los datos que queremos enviar al cliente, sin información sensible.

```javascript
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
```
**¿Qué hace?** Crea un objeto con solo los campos seguros.
**¿Por qué constructor?** Permite crear instancias fácilmente.

**¿Por qué `user._id || user.id`?** MongoDB usa `_id`, pero a veces puede venir como `id`.

```javascript
  static fromUser(user) {
    if (!user) return null;
    return new UserDTO(user);
  }
```
**¿Qué hace?** Método estático que crea DTO desde un usuario.
**¿Por qué `static`?** No necesitamos instancia, solo convertir.

**¿Por qué verificar `!user`?** Evita errores si el usuario es null/undefined.

```javascript
  static fromUsers(users) {
    return users.map(user => UserDTO.fromUser(user));
  }
```
**¿Qué hace?** Convierte array de usuarios a array de DTOs.
**¿Por qué `map`?** Aplica la conversión a cada elemento.

---

### PASO 5: SERVICIOS (Servicios externos)

#### 📁 `src/config/email.config.js`

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export default transporter;
```
**¿Qué hace?** Configura el servicio de email.
**¿Por qué aquí?** Es configuración, no lógica de negocio.

**¿Qué es `createTransport`?** Crea la conexión con el servidor de email.

---

#### 📁 `src/services/email.service.js`

```javascript
  static async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
```
**¿Qué hace?** Construye la URL de recuperación.
**¿Por qué variable de entorno?** El frontend puede estar en otra URL en producción.

```javascript
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de Contraseña',
      html: `...`
    };
```
**¿Qué hace?** Define el email a enviar.
**¿Por qué `html`?** Permite formato rico (botones, estilos).

```javascript
    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Error al enviar el correo de recuperación');
    }
```
**¿Qué hace?** Envía el email y maneja errores.
**¿Por qué try/catch?** El envío puede fallar (servidor caído, credenciales incorrectas).

---

#### 📁 `src/services/password.service.js`

```javascript
  static async requestPasswordReset(email) {
    const user = await UserRepository.findByEmail(email);
    
    if (!user) {
      return { success: true, message: 'Si el email existe, se enviará un correo...' };
    }
```
**¿Qué hace?** Busca el usuario.
**¿Por qué mensaje genérico si no existe?** Por seguridad: no revelamos si el email existe o no.

```javascript
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);
```
**¿Qué hace?** 
1. Genera token aleatorio de 32 bytes
2. Crea fecha de expiración (1 hora después)

**¿Por qué 32 bytes?** Suficientemente largo para ser seguro.

```javascript
    await UserRepository.updateResetToken(user._id, resetToken, resetExpires);
    await EmailService.sendPasswordResetEmail(user.email, resetToken);
```
**¿Qué hace?** Guarda el token y envía el email.
**¿Por qué en este orden?** Si el email falla, el token ya está guardado (puede reenviarse).

---

### PASO 6: CONTROLADORES (Manejo de HTTP)

#### 📁 `src/controllers/sessions.controller.js`

```javascript
export async function register(req, res) {
  try {
    const { first_name, last_name, email, age, password } = req.body;
```
**¿Qué hace?** Extrae datos del body de la petición.
**¿Por qué destructuring?** Más limpio que `req.body.first_name`.

```javascript
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
```
**¿Qué hace?** Valida que todos los campos requeridos estén presentes.
**¿Por qué 400?** Es error del cliente (Bad Request).

```javascript
    const exists = await UserRepository.findByEmail(email);
    if (exists) return res.status(409).json({ error: 'Email ya registrado' });
```
**¿Qué hace?** Verifica si el email ya existe.
**¿Por qué 409?** Conflict (el recurso ya existe).

```javascript
    const user = await UserRepository.create({
      first_name,
      last_name,
      email,
      age,
      password
    });

    const userDTO = UserDTO.fromUser(user);
    return res.status(201).json({ user: userDTO });
```
**¿Qué hace?** 
1. Crea el usuario (el Repository hashea el password)
2. Convierte a DTO (sin password)
3. Devuelve respuesta 201 (Created)

**¿Por qué DTO?** No queremos enviar el password hasheado.

```javascript
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error en registro' });
  }
}
```
**¿Qué hace?** Maneja errores inesperados.
**¿Por qué 500?** Error del servidor.

---

```javascript
export async function login(req, res, next) {
  passport.authenticate('local', { session: false }, (err, user, info) => {
```
**¿Qué hace?** Usa Passport para autenticar.
**¿Qué es 'local'?** Estrategia de autenticación (email + password).

**¿Por qué callback?** Passport necesita un callback para manejar el resultado.

```javascript
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'No autorizado' });
```
**¿Qué hace?** Maneja errores y usuario no encontrado.
**¿Qué es `info?.message`?** Optional chaining: si `info` existe, toma `message`, sino undefined.

```javascript
    const token = generateToken(user);
    const userDTO = UserDTO.fromUser(user);
    return res.json({ token, user: userDTO });
  })(req, res, next);
}
```
**¿Qué hace?** 
1. Genera token JWT
2. Convierte usuario a DTO
3. Devuelve token y usuario

**¿Por qué `(req, res, next)` al final?** Passport necesita que ejecutemos la función con los parámetros.

---

```javascript
export function current(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autorizado' });
  
  const userDTO = UserDTO.fromUser(req.user);
  return res.json({ user: userDTO });
}
```
**¿Qué hace?** Devuelve el usuario actual.
**¿Por qué `req.user`?** Passport lo agrega después de autenticar.

---

### PASO 7: MIDDLEWARES

#### 📁 `src/middlewares/auth.middleware.js`

```javascript
export const authenticate = passport.authenticate('current', { session: false });
```
**¿Qué hace?** Middleware que autentica usando la estrategia 'current'.
**¿Por qué exportar directamente?** Es reutilizable en múltiples rutas.

```javascript
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
```
**¿Qué hace?** Función que retorna un middleware.
**¿Qué es `...allowedRoles`?** Rest parameters: acepta múltiples argumentos como array.

**Ejemplo:** `authorizeRoles('admin', 'user')` → `allowedRoles = ['admin', 'user']`

```javascript
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado: se requiere autenticación' });
    }

    const userRole = req.user.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'No autorizado: rol insuficiente' });
    }

    next();
  };
}
```
**¿Qué hace paso a paso?**
1. Verifica que el usuario esté autenticado
2. Obtiene el rol del usuario
3. Verifica que el rol esté en los permitidos
4. Si todo OK, llama a `next()` (continúa)

**¿Por qué 401 vs 403?**
- 401: No autenticado (no tiene token)
- 403: Autenticado pero sin permisos

```javascript
export const requireAdmin = [
  authenticate,
  authorizeRoles('admin')
];
```
**¿Qué hace?** Array de middlewares que:
1. Autentica
2. Verifica que sea admin

**¿Por qué array?** Express ejecuta middlewares en orden.

---

### PASO 8: RUTAS

#### 📁 `src/routes/products.routes.js`

```javascript
import { Router } from 'express';
```
**¿Qué hace?** Importa Router de Express.
**¿Por qué Router?** Permite crear rutas modulares.

```javascript
const router = Router();
```
**¿Qué hace?** Crea un router.
**¿Por qué?** Agrupa rutas relacionadas.

```javascript
router.get('/', getProducts);
```
**¿Qué hace?** Ruta GET pública (cualquiera puede ver productos).

```javascript
router.post('/', requireAdmin, createProduct);
```
**¿Qué hace?** Ruta POST que:
1. Ejecuta `requireAdmin` (autentica y verifica admin)
2. Si pasa, ejecuta `createProduct`

**¿Por qué antes del controlador?** Los middlewares se ejecutan en orden.

---

#### 📁 `src/routes/carts.routes.js`

```javascript
router.get('/', requireUser, getCart);
```
**¿Qué hace?** Solo usuarios pueden ver su carrito.
**¿Por qué `requireUser`?** Los admins no deberían tener carrito (aunque técnicamente podrían).

---

### PASO 9: SERVIDOR

#### 📁 `server.js`

```javascript
import dotenv from 'dotenv';
dotenv.config();
```
**¿Qué hace?** Carga variables de entorno del archivo `.env`.
**¿Por qué primero?** Otros módulos pueden necesitarlas.

```javascript
import connectDB from './src/config/db.js';
import initPassport from './src/config/passport.js';
```
**¿Qué hace?** Importa configuraciones.
**¿Por qué?** Necesitamos inicializar DB y Passport antes de usar rutas.

```javascript
async function startServer() {
  try {
    await connectDB();
```
**¿Qué hace?** Conecta a MongoDB.
**¿Por qué async?** La conexión es asíncrona.

```javascript
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
```
**¿Qué hace?** Middlewares para parsear JSON y formularios.
**¿Por qué?** Express necesita convertir el body de la petición a objeto JavaScript.

```javascript
    app.use('/api/products', productsRouter);
    app.use('/api/carts', cartsRouter);
```
**¿Qué hace?** Monta los routers en rutas específicas.
**¿Por qué `/api/`?** Prefijo común para todas las APIs.

---

## 4. RELACIONES ENTRE ARCHIVOS

### Flujo de dependencias:

```
server.js
  ↓
routes/
  ↓
controllers/
  ↓
repositories/ ← Lógica de negocio
  ↓
dao/ ← Acceso a datos
  ↓
models/ ← Estructura de datos
```

### Ejemplo completo: Crear un producto

```
1. Cliente hace POST /api/products
   ↓
2. server.js recibe y envía a productsRouter
   ↓
3. productsRouter ejecuta requireAdmin
   ↓
4. Si es admin, ejecuta productController.createProduct
   ↓
5. productController llama a ProductRepository.create
   ↓
6. ProductRepository valida código único y llama a ProductDAO.create
   ↓
7. ProductDAO guarda en MongoDB usando Product model
   ↓
8. Respuesta sube por todas las capas
   ↓
9. Se devuelve ProductDTO al cliente
```

---

## 5. FLUJO COMPLETO DE UNA PETICIÓN

### Ejemplo: Usuario agrega producto al carrito

```
┌─────────────────────────────────────────┐
│ 1. Cliente (Frontend/Postman)           │
│    POST /api/carts/products             │
│    Body: { productId: "123", quantity: 2 }│
│    Header: Authorization: Bearer <token>  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. server.js                            │
│    app.use('/api/carts', cartsRouter)    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. carts.routes.js                      │
│    router.post('/products', requireUser,│
│                addProductToCart)         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. auth.middleware.js                   │
│    requireUser = [authenticate,          │
│                   authorizeRoles('user')]│
│    - Verifica token JWT                 │
│    - Verifica que role = 'user'          │
│    - Agrega req.user                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 5. cart.controller.js                   │
│    addProductToCart(req, res)           │
│    - Extrae productId y quantity        │
│    - Llama a CartRepository.addProduct   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 6. cart.repository.js                   │
│    addProduct(userId, productId, qty)   │
│    - Busca/crea carrito                 │
│    - Llama a ProductRepository.checkStock│
│    - Actualiza carrito                  │
│    - Llama a CartDAO.updateByUserId     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 7. product.repository.js                │
│    checkStock(productId, quantity)      │
│    - Llama a ProductDAO.findById        │
│    - Verifica stock >= quantity         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 8. product.dao.js                      │
│    findById(id)                         │
│    - Product.findById(id)               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 9. product.model.js                     │
│    Modelo de Mongoose                   │
│    - Consulta MongoDB                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 10. MongoDB                             │
│     Retorna documento del producto      │
└──────────────┬──────────────────────────┘
               │
               ▼ (Respuesta sube por todas las capas)
               │
┌─────────────────────────────────────────┐
│ 11. Cliente recibe respuesta            │
│     { cart: {...}, message: "..." }    │
└─────────────────────────────────────────┘
```

---

## 🎯 RESUMEN: ¿Por qué cada capa?

| Capa | Responsabilidad | ¿Por qué existe? |
|------|----------------|------------------|
| **Modelo** | Estructura de datos | Define qué guardamos en BD |
| **DAO** | Acceso a BD | Separa consultas SQL/NoSQL del resto |
| **Repository** | Lógica de negocio | Reglas de negocio reutilizables |
| **DTO** | Transferencia segura | No exponer datos sensibles |
| **Controlador** | HTTP | Maneja peticiones/respuestas |
| **Middleware** | Autenticación/Autorización | Reutilizable en múltiples rutas |
| **Rutas** | Enrutamiento | Organiza endpoints |
| **Servicios** | Funcionalidades externas | Email, pagos, etc. |

---

## ✅ CHECKLIST: Orden de creación

- [ ] 1. Modelos (estructura de datos)
- [ ] 2. DAOs (acceso a datos)
- [ ] 3. Repositories (lógica de negocio)
- [ ] 4. DTOs (objetos de transferencia)
- [ ] 5. Servicios (email, etc.)
- [ ] 6. Controladores (HTTP)
- [ ] 7. Middlewares (auth)
- [ ] 8. Rutas (endpoints)
- [ ] 9. Servidor (configuración)

---

## 🚀 Próximos pasos para practicar

1. Crea un modelo nuevo (ej: Order)
2. Crea su DAO
3. Crea su Repository
4. Crea su DTO
5. Crea su Controlador
6. Crea sus Rutas
7. Conéctalo al servidor

¡Sigue este orden y todo funcionará! 🎉

