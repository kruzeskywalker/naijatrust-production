const express = require('express');
const jwt = require('jsonwebtoken');
const Review = require('../models/Review');
const Business = require('../models/Business');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = await User.findById(decoded.id);
        if (!req.user) return res.status(401).json({ message: 'User no longer exists' });
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get reviews for a specific business
router.get('/:businessId', async (req, res) => {
    try {
        const reviews = await Review.find({
            business: req.params.businessId,
            isHidden: { $ne: true } // Exclude hidden reviews
        })
            .populate('user', 'name avatar')
            .sort('-createdAt');
        res.status(200).json({ status: 'success', data: { reviews } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Post a new review
router.post('/', verifyToken, async (req, res) => {
    try {
        const { businessId, rating, title, content } = req.body;

        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({ status: 'fail', message: 'Business not found' });
        }

        const newReview = await Review.create({
            user: req.user._id,
            business: businessId,
            rating,
            title,
            content
        });

        // Update business rating and review count
        const allReviews = await Review.find({ business: businessId });
        const avgRating = allReviews.reduce((acc, rev) => acc + rev.rating, 0) / allReviews.length;

        business.rating = avgRating.toFixed(1);
        business.reviewCount = allReviews.length;
        await business.save();

        res.status(201).json({
            status: 'success',
            data: {
                review: await newReview.populate('user', 'name avatar')
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Get logged-in user's reviews
router.get('/user/me', verifyToken, async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate('business', 'name category location')
            .populate('replies.user', 'name avatar')
            .sort('-createdAt');

        res.status(200).json({ status: 'success', data: { reviews } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Edit a review
router.put('/:reviewId', verifyToken, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, title, content } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ status: 'fail', message: 'Review not found' });
        }

        // Verify user owns the review
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: 'fail', message: 'You can only edit your own reviews' });
        }

        // Update review fields
        review.rating = rating;
        review.title = title;
        review.content = content;
        await review.save();

        // Recalculate business rating
        const allReviews = await Review.find({ business: review.business });
        const avgRating = allReviews.reduce((acc, rev) => acc + rev.rating, 0) / allReviews.length;

        await Business.findByIdAndUpdate(review.business, {
            rating: avgRating.toFixed(1)
        });

        res.status(200).json({
            status: 'success',
            data: {
                review: await review.populate('user', 'name avatar')
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Delete a review
router.delete('/:reviewId', verifyToken, async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ status: 'fail', message: 'Review not found' });
        }

        // Verify user owns the review
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: 'fail', message: 'You can only delete your own reviews' });
        }

        const businessId = review.business;
        await Review.findByIdAndDelete(reviewId);

        // Update business rating and review count
        const allReviews = await Review.find({ business: businessId });
        if (allReviews.length > 0) {
            const avgRating = allReviews.reduce((acc, rev) => acc + rev.rating, 0) / allReviews.length;
            await Business.findByIdAndUpdate(businessId, {
                rating: avgRating.toFixed(1),
                reviewCount: allReviews.length
            });
        } else {
            await Business.findByIdAndUpdate(businessId, {
                rating: 0,
                reviewCount: 0
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Review deleted successfully'
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Add a reply to a review
router.post('/:reviewId/reply', verifyToken, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { content, isBusiness } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ status: 'fail', message: 'Review not found' });
        }

        // Add reply to the review
        review.replies.push({
            user: req.user._id,
            content,
            isBusiness: isBusiness || false,
            createdAt: new Date()
        });

        await review.save();

        res.status(200).json({
            status: 'success',
            data: {
                review: await review.populate([
                    { path: 'user', select: 'name avatar' },
                    { path: 'replies.user', select: 'name avatar' }
                ])
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

module.exports = router;
