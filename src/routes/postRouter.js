const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { authMiddleware } = require('../auth/authMiddleware');
const { upload } = require('../auth/multerConfig');
const Post = require('../models/Posts');

router.use(authMiddleware);

// ========================
// Create a new post
// ========================
router.post('/', upload.single('media'), async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    let media = null;

    if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();

    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.bmp'];
    const gifExtensions = ['.gif'];
    const videoExtensions = ['.mp4', '.mov', '.webm', '.mkv'];

    if (imageExtensions.includes(ext)) {
        const webpFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
        const webpPath = path.join('uploads/post', webpFilename);

        await sharp(req.file.path)
        .webp({ quality: 80 })
        .toFile(webpPath);

        fs.unlinkSync(req.file.path);

        media = {
        url: `/uploads/post/${webpFilename}`,
        type: 'image'
        };

    } else if (gifExtensions.includes(ext)) {
        media = {
        url: `/uploads/post/${req.file.filename}`,
        type: 'gif'
        };

    } else if (videoExtensions.includes(ext)) {
        media = {
        url: `/uploads/post/${req.file.filename}`,
        type: 'video'
        };

    } else {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Unsupported media type.' });
    }
    }

    const post = new Post({
      title,
      content,
      tags,
      media,
      author: req.user._id
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while creating post.', details: err.message });
  }
});

// ========================
// Delete a post
// ========================
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post.' });
    }

    if (post.media && post.media.url) {
    const filename = path.basename(post.media.url);
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'post', filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    } else {
        console.warn("File not found on disk:", filePath);
    }
    }

    await post.deleteOne();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while deleting post.' });
  }
});

// ========================
//       Get posts
// ========================
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1)*limit;

    const User = require('../models/User');
    const user = await User.findById(userId).select('friends').lean();
    const friendIds = user?.friends?.map(f => f.toString()) || [];

    const posts = await Post.find({ author: { $in: friendIds } })
      .populate('author', 'name uniquenick profilePictureUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1)
      .lean();

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    posts.forEach(post => {
      if (typeof post.media === 'undefined') post.media = null;
      post.likedByUser = (post.likes || []).map(String).includes(userId);
    });

    res.json({ posts, hasMore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching posts.' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1)*limit;

    const posts = await Post.find({ author: userId })
      .populate('author', 'name uniquenick profilePictureUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1)
      .lean();

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    posts.forEach(post => {
      if (typeof post.media === 'undefined') post.media = null;
      post.likedByUser = (post.likes || []).map(String).includes(userId);
    });

    res.json({ posts, hasMore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching user posts.' });
  }
});

// ========================
// Like / Unlike a post
// ========================
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes?.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(u => u.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while liking post.' });
  }
});

// ========================
// Add a comment
// ========================
router.post('/:id/comment', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required.' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const comment = {
      user: req.user._id,
      text,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while adding comment.' });
  }
});

// ========================
// Delete a comment
// ========================
router.delete('/:postId/comment/:commentId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this comment.' });
    }

    comment.remove();
    await post.save();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while deleting comment.' });
  }
});

module.exports = router;
