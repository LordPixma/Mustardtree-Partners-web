import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react';
import { blogService } from '../services/blogService';
import type { BlogPost as BlogPostType } from '../types/blog';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) { setNotFound(true); setLoading(false); return; }
      try {
        const fetchedPost = await blogService.getPostBySlug(slug);
        if (fetchedPost && fetchedPost.status === 'published') {
          const postsWithAuthors = await blogService.getPosts();
          const postWithAuthor = postsWithAuthors.find(p => p.id === fetchedPost.id);
          setPost(postWithAuthor || fetchedPost);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post) {
      document.title = post.seo?.metaTitle || `${post.title} | MustardTree Partners`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.seo?.metaDescription || post.excerpt);
      }
    }
  }, [post]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
      } catch {
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) return <h1 key={index} className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={index} className="text-2xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={index} className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">{line.slice(4)}</h3>;
      if (line.startsWith('- ')) return <li key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed ml-4">{line.slice(2)}</li>;
      if (/^\d+\. /.test(line)) return <li key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed ml-4">{line.replace(/^\d+\. /, '')}</li>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"><strong>{line.slice(2, -2)}</strong></p>;
      if (line.trim() === '') return <br key={index} />;
      return <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{line}</p>;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-4">Article Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The article you're looking for doesn't exist or has been removed.</p>
          <a href="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <a href="/blog" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </a>
        </motion.div>

        <motion.article initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {post.featuredImage && (
            <div className="h-64 md:h-96 overflow-hidden">
              <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {post.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">{post.category}</span>
              )}
              {post.tags && post.tags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">{tag}</span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-white mb-6 leading-tight">{post.title}</h1>

            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
              <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{formatDate(post.publishedAt || post.createdAt)}</span></div>
                {post.readingTime && <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{post.readingTime} min read</span></div>}
              </div>
              <button onClick={handleShare} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Share this article">
                <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            {post.author && (
              <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {post.author.headshot ? (
                  <img src={post.author.headshot} alt={post.author.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <User className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{post.author.name}</p>
                  {post.author.position && <p className="text-sm text-gray-600 dark:text-gray-400">{post.author.position}</p>}
                  {post.author.bio && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{post.author.bio}</p>}
                </div>
              </div>
            )}

            {post.videoUrl && (
              <div className="mb-8">
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <iframe src={post.videoUrl} title={post.title} className="w-full h-full" allowFullScreen />
                </div>
              </div>
            )}

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {renderContent(post.content)}
            </div>

            {post.images && post.images.length > 0 && (
              <div className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.images.map((image: string, index: number) => (
                    <img key={index} src={image} alt={`${post.title} - Image ${index + 1}`} className="rounded-lg shadow-md" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.article>
      </div>
    </div>
  );
}
