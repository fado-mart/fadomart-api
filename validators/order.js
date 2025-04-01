import Joi from "joi";

export const addOrderValidator = Joi.object({
    user: Joi.string().length(24),

    products: Joi.array().items(
        Joi.object({
          product: Joi.string().length(24).required(), // Assuming ObjectId as string
          quantity: Joi.number().required().min(1), // Quantity must be a number and at least 1
        })
      ).required(),

      status: Joi.string().valid('Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled').default('Pending'),

      paymentRef: Joi.string(),

      shippingAddress: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().email().required()
    }).required()
})

export const updateOrderValidator = Joi.object({
    user: Joi.string().length(24),

    products: Joi.array().items(
        Joi.object({
          product: Joi.string().length(24), // Assuming ObjectId as string
          quantity: Joi.number(), // Quantity must be a number
        })
      ).required(),

      totalPrice: Joi.number(),

      status: Joi.string().valid('Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled').default('Pending'),

      paymentRef: Joi.string()
})