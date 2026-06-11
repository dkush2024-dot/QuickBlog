import Newsletter from "../models/Newsletter.js";

export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({success: false, message: "Email is required"});
        }

        // Check if already subscribed
        const existingSubscriber = await Newsletter.findOne({ email });
        if (existingSubscriber) {
            return res.json({success: false, message: "This email is already subscribed"});
        }

        // Create new subscriber
        await Newsletter.create({ email });
        res.json({success: true, message: "Successfully subscribed to newsletter!"});
    } catch (error) {
        if (error.code === 11000) {
            res.json({success: false, message: "This email is already subscribed"});
        } else {
            res.json({success: false, message: error.message});
        }
    }
};

export const unsubscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({success: false, message: "Email is required"});
        }

        const result = await Newsletter.findOneAndDelete({ email });
        
        if (!result) {
            return res.json({success: false, message: "Email not found in subscribers"});
        }

        res.json({success: true, message: "Successfully unsubscribed from newsletter"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

export const getNewsletterSubscribers = async (req, res) => {
    try {
        const subscribers = await Newsletter.find({}).sort({ subscribedAt: -1 });
        const count = await Newsletter.countDocuments();
        
        res.json({success: true, subscribers, count});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

export const deleteNewsletterSubscriber = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({success: false, message: "Email is required"});
        }

        await Newsletter.findOneAndDelete({ email });
        res.json({success: true, message: "Subscriber removed successfully"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};
