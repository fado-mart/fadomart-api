import Joi from "joi";

export const addCategoryValidator = Joi.object({
    name: Joi.string(),
    description: Joi.string()
});

export const updateCategoryValidator = Joi.object({
    name: Joi.string(),
    description: Joi.string()
});