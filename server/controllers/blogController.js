import fs from 'fs'
import imagekit from '../configs/imagekit.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comments.js';
import main from '../configs/gemini.js';

export const addBlog = async (req, res)=> {
    try {
        const {title, subTitle, description, category, isPublished} = JSON.parse(req.body.blog);
        const imageFile = req.file;

        //Check if all fields are present
        if(!title || !description || !category || !imageFile) {
            return res.json({success: false, message: "Missing required fields"})
        }

        // Upload Image to ImageKit 
        let response;
        try {
            response = await imagekit.upload({
                file: imageFile.buffer,
                fileName: imageFile.originalname,
                folder: "/blogs",
            });
        } catch (uploadError) {
            console.error("ImageKit Upload Error:", uploadError);
            return res.json({success: false, message: "Image upload failed. Check ImageKit credentials in .env"})
        }

        // Optimization through imagekit URL transformation
        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                {quality: 'auto'},
                {format: 'webp'},
                {width: '1280'}
            ]
        });

        const image = optimizedImageUrl;

        await Blog.create({title, subTitle, description, category, image, isPublished})

        res.json({success: true, message: "Blog added successfully"})

    } catch (error) {
        console.error("Add Blog Error:", error);
        res.json({success: false, message: error.message})
    }
}

export const getAllBlogs = async(req, res)=> {
    try {
        const blogs = await Blog.find({isPublished: true})
        res.json({success: true, blogs})
    } catch(error) {
        res.json({success: false, message: error.message})
    }
}

export const getBlogById =async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findById(blogId)
        console.log(blogId)
        console.log(blog);
        if(!blog) {
            return res.json({success: false, message: "Blog not found"});
        }
        res.json({success: true, blog})
    } catch(error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const deleteBlogById =async (req, res) => {
    try {
        const { id } = req.body;
        await Blog.findByIdAndDelete(id);
        res.json({success: true, message: 'Blog deleted successfully'})
    } catch(error) {
        res.json({success: false, message: error.message})
    }
}


export const togglePublish = async (req, res) => {
    try {
        const { id } = req.body;
        const blog = await Blog.findById(id);
        blog.isPublished = !blog.isPublished;
        await blog.save();
        res.json({success: true, message: 'Blog status updated'})
    } catch(error) {
        res.json({success: false, message: error.message})
    }
}

export const updateBlog = async (req, res) => {
    try {
        const { id, title, subTitle, description, category, isPublished } = JSON.parse(req.body.blog);
        const imageFile = req.file;

        if (!id) {
            return res.json({success: false, message: "Blog ID is required"})
        }

        let updateData = { title, subTitle, description, category, isPublished };

        // If new image is provided, upload it
        if (imageFile) {
            try {
                const response = await imagekit.upload({
                    file: imageFile.buffer,
                    fileName: imageFile.originalname,
                    folder: "/blogs",
                });

                const optimizedImageUrl = imagekit.url({
                    path: response.filePath,
                    transformation: [
                        {quality: 'auto'},
                        {format: 'webp'},
                        {width: '1280'}
                    ]
                });

                updateData.image = optimizedImageUrl;
            } catch (uploadError) {
                console.error("ImageKit upload error:", uploadError);
                return res.json({success: false, message: "Image upload failed"})
            }
        }

        const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
        res.json({success: true, message: "Blog updated successfully", blog: updatedBlog})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const searchBlogs = async (req, res) => {
    try {
        const { query, category, page = 1, limit = 10 } = req.query;
        
        let filter = { isPublished: true };

        // Search by title or description
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { subTitle: { $regex: query, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category) {
            filter.category = category;
        }

        const skip = (page - 1) * limit;
        const blogs = await Blog.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Blog.countDocuments(filter);

        res.json({
            success: true,
            blogs,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
        })
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const addComment = async (req, res) => {
    try {
        const {blog, name, content } = req.body;
        await Comment.create({blog, name, content});
        res.json({success: true, message: 'Comment added for review'})
    } catch(error) {
        res.json({success: false, message: error.message})
    }
}

export const getBlogComments = async (req, res) => {
    try {
        const { blogId } = req.params;
        const comments = (await Comment.find({ blog: blogId, isApproved: true })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json({success: true, comments})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const generateContent = async(req, res) => {
    try {
        const {prompt} = req.body;
        const content = await main(prompt + ' Generate a blog content for this topic in simple text format ')
        res.json({success: true, content})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}