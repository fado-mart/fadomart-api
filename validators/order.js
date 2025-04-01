import Joi from "joi";

export const addOrderValidator = Joi.object({
    user: Joi.string().length(24),

    products: Joi.array().items(
        Joi.object({
          product: Joi.string().length(24).required(), // Assuming ObjectId as string
          quantity: Joi.number().required(), // Quantity must be a number
        })
      ).required(),

      totalPrice: Joi.number().required(),

      status: Joi.string().valid('Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled').default('Pending'),

      paymentRef: Joi.string()
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