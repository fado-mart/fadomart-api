import { categoryModel } from "../models/category.js";
import { addCategoryValidator, updateCategoryValidator } from "../validators/category.js";

export const addCategory = async (req, res, next) => {
    try {
        const { error, value } = addCategoryValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }

        const existingCategory = await categoryModel.findOne({ name: value.name });
        if (existingCategory) {
            return res.status(409).json({ message: `${existingCategory.name} already exists!` });
        }

        const category = await categoryModel.create({
            ...value
        })

        res.status(201).json({ message: `${category.name} created successfully`, category });

    } catch (error) {
        next(error);
    }
};


export const getCategories = async (req, res, next) => {
    try {
        const { filter = '{}', sort = '{}', } = req.query

        const categories = await categoryModel
            .find(JSON.parse(filter))
            .sort(JSON.parse(sort))
            // .populate('Product', '-_id')

        res.status(200).json(categories);
    } catch (error) {
        next(error)
    }
};

export const getCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await categoryModel
            .findById(id)
            // .populate('Product', '-id')

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        // const { id } = req.params;
        const { error, value } = updateCategoryValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error)
        }

        const category = await categoryModel.findByIdAndUpdate(
            req.params.id,
            {
                ...value
            }
        )
        if (!category) {
            return res.status(404).json({ message: 'Category not found' })
        }

        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const category = await categoryModel.findByIdAndDelete({_id: req.params.id});
        if (!category) {
            return res.status(404).json({message: 'Category not found'});
        }

        res.status(200).json({message: 'Category deleted successfully'});
    } catch (error) {
        next(error);
    }
};