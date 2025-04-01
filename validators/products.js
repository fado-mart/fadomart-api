import Joi from "joi";

export const addProductValidator = Joi.object({
    productName: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string(),
    quantity: Joi.number(),
    image: Joi.string(),
    price: Joi.number().required(),
    stockStatus: Joi.string()
    // discountPrice: Joi.number(),
    // discountPercentage: Joi.number()
});

export const updateProductValidator = Joi.object({
    productName: Joi.string(),
    description: Joi.string(),
    category: Joi.string(),
    quantity: Joi.number(),
    image: Joi.string(),
    price: Joi.number(),
    stockStatus: Joi.string()
    // discountPrice: Joi.number(),
    // discountPercentage: Joi.number()
})