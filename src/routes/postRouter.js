const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { authMiddleware } = require('../auth/authMiddleware');
const { upload } = require('../auth/multerConfig'); 
const Post = require('../models/Posts');

router.use(authMiddleware);

router.post('/', upload.single('media'), async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    let media = null;

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'].includes(ext);

      if (isImage) {
        const webpFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
        const webpPath = path.join('uploads', webpFilename);

        await sharp(req.file.path)
          .webp({ quality: 80 })
          .toFile(webpPath);

        fs.unlinkSync(req.file.path); 
        media = {
            url: `/uploads/${webpFilename}`,
            type: 'image'
            };
        } else {
            media = {
            url: `/uploads/${req.file.filename}`,
            type: 'video'
            };
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

// Eliminazione post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post.' });
    }

    await post.deleteOne();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while deleting post.' });
  }
});

// Lista post
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username profilePictureUrl')
      .sort({ createdAt: -1 })
      .lean();

    posts.forEach(post => {
      if (typeof post.media === 'undefined') post.media = null;
    });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching posts.' });
  }
});

// Like / unlike post
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

// Commento post
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
    res.status(500).json({ error: 'Server error while commenting.' });
  }
});

// Eliminazione commento
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
